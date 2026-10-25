<template>
  <div
    ref="root"
    role="search"
    class="max-w-190"
  >
    <label
      for="search"
      class="sr-only"
      >Search products</label
    >
    <UInput
      id="search"
      v-model="text"
      type="search"
      size="xl"
      icon="i-lucide-search"
      placeholder="Search by name, manufacturer or description…"
      autocomplete="off"
      :loading="loading"
      class="w-full"
      :ui="{ trailing: 'pe-1.5' }"
      @keydown.enter="commit()"
    >
      <template
        v-if="text"
        #trailing
      >
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="Clear search"
          @click="clear"
        />
      </template>
    </UInput>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, useFocusWithin } from "@vueuse/core"
import { listingQuerySchema } from "#shared/listing"

const { query, loading = false } = defineProps<{
  query: string | undefined
  loading?: boolean
}>()

const emit = defineEmits<{
  commit: [query: string | undefined, replace: boolean]
}>()

const text = ref(query ?? "")

const root = useTemplateRef<HTMLElement>("root")
const { focused } = useFocusWithin(root)

function normalise(value: string) {
  return listingQuerySchema.shape.q.parse(value)
}

watch(
  () => query,
  (applied) => {
    if (!focused.value && normalise(text.value) !== applied) text.value = applied ?? ""
  }
)

let committedThisFocus = false
watch(focused, () => (committedThisFocus = false))

function commit({ replace = committedThisFocus } = {}) {
  const next = normalise(text.value)
  if (next === query) return
  emit("commit", next, replace)
  committedThisFocus = true
}

const debouncedCommit = useDebounceFn(() => commit(), 300)
watch(text, () => debouncedCommit())

function clear() {
  text.value = ""
  commit({ replace: false })
}
</script>
