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
  /** Manufacturer slugs, comma-separated in the URL */
  manufacturer: z
    .string()
    .transform((value) => [...new Set(value.split(",").map((slug) => slug.trim()))].filter(Boolean))
    .catch([]),
  priceMin: z.coerce.number().finite().optional().catch(undefined),
  priceMax: z.coerce.number().finite().optional().catch(undefined),
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

function toQueryValue(value: ListingParams[keyof ListingParams]): string | undefined {
  if (value === undefined) return undefined
  return Array.isArray(value) ? value.join(",") : String(value)
}

export function toListingQuery(params: ListingParams): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, toQueryValue(value)] as const)
      .filter(
        (entry): entry is readonly [string, string] =>
          entry[1] !== undefined &&
          entry[1] !== toQueryValue(DEFAULT_PARAMS[entry[0] as keyof ListingParams])
      )
  )
}

export function paramsForCategorySwitch(params: ListingParams): ListingParams {
  return { ...DEFAULT_PARAMS, sort: params.sort }
}

export interface ManufacturerFacet {
  slug: string
  name: string
  /** Products matching every Filter except the Manufacturer Filter */
  count: number
}

export interface Range {
  min: number
  max: number
}

export function normaliseRange(range: Range, bounds: Range): Range {
  const clamp = (value: number) => Math.min(Math.max(value, bounds.min), bounds.max)
  const [min, max] = [clamp(range.min), clamp(range.max)].sort((a, b) => a - b) as [number, number]
  return { min, max }
}

export function rangeParams(range: Range, bounds: Range): Partial<Range> {
  return {
    min: range.min > bounds.min ? range.min : undefined,
    max: range.max < bounds.max ? range.max : undefined
  }
}

export interface ProductsResponse {
  products: Product[]
  total: number
  pageCount: number
  params: ListingParams
  categoryCounts: Record<Category, number>
  manufacturers: ManufacturerFacet[]
  priceBounds: Range
}
