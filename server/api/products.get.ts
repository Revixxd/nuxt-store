import { z } from "zod"
import { CATEGORY_IDS } from "../../shared/catalog"
import type { Category } from "../../shared/catalog"
import type { ProductsResponse } from "../../shared/listing"
import { queryListing } from "../lib/listing"

const categorySchema = z.object({
  category: z.enum(CATEGORY_IDS as [Category, ...Category[]]).optional()
})

export default defineEventHandler(async (event): Promise<ProductsResponse> => {
  const { category } = await getValidatedQuery(event, categorySchema.parse)

  return queryListing(await getProducts(), category ?? null, getQuery(event))
})
