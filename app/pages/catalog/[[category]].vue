<template>
  <UContainer class="pb-16">
    <UBreadcrumb
      :items="breadcrumb"
      class="pt-6"
    />

    <header class="border-b border-default pt-6 pb-8">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-4xl/tight font-bold tracking-tight text-highlighted">
          {{ info.label }}
        </h1>
        <UBadge
          color="neutral"
          variant="subtle"
          size="lg"
        >
          {{ data?.total ?? 0 }} products
        </UBadge>
      </div>
      <p class="mt-3 max-w-180 text-lg text-muted">
        {{ info.description }}
      </p>

      <UiCategoryTabs
        v-if="data"
        :active="category"
        :counts="data.categoryCounts"
        class="mt-5"
      />
    </header>

    <ul
      v-if="data"
      class="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4 pt-8"
    >
      <li
        v-for="product in data.products"
        :id="product.id"
        :key="product.id"
      >
        <UiProductCard :product="product" />
      </li>
    </ul>
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui"
import { ALL_PRODUCTS, CATEGORIES, isCategory } from "#shared/catalog"
import type { ProductsResponse } from "#shared/catalog"

definePageMeta({
  layout: "catalog",
  validate: (route) => !route.params.category || isCategory(route.params.category)
})

const route = useRoute()

const category = computed(() => {
  const param = route.params.category
  return isCategory(param) ? param : null
})

const info = computed(() => (category.value ? CATEGORIES[category.value] : ALL_PRODUCTS))

const breadcrumb = computed<BreadcrumbItem[]>(() => [
  { label: "Home", to: "/" },
  { label: "Products", to: "/catalog" },
  { label: info.value.label }
])

const { data } = await useFetch<ProductsResponse>("/api/products", {
  query: { category: computed(() => category.value ?? undefined) }
})
</script>
