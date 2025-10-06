<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import VinylCard from '../components/VinylCard.vue'

import Pager from '@/components/UI/Pager.vue'
import CollectionFilters from '@/components/CollectionFilters.vue'
import ResultsCounter from '@/components/UI/ResultsCounter.vue'
import SearchIndicator from '@/components/UI/SearchIndicator.vue'
import { VSkeletonLoader, VRow, VCol, VContainer } from 'vuetify/components'
import { useCollection } from '@/composables/useCollection'

// UI state
const isFiltersVisible = ref(true)
const isContentVisible = ref(true)
const isPagerVisible = ref(true)

// Smooth scroll to collection top
const scrollToCollection = async () => {
  await nextTick()
  const mainScroll = document.getElementById('main-scroll')
  if (mainScroll) {
    mainScroll.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// Use collection composable - much simpler now
const {
  releases,
  folders,
  isLoading,
  isInitialized,
  totalItems,
  error,
  currentFolder,
  currentSort,
  currentSortOrder,
  searchQuery,
  currentPage,
  totalPages,
  isSearchActive,
  fetchFolders,
  fetchCollection,
  initializeFromUrl,
  handleSearch,
  handleFolderChange,
  handleSortChange,
  handleSortOrderChange,
  handlePageChange: originalHandlePageChange
} = useCollection()

// Enhanced page change with smooth scroll and transitions
const handlePageChange = async (page: number) => {
  // Scroll to collection top first
  await scrollToCollection()

  // Call the original handler which will set isLoading = true
  // This allows the skeleton loader to show during the loading
  await originalHandlePageChange(page)
}

onMounted(async () => {
  isFiltersVisible.value = false
  isContentVisible.value = true
  isPagerVisible.value = false

  await fetchFolders()

  // Try to initialize from URL params first, fallback to regular fetch
  const wasInitializedFromUrl = await initializeFromUrl()
  if (!wasInitializedFromUrl) {
    await fetchCollection()
  }

  // show outer components with slight delay
  setTimeout(() => {
    isFiltersVisible.value = true
    isPagerVisible.value = true
  }, 100)
})
</script>
<template>
  <div>
    <div class="mx-auto collection-container">
      <div class="d-flex flex-column align-center w-100">
        <h1 class="page-title">THE COLLECTION</h1>
        <div class="text-center text-caption mt-2 mb-4">
          Data provided by <a href="https://www.discogs.com/" target="_blank" rel="noopener noreferrer"
            class="text-decoration-none">Discogs</a>
        </div>
        <!-- Filters -->
        <Transition name="fade">
          <div v-show="isFiltersVisible" class="d-flex justify-center w-100">
            <CollectionFilters :folders="folders" :current-folder="currentFolder" :current-sort="currentSort"
              :current-sort-order="currentSortOrder" :releases="releases" :search-query="searchQuery"
              @update:folder="handleFolderChange" @update:sort="handleSortChange"
              @update:sort-order="handleSortOrderChange" @search="handleSearch" />
          </div>
        </Transition>
        <!-- Results Counter -->
        <Transition name="fade">
          <div v-show="isFiltersVisible" class="d-flex justify-center w-100 mb-4">
            <ResultsCounter :total="totalItems" :filtered="releases.length" :is-searching="isSearchActive" />
          </div>
        </Transition>
        <!-- Search Loading Indicator - simplified -->
        <Transition name="fade">
          <SearchIndicator v-if="isSearchActive && isLoading" :is-loading="isLoading" :search-query="searchQuery"
            :result-count="releases.length" />
        </Transition>
        <!-- Content -->
        <!-- Results -->
        <Transition name="fade" mode="out-in">
          <!-- LOADING -->
          <div v-if="isLoading" key="loading" class="d-flex flex-wrap justify-center ga-3 mt-4">
            <v-skeleton-loader v-for="n in 40" :key="n" class="skeleton-vinyl-card-width" type="image"
              :loading="true" />
          </div>
          <!-- ERROR -->
          <div v-else-if="error" key="error" class="d-flex justify-center align-center min-height-300">
            {{ error }}
          </div>
          <!-- EMPTY -->
          <div v-else-if="releases.length === 0 && isInitialized" key="empty"
            class="d-flex flex-column justify-center align-center min-height-300">
            <div class="text-h6 mb-2">No releases found</div>
            <div class="text-body-2 text-medium-emphasis">
              <span v-if="isSearchActive">Try adjusting your search terms or filters.</span>
              <span v-else>No releases in this folder.</span>
            </div>
          </div>
          <!-- GRID -->
          <div v-else key="grid" class="mt-4 w-100">
            <v-container fluid class="pa-0">
              <v-row no-gutters :class="{ 'justify-center': releases.length === 1 }">
                <v-col v-for="release in releases" :key="release.id" cols="6" sm="4" md="3" lg="2" class="pa-1 d-flex">
                  <VinylCard :release="release" class="w-100 vinyl-card" />
                </v-col>
              </v-row>
            </v-container>
          </div>
        </Transition>
        <!-- Pagination -->
        <Transition name="fade">
          <div v-show="isPagerVisible && totalPages > 1" class="d-flex justify-center w-100 mt-8">
            <Pager :current-page="currentPage" :total-pages="totalPages" :on-page-change="handlePageChange" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
<style scoped>
.collection-container {
  max-width: 1400px;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 1360px) {
  .collection-container {
    padding-left: 8px;
    padding-right: 8px;
  }
}

.page-title {
  font-family: 'Rubik Mono One', monospace;
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 400;
  color: var(--color-heading);
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  line-height: 1.1;
  text-align: center;
}

.skeleton-vinyl-card-width {
  width: 222px;
}

.vinyl-card {
  transition: opacity 0.1s ease-in-out;
}

.vinyl-card:hover {
  opacity: 0.8;
}

.vinyl-card-col {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

:deep(.v-col) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.min-height-300 {
  min-height: 300px;
}

/* Add transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Content transitions for page changes */
.content-fade-enter-active,
.content-fade-leave-active {
  transition: all 0.4s ease;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.content-container {
  transition: all 0.4s ease;
}

/* Card list transitions */
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.5s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Ensure items maintain their space during transition */
.card-list-move {
  transition: transform 0.5s ease;
}

/* Add some custom styling for the skeleton loaders */
:deep(.v-skeleton-loader) {
  border-radius: 4px;
}

:deep(.v-skeleton-loader__image) {
  height: 200px !important;
  border-radius: 4px;
}

:deep(.v-skeleton-loader__text) {
  max-width: 90% !important;
  margin: 8px auto !important;
}
</style>
