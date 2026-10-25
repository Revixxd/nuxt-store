<template>
  <div>
    <UiAppHeader :links="categoryLinks" />

    <UMain>
      <slot />
    </UMain>

    <UiAppFooter />
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

const { categoryQuery } = useListingState()

const categoryLinks = computed<NavigationMenuItem[]>(() => [
  { label: "Solar panels", to: { path: "/catalog/solar-panels", query: categoryQuery.value } },
  { label: "Batteries", to: { path: "/catalog/batteries", query: categoryQuery.value } },
  {
    label: "Connectors & accessories",
    to: { path: "/catalog/connectors", query: categoryQuery.value }
  }
])
</script>
