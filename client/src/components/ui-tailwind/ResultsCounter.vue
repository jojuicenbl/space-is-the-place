<script setup lang="ts">
import { computed } from 'vue'
import Badge from './Badge.vue'

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

const badgeVariant = computed<'default' | 'primary' | 'success' | 'warning'>(() => {
  if (!props.isSearching) return 'primary'
  return props.filtered === 0 ? 'warning' : 'success'
})
</script>

<template>
  <Badge :variant="badgeVariant" size="md" class="results-counter font-medium transition-all duration-300">
    {{ counterText }}
  </Badge>
</template>
