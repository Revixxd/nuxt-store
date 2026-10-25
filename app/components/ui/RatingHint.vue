<template>
  <UAlert
    role="note"
    color="neutral"
    variant="subtle"
    icon="i-lucide-info"
    title="Power & capacity"
    description="Pick a category to filter and sort by power (W) or capacity (kWh)."
    orientation="vertical"
    :actions="actions"
  />
</template>

<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui"
import type { Category } from "#shared/catalog"

const { queryFor } = defineProps<{
  queryFor: (category: Category) => Record<string, string>
}>()

const actions = computed<ButtonProps[]>(() => [
  {
    label: "Solar panels · W",
    to: { path: "/catalog/solar-panels", query: queryFor("solar-panels") },
    color: "neutral",
    variant: "outline",
    size: "xs"
  },
  {
    label: "Batteries · kWh",
    to: { path: "/catalog/batteries", query: queryFor("batteries") },
    color: "neutral",
    variant: "outline",
    size: "xs"
  }
])
</script>
