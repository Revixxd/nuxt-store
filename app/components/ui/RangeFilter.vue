<template>
  <fieldset class="min-w-0">
    <legend class="mb-3.5 text-sm font-semibold text-highlighted">{{ legend }}</legend>

    <USlider
      v-model="draft"
      :min="bounds.min"
      :max="bounds.max"
      :step="step"
      :disabled="bounds.min === bounds.max"
      :aria-label="legend"
      @change="commit({ min: draft[0]!, max: draft[1]! })"
    />

    <div class="mt-3.5 grid grid-cols-2 gap-3">
      <div
        v-for="end in ENDS"
        :key="end"
      >
        <label
          :for="`${id}-${end}`"
          class="mb-1 block text-xs font-medium text-muted"
        >
          {{ end === "min" ? "Min" : "Max" }}{{ unit ? ` (${unit})` : "" }}
        </label>
        <UInput
          :id="`${id}-${end}`"
          v-model="typed[end]"
          type="number"
          inputmode="decimal"
          :min="bounds.min"
          :max="bounds.max"
          :step="step"
          :disabled="bounds.min === bounds.max"
          class="w-full"
          @change="commitTyped"
        />
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { normaliseRange } from "#shared/listing"
import type { Range } from "#shared/listing"

const ENDS = ["min", "max"] as const

const {
  legend,
  bounds,
  range,
  step,
  unit = ""
} = defineProps<{
  legend: string
  bounds: Range
  range: Range
  step: number
  unit?: string
}>()

const emit = defineEmits<{
  commit: [range: Range]
}>()

const id = useId()

const draft = ref<number[]>([])
const typed = reactive<Record<(typeof ENDS)[number], string>>({ min: "", max: "" })

watch(
  () => [range.min, range.max],
  ([min, max]) => (draft.value = [min!, max!]),
  { immediate: true }
)

// The inputs follow the slider while it is dragged
watch(draft, showDraft, { immediate: true })

function showDraft() {
  Object.assign(typed, { min: String(draft.value[0]), max: String(draft.value[1]) })
}

function commit(next: Range) {
  const normalised = normaliseRange(next, bounds)
  draft.value = [normalised.min, normalised.max]
  if (normalised.min !== range.min || normalised.max !== range.max) emit("commit", normalised)
}

/** An emptied input goes back to its bound, an invalid one to the value it had */
function commitTyped() {
  const [min, max] = ENDS.map((end, i) => {
    if (typed[end] === "") return bounds[end]
    const value = Number(typed[end])
    return Number.isFinite(value) ? value : draft.value[i]!
  })
  commit({ min: min!, max: max! })
  // Show the normalised range even when it equals the draft, so the watch on it didn't fire
  showDraft()
}
</script>
