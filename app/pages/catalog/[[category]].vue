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
        :query="categoryQuery"
        class="mt-5"
      />
    </header>

    <div
      v-if="data"
      class="grid items-start gap-8 pt-8 lg:grid-cols-[248px_minmax(0,1fr)]"
    >
      <aside
        aria-labelledby="filters-title"
        class="hidden flex-col gap-6 lg:flex"
      >
        <h2
          id="filters-title"
          class="flex items-center gap-2 font-semibold text-highlighted"
        >
          <UIcon
            name="i-lucide-funnel"
            class="size-4.5"
          />
          Filters
        </h2>

        <UiManufacturerFilter
          :key="category ?? 'all'"
          :manufacturers="data.manufacturers"
          :selected="selectedManufacturers"
          @update:selected="selectManufacturers"
        />

        <USeparator />

        <UiRangeFilter
          legend="Price (EUR, excl. VAT)"
          :bounds="data.priceBounds"
          :range="priceRange"
          :step="1"
          @commit="selectPriceRange"
        />
      </aside>

      <section
        aria-label="Products"
        :aria-busy="pending"
        class="flex flex-col gap-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p
            role="status"
            class="text-sm text-muted"
          >
            {{ statusText }}
          </p>
          <div class="flex items-center gap-2">
            <UDrawer
              v-model:open="filtersOpen"
              title="Filters"
              close
              :ui="{
                content: 'max-h-[85dvh] lg:hidden',
                container: 'min-h-0 overflow-hidden',
                body: 'min-h-0 overflow-y-auto',
                footer: '-mx-4 flex-row gap-2 border-t border-default px-4 pt-4'
              }"
            >
              <UButton
                label="Filters"
                icon="i-lucide-funnel"
                color="neutral"
                variant="outline"
                class="lg:hidden"
              >
                <template
                  v-if="activeFilterCount"
                  #trailing
                >
                  <UBadge
                    :label="activeFilterCount"
                    size="sm"
                    class="rounded-full"
                  />
                </template>
              </UButton>

              <template #body>
                <UiManufacturerFilter
                  show-all
                  :manufacturers="data.manufacturers"
                  :selected="selectedManufacturers"
                  @update:selected="selectManufacturers"
                />

                <USeparator class="my-6" />

                <UiRangeFilter
                  legend="Price (EUR, excl. VAT)"
                  :bounds="data.priceBounds"
                  :range="priceRange"
                  :step="1"
                  @commit="selectPriceRange"
                />
              </template>

              <template #footer>
                <UButton
                  label="Clear all"
                  color="neutral"
                  variant="outline"
                  size="lg"
                  :disabled="!activeFilterCount"
                  class="flex-1 justify-center"
                  @click="clearFilters"
                />
                <UButton
                  :label="`Show ${data.total} products`"
                  size="lg"
                  class="flex-2 justify-center"
                  @click="filtersOpen = false"
                />
              </template>
            </UDrawer>

            <label
              for="sort"
              class="sr-only text-sm text-muted sm:not-sr-only"
              >Sort by</label
            >
            <USelect
              id="sort"
              :model-value="params.sort"
              :items="sortItems"
              class="min-w-44 sm:min-w-52"
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
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui"
import { ALL_PRODUCTS, CATEGORIES, isCategory } from "#shared/catalog"
import { PER_PAGE_OPTIONS, rangeParams, SORT_LABELS, SORTS, toListingQuery } from "#shared/listing"
import type { ProductsResponse, Range } from "#shared/listing"

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

const { params, categoryQuery, linkTo, update } = useListingState()

const { data, status } = await useFetch<ProductsResponse>("/api/products", {
  query: computed(() => ({
    category: category.value ?? undefined,
    ...toListingQuery(params.value)
  }))
})

const pending = computed(() => status.value === "pending")

function selectManufacturers(manufacturer: string[]) {
  return update({ manufacturer, page: 1 })
}

const priceRange = computed<Range>(() => ({
  min: data.value?.params.priceMin ?? data.value?.priceBounds.min ?? 0,
  max: data.value?.params.priceMax ?? data.value?.priceBounds.max ?? 0
}))

function selectPriceRange(range: Range) {
  if (!data.value) return
  const { min: priceMin, max: priceMax } = rangeParams(range, data.value.priceBounds)
  return update({ priceMin, priceMax, page: 1 })
}

function clearFilters() {
  return update({ manufacturer: [], priceMin: undefined, priceMax: undefined, page: 1 })
}

const activeFilterCount = computed(
  () =>
    selectedManufacturers.value.length +
    (data.value?.params.priceMin !== undefined || data.value?.params.priceMax !== undefined ? 1 : 0)
)

const filtersOpen = ref(false)

// From the URL rather than the response, so toggles during a refetch don't
// start from stale params; unknown slugs are dropped as the server does
const selectedManufacturers = computed(() =>
  params.value.manufacturer.filter((slug) => data.value?.manufacturers.some((m) => m.slug === slug))
)

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
