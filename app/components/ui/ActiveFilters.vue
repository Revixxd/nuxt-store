<template>
  <ul
    aria-label="Active filters"
    class="flex flex-wrap items-center gap-1.5"
  >
    <li
      v-for="chip in chips"
      :key="chip.key"
    >
      <UBadge
        color="primary"
        variant="subtle"
        class="gap-1 py-0.5 pr-1 pl-2 text-highlighted"
      >
        <span class="text-muted">{{ chip.kind }}</span>
        <span>{{ chip.label }}</span>
        <UButton
          :to="chip.to"
          :aria-label="`Remove filter ${chip.label}`"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          class="p-0.5"
        />
      </UBadge>
    </li>
    <li>
      <UButton
        :to="clearTo"
        label="Clear all"
        color="neutral"
        variant="ghost"
        size="xs"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router"

export interface ActiveFilterChip {
  key: string
  kind: string
  label: string
  to: RouteLocationRaw
}

defineProps<{
  chips: ActiveFilterChip[]
  clearTo: RouteLocationRaw
}>()
</script>
