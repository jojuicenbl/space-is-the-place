<script setup lang="ts">
import { VProgressCircular, VProgressLinear, VChip } from 'vuetify/components'

defineProps<{
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
</script>

<template>
  <div v-if="isLoading" class="search-indicator">
    <!-- Search Loading -->
    <div v-if="isSearchingAllData" class="search-loading">
      <VProgressCircular
        indeterminate
        color="primary"
        size="32"
        width="3"
        class="mb-3"
      />
      
      <!-- Progress bar for search data loading -->
      <div v-if="loadingProgress && loadingProgress.total > 1" class="progress-container">
        <VProgressLinear
          :model-value="loadingPercentage"
          color="primary"
          height="4"
          rounded
          class="mb-2"
        />
        <div class="progress-text">
          <span class="text-caption text-medium-emphasis">
            Loading collection for search...
            {{ loadingProgress.current }} / {{ loadingProgress.total }} pages
            <span v-if="loadingPercentage">({{ loadingPercentage }}%)</span>
          </span>
        </div>
      </div>
      
      <!-- Simple loading text for search -->
      <div v-else class="text-caption text-medium-emphasis">
        Preparing search data...
      </div>
    </div>
    
    <!-- Regular loading (page load) -->
    <div v-else class="regular-loading">
      <VProgressCircular
        indeterminate
        color="secondary"
        size="28"
        width="3"
        class="mb-2"
      />
      <div class="text-caption text-medium-emphasis">
        Loading page...
      </div>
    </div>
  </div>
  
  <!-- Background Loading Indicator (non-blocking) -->
  <div v-else-if="isBackgroundLoading" class="background-indicator">
    <VChip
      color="info"
      variant="tonal"
      size="small"
      class="mb-2"
    >
      <VProgressCircular
        indeterminate
        size="16"
        width="2"
        color="info"
        class="mr-2"
      />
      Loading collection in background...
      <span v-if="backgroundProgress && backgroundProgress.total > 1">
        {{ backgroundLoadingPercentage }}%
      </span>
    </VChip>
    
    <!-- Subtle hint about search capabilities -->
    <div v-if="!canSearchLocally" class="text-caption text-medium-emphasis">
      Search will be faster once background loading completes
    </div>
  </div>
</template>

<style scoped>
.search-indicator {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  width: 100%;
}

.search-loading,
.regular-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.background-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0 0.5rem 0;
  width: 100%;
}

.progress-container {
  width: 250px;
  text-align: center;
}

.progress-text {
  min-height: 20px;
}
</style> 