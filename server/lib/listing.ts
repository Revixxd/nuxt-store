import { CATEGORY_IDS } from "../../shared/catalog"
import type { Category, Product } from "../../shared/catalog"
import { normaliseRange, parseListingQuery, rangeParams } from "../../shared/listing"
import type { ManufacturerFacet, ProductsResponse, Range, Sort } from "../../shared/listing"

const SORTERS: Record<Sort, ((a: Product, b: Product) => number) | null> = {
  featured: null,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })
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

function priceBoundsOf(products: Product[]): Range {
  if (!products.length) return { min: 0, max: 0 }
  const prices = products.map((p) => p.price)
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
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

  const priceBounds = priceBoundsOf(inCategory)
  const price = normaliseRange(
    { min: query.priceMin ?? priceBounds.min, max: query.priceMax ?? priceBounds.max },
    priceBounds
  )
  const inPriceRange = inCategory.filter((p) => p.price >= price.min && p.price <= price.max)

  const manufacturers = countManufacturers(inCategory, inPriceRange)
  const offered = new Set(manufacturers.map((m) => m.slug))
  const manufacturer = query.manufacturer.filter((slug) => offered.has(slug))
  const selected = new Set(manufacturer)
  const matching = selected.size
    ? inPriceRange.filter((p) => selected.has(p.manufacturerSlug))
    : inPriceRange

  const sorter = SORTERS[query.sort]
  const sorted = sorter ? matching.toSorted(sorter) : matching

  const pageCount = Math.max(1, Math.ceil(matching.length / query.perPage))
  const { min: priceMin, max: priceMax } = rangeParams(price, priceBounds)
  const params = {
    ...query,
    manufacturer,
    priceMin,
    priceMax,
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
    priceBounds
  }
}
