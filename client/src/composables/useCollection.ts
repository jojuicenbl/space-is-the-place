import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import axios from 'axios'
import { getCollection, searchCollection, getFolders } from '@/services/collectionApi'
import type { CollectionRelease } from '@/types/models/Release'
import type { DiscogsFolder, SortField, SortOrder } from '@/services/collectionApi'

// Mobile breakpoint (< 768px = mobile)
const MOBILE_BREAKPOINT = 768

// Snapshot interface for scroll restoration
interface CollectionSnapshot {
  items: CollectionRelease[]
  currentPage: number
  totalPages: number
  totalItems: number
  scrollPosition: number
  filters: {
    folder: number
    sort: SortField
    order: SortOrder
    search: string
  }
  timestamp: number
}

export function useCollection() {
  const route = useRoute()
  const router = useRouter()

  let controller: AbortController | null = null
  let lastQuery = ''
  let weOwnNavigation = false // Flag to prevent sync loops

  // State - much simplified since server handles caching and processing
  const releases = ref<CollectionRelease[]>([])
  const folders = ref<DiscogsFolder[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)

  // Pagination info from server
  const totalPages = ref(0)
  const totalItems = ref(0)
  const currentPageItems = ref(0)

  // Search state
  const isSearchActive = ref(false)
  const lastSearchQuery = ref('')

  // Filters state - initialized from URL params or defaults
  const currentFolder = ref<number>(0)
  const currentSort = ref<SortField>('added')
  const currentSortOrder = ref<SortOrder>('desc')
  const searchQuery = ref<string>('')
  const currentPage = ref<number>(1)

  // Mobile Load More state
  const isMobileView = ref(window.innerWidth < MOBILE_BREAKPOINT)
  const isLoadingMore = ref(false) // In-flight lock for load more
  const loadMoreError = ref<string | null>(null)

  // Computed
  const isSearching = computed(() => {
    return searchQuery.value.trim().length > 0
  })

  // Helper: Generate snapshot key from current filters
  const getSnapshotKey = () => {
    const parts = ['collection']
    if (currentFolder.value !== 0) parts.push(`f${currentFolder.value}`)
    if (currentSort.value !== 'added') parts.push(`s${currentSort.value}`)
    if (currentSortOrder.value !== 'desc') parts.push(`o${currentSortOrder.value}`)
    if (searchQuery.value.trim()) parts.push(`q${searchQuery.value.trim()}`)
    return parts.join('-')
  }

  // Update URL params (only called on explicit actions)
  const updateUrlParams = (silent = false) => {
    if (silent) weOwnNavigation = true

    const query: Record<string, string> = {}

    if (currentFolder.value !== 0) query.folder = currentFolder.value.toString()
    if (currentSort.value !== 'added') query.sort = currentSort.value
    if (currentSortOrder.value !== 'desc') query.order = currentSortOrder.value
    if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
    // Only add page to URL if > 1 (on mobile) or explicitly needed (desktop)
    if (currentPage.value > 1 && (isMobileView.value || !isMobileView.value)) {
      query.page = currentPage.value.toString()
    }

    router.replace({ query })

    if (silent) {
      setTimeout(() => {
        weOwnNavigation = false
      }, 50)
    }
  }

  // Read URL params and sync to state (single direction: URL → state)
  const syncFromUrl = () => {
    if (weOwnNavigation) return // Skip if we just wrote to URL

    currentFolder.value = Number(route.query.folder) || 0
    currentSort.value = (route.query.sort as SortField) || 'added'
    currentSortOrder.value = (route.query.order as SortOrder) || 'desc'
    searchQuery.value = (route.query.search as string) || ''
    currentPage.value = Number(route.query.page) || 1
  }

  // Update mobile view state on resize
  const updateMobileView = () => {
    isMobileView.value = window.innerWidth < MOBILE_BREAKPOINT
  }

  // Main fetch function - now much simpler
  const fetchCollection = async (resetPage = false, isLoadMore = false) => {
    // In-flight lock: prevent parallel requests on mobile load more
    if (isLoadMore && isLoadingMore.value) {
      return
    }

    if (resetPage) {
      currentPage.value = 1
      // Clear accumulated releases on reset (filter change)
      if (isMobileView.value) {
        releases.value = []
        clearSnapshot()
      }
    }

    try {
      if (isLoadMore) {
        isLoadingMore.value = true
        loadMoreError.value = null
      } else {
        isLoading.value = true
        error.value = null
      }

      const filters = {
        page: currentPage.value,
        perPage: 48,
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value,
        search: searchQuery.value.trim() || undefined
      }

      let result
      if (searchQuery.value.trim()) {
        // Use search endpoint
        result = await searchCollection(searchQuery.value.trim(), filters)
        isSearchActive.value = true
        lastSearchQuery.value = searchQuery.value.trim()
      } else {
        // Use regular collection endpoint
        result = await getCollection(filters)
        isSearchActive.value = false
        lastSearchQuery.value = ''
      }

      // Mobile: accumulate releases, Desktop: replace
      if (isMobileView.value && isLoadMore && currentPage.value > 1) {
        // Accumulate new releases for mobile load more (anti-duplicate by ID)
        const existingIds = new Set(releases.value.map((r) => r.id))
        const newReleases = result.releases.filter((r) => !existingIds.has(r.id))
        releases.value = [...releases.value, ...newReleases]
      } else {
        // Replace releases (desktop pagination or first page)
        releases.value = result.releases
      }

      totalPages.value = result.pagination.pages
      totalItems.value = result.pagination.items
      currentPageItems.value = result.releases.length

      // Update folders if they come with the response
      if (result.folders && result.folders.length > 0) {
        folders.value = result.folders
      }

      // Update URL only on explicit actions (Load More or filter change)
      if (isLoadMore || resetPage) {
        updateUrlParams(true)
      }

      // Save snapshot for mobile (complete items + scroll position)
      if (isMobileView.value && currentPage.value > 1) {
        saveSnapshot()
      }
    } catch (err) {
      // Ignore cancellation errors - these are expected when user changes filters quickly
      if (!axios.isCancel(err)) {
        console.error('Error loading collection:', err)
        if (isLoadMore) {
          loadMoreError.value = 'Failed to load more items'
        } else {
          error.value = 'Failed to load collection'
        }
      }
    } finally {
      if (isLoadMore) {
        isLoadingMore.value = false
      } else {
        isLoading.value = false
      }
      isInitialized.value = true
    }
  }

  // Handle Load More (mobile only)
  const handleLoadMore = async () => {
    if (currentPage.value >= totalPages.value) return
    if (isLoadingMore.value) return // In-flight lock

    currentPage.value += 1
    await fetchCollection(false, true)
  }

  // Retry Load More after error
  const retryLoadMore = async () => {
    loadMoreError.value = null
    await fetchCollection(false, true)
  }

  // Snapshot helpers - save complete state (items + scroll)
  const saveSnapshot = () => {
    const mainScroll = document.getElementById('main-scroll')
    if (!mainScroll || !isMobileView.value) return

    const key = getSnapshotKey()
    const snapshot: CollectionSnapshot = {
      items: releases.value,
      currentPage: currentPage.value,
      totalPages: totalPages.value,
      totalItems: totalItems.value,
      scrollPosition: mainScroll.scrollTop,
      filters: {
        folder: currentFolder.value,
        sort: currentSort.value,
        order: currentSortOrder.value,
        search: searchQuery.value
      },
      timestamp: Date.now()
    }

    try {
      sessionStorage.setItem(`collection-snapshot-${key}`, JSON.stringify(snapshot))
      // Set flag to indicate we expect a restoration (for back navigation detection)
      sessionStorage.setItem('collection-navigation-intent', 'should-restore')
      console.log(`[Snapshot] Saved: ${key}, page ${currentPage.value}, ${releases.value.length} items`)
    } catch (err) {
      console.error('Failed to save snapshot:', err)
      // If sessionStorage is full, clear old snapshots
      clearOldSnapshots()
    }
  }

  const loadSnapshot = (): boolean => {
    if (!isMobileView.value) return false

    // Check if we should restore (only on back navigation, not manual URL edit)
    const navigationIntent = sessionStorage.getItem('collection-navigation-intent')
    if (navigationIntent !== 'should-restore') {
      console.log(`[Snapshot] No restoration intent (manual URL edit or fresh load)`)
      return false
    }

    const key = getSnapshotKey()
    const saved = sessionStorage.getItem(`collection-snapshot-${key}`)
    if (!saved) {
      console.log(`[Snapshot] No snapshot found for key: ${key}`)
      sessionStorage.removeItem('collection-navigation-intent')
      return false
    }

    try {
      const snapshot: CollectionSnapshot = JSON.parse(saved)

      // Check if snapshot is still valid (< 30 minutes old)
      const maxAge = 30 * 60 * 1000 // 30 minutes
      if (Date.now() - snapshot.timestamp > maxAge) {
        console.log(`[Snapshot] Snapshot expired for key: ${key}`)
        sessionStorage.removeItem(`collection-snapshot-${key}`)
        sessionStorage.removeItem('collection-navigation-intent')
        return false
      }

      // Verify filters match exactly
      const filtersMatch =
        snapshot.filters.folder === currentFolder.value &&
        snapshot.filters.sort === currentSort.value &&
        snapshot.filters.order === currentSortOrder.value &&
        snapshot.filters.search === searchQuery.value

      if (!filtersMatch) {
        console.log(`[Snapshot] Filters mismatch for key: ${key}`)
        sessionStorage.removeItem('collection-navigation-intent')
        return false
      }

      // IMPORTANT: Only restore if the URL page matches the snapshot page
      // This prevents restoration when user manually edits ?page parameter
      if (currentPage.value !== snapshot.currentPage) {
        console.log(
          `[Snapshot] Page mismatch (URL: ${currentPage.value}, Snapshot: ${snapshot.currentPage}) - manual URL edit detected`
        )
        sessionStorage.removeItem('collection-navigation-intent')
        return false
      }

      // Restore complete state
      releases.value = snapshot.items
      currentPage.value = snapshot.currentPage
      totalPages.value = snapshot.totalPages
      totalItems.value = snapshot.totalItems

      console.log(`[Snapshot] Restored: ${key}, page ${snapshot.currentPage}, ${snapshot.items.length} items`)

      // Clear restoration intent flag
      sessionStorage.removeItem('collection-navigation-intent')

      // Restore scroll position after next tick (with validation)
      setTimeout(() => {
        const mainScroll = document.getElementById('main-scroll')
        if (mainScroll) {
          // Validate scroll position: ensure we have enough content
          const maxScroll = mainScroll.scrollHeight - mainScroll.clientHeight
          const targetScroll = Math.min(snapshot.scrollPosition, maxScroll)

          mainScroll.scrollTo({
            top: targetScroll,
            behavior: 'auto'
          })
          console.log(
            `[Snapshot] Scroll restored to: ${targetScroll}px (requested: ${snapshot.scrollPosition}px, max: ${maxScroll}px)`
          )
        }
      }, 150) // Increased delay to ensure DOM is fully rendered

      return true
    } catch (err) {
      console.error('Failed to load snapshot:', err)
      sessionStorage.removeItem(`collection-snapshot-${key}`)
      sessionStorage.removeItem('collection-navigation-intent')
      return false
    }
  }

  const clearSnapshot = () => {
    const key = getSnapshotKey()
    sessionStorage.removeItem(`collection-snapshot-${key}`)
    sessionStorage.removeItem('collection-navigation-intent')
    console.log(`[Snapshot] Cleared: ${key}`)
  }

  const clearOldSnapshots = () => {
    const maxAge = 30 * 60 * 1000 // 30 minutes
    const now = Date.now()

    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('collection-snapshot-')) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || '{}')
          if (data.timestamp && now - data.timestamp > maxAge) {
            sessionStorage.removeItem(key)
            console.log(`[Snapshot] Removed old snapshot: ${key}`)
          }
        } catch (err) {
          // Invalid JSON, remove it
          sessionStorage.removeItem(key)
        }
      }
    })
  }

  const doSearch = async (q: string, page = 1) => {
    // Annule la requête précédente si elle est en vol
    if (controller) controller.abort()
    controller = new AbortController()

    // Garde-fou: pas de requête si < 2 caractères
    if (q.trim().length < 2) {
      searchQuery.value = q
      isSearchActive.value = false
      currentPage.value = 1
      // recharge la page normale si tu veux ; sinon vide les résultats:
      // releases.value = []; totalItems.value = 0; totalPages.value = 0
      return
    }

    try {
      isLoading.value = true
      error.value = null
      currentPage.value = page
      const filters = {
        page: currentPage.value,
        perPage: 48,
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value
      }
      const res = await searchCollection(q.trim(), filters, { signal: controller.signal })
      releases.value = res.releases
      totalPages.value = res.pagination.pages
      totalItems.value = res.pagination.items
      isSearchActive.value = true
      lastSearchQuery.value = q.trim()
    } catch (e) {
      // Ignore cancellation errors (user typed before previous request finished)
      // These are expected and should not be treated as errors
      if (!axios.isCancel(e)) {
        console.error('Search error:', e)
        error.value = 'Failed to load collection'
      }
      // If canceled, silently ignore - this is normal behavior with debounced search
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const debouncedSearch = useDebounceFn((q: string) => doSearch(q, 1), 350, { maxWait: 800 })

  const clearSearchAndReload = async () => {
    // Annule la requête en cours (search ou autre)
    if (controller) controller.abort()

    isSearchActive.value = false
    searchQuery.value = ''
    currentPage.value = 1

    isLoading.value = true
    error.value = null
    try {
      await fetchCollection(false) // <- ta méthode existante de fetch "normal"
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }

    // (optionnel) Nettoyer l’URL: retirer le paramètre "q"
    router.replace({ query: { ...route.query, q: undefined } })
  }

  // Fetch folders separately
  const fetchFolders = async () => {
    try {
      const data = await getFolders()
      folders.value = data.folders
    } catch (err) {
      console.error('Error loading folders:', err)
      error.value = 'Failed to load folders'
    }
  }

  // Simplified search handler
  const handleSearch = (query: string) => {
    if (query.trim().length < 1) {
      lastQuery = query
      void clearSearchAndReload()
      return
    }
    if (query === lastQuery) return // distinctUntilChanged
    lastQuery = query
    searchQuery.value = query
    debouncedSearch(query)
  }

  // Folder change handler
  const handleFolderChange = async (folderId: number) => {
    currentFolder.value = folderId
    await fetchCollection(true)
  }

  // Sort change handler
  const handleSortChange = async (sort: SortField) => {
    currentSort.value = sort
    await fetchCollection(true)
  }

  // Sort order change handler
  const handleSortOrderChange = async (order: SortOrder) => {
    currentSortOrder.value = order
    await fetchCollection(true)
  }

  // Page change handler
  const handlePageChange = async (page: number) => {
    if (isSearchActive.value) {
      await doSearch(searchQuery.value, page)
    } else {
      currentPage.value = page
      await fetchCollection(false)
    }
  }

  // Helper: Scroll to top
  const scrollToTop = () => {
    const mainScroll = document.getElementById('main-scroll')
    if (mainScroll) {
      mainScroll.scrollTo({
        top: 0,
        behavior: 'auto' // Instant scroll for manual URL edits
      })
      console.log('[Scroll] Reset to top')
    }
  }

  // Initialize with URL params
  const initializeFromUrl = async () => {
    // Sync state from URL (single source of truth)
    syncFromUrl()

    // Fetch folders first
    await fetchFolders()

    // Try to restore from snapshot (mobile only)
    if (isMobileView.value) {
      const restored = loadSnapshot()
      if (restored) {
        console.log('[Init] Restored from snapshot')
        isInitialized.value = true
        return true
      }
    }

    // No snapshot found or desktop: fetch normally and scroll to top
    console.log('[Init] Fetching from API (no snapshot)')
    scrollToTop()
    await fetchCollection()

    return true
  }

  // Setup responsive listener
  onMounted(() => {
    window.addEventListener('resize', updateMobileView)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateMobileView)
    // Save snapshot on unmount (navigation to release view)
    if (isMobileView.value && currentPage.value > 1) {
      saveSnapshot()
    }
  })

  // Watch for URL changes (back/forward navigation or manual edit)
  watch(
    () => route.query,
    () => {
      if (weOwnNavigation) return // Skip if we just wrote to URL

      console.log('[Route] URL changed, syncing state...')
      const oldPage = currentPage.value
      const oldFolder = currentFolder.value
      const oldSort = currentSort.value
      const oldSortOrder = currentSortOrder.value
      const oldSearch = searchQuery.value

      syncFromUrl()

      // If filters changed, clear snapshot, scroll to top, and refetch
      if (
        currentFolder.value !== oldFolder ||
        currentSort.value !== oldSort ||
        currentSortOrder.value !== oldSortOrder ||
        searchQuery.value !== oldSearch
      ) {
        clearSnapshot()
        scrollToTop()
        void fetchCollection(true)
      }
      // If only page changed, try to restore snapshot or refetch
      else if (currentPage.value !== oldPage) {
        if (isMobileView.value) {
          const restored = loadSnapshot()
          if (!restored) {
            // Manual URL edit detected (no snapshot intent), scroll to top
            console.log('[Route] Manual page edit detected, scrolling to top')
            scrollToTop()
            void fetchCollection()
          }
          // else: snapshot restored with its own scroll position
        } else {
          // Desktop: always fetch and let pager handle it
          void fetchCollection()
        }
      }
    },
    { deep: true }
  )

  return {
    // State
    releases,
    folders,
    isLoading,
    isInitialized,
    error,

    // Pagination
    totalPages,
    totalItems,
    currentPageItems,

    // Search state
    isSearchActive: isSearching,
    lastSearchQuery,

    // Filters
    currentFolder,
    currentSort,
    currentSortOrder,
    searchQuery,
    currentPage,

    // Mobile Load More
    isMobileView,
    isLoadingMore,
    loadMoreError,

    // Methods
    fetchFolders,
    fetchCollection,
    initializeFromUrl,
    handleSearch,
    handleFolderChange,
    handleSortChange,
    handleSortOrderChange,
    handlePageChange,
    handleLoadMore,
    retryLoadMore,
    saveSnapshot,
    clearSnapshot
  }
}
