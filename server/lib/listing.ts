import { CATEGORY_IDS } from "../../shared/catalog"
import type { Category, Product } from "../../shared/catalog"
import { parseListingQuery } from "../../shared/listing"
import type { ProductsResponse, Sort } from "../../shared/listing"

const SORTERS: Record<Sort, ((a: Product, b: Product) => number) | null> = {
  featured: null,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })
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

  const sorter = SORTERS[query.sort]
  const sorted = sorter ? inCategory.toSorted(sorter) : inCategory

  const pageCount = Math.max(1, Math.ceil(inCategory.length / query.perPage))
  const params = { ...query, page: Math.min(query.page, pageCount) }
  const start = (params.page - 1) * params.perPage

  return {
    products: sorted.slice(start, start + params.perPage),
    total: inCategory.length,
    pageCount,
    params,
    categoryCounts
  }
}
