<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import VinylCard from '../components/VinylCard.vue'
import MainTitle from '@/components/UI/MainTitle.vue'

import Pager from '@/components/UI/Pager.vue'
import CollectionFilters from '@/components/CollectionFilters.vue'
import ResultsCounter from '@/components/UI/ResultsCounter.vue'
import SearchIndicator from '@/components/UI/SearchIndicator.vue'
import { VSkeletonLoader } from 'vuetify/components'
import AppNavbar from '@/components/Nav/AppNavbar.vue'
import { useCollection } from '@/composables/useCollection'

// UI state
const isFiltersVisible = ref(true)
const isContentVisible = ref(true)
const isPagerVisible = ref(true)
const collectionContainer = ref<HTMLElement>()

// Smooth scroll to collection top
const scrollToCollection = async () => {
  await nextTick()
  if (collectionContainer.value) {
    collectionContainer.value.scrollIntoView({
      behavior: 'smooth', // /!\ Todo: To keep or not ? /!\
      block: 'start'
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
  // Add a subtle loading effect
  isContentVisible.value = false

  // Scroll to collection top
  await scrollToCollection()

  // Slight delay for smooth transition
  setTimeout(async () => {
    await originalHandlePageChange(page)

    // Show content with delay for smooth appearance
    setTimeout(() => {
      isContentVisible.value = true
    }, 150)
  }, 100)
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
    <AppNavbar />
    <div class="page-content">
      <div ref="collectionContainer" class="mx-auto collection-container">
        <div class="d-flex flex-column align-center w-100">
          <MainTitle text="Collection" align="center" />
          <!-- Filters -->
          <Transition name="fade">
            <div v-show="isFiltersVisible" class="d-flex justify-center w-100">
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
            <div v-show="isFiltersVisible" class="d-flex justify-center w-100 mb-4">
              <ResultsCounter
                :total="totalItems"
                :filtered="releases.length"
                :is-searching="isSearchActive"
              />
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
          <Transition name="content-fade" mode="out-in">
            <div v-show="isContentVisible" key="content" class="content-container">
              <Transition name="fade" mode="out-in">
                <!-- Loading State -->
                <div
                  v-if="isLoading"
                  class="d-flex flex-wrap justify-center ga-3 mt-4"
                >
                  <v-skeleton-loader
                    v-for="n in 12"
                    :key="n"
                    class="vinyl-card-width"
                    type="image"
                    :loading="true"
                  ></v-skeleton-loader>
                </div>
                <!-- Error State -->
                <div v-else-if="error" class="d-flex justify-center align-center min-height-300">
                  {{ error }}
                </div>
                <!-- No Results State -->
                <div
                  v-else-if="
                    releases.length === 0 && !isLoading && isInitialized
                  "
                  class="d-flex flex-column justify-center align-center min-height-300"
                >
                  <div class="text-h6 mb-2">No releases found</div>
                  <div class="text-body-2 text-medium-emphasis">
                    <span v-if="isSearchActive"> Try adjusting your search terms or filters. </span>
                    <span v-else> No releases in this folder. </span>
                  </div>
                </div>
                <!-- Results -->
                <TransitionGroup
                  v-else
                  name="card-list"
                  tag="div"
                  class="d-flex flex-wrap justify-center ga-3 mt-4 w-100"
                >
                  <VinylCard
                    v-for="release in releases"
                    :key="release.id"
                    :release="release"
                    class="vinyl-card-width"
                  />
                </TransitionGroup>
              </Transition>
            </div>
          </Transition>
          <!-- Pagination -->
          <Transition name="fade">
            <div v-show="isPagerVisible && totalPages > 1" class="d-flex justify-center w-100 mt-8">
              <Pager
                :current-page="currentPage"
                :total-pages="totalPages"
                :on-page-change="handlePageChange"
              />
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.page-content {
  padding-top: 80px;
  /* Espace pour la navbar fixe */
}

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

.vinyl-card-width {
  width: 200px;
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
