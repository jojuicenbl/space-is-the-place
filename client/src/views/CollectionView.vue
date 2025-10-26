<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import VinylCard from '../components/VinylCard.vue'

import Pager from '@/components/UI/Pager.vue'
import CollectionFilters from '@/components/CollectionFilters.vue'
import ResultsCounter from '@/components/UI/ResultsCounter.vue'
import SearchIndicator from '@/components/UI/SearchIndicator.vue'
import SkeletonLoader from '@/components/UI/SkeletonLoader.vue'
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
      <div class="flex flex-col items-center w-full">
        <h1 class="page-title">THE COLLECTION</h1>
        <div class="text-center text-xs mt-2 mb-4 text-gray-600 dark:text-gray-400">
          Data provided by
          <a
            href="https://www.discogs.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="no-underline hover:underline text-primary-500 dark:text-primary-400"
          >
            Discogs
          </a>
        </div>
        <!-- Filters -->
        <Transition name="fade">
          <div v-show="isFiltersVisible" class="flex justify-center w-full">
            <CollectionFilters
              :folders="folders"
              :current-folder="currentFolder"
              :current-sort="currentSort"
              :current-sort-order="currentSortOrder"
              :releases="releases"
              :search-query="searchQuery"
              @update:folder="handleFolderChange"
              @update:sort="handleSortChange"
              @update:sort-order="handleSortOrderChange"
              @search="handleSearch"
            />
          </div>
        </Transition>
        <!-- Results Counter -->
        <Transition name="fade">
          <div v-show="isFiltersVisible" class="flex justify-center w-full mb-4">
            <ResultsCounter :total="totalItems" :filtered="releases.length" :is-searching="isSearchActive" />
          </div>
        </Transition>
        <!-- Search Loading Indicator - simplified -->
        <Transition name="fade">
          <SearchIndicator
            v-if="isSearchActive && isLoading"
            :is-loading="isLoading"
            :search-query="searchQuery"
            :result-count="releases.length"
          />
        </Transition>
        <!-- Content -->
        <!-- Results -->
        <Transition name="fade" mode="out-in">
          <!-- LOADING -->
          <div v-if="isLoading" key="loading" class="flex flex-wrap justify-center gap-3 mt-4">
            <SkeletonLoader
              v-for="n in 40"
              :key="n"
              type="image"
              class="skeleton-vinyl-card-width"
              width="222px"
              height="200px"
            />
          </div>
          <!-- ERROR -->
          <div v-else-if="error" key="error" class="flex justify-center items-center min-height-300">
            {{ error }}
          </div>
          <!-- EMPTY -->
          <div
            v-else-if="releases.length === 0 && isInitialized"
            key="empty"
            class="flex flex-col justify-center items-center min-height-300"
          >
            <div class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No releases found</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <span v-if="isSearchActive">Try adjusting your search terms or filters.</span>
              <span v-else>No releases in this folder.</span>
            </div>
          </div>
          <!-- GRID -->
          <div v-else key="grid" class="mt-4 mb-4 w-full">
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-0"
              :class="{ 'justify-items-center': releases.length === 1 }"
            >
              <VinylCard v-for="release in releases" :key="release.id" :release="release" class="w-full vinyl-card" />
            </div>
          </div>
        </Transition>
        <!-- Pagination -->
        <Transition name="fade">
          <div v-show="isPagerVisible && totalPages > 1" class="flex justify-center w-full">
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
  font-family: 'Inter', 'ui-sans-serif', 'system-ui', sans-serif;
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 900;
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

.min-height-300 {
  min-height: 300px;
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
