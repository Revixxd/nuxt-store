import { CATEGORIES, CATEGORY_IDS } from "../../shared/catalog"
import type { Category, Product } from "../../shared/catalog"
import { normaliseRange, parseListingQuery, rangeParams, sortsFor } from "../../shared/listing"
import type { ManufacturerFacet, ProductsResponse, Range, Sort } from "../../shared/listing"

function ascending(value: (p: Product) => number | null, direction = 1) {
  return (a: Product, b: Product) => {
    const [x, y] = [value(a), value(b)]
    if (x === null || y === null) return x === y ? a.price - b.price : x === null ? 1 : -1
    return direction * (x - y) || a.price - b.price
  }
}

const SORTERS: Record<Sort, ((a: Product, b: Product) => number) | null> = {
  featured: null,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  "rating-desc": ascending((p) => p.rating, -1),
  "rating-asc": ascending((p) => p.rating),
  "unit-price-asc": ascending((p) => p.unitPrice)
}

function countManufacturers(inCategory: Product[], matching: Product[]): ManufacturerFacet[] {
  const bySlug = new Map<string, ManufacturerFacet>()
  for (const p of inCategory) {
    if (!bySlug.has(p.manufacturerSlug))
      bySlug.set(p.manufacturerSlug, { slug: p.manufacturerSlug, name: p.manufacturer, count: 0 })
  }
  for (const p of matching) bySlug.get(p.manufacturerSlug)!.count++
  return [...bySlug.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  )
}

function boundsOf(values: number[]): Range {
  if (!values.length) return { min: 0, max: 0 }
  return { min: Math.floor(Math.min(...values)), max: Math.ceil(Math.max(...values)) }
}

export function queryListing(
  products: Product[],
  category: Category | null,
  rawQuery: unknown
): ProductsResponse {
  const query = parseListingQuery(rawQuery)

  const inCategory = category ? products.filter((p) => p.category === category) : products
  const categoryCounts = Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, products.filter((p) => p.category === id).length])
  ) as Record<Category, number>

  const priceBounds = boundsOf(inCategory.map((p) => p.price))
  const price = normaliseRange(
    { min: query.priceMin ?? priceBounds.min, max: query.priceMax ?? priceBounds.max },
    priceBounds
  )
  const inPriceRange = inCategory.filter((p) => p.price >= price.min && p.price <= price.max)

  const ratingBounds =
    category && CATEGORIES[category].ratingUnit
      ? boundsOf(inCategory.flatMap((p) => (p.rating === null ? [] : [p.rating])))
      : null
  const rating = ratingBounds
    ? rangeParams(
        normaliseRange(
          { min: query.ratingMin ?? ratingBounds.min, max: query.ratingMax ?? ratingBounds.max },
          ratingBounds
        ),
        ratingBounds
      )
    : {}
  const inRatingRange = inPriceRange.filter(
    (p) =>
      (rating.min === undefined || (p.rating !== null && p.rating >= rating.min)) &&
      (rating.max === undefined || (p.rating !== null && p.rating <= rating.max))
  )

  const manufacturers = countManufacturers(inCategory, inRatingRange)
  const offered = new Set(manufacturers.map((m) => m.slug))
  const manufacturer = query.manufacturer.filter((slug) => offered.has(slug))
  const selected = new Set(manufacturer)
  const matching = selected.size
    ? inRatingRange.filter((p) => selected.has(p.manufacturerSlug))
    : inRatingRange

  const sort = sortsFor(category).includes(query.sort) ? query.sort : "featured"
  const sorter = SORTERS[sort]
  const sorted = sorter ? matching.toSorted(sorter) : matching

  const pageCount = Math.max(1, Math.ceil(matching.length / query.perPage))
  const { min: priceMin, max: priceMax } = rangeParams(price, priceBounds)
  const params = {
    ...query,
    manufacturer,
    sort,
    priceMin,
    priceMax,
    ratingMin: rating.min,
    ratingMax: rating.max,
    page: Math.min(query.page, pageCount)
  }
  const start = (params.page - 1) * params.perPage

  return {
    products: sorted.slice(start, start + params.perPage),
    total: matching.length,
    pageCount,
    params,
    categoryCounts,
    manufacturers,
    priceBounds,
    ratingBounds
  }
}
