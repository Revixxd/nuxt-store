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

const categoryLinks: NavigationMenuItem[] = [
  { label: "Solar panels", to: "/catalog/solar-panels" },
  { label: "Batteries", to: "/catalog/batteries" },
  { label: "Connectors & accessories", to: "/catalog/connectors" }
]
</script>
