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

    <section
      v-if="data"
      aria-label="Products"
      :aria-busy="pending"
      class="flex flex-col gap-4 pt-8"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          class="text-sm text-muted"
        >
          {{ statusText }}
        </p>
        <div class="flex items-center gap-2">
          <label
            for="sort"
            class="text-sm text-muted"
            >Sort by</label
          >
          <USelect
            id="sort"
            :model-value="params.sort"
            :items="sortItems"
            class="min-w-52"
            @update:model-value="(sort) => update({ sort, page: 1 })"
          />
        </div>
      </div>

      <ul
        :class="[
          'grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4 transition-opacity',
          pending && 'opacity-50'
        ]"
      >
        <li
          v-for="product in data.products"
          :id="product.id"
          :key="product.id"
        >
          <UiProductCard :product="product" />
        </li>
      </ul>

      <div
        v-if="data.total"
        class="flex flex-wrap items-center justify-between gap-3 pt-2"
      >
        <div class="flex items-center gap-2">
          <label
            for="per-page"
            class="text-sm text-muted"
            >Per page</label
          >
          <USelect
            id="per-page"
            :model-value="params.perPage"
            :items="perPageItems"
            size="sm"
            @update:model-value="(perPage) => update({ perPage, page: 1 })"
          />
        </div>
        <UPagination
          v-if="data.pageCount > 1"
          :page="page"
          :total="data.total"
          :items-per-page="data.params.perPage"
          :show-edges="true"
          :sibling-count="1"
          :to="(n: number) => linkTo({ page: n })"
          size="sm"
          :ui="{ root: 'flex' }"
          aria-label="Pagination"
        />
      </div>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui"
import { ALL_PRODUCTS, CATEGORIES, isCategory } from "#shared/catalog"
import { PER_PAGE_OPTIONS, SORT_LABELS, SORTS, toListingQuery } from "#shared/listing"
import type { ProductsResponse } from "#shared/listing"

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

const { params, linkTo, update } = useListingState()

const { data, status } = await useFetch<ProductsResponse>("/api/products", {
  query: computed(() => ({
    category: category.value ?? undefined,
    ...toListingQuery(params.value)
  }))
})

const pending = computed(() => status.value === "pending")

const page = computed(() => data.value?.params.page ?? 1)

const sortItems = SORTS.map((value) => ({ label: SORT_LABELS[value], value }))
const perPageItems = PER_PAGE_OPTIONS.map((value) => ({ label: String(value), value }))

const statusText = computed(() => {
  if (!data.value?.total) return "0 products found"
  const { total, params: shown } = data.value
  const from = (shown.page - 1) * shown.perPage + 1
  const to = Math.min(shown.page * shown.perPage, total)
  return `Showing ${from}–${to} of ${total} products`
})
</script>
