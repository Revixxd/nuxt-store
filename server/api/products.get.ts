import { z } from "zod"
import { CATEGORY_IDS, PER_PAGE } from "../../shared/catalog"
import type { Category, ProductsResponse } from "../../shared/catalog"

const querySchema = z.object({
  category: z.enum(CATEGORY_IDS as [Category, ...Category[]]).optional()
})

export default defineEventHandler(async (event): Promise<ProductsResponse> => {
  const { category } = await getValidatedQuery(event, querySchema.parse)
  const products = await getProducts()

  const inCategory = category ? products.filter((p) => p.category === category) : products
  const categoryCounts = Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, products.filter((p) => p.category === id).length])
  ) as Record<Category, number>

  return {
    products: inCategory.slice(0, PER_PAGE),
    total: inCategory.length,
    categoryCounts
  }
})
