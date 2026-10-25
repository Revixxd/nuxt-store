<template>
  <nav
    aria-label="Category"
    class="overflow-x-auto"
  >
    <ul class="inline-flex gap-1 rounded-lg bg-elevated p-1">
      <li
        v-for="tab in tabs"
        :key="tab.to"
      >
        <NuxtLink
          :to="{ path: tab.to, query: queryFor(tab.category) }"
          :aria-current="tab.active ? 'page' : undefined"
          :class="[
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            tab.active ? 'bg-primary text-inverted' : 'text-toned hover:text-highlighted'
          ]"
        >
          <UIcon
            :name="tab.icon"
            class="size-4"
          />
          <span>{{ tab.label }}</span>
          <span
            :class="[
              'rounded-sm px-1.5 text-xs font-medium',
              tab.active ? 'bg-white/20 text-inverted' : 'bg-accented text-toned'
            ]"
          >
            {{ tab.count }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ALL_PRODUCTS, CATEGORIES, CATEGORY_IDS } from "#shared/catalog"
import type { Category } from "#shared/catalog"

const { active, counts, queryFor } = defineProps<{
  active: Category | null
  counts: Record<Category, number>
  queryFor: (category: Category | null) => Record<string, string>
}>()

const tabs = computed(() => [
  {
    label: ALL_PRODUCTS.tabLabel,
    icon: ALL_PRODUCTS.icon,
    category: null,
    to: "/catalog",
    count: CATEGORY_IDS.reduce((sum, id) => sum + counts[id], 0),
    active: active === null
  },
  ...CATEGORY_IDS.map((id) => ({
    label: CATEGORIES[id].label,
    icon: CATEGORIES[id].icon,
    category: id,
    to: `/catalog/${id}`,
    count: counts[id],
    active: active === id
  }))
])
</script>
