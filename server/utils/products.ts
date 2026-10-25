import { parseCatalog } from "../lib/catalog"
import type { Product } from "../../shared/catalog"

let products: Promise<Product[]> | undefined

/** Parses the CSV server asset once, on first use, and keeps it in memory. */
export function getProducts(): Promise<Product[]> {
  products ??= useStorage("assets:server")
    .getItem<string>("products.csv")
    .then((csv) => {
      if (!csv) throw new Error("[catalog] products.csv server asset is missing")
      return parseCatalog(csv)
    })
    .catch((error: unknown) => {
      products = undefined
      throw error
    })

  return products
}
