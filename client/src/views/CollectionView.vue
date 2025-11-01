<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import VinylCard from '../components/VinylCard.vue'

import Pager from '@/components/UI/Pager.vue'
import LoadMoreButton from '@/components/UI/LoadMoreButton.vue'
import CollectionFilters from '@/components/CollectionFilters.vue'
import ResultsCounter from '@/components/UI/ResultsCounter.vue'
import SearchIndicator from '@/components/UI/SearchIndicator.vue'
import SkeletonLoader from '@/components/UI/SkeletonLoader.vue'
import { useCollection } from '@/composables/useCollection'

// UI state
const isFiltersVisible = ref(true)
const isContentVisible = ref(true)
const isPagerVisible = ref(true)

// Grid configuration: nombre de colonnes par breakpoint (synchronisé avec CSS)
const getInitialGridColumns = () => {
  const width = window.innerWidth
  // Synchronisé avec les breakpoints Tailwind et CSS
  if (width < 640) return 2       // mobile
  else if (width < 768) return 3  // sm
  else if (width < 1024) return 4 // md
  else return 6                   // xl
}

const gridColumns = ref(getInitialGridColumns())

const updateGridColumns = () => {
  const width = window.innerWidth
  // Synchronisé avec les breakpoints Tailwind et CSS
  if (width < 640) gridColumns.value = 2       // mobile
  else if (width < 768) gridColumns.value = 3  // sm
  else if (width < 1024) gridColumns.value = 4 // md
  else gridColumns.value = 6                   // xl
}

// Calcul du nombre de cartes fantômes nécessaires pour compléter la dernière rangée
const ghostCardsCount = computed(() => {
  const count = releases.value.length
  if (count === 0) return 0
  const remainder = count % gridColumns.value
  return remainder === 0 ? 0 : gridColumns.value - remainder
})

// Nombre de skeleton loaders à afficher (toujours un multiple du nombre de colonnes)
const skeletonCount = computed(() => {
  const baseCount = 40
  const remainder = baseCount % gridColumns.value
  return remainder === 0 ? baseCount : baseCount + (gridColumns.value - remainder)
})

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
  isMobileView,
  isLoadingMore,
  loadMoreError,
  fetchFolders,
  fetchCollection,
  initializeFromUrl,
  handleSearch,
  handleFolderChange,
  handleSortChange,
  handleSortOrderChange,
  handlePageChange: originalHandlePageChange,
  handleLoadMore,
  retryLoadMore,
  saveScrollRestoration
} = useCollection()

// Computed: Check if there are more pages to load
const hasMorePages = computed(() => currentPage.value < totalPages.value)

// Enhanced page change with smooth scroll and transitions
const handlePageChange = async (page: number) => {
  // Scroll to collection top first (desktop only)
  if (!isMobileView.value) {
    await scrollToCollection()
  }

  // Call the original handler which will set isLoading = true
  // This allows the skeleton loader to show during the loading
  await originalHandlePageChange(page)
}

// Wrapper for filter changes: scroll to top on mobile
const handleFolderChangeWithScroll = async (folderId: number) => {
  if (isMobileView.value) {
    await scrollToCollection()
  }
  await handleFolderChange(folderId)
}

const handleSortChangeWithScroll = async (sort: typeof currentSort.value) => {
  if (isMobileView.value) {
    await scrollToCollection()
  }
  await handleSortChange(sort)
}

const handleSortOrderChangeWithScroll = async (order: typeof currentSortOrder.value) => {
  if (isMobileView.value) {
    await scrollToCollection()
  }
  await handleSortOrderChange(order)
}

onMounted(async () => {
  // Start with all sections hidden for staggered animation
  isFiltersVisible.value = false
  isContentVisible.value = false
  isPagerVisible.value = false

  // Listen to screen size changes
  window.addEventListener('resize', updateGridColumns)

  await fetchFolders()

  // Try to initialize from URL params first, fallback to regular fetch
  const wasInitializedFromUrl = await initializeFromUrl()
  if (!wasInitializedFromUrl) {
    await fetchCollection()
  }

  // Staggered reveal with tight timing (≤350ms total)
  // Show sections in order: filters (0ms) → content (60ms) → pager (120ms)
  await nextTick()
  isFiltersVisible.value = true

  setTimeout(() => {
    isContentVisible.value = true
  }, 60)

  setTimeout(() => {
    isPagerVisible.value = true
  }, 120)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateGridColumns)
})
</script>
<template>
  <div class="collection-page">
    <div class="mx-auto collection-container">
      <div class="flex flex-col items-center w-full">
        <!-- Page Header - always visible -->
        <div class="collection-header">
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
        </div>

        <!-- Filters Section - stagger delay 0ms -->
        <Transition name="stagger-fade">
          <div v-show="isFiltersVisible" class="collection-filters-section">
            <div class="flex justify-center w-full">
              <CollectionFilters
                :folders="folders"
                :current-folder="currentFolder"
                :current-sort="currentSort"
                :current-sort-order="currentSortOrder"
                :releases="releases"
                :search-query="searchQuery"
                @update:folder="handleFolderChangeWithScroll"
                @update:sort="handleSortChangeWithScroll"
                @update:sort-order="handleSortOrderChangeWithScroll"
                @search="handleSearch"
              />
            </div>
            <!-- Results Counter -->
            <div class="flex justify-center w-full mb-4">
              <ResultsCounter :total="totalItems" :filtered="releases.length" :is-searching="isSearchActive" />
            </div>
            <!-- Search Loading Indicator -->
            <Transition name="fade">
              <SearchIndicator
                v-if="isSearchActive && isLoading"
                :is-loading="isLoading"
                :search-query="searchQuery"
                :result-count="releases.length"
              />
            </Transition>
          </div>
        </Transition>

        <!-- Content Section - stagger delay 60ms -->
        <Transition name="stagger-fade-delayed" mode="out-in">
          <div v-show="isContentVisible" class="collection-content-section">
            <Transition name="fade" mode="out-in">
              <!-- LOADING -->
              <div v-if="isLoading" key="loading" class="mt-4 mb-4 w-full">
                <div class="vinyl-grid">
                  <SkeletonLoader
                    v-for="n in skeletonCount"
                    :key="n"
                    type="image"
                    class="vinyl-grid-item"
                  />
                </div>
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
                  class="vinyl-grid"
                  :class="{ 'single-item': releases.length === 1 }"
                >
                  <VinylCard
                    v-for="release in releases"
                    :key="release.id"
                    :release="release"
                    class="vinyl-grid-item vinyl-card"
                  />
                  <!-- Cartes fantômes invisibles pour compléter la dernière rangée -->
                  <div
                    v-for="n in ghostCardsCount"
                    :key="`ghost-${n}`"
                    class="vinyl-grid-item ghost-card"
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>

        <!-- Pagination Section - stagger delay 120ms -->
        <Transition name="stagger-fade-pager">
          <div v-show="isPagerVisible && totalPages > 1" class="collection-pager-section">
            <!-- Desktop: Show Pager (>= md breakpoint) -->
            <div v-if="!isMobileView" class="flex justify-center w-full">
              <Pager :current-page="currentPage" :total-pages="totalPages" :on-page-change="handlePageChange" />
            </div>

            <!-- Mobile: Show Load More Button (< md breakpoint) -->
            <div v-else class="w-full">
              <LoadMoreButton
                :is-loading="isLoadingMore"
                :has-more="hasMorePages"
                :error="loadMoreError"
                :on-load-more="handleLoadMore"
                :on-retry="retryLoadMore"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* ====================================
   Layout & Container
   ==================================== */
.collection-page {
  width: 100%;
}

.collection-container {
  max-width: 1600px;
  /* Mobile: safe-area padding + base padding */
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}

@media (min-width: 1360px) {
  .collection-container {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }
}

/* ====================================
   Page Header
   ==================================== */
.collection-header {
  width: 100%;
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

/* ====================================
   Section Wrappers
   ==================================== */
.collection-filters-section,
.collection-content-section,
.collection-pager-section {
  width: 100%;
}

/* ====================================
   Staggered Fade Transitions
   ==================================== */

/* Base stagger-fade (no delay) - for filters */
.stagger-fade-enter-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stagger-fade-leave-active {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stagger-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.stagger-fade-leave-to {
  opacity: 0;
}

/* Delayed stagger-fade (60ms delay) - for content */
.stagger-fade-delayed-enter-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 60ms;
}

.stagger-fade-delayed-leave-active {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stagger-fade-delayed-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.stagger-fade-delayed-leave-to {
  opacity: 0;
}

/* Pager stagger-fade (120ms delay) - for pagination */
.stagger-fade-pager-enter-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 120ms;
}

.stagger-fade-pager-leave-active {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stagger-fade-pager-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.stagger-fade-pager-leave-to {
  opacity: 0;
}

/* Grille CSS pure avec nombre de colonnes fixe par breakpoint */
.vinyl-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Mobile: 2 colonnes */
  gap: 0.5rem; /* gap-2 = 8px */
  width: 100%;
}

/* Breakpoint sm (640px+) : 3 colonnes */
@media (min-width: 640px) {
  .vinyl-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Breakpoint md (768px+) : 4 colonnes */
@media (min-width: 768px) {
  .vinyl-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Breakpoint xl (1280px+) : 6 colonnes */
@media (min-width: 1280px) {
  .vinyl-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Cas spécial : un seul élément centré */
.vinyl-grid.single-item {
  justify-items: center;
}

/* Chaque item de la grille */
.vinyl-grid-item {
  width: 100%;
  /* Aspect ratio 1:1 pour toutes les cartes (vraies et fantômes) */
  aspect-ratio: 1 / 1;
}

.vinyl-card {
  transition: opacity 0.1s ease-in-out;
}

.vinyl-card:hover {
  opacity: 0.8;
}

/* Carte fantôme invisible qui occupe l'espace pour compléter la grille */
.ghost-card {
  visibility: hidden;
  pointer-events: none;
  /* Même aspect ratio que les vraies cartes */
  aspect-ratio: 1 / 1;
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

/* ====================================
   Reduced Motion Support
   ==================================== */
@media (prefers-reduced-motion: reduce) {
  .stagger-fade-enter-active,
  .stagger-fade-leave-active,
  .stagger-fade-delayed-enter-active,
  .stagger-fade-delayed-leave-active,
  .stagger-fade-pager-enter-active,
  .stagger-fade-pager-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none !important;
    transition-delay: 0ms !important;
  }

  .stagger-fade-enter-from,
  .stagger-fade-delayed-enter-from,
  .stagger-fade-pager-enter-from {
    transform: none !important;
  }
}
</style>
