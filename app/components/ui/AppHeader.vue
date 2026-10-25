<template>
  <UHeader
    to="/"
    :toggle="links.length > 0"
  >
    <template #title>
      <UiAppLogo />
    </template>

    <UNavigationMenu
      v-if="links.length"
      :items="links"
      aria-label="Main"
    />

    <template
      v-if="links.length"
      #body
    >
      <UNavigationMenu
        :items="links"
        orientation="vertical"
        aria-label="Main"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

const { links = [] } = defineProps<{
  links?: NavigationMenuItem[]
}>()
</script>
