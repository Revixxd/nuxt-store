export type Category = "solar-panels" | "batteries" | "connectors"

export type RatingUnit = "W" | "kWh"

export interface Product {
  id: string
  name: string
  manufacturer: string
  manufacturerSlug: string
  /** EUR, excluding VAT */
  price: number
  description: string
  category: Category
  /** Power in W or Capacity in kWh; null for Connectors & accessories */
  rating: number | null
  /** EUR per W or per kWh; null when there is no Rating */
  unitPrice: number | null
}

export interface CategoryInfo {
  label: string
  shortLabel: string
  description: string
  ratingUnit: RatingUnit | null
  icon: string
}

export const CATEGORIES: Record<Category, CategoryInfo> = {
  "solar-panels": {
    label: "Solar panels",
    shortLabel: "Solar panel",
    description: "Monocrystalline, bifacial, shingled and flexible PV modules from 300 W to 600 W for residential, C&I and utility-scale projects.",
    ratingUnit: "W",
    icon: "i-lucide-sun"
  },
  batteries: {
    label: "Batteries",
    shortLabel: "Battery",
    description: "LiFePO4 and NMC energy storage from 2.4 kWh to 15 kWh — wall-mounted, rack-mounted and stackable systems.",
    ratingUnit: "kWh",
    icon: "i-lucide-battery-charging"
  },
  connectors: {
    label: "Connectors & accessories",
    shortLabel: "Accessory",
    description: "MC4, MC4-Evo 2 and H4 connectors, branch splitters, combiners, inline fuses and installation tools.",
    ratingUnit: null,
    icon: "i-lucide-plug"
  }
}

export const ALL_PRODUCTS = {
  label: "All products",
  tabLabel: "All",
  icon: "i-lucide-layers",
  description: "Solar panels, battery storage and connectors from leading manufacturers — net B2B prices for installers and distributors across Europe."
}

export const CATEGORY_IDS = Object.keys(CATEGORIES) as Category[]

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && value in CATEGORIES
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
