<script setup lang="ts">
/**
 * CollectionView - Unified Pagination (Infinite Scroll + Classic Pager)
 *
 * Mobile (< 768px): Infinite scroll with IntersectionObserver
 * Desktop (>= 768px): Classic pager
 *
 * Features:
 * - Responsive pagination mode switching
 * - Scroll restoration on back navigation
 * - URL state synchronization
 * - ARIA live regions for accessibility
 * - DOM cap management (10 batches = 480 items)
 * - Back to top button (mobile)
 * - Manual load more fallback
 */

import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import VinylCard from '../components/VinylCard.vue'

import Pager from '@/components/UI/Pager.vue'
import CollectionFilters from '@/components/CollectionFilters.vue'
import ResultsCounter from '@/components/UI/ResultsCounter.vue'
import SearchIndicator from '@/components/UI/SearchIndicator.vue'
import SkeletonLoader from '@/components/UI/SkeletonLoader.vue'
import BackToTop from '@/components/UI/BackToTop.vue'
import LoadMore from '@/components/UI/LoadMore.vue'
import InfiniteScrollSentinel from '@/components/UI/InfiniteScrollSentinel.vue'
import LiveRegion from '@/components/UI/LiveRegion.vue'
import DomCapMessage from '@/components/UI/DomCapMessage.vue'

import { usePaginationStore } from '@/stores/usePaginationStore'
import { useResponsive } from '@/composables/useResponsive'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import { getFolders } from '@/services/collectionApi'

// ============ STORES & COMPOSABLES ============

const paginationStore = usePaginationStore()
const { isMobile } = useResponsive()

// ============ UI STATE ============

const isFiltersVisible = ref(true)
const isContentVisible = ref(true)
const isPagerVisible = ref(true)

// ARIA live region message
const liveMessage = ref('')

// Sentinel ref for IntersectionObserver
const sentinelRef = ref<HTMLElement | null>(null)

// ============ GRID CONFIGURATION ============

const getInitialGridColumns = () => {
  const width = window.innerWidth
  if (width < 640) return 2 // mobile
  else if (width < 768) return 3 // sm
  else if (width < 1024) return 4 // md
  else return 6 // xl
}

const gridColumns = ref(getInitialGridColumns())

const updateGridColumns = () => {
  const width = window.innerWidth
  if (width < 640) gridColumns.value = 2
  else if (width < 768) gridColumns.value = 3
  else if (width < 1024) gridColumns.value = 4
  else gridColumns.value = 6
}

// Ghost cards to complete last row
const ghostCardsCount = computed(() => {
  const count = paginationStore.items.length
  if (count === 0) return 0
  const remainder = count % gridColumns.value
  return remainder === 0 ? 0 : gridColumns.value - remainder
})

// Skeleton loaders count
const skeletonCount = computed(() => {
  const baseCount = 40
  const remainder = baseCount % gridColumns.value
  return remainder === 0 ? baseCount : baseCount + (gridColumns.value - remainder)
})

// ============ PAGINATION MODE MANAGEMENT ============

// Watch responsive breakpoint and update mode
watch(
  isMobile,
  (mobile) => {
    const newMode = mobile ? 'infinite' : 'pager'
    console.log('[CollectionView] Breakpoint changed, setting mode to:', newMode)
    paginationStore.setMode(newMode)

    // If switching to infinite mode and already have items, setup observer
    if (mobile && paginationStore.items.length > 0) {
      nextTick(() => {
        setupInfiniteScroll()
      })
    }
  },
  { immediate: true }
)

// ============ INFINITE SCROLL ============

const { observe, disconnect } = useIntersectionObserver(
  () => {
    if (paginationStore.canLoadMore) {
      console.log('[CollectionView] Sentinel visible, loading more...')
      window.dispatchEvent(new CustomEvent('infinite_load_requested'))
      handleLoadMore()
    }
  },
  { rootMargin: '600px', threshold: 0.1 }
)

const setupInfiniteScroll = () => {
  if (sentinelRef.value && paginationStore.isInfiniteMode) {
    console.log('[CollectionView] Setting up IntersectionObserver')
    observe(sentinelRef.value)
  }
}

const handleLoadMore = async () => {
  const previousCount = paginationStore.items.length
  await paginationStore.loadMore()
  const newCount = paginationStore.items.length
  const loadedCount = newCount - previousCount

  if (loadedCount > 0) {
    liveMessage.value = `${loadedCount} new items loaded. Total: ${newCount}`
  }
}

const handleManualLoadMore = async () => {
  if (paginationStore.domCapReached) {
    paginationStore.resetDomCap()
  }
  await handleLoadMore()
}

// ============ PAGER MODE ============

const handlePageChange = async (page: number) => {
  // Scroll to collection top first
  await scrollToCollection()

  // Save scroll position before changing page
  const mainScroll = document.getElementById('main-scroll')
  if (mainScroll) {
    paginationStore.saveScrollPosition(0)
  }

  // Change page
  await paginationStore.changePage(page)
}

// ============ FILTERS ============

const handleFolderChange = async (folderId: number) => {
  await scrollToCollection()
  await paginationStore.applyFiltersAndSort({ folder: folderId })
}

const handleSortChange = async (sort: string) => {
  await scrollToCollection()
  await paginationStore.applyFiltersAndSort({ sort: sort as any })
}

const handleSortOrderChange = async (order: string) => {
  await scrollToCollection()
  await paginationStore.applyFiltersAndSort({ sortOrder: order as any })
}

const handleSearch = async (query: string) => {
  await scrollToCollection()
  await paginationStore.applyFiltersAndSort({ search: query })
}

// ============ SCROLL UTILITIES ============

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

// ============ LIFECYCLE ============

onMounted(async () => {
  // Start with sections hidden
  isFiltersVisible.value = false
  isContentVisible.value = false
  isPagerVisible.value = false

  // Listen to screen size changes
  window.addEventListener('resize', updateGridColumns)

  // Initialize from URL
  paginationStore.initializeFromUrl()

  // Load folders
  try {
    const data = await getFolders()
    paginationStore.folders = data.folders
  } catch (err) {
    console.error('Error loading folders:', err)
  }

  // Load initial data
  await paginationStore.loadInitial()

  // Setup infinite scroll if in mobile mode
  if (paginationStore.isInfiniteMode) {
    await nextTick()
    setupInfiniteScroll()
  }

  // Staggered reveal
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
  disconnect()
})
</script>

<template>
  <div class="collection-page">
    <div class="mx-auto collection-container">
      <div class="flex flex-col items-center w-full">
        <!-- Page Header -->
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

        <!-- Filters Section -->
        <Transition name="stagger-fade">
          <div v-show="isFiltersVisible" class="collection-filters-section">
            <div class="flex justify-center w-full">
              <CollectionFilters
                :folders="paginationStore.folders"
                :current-folder="paginationStore.currentFolder"
                :current-sort="paginationStore.currentSort"
                :current-sort-order="paginationStore.currentSortOrder"
                :releases="paginationStore.items"
                :search-query="paginationStore.searchQuery"
                @update:folder="handleFolderChange"
                @update:sort="handleSortChange"
                @update:sort-order="handleSortOrderChange"
                @search="handleSearch"
              />
            </div>

            <!-- Results Counter -->
            <div class="flex justify-center w-full mb-4">
              <ResultsCounter
                :total="paginationStore.totalItems"
                :filtered="paginationStore.items.length"
                :is-searching="paginationStore.isSearchActive"
              />
            </div>

            <!-- Search Loading Indicator -->
            <Transition name="fade">
              <SearchIndicator
                v-if="paginationStore.isSearchActive && paginationStore.isLoading"
                :is-loading="paginationStore.isLoading"
                :search-query="paginationStore.searchQuery"
                :result-count="paginationStore.items.length"
              />
            </Transition>
          </div>
        </Transition>

        <!-- Content Section -->
        <Transition name="stagger-fade-delayed" mode="out-in">
          <div v-show="isContentVisible" class="collection-content-section">
            <Transition name="fade" mode="out-in">
              <!-- LOADING (initial) -->
              <div v-if="paginationStore.isLoading && !paginationStore.isLoadingMore" key="loading" class="mt-4 mb-4 w-full">
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
              <div
                v-else-if="paginationStore.error && paginationStore.items.length === 0"
                key="error"
                class="flex flex-col justify-center items-center min-height-300"
              >
                <p class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {{ paginationStore.error }}
                </p>
                <button
                  type="button"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  @click="paginationStore.retry"
                >
                  Retry
                </button>
              </div>

              <!-- EMPTY -->
              <div
                v-else-if="paginationStore.items.length === 0 && paginationStore.isInitialized"
                key="empty"
                class="flex flex-col justify-center items-center min-height-300"
              >
                <div class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  No releases found
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <span v-if="paginationStore.isSearchActive">
                    Try adjusting your search terms or filters.
                  </span>
                  <span v-else>No releases in this folder.</span>
                </div>
              </div>

              <!-- GRID -->
              <div v-else key="grid" class="mt-4 mb-4 w-full">
                <div class="vinyl-grid" :class="{ 'single-item': paginationStore.items.length === 1 }">
                  <VinylCard
                    v-for="release in paginationStore.items"
                    :key="release.id"
                    :release="release"
                    class="vinyl-grid-item vinyl-card"
                  />

                  <!-- Ghost cards -->
                  <div
                    v-for="n in ghostCardsCount"
                    :key="`ghost-${n}`"
                    class="vinyl-grid-item ghost-card"
                    aria-hidden="true"
                  ></div>
                </div>

                <!-- INFINITE SCROLL: Loading more skeleton -->
                <div v-if="paginationStore.isLoadingMore" class="mt-4 w-full">
                  <div class="vinyl-grid">
                    <SkeletonLoader
                      v-for="n in gridColumns * 2"
                      :key="`more-${n}`"
                      type="image"
                      class="vinyl-grid-item"
                    />
                  </div>
                </div>

                <!-- INFINITE SCROLL: Sentinel -->
                <InfiniteScrollSentinel
                  v-if="paginationStore.isInfiniteMode && paginationStore.canLoadMore && !paginationStore.domCapReached"
                  ref="sentinelRef"
                  :debug="false"
                />

                <!-- INFINITE SCROLL: DOM Cap Message -->
                <DomCapMessage
                  v-if="paginationStore.isInfiniteMode && paginationStore.domCapReached"
                  :total-loaded="paginationStore.items.length"
                  :on-load-more="handleManualLoadMore"
                />

                <!-- INFINITE SCROLL: Manual Load More (error fallback) -->
                <LoadMore
                  v-if="paginationStore.isInfiniteMode && paginationStore.error && paginationStore.items.length > 0"
                  :is-loading="paginationStore.isLoadingMore"
                  :error="paginationStore.error"
                  @load-more="paginationStore.retry"
                />
              </div>
            </Transition>
          </div>
        </Transition>

        <!-- PAGER MODE: Pagination -->
        <Transition name="stagger-fade-pager">
          <div
            v-show="isPagerVisible && paginationStore.isPagerMode && paginationStore.totalPages > 1"
            class="collection-pager-section"
          >
            <div class="flex justify-center w-full">
              <Pager
                :current-page="paginationStore.currentPage"
                :total-pages="paginationStore.totalPages"
                :on-page-change="handlePageChange"
              />
            </div>
          </div>
        </Transition>

        <!-- INFINITE SCROLL: Back to Top Button -->
        <BackToTop v-if="paginationStore.isInfiniteMode" :threshold="800" scroll-target="main-scroll" />

        <!-- ARIA Live Region -->
        <LiveRegion :message="liveMessage" politeness="polite" :auto-clear="true" :clear-delay="3000" />
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
  transition:
    opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
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
  transition:
    opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
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
  transition:
    opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
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
