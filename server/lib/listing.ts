import { CATEGORY_IDS } from "../../shared/catalog"
import type { Category, Product } from "../../shared/catalog"
import { parseListingQuery } from "../../shared/listing"
import type { ManufacturerFacet, ProductsResponse, Sort } from "../../shared/listing"

const SORTERS: Record<Sort, ((a: Product, b: Product) => number) | null> = {
  featured: null,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })
}

/**
 * The Manufacturers of the given Products by name, with how many Products each
 * has. Called with every Filter applied except the Manufacturer Filter, so
 * selecting a Manufacturer never zeroes the others.
 */
function countManufacturers(products: Product[]): ManufacturerFacet[] {
  const bySlug = new Map<string, ManufacturerFacet>()
  for (const p of products) {
    const facet = bySlug.get(p.manufacturerSlug)
    if (facet) facet.count++
    else
      bySlug.set(p.manufacturerSlug, { slug: p.manufacturerSlug, name: p.manufacturer, count: 1 })
  }
  return [...bySlug.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  )
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

  const manufacturers = countManufacturers(inCategory)
  const offered = new Set(manufacturers.map((m) => m.slug))
  const manufacturer = query.manufacturer.filter((slug) => offered.has(slug))
  const selected = new Set(manufacturer)
  const matching = selected.size
    ? inCategory.filter((p) => selected.has(p.manufacturerSlug))
    : inCategory

  const sorter = SORTERS[query.sort]
  const sorted = sorter ? matching.toSorted(sorter) : matching

  const pageCount = Math.max(1, Math.ceil(matching.length / query.perPage))
  const params = { ...query, manufacturer, page: Math.min(query.page, pageCount) }
  const start = (params.page - 1) * params.perPage

  return {
    products: sorted.slice(start, start + params.perPage),
    total: matching.length,
    pageCount,
    params,
    categoryCounts,
    manufacturers
  }
}
