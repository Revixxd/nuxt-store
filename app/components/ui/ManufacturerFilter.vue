<template>
  <fieldset class="min-w-0">
    <legend class="mb-2.5 text-sm font-semibold text-highlighted">Manufacturer</legend>

    <ul
      :id="listId"
      class="flex flex-col gap-0.5"
    >
      <li
        v-for="manufacturer in shown"
        :key="manufacturer.slug"
      >
        <UCheckbox
          :model-value="selectedSet.has(manufacturer.slug)"
          :disabled="!manufacturer.count && !selectedSet.has(manufacturer.slug)"
          :ui="{ root: 'py-1.5', label: 'flex items-baseline gap-2 font-normal' }"
          @update:model-value="toggle(manufacturer.slug)"
        >
          <template #label>
            <span class="min-w-0 flex-1 truncate">{{ manufacturer.name }}</span>
            <span class="text-xs text-muted">{{ manufacturer.count }}</span>
          </template>
        </UCheckbox>
      </li>
    </ul>

    <UButton
      v-if="!showAll && manufacturers.length > LIMIT"
      variant="link"
      :label="expanded ? 'Show less' : `Show all ${manufacturers.length}`"
      trailing-icon="i-lucide-chevron-down"
      :aria-expanded="expanded"
      :aria-controls="listId"
      :ui="{ base: 'mt-1.5 px-0', trailingIcon: expanded ? 'rotate-180' : '' }"
      @click="expanded = !expanded"
    />
  </fieldset>
</template>

<script setup lang="ts">
import type { ManufacturerFacet } from "#shared/listing"

/** Manufacturers shown while the list is collapsed, besides the selected ones */
const LIMIT = 8

const { manufacturers, selected, showAll } = defineProps<{
  manufacturers: ManufacturerFacet[]
  selected: string[]
  showAll?: boolean
}>()

const emit = defineEmits<{
  "update:selected": [slugs: string[]]
}>()

const listId = useId()
const expanded = ref(false)

const selectedSet = computed(() => new Set(selected))

const shown = computed(() =>
  showAll || expanded.value
    ? manufacturers
    : manufacturers.filter((m, i) => i < LIMIT || selectedSet.value.has(m.slug))
)

function toggle(slug: string) {
  emit(
    "update:selected",
    selectedSet.value.has(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]
  )
}
</script>
