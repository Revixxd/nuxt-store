import type { RatingUnit } from "./catalog"

const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const eurWhole = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
})

/** "€1,499.00" */
export function formatPrice(price: number): string {
  return eur.format(price)
}

/** "€0.30 / W" or "€150 / kWh" */
export function formatUnitPrice(unitPrice: number, unit: RatingUnit): string {
  return `${(unit === "W" ? eur : eurWhole).format(unitPrice)} / ${unit}`
}

/** "450 W" or "7.5 kWh" */
export function formatRating(rating: number, unit: RatingUnit): string {
  return `${rating} ${unit}`
}

export function formatPriceRange(min: number, max: number): string {
  return `${eurWhole.format(min)} – ${eurWhole.format(max)}`
}

export function formatRatingRange(min: number, max: number, unit: RatingUnit): string {
  return `${min}–${max} ${unit}`
}
