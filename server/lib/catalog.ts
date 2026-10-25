import { parse } from "csv-parse/sync"
import { CATEGORIES, slugify } from "../../shared/catalog"
import type { Category, Product } from "../../shared/catalog"

interface CsvRow {
  name: string
  manufacturer: string
  price: string
  description: string
  category: string
}

const CSV_CATEGORIES: Record<string, Category> = {
  "solar panel": "solar-panels",
  battery: "batteries",
  connector: "connectors"
}

/**
 * The first number immediately followed by the Category's unit, cross-checked
 * against the last number in the name. Anchoring on the unit skips "48V" and
 * "1500V"; taking the first match skips "up to 30kWh" and "three 3.5kWh modules".
 */
function extractRating(row: CsvRow, category: Category): number | null {
  const unit = CATEGORIES[category].ratingUnit
  if (!unit) return null

  const fromDescription = row.description.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${unit}\\b`))?.[1]
  const fromName = row.name.match(/(\d+(?:\.\d+)?)\s*$/)?.[1]

  if (fromDescription === undefined || Number(fromDescription) !== Number(fromName)) {
    console.warn(`[catalog] No Rating for "${row.name}": description says ${fromDescription ?? "nothing"}${fromDescription ? ` ${unit}` : ""}, name says ${fromName ?? "nothing"}`)
    return null
  }

  return Number(fromDescription)
}

export function parseCatalog(csvText: string): Product[] {
  const rows: CsvRow[] = parse(csvText, { columns: true, skip_empty_lines: true, trim: true })

  return rows.map((row) => {
    const category = CSV_CATEGORIES[row.category]
    if (!category) throw new Error(`[catalog] Unknown category "${row.category}" for "${row.name}"`)
    const rating = extractRating(row, category)
    const price = Number(row.price)

    return {
      id: slugify(row.name),
      name: row.name,
      manufacturer: row.manufacturer,
      manufacturerSlug: slugify(row.manufacturer),
      price,
      description: row.description,
      category,
      rating,
      unitPrice: rating ? price / rating : null
    }
  })
}
