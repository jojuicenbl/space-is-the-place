/**
 * Unified Pagination Store
 *
 * Manages both infinite scroll (mobile) and classic pager (desktop) pagination modes.
 * Follows DRY principles by centralizing all pagination logic.
 *
 * Features:
 * - Dual mode support: 'infinite' | 'pager'
 * - Cursor-based pagination ready (with fallback to offset-based)
 * - URL state synchronization
 * - Scroll position restoration
 * - DOM cap management (max 10 batches)
 * - Request deduplication and abort handling
 * - Error recovery with retry mechanism
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { getCollection, searchCollection } from '@/services/collectionApi'
import type { CollectionRelease } from '@/types/models/Release'
import type { DiscogsFolder, SortField, SortOrder } from '@/services/collectionApi'

export type PaginationMode = 'infinite' | 'pager'

interface PaginationState {
  // Core data
  items: CollectionRelease[]
  folders: DiscogsFolder[]

  // Pagination metadata
  currentPage: number
  totalPages: number
  totalItems: number
  nextCursor: string | null
  hasMore: boolean

  // Loading & error states
  isLoading: boolean
  isLoadingMore: boolean
  isInitialized: boolean
  error: string | null

  // Filters
  currentFolder: number
  currentSort: SortField
  currentSortOrder: SortOrder
  searchQuery: string

  // Search state
  isSearchActive: boolean

  // Infinite scroll state
  batchesLoaded: number
  lastScrollY: number
  domCapReached: boolean

  // Request management
  abortController: AbortController | null
}

const ITEMS_PER_PAGE = 48
const MAX_BATCHES = 20 // Increased to support ~960 items (20 × 48)
const DOM_CAP_LIMIT = MAX_BATCHES * ITEMS_PER_PAGE // 960 items
const BATCH_INCREMENT = 5 // Load this many more batches when user clicks "Continue Loading"

export const usePaginationStore = defineStore('pagination', () => {
  const router = useRouter()
  const route = useRoute()

  // ============ STATE ============

  const mode = ref<PaginationMode>('pager') // Will be set by the view based on breakpoint

  const items = ref<CollectionRelease[]>([])
  const folders = ref<DiscogsFolder[]>([])

  const currentPage = ref<number>(1)
  const totalPages = ref<number>(0)
  const totalItems = ref<number>(0)
  const nextCursor = ref<string | null>(null)
  const hasMore = ref<boolean>(true)

  const isLoading = ref<boolean>(false)
  const isLoadingMore = ref<boolean>(false)
  const isInitialized = ref<boolean>(false)
  const error = ref<string | null>(null)

  const currentFolder = ref<number>(0)
  const currentSort = ref<SortField>('added')
  const currentSortOrder = ref<SortOrder>('desc')
  const searchQuery = ref<string>('')

  const isSearchActive = ref<boolean>(false)

  const batchesLoaded = ref<number>(0)
  const maxBatchesAllowed = ref<number>(10) // Start with 10, can be increased
  const lastScrollY = ref<number>(0)
  const domCapReached = ref<boolean>(false)

  let abortController: AbortController | null = null

  // ============ COMPUTED ============

  const isInfiniteMode = computed(() => mode.value === 'infinite')
  const isPagerMode = computed(() => mode.value === 'pager')

  const canLoadMore = computed(() => {
    if (isPagerMode.value) return false
    if (!isInitialized.value) return false
    if (isLoading.value || isLoadingMore.value) return false
    if (domCapReached.value) return false
    if (!hasMore.value) return false
    return true
  })

  const currentPageItems = computed(() => items.value.length)

  // ============ ACTIONS ============

  /**
   * Set pagination mode (infinite or pager)
   */
  function setMode(newMode: PaginationMode) {
    if (mode.value !== newMode) {
      console.log(`[PaginationStore] Switching mode from ${mode.value} to ${newMode}`)
      mode.value = newMode

      // Reset infinite scroll specific state when switching to pager
      if (newMode === 'pager') {
        batchesLoaded.value = 0
        domCapReached.value = false
        nextCursor.value = null
      }
    }
  }

  /**
   * Update URL query parameters
   */
  function updateUrlParams() {
    const query: Record<string, string> = {}

    if (currentFolder.value !== 0) query.folder = currentFolder.value.toString()
    if (currentSort.value !== 'added') query.sort = currentSort.value
    if (currentSortOrder.value !== 'desc') query.order = currentSortOrder.value
    if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
    if (currentPage.value !== 1) query.page = currentPage.value.toString()

    router.replace({ query })
  }

  /**
   * Abort any in-flight request
   */
  function abortPendingRequest() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  /**
   * Load initial data (first page/batch)
   */
  async function loadInitial() {
    abortPendingRequest()
    abortController = new AbortController()

    try {
      isLoading.value = true
      error.value = null
      items.value = []
      currentPage.value = 1
      batchesLoaded.value = 0
      domCapReached.value = false
      nextCursor.value = null

      const filters = {
        page: 1,
        perPage: ITEMS_PER_PAGE,
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value,
        search: searchQuery.value.trim() || undefined
      }

      let result
      if (searchQuery.value.trim()) {
        result = await searchCollection(searchQuery.value.trim(), filters)
        isSearchActive.value = true
      } else {
        result = await getCollection(filters)
        isSearchActive.value = false
      }

      items.value = result.releases
      totalPages.value = result.pagination.pages
      totalItems.value = result.pagination.items
      hasMore.value = currentPage.value < totalPages.value

      if (result.folders && result.folders.length > 0) {
        folders.value = result.folders
      }

      if (isInfiniteMode.value) {
        batchesLoaded.value = 1
      }

      updateUrlParams()

      console.log('[PaginationStore] Initial load complete', {
        mode: mode.value,
        items: items.value.length,
        totalPages: totalPages.value,
        hasMore: hasMore.value
      })
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('[PaginationStore] Load initial error:', err)
        error.value = 'Failed to load collection'
      }
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Load more items (infinite scroll only)
   */
  async function loadMore() {
    if (!canLoadMore.value) {
      console.log('[PaginationStore] Cannot load more', {
        canLoadMore: canLoadMore.value,
        isLoadingMore: isLoadingMore.value,
        hasMore: hasMore.value,
        domCapReached: domCapReached.value
      })
      return
    }

    // Check DOM cap
    if (batchesLoaded.value >= maxBatchesAllowed.value) {
      console.log('[PaginationStore] DOM cap reached', {
        batchesLoaded: batchesLoaded.value,
        maxAllowed: maxBatchesAllowed.value
      })
      domCapReached.value = true
      return
    }

    abortPendingRequest()
    abortController = new AbortController()

    try {
      isLoadingMore.value = true
      error.value = null

      const nextPage = currentPage.value + 1

      const filters = {
        page: nextPage,
        perPage: ITEMS_PER_PAGE,
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value,
        search: searchQuery.value.trim() || undefined
      }

      let result
      if (searchQuery.value.trim()) {
        result = await searchCollection(searchQuery.value.trim(), filters)
      } else {
        result = await getCollection(filters)
      }

      // Append new items
      items.value = [...items.value, ...result.releases]
      currentPage.value = nextPage
      totalPages.value = result.pagination.pages
      totalItems.value = result.pagination.items
      hasMore.value = currentPage.value < totalPages.value

      batchesLoaded.value++

      // Check if we reached the DOM cap
      if (batchesLoaded.value >= maxBatchesAllowed.value) {
        domCapReached.value = true
      }

      updateUrlParams()

      console.log('[PaginationStore] Load more complete', {
        page: currentPage.value,
        batchesLoaded: batchesLoaded.value,
        totalItems: items.value.length,
        hasMore: hasMore.value,
        domCapReached: domCapReached.value
      })

      // Emit event for observability
      window.dispatchEvent(new CustomEvent('infinite_load_success', {
        detail: {
          page: currentPage.value,
          itemsLoaded: result.releases.length,
          totalLoaded: items.value.length
        }
      }))
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('[PaginationStore] Load more error:', err)
        error.value = 'Failed to load more items'

        window.dispatchEvent(new CustomEvent('infinite_load_error', {
          detail: { error: err }
        }))
      }
    } finally {
      isLoadingMore.value = false
    }
  }

  /**
   * Change page (pager mode only)
   */
  async function changePage(page: number) {
    if (isInfiniteMode.value) return

    abortPendingRequest()
    abortController = new AbortController()

    try {
      isLoading.value = true
      error.value = null

      const filters = {
        page,
        perPage: ITEMS_PER_PAGE,
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value,
        search: searchQuery.value.trim() || undefined
      }

      let result
      if (searchQuery.value.trim()) {
        result = await searchCollection(searchQuery.value.trim(), filters)
      } else {
        result = await getCollection(filters)
      }

      items.value = result.releases
      currentPage.value = page
      totalPages.value = result.pagination.pages
      totalItems.value = result.pagination.items
      hasMore.value = currentPage.value < totalPages.value

      updateUrlParams()

      console.log('[PaginationStore] Page change complete', {
        page: currentPage.value,
        items: items.value.length
      })
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('[PaginationStore] Change page error:', err)
        error.value = 'Failed to change page'
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Apply filters and sort (resets pagination)
   */
  async function applyFiltersAndSort(filters: {
    folder?: number
    sort?: SortField
    sortOrder?: SortOrder
    search?: string
  }) {
    let changed = false

    if (filters.folder !== undefined && filters.folder !== currentFolder.value) {
      currentFolder.value = filters.folder
      changed = true
    }

    if (filters.sort !== undefined && filters.sort !== currentSort.value) {
      currentSort.value = filters.sort
      changed = true
    }

    if (filters.sortOrder !== undefined && filters.sortOrder !== currentSortOrder.value) {
      currentSortOrder.value = filters.sortOrder
      changed = true
    }

    if (filters.search !== undefined && filters.search !== searchQuery.value) {
      searchQuery.value = filters.search
      changed = true
    }

    if (changed) {
      console.log('[PaginationStore] Filters changed, reloading...')
      await loadInitial()
    }
  }

  /**
   * Save scroll position
   */
  function saveScrollPosition(scrollY: number) {
    lastScrollY.value = scrollY
  }

  /**
   * Restore scroll position
   */
  function restoreScrollPosition() {
    if (lastScrollY.value > 0) {
      const mainScroll = document.getElementById('main-scroll')
      if (mainScroll) {
        mainScroll.scrollTo({
          top: lastScrollY.value,
          behavior: 'auto' // Instant restore
        })
      }
    }
  }

  /**
   * Initialize from URL parameters
   */
  function initializeFromUrl() {
    if (route.query.folder) currentFolder.value = Number(route.query.folder)
    if (route.query.sort) currentSort.value = route.query.sort as SortField
    if (route.query.order) currentSortOrder.value = route.query.order as SortOrder
    if (route.query.search) searchQuery.value = route.query.search as string
    if (route.query.page) currentPage.value = Number(route.query.page)
  }

  /**
   * Reset DOM cap (allow loading more after cap was reached)
   * Increases the allowed batch limit by BATCH_INCREMENT
   */
  function resetDomCap() {
    const oldMax = maxBatchesAllowed.value
    maxBatchesAllowed.value = Math.min(
      maxBatchesAllowed.value + BATCH_INCREMENT,
      MAX_BATCHES // Never exceed absolute maximum
    )

    console.log('[PaginationStore] Resetting DOM cap', {
      oldMax,
      newMax: maxBatchesAllowed.value,
      batchesLoaded: batchesLoaded.value,
      canLoadMore: maxBatchesAllowed.value > batchesLoaded.value
    })

    domCapReached.value = false
  }

  /**
   * Retry after error
   */
  async function retry() {
    console.log('[PaginationStore] Retrying...')
    error.value = null

    if (isInfiniteMode.value && items.value.length > 0) {
      // Retry loading more
      await loadMore()
    } else {
      // Retry initial load
      await loadInitial()
    }
  }

  // ============ RETURN ============

  return {
    // State
    mode,
    items,
    folders,
    currentPage,
    totalPages,
    totalItems,
    nextCursor,
    hasMore,
    isLoading,
    isLoadingMore,
    isInitialized,
    error,
    currentFolder,
    currentSort,
    currentSortOrder,
    searchQuery,
    isSearchActive,
    batchesLoaded,
    lastScrollY,
    domCapReached,

    // Computed
    isInfiniteMode,
    isPagerMode,
    canLoadMore,
    currentPageItems,

    // Actions
    setMode,
    loadInitial,
    loadMore,
    changePage,
    applyFiltersAndSort,
    saveScrollPosition,
    restoreScrollPosition,
    initializeFromUrl,
    resetDomCap,
    retry,
    updateUrlParams
  }
})
