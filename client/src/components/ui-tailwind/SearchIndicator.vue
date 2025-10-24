<script setup lang="ts">
import { computed } from 'vue'
import Badge from './Badge.vue'

const props = defineProps<{
  isLoading: boolean
  searchQuery: string
  resultCount: number
  loadingProgress?: { current: number; total: number }
  loadingPercentage?: number
  isSearchingAllData?: boolean
  isBackgroundLoading?: boolean
  backgroundProgress?: { current: number; total: number }
  backgroundLoadingPercentage?: number
  canSearchLocally?: boolean
}>()

const progressBarWidth = computed(() => {
  return props.loadingPercentage ? `${props.loadingPercentage}%` : '0%'
})

const backgroundProgressWidth = computed(() => {
  return props.backgroundLoadingPercentage ? `${props.backgroundLoadingPercentage}%` : '0%'
})
</script>

<template>
  <!-- Search Loading -->
  <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 w-full">
    <!-- Search Loading - All Data -->
    <div v-if="isSearchingAllData" class="flex flex-col items-center">
      <!-- Spinner -->
      <div
        class="w-8 h-8 mb-3 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Loading collection"
      ></div>

      <!-- Progress bar for search data loading -->
      <div v-if="loadingProgress && loadingProgress.total > 1" class="w-64 text-center">
        <div class="relative w-full h-1 mb-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="absolute top-0 left-0 h-full bg-primary-500 transition-all duration-300 ease-out rounded-full"
            :style="{ width: progressBarWidth }"
          ></div>
        </div>
        <div class="min-h-5">
          <span class="text-xs text-gray-600">
            Loading collection for search... {{ loadingProgress.current }} / {{ loadingProgress.total }} pages
            <span v-if="loadingPercentage">({{ loadingPercentage }}%)</span>
          </span>
        </div>
      </div>

      <!-- Simple loading text for search -->
      <div v-else class="text-xs text-gray-600">Preparing search data...</div>
    </div>

    <!-- Regular loading (page load) -->
    <div v-else class="flex flex-col items-center">
      <div
        class="w-7 h-7 mb-2 border-3 border-secondary-500 border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Loading page"
      ></div>
      <div class="text-xs text-gray-600">Loading page...</div>
    </div>
  </div>

  <!-- Background Loading Indicator (non-blocking) -->
  <div v-else-if="isBackgroundLoading" class="flex flex-col items-center py-4 w-full">
    <Badge variant="default" size="sm" class="mb-2 inline-flex items-center gap-2">
      <div
        class="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Loading in background"
      ></div>
      <span>
        Loading collection in background...
        <span v-if="backgroundProgress && backgroundProgress.total > 1">
          {{ backgroundLoadingPercentage }}%
        </span>
      </span>
    </Badge>

    <!-- Subtle hint about search capabilities -->
    <div v-if="!canSearchLocally" class="text-xs text-gray-600 mt-1">
      Search will be faster once background loading completes
    </div>
  </div>
</template>

<style scoped>
.border-3 {
  border-width: 3px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
