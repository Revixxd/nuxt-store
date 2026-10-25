<template>
  <article
    class="flex h-full min-w-0 flex-col overflow-hidden rounded-lg bg-default ring ring-default transition-shadow hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)]"
  >
    <div
      class="relative flex aspect-4/3 items-center justify-center border-b border-default bg-muted text-dimmed"
    >
      <UIcon
        :name="category.icon"
        mode="svg"
        aria-hidden="true"
        class="size-14 [&_*]:stroke-[1.25]"
      />
      <span
        class="absolute top-2.5 left-2.5 rounded-sm bg-default px-1.5 py-px text-xs font-medium text-toned ring ring-default"
      >
        {{ category.shortLabel }}
      </span>
      <span
        v-if="ratingLabel"
        class="absolute top-2.5 right-2.5 rounded-sm bg-primary/10 px-1.5 py-px text-xs font-semibold text-highlighted ring ring-primary/25"
      >
        {{ ratingLabel }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-1 p-4">
      <p class="text-xs font-medium tracking-wide text-muted uppercase">
        {{ product.manufacturer }}
      </p>
      <h3 class="text-base/snug font-semibold text-highlighted">
        {{ product.name }}
      </h3>
      <p class="mt-1 line-clamp-2 text-sm/normal text-muted">
        {{ product.description }}
      </p>
    </div>

    <div class="px-4 pt-3 pb-4">
      <p class="text-lg font-bold text-highlighted">
        {{ formatPrice(product.price) }}
      </p>
      <p class="text-xs text-muted">
        excl. VAT<template v-if="unitPriceLabel"> · {{ unitPriceLabel }}</template>
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { CATEGORIES } from "#shared/catalog"
import type { Product } from "#shared/catalog"
import { formatPrice, formatRating, formatUnitPrice } from "#shared/format"

const { product } = defineProps<{
  product: Product
}>()

const category = computed(() => CATEGORIES[product.category])

const ratingLabel = computed(() => {
  const unit = category.value.ratingUnit
  return unit && product.rating !== null ? formatRating(product.rating, unit) : null
})

const unitPriceLabel = computed(() => {
  const unit = category.value.ratingUnit
  return unit && product.unitPrice !== null ? formatUnitPrice(product.unitPrice, unit) : null
})
</script>
