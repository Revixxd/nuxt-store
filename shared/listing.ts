import { z } from "zod"
import type { Category, Product } from "./catalog"

export const SORTS = ["featured", "price-asc", "price-desc", "name-asc"] as const
export type Sort = (typeof SORTS)[number]

export const SORT_LABELS: Record<Sort, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A–Z"
}

export const PER_PAGE_OPTIONS = [12, 24, 48] as const
export type PerPage = (typeof PER_PAGE_OPTIONS)[number]

export const listingQuerySchema = z.object({
  sort: z.enum(SORTS).catch("featured"),
  page: z.coerce.number().int().min(1).catch(1),
  perPage: z.coerce
    .number()
    .pipe(z.union(PER_PAGE_OPTIONS.map((n) => z.literal(n))))
    .catch(12)
})

export type ListingParams = z.infer<typeof listingQuerySchema>

export const DEFAULT_PARAMS: ListingParams = listingQuerySchema.parse({})

export function parseListingQuery(query: unknown): ListingParams {
  return listingQuerySchema.parse(query && typeof query === "object" ? query : {})
}

export function toListingQuery(params: ListingParams): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([key, value]) => DEFAULT_PARAMS[key as keyof ListingParams] !== value)
      .map(([key, value]) => [key, String(value)])
  )
}

export interface ProductsResponse {
  products: Product[]
  total: number
  pageCount: number
  params: ListingParams
  categoryCounts: Record<Category, number>
}
