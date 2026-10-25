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

      <UiSearchField
        :query="params.q"
        :loading="pending"
        class="mt-6"
        @commit="search"
      />

      <UiCategoryTabs
        v-if="data"
        :active="category"
        :counts="data.categoryCounts"
        :query-for="categoryQuery"
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

        <template v-if="ratingFilter || !category">
          <USeparator />

          <UiRangeFilter
            v-if="ratingFilter"
            v-bind="ratingFilter"
            :range="ratingRange"
            @commit="selectRatingRange"
          />
          <UiRatingHint
            v-else
            :query-for="categoryQuery"
          />
        </template>
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

                <template v-if="ratingFilter || !category">
                  <USeparator class="my-6" />

                  <UiRangeFilter
                    v-if="ratingFilter"
                    v-bind="ratingFilter"
                    :range="ratingRange"
                    @commit="selectRatingRange"
                  />
                  <UiRatingHint
                    v-else
                    :query-for="categoryQuery"
                  />
                </template>
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
              :model-value="data?.params.sort ?? params.sort"
              :items="sortItems"
              class="min-w-44 sm:min-w-52"
              @update:model-value="(sort) => update({ sort, page: 1 })"
            />
          </div>
        </div>

        <UiActiveFilters
          v-if="chips.length"
          :chips="chips"
          :clear-to="clearAllTo"
        />

        <UEmpty
          v-if="!data.total"
          icon="i-lucide-search"
          title="No products match your filters"
          description="Try a different search term, widen the price range or remove some manufacturers."
          :actions="[{ label: 'Clear all filters', to: clearAllTo }]"
          variant="naked"
          class="rounded-lg border border-dashed border-accented py-16"
        />

        <ul
          v-else
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
import {
  PER_PAGE_OPTIONS,
  RATING_FILTERS,
  rangeParams,
  sortLabel,
  sortsFor,
  toListingQuery
} from "#shared/listing"
import type { ListingParams, ProductsResponse, Range } from "#shared/listing"
import { formatPriceRange, formatRatingRange } from "#shared/format"
import type { ActiveFilterChip } from "~/components/ui/ActiveFilters.vue"

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

function search(q: string | undefined, replace: boolean) {
  return update({ q, page: 1 }, { replace })
}

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

/** The Power or Capacity filter, on Solar panels and Batteries only */
const ratingFilter = computed(() => {
  const unit = category.value ? CATEGORIES[category.value].ratingUnit : null
  const bounds = data.value?.ratingBounds
  if (!unit || !bounds) return null
  const { name, step, presets } = RATING_FILTERS[unit]
  return { legend: `${name} (${unit})`, unit, bounds, step, presets }
})

const ratingRange = computed<Range>(() => ({
  min: data.value?.params.ratingMin ?? data.value?.ratingBounds?.min ?? 0,
  max: data.value?.params.ratingMax ?? data.value?.ratingBounds?.max ?? 0
}))

function selectRatingRange(range: Range) {
  if (!data.value?.ratingBounds) return
  const { min: ratingMin, max: ratingMax } = rangeParams(range, data.value.ratingBounds)
  return update({ ratingMin, ratingMax, page: 1 })
}

function clearFilters() {
  return update({
    manufacturer: [],
    priceMin: undefined,
    priceMax: undefined,
    ratingMin: undefined,
    ratingMax: undefined,
    page: 1
  })
}

const activeFilterCount = computed(() => {
  const shown = data.value?.params
  const isSet = (min?: number, max?: number) => (min !== undefined || max !== undefined ? 1 : 0)
  return (
    selectedManufacturers.value.length +
    isSet(shown?.priceMin, shown?.priceMax) +
    isSet(shown?.ratingMin, shown?.ratingMax)
  )
})

function shownWith(changes: Partial<ListingParams>) {
  const shown = data.value?.params ?? params.value
  return { query: toListingQuery({ ...shown, ...changes, page: 1 }) }
}

const clearAllTo = computed(() =>
  shownWith({
    q: undefined,
    manufacturer: [],
    priceMin: undefined,
    priceMax: undefined,
    ratingMin: undefined,
    ratingMax: undefined
  })
)

const chips = computed<ActiveFilterChip[]>(() => {
  if (!data.value) return []
  const { params: shown, manufacturers, priceBounds, ratingBounds } = data.value
  const result: ActiveFilterChip[] = []

  if (shown.q) {
    result.push({
      key: "q",
      kind: "Search",
      label: `“${shown.q}”`,
      to: shownWith({ q: undefined })
    })
  }
  for (const slug of shown.manufacturer) {
    result.push({
      key: `manufacturer:${slug}`,
      kind: "Manufacturer",
      label: manufacturers.find((m) => m.slug === slug)?.name ?? slug,
      to: shownWith({ manufacturer: shown.manufacturer.filter((s) => s !== slug) })
    })
  }
  if (shown.priceMin !== undefined || shown.priceMax !== undefined) {
    result.push({
      key: "price",
      kind: "Price",
      label: formatPriceRange(shown.priceMin ?? priceBounds.min, shown.priceMax ?? priceBounds.max),
      to: shownWith({ priceMin: undefined, priceMax: undefined })
    })
  }
  if (
    ratingFilter.value &&
    ratingBounds &&
    (shown.ratingMin !== undefined || shown.ratingMax !== undefined)
  ) {
    const { unit } = ratingFilter.value
    result.push({
      key: "rating",
      kind: RATING_FILTERS[unit].name,
      label: formatRatingRange(
        shown.ratingMin ?? ratingBounds.min,
        shown.ratingMax ?? ratingBounds.max,
        unit
      ),
      to: shownWith({ ratingMin: undefined, ratingMax: undefined })
    })
  }
  return result
})

const filtersOpen = ref(false)

const selectedManufacturers = computed(() =>
  params.value.manufacturer.filter((slug) => data.value?.manufacturers.some((m) => m.slug === slug))
)

const page = computed(() => data.value?.params.page ?? 1)

const sortItems = computed(() =>
  sortsFor(category.value).map((value) => ({
    label: sortLabel(value, category.value, !!params.value.q),
    value
  }))
)
const perPageItems = PER_PAGE_OPTIONS.map((value) => ({ label: String(value), value }))

const statusText = computed(() => {
  if (!data.value?.total) return "0 products found"
  const { total, params: shown } = data.value
  const from = (shown.page - 1) * shown.perPage + 1
  const to = Math.min(shown.page * shown.perPage, total)
  return `Showing ${from}–${to} of ${total} products`
})

const seoTitle = computed(() => {
  const shown = data.value?.params ?? params.value
  const heading = [info.value.label]
  const ratingBounds = data.value?.ratingBounds
  if (
    ratingFilter.value &&
    ratingBounds &&
    (shown.ratingMin !== undefined || shown.ratingMax !== undefined)
  ) {
    heading.push(
      formatRatingRange(
        shown.ratingMin ?? ratingBounds.min,
        shown.ratingMax ?? ratingBounds.max,
        ratingFilter.value.unit
      )
    )
  }
  const names = shown.manufacturer.flatMap(
    (slug) => data.value?.manufacturers.find((m) => m.slug === slug)?.name ?? []
  )
  const manufacturers =
    names.length >= 3 ? `${names.length} manufacturers` : names.join(", ") || undefined
  return `${[heading.join(" "), manufacturers].filter(Boolean).join(" · ")} | nuxt-store`
})

const seoDescription = computed(() => {
  const total = data.value?.total ?? 0
  return `${info.value.description} ${total} ${total === 1 ? "product" : "products"}.`
})

const robots = computed(() => {
  const shown = data.value?.params ?? params.value
  return shown.q || shown.page > 1 ? "noindex, follow" : "index, follow"
})

const { siteUrl } = useRuntimeConfig().public
const canonical = computed(() => `${siteUrl}/catalog${category.value ? `/${category.value}` : ""}`)

useSeoMeta({ title: seoTitle, description: seoDescription, robots })
useHead({ link: [{ rel: "canonical", href: canonical }] })
</script>
