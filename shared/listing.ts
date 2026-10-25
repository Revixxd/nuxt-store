import { z } from "zod"
import { CATEGORIES } from "./catalog"
import type { Category, Product, RatingUnit } from "./catalog"

export const SORTS = [
  "featured",
  "price-asc",
  "price-desc",
  "name-asc",
  "rating-desc",
  "rating-asc",
  "unit-price-asc"
] as const
export type Sort = (typeof SORTS)[number]

const RATING_SORTS = new Set<Sort>(["rating-desc", "rating-asc", "unit-price-asc"])

export interface RatingFilter {
  name: string
  step: number
  presets: { label: string; range: Range }[]
}

export const RATING_FILTERS: Record<RatingUnit, RatingFilter> = {
  W: {
    name: "Power",
    step: 5,
    presets: [
      { label: "Under 400 W", range: { min: 300, max: 399 } },
      { label: "400–499 W", range: { min: 400, max: 499 } },
      { label: "500 W and up", range: { min: 500, max: 600 } }
    ]
  },
  kWh: {
    name: "Capacity",
    step: 0.1,
    presets: [
      { label: "Up to 5 kWh", range: { min: 2, max: 5 } },
      { label: "5.1–10 kWh", range: { min: 5.1, max: 10 } },
      { label: "Over 10 kWh", range: { min: 10.1, max: 15 } }
    ]
  }
}

export function sortsFor(category: Category | null): Sort[] {
  return category && CATEGORIES[category].ratingUnit
    ? [...SORTS]
    : SORTS.filter((sort) => !RATING_SORTS.has(sort))
}

export function sortLabel(sort: Sort, category: Category | null): string {
  const unit = category ? CATEGORIES[category].ratingUnit : null
  const name = unit ? RATING_FILTERS[unit].name : "Rating"
  return {
    featured: "Featured",
    "price-asc": "Price: low to high",
    "price-desc": "Price: high to low",
    "name-asc": "Name: A–Z",
    "rating-desc": `${name}: highest first`,
    "rating-asc": `${name}: lowest first`,
    "unit-price-asc": `Price per ${unit ?? "unit"}: lowest first`
  }[sort]
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
  ratingMin: z.coerce.number().finite().optional().catch(undefined),
  ratingMax: z.coerce.number().finite().optional().catch(undefined),
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

export function paramsForCategorySwitch(
  params: ListingParams,
  category: Category | null
): ListingParams {
  const sort = sortsFor(category).includes(params.sort) ? params.sort : DEFAULT_PARAMS.sort
  return { ...DEFAULT_PARAMS, sort }
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
  ratingBounds: Range | null
}
