<script setup lang="ts">
import { computed } from 'vue'
import { VChip } from 'vuetify/components'

const props = defineProps<{
  total: number
  filtered: number
  isSearching: boolean
}>()

const counterText = computed(() => {
  if (!props.isSearching) {
    return `${props.total} release${props.total > 1 ? 's' : ''}`
  }
  return `${props.filtered} of ${props.total} release${props.total > 1 ? 's' : ''}`
})

const counterColor = computed(() => {
  if (!props.isSearching) return 'primary'
  return props.filtered === 0 ? 'warning' : 'success'
})
</script>

<template>
  <VChip :color="counterColor" variant="tonal" size="small" class="results-counter">
    <span class="font-weight-medium">{{ counterText }}</span>
  </VChip>
</template>

<style scoped>
.results-counter {
  transition: all 0.3s ease;
}
</style>
