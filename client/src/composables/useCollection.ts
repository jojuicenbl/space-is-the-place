import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import axios from 'axios'
import { getCollection, searchCollection, getFolders } from '@/services/collectionApi'
import type { CollectionRelease } from '@/types/models/Release'
import type { DiscogsFolder, SortField, SortOrder } from '@/services/collectionApi'

// Mobile breakpoint (< 768px = mobile)
const MOBILE_BREAKPOINT = 768

export function useCollection() {
  const route = useRoute()
  const router = useRouter()

  let controller: AbortController | null = null
  let lastQuery = ''

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

  // Filters state - initialized from URL params
  const currentFolder = ref<number>(Number(route.query.folder) || 0)
  const currentSort = ref<SortField>((route.query.sort as SortField) || 'added')
  const currentSortOrder = ref<SortOrder>((route.query.order as SortOrder) || 'desc')
  const searchQuery = ref<string>((route.query.search as string) || '')
  const currentPage = ref<number>(Number(route.query.page) || 1)

  // Mobile Load More state
  const isMobileView = ref(window.innerWidth < MOBILE_BREAKPOINT)
  const isLoadingMore = ref(false) // In-flight lock for load more
  const loadMoreError = ref<string | null>(null)

  // Scroll restoration state
  const scrollRestoration = ref<{
    position: number
    loadedPages: number[]
  } | null>(null)

  // Computed
  const isSearching = computed(() => {
    return searchQuery.value.trim().length > 0
  })

  // Update URL params when filters change
  const updateUrlParams = () => {
    const query: Record<string, string> = {}

    if (currentFolder.value !== 0) query.folder = currentFolder.value.toString()
    if (currentSort.value !== 'added') query.sort = currentSort.value
    if (currentSortOrder.value !== 'desc') query.order = currentSortOrder.value
    if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
    if (currentPage.value !== 1) query.page = currentPage.value.toString()

    router.replace({ query })
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
        scrollRestoration.value = null
        saveScrollRestoration()
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
        // Accumulate new releases for mobile load more
        releases.value = [...releases.value, ...result.releases]
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

      updateUrlParams()

      // Save scroll restoration state for mobile
      if (isMobileView.value) {
        saveScrollRestoration()
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

  // Scroll restoration helpers
  const saveScrollRestoration = () => {
    const mainScroll = document.getElementById('main-scroll')
    if (!mainScroll || !isMobileView.value) return

    const state = {
      position: mainScroll.scrollTop,
      loadedPages: Array.from({ length: currentPage.value }, (_, i) => i + 1),
      filters: {
        folder: currentFolder.value,
        sort: currentSort.value,
        order: currentSortOrder.value,
        search: searchQuery.value
      }
    }

    sessionStorage.setItem('collection-scroll-state', JSON.stringify(state))
  }

  const restoreScrollPosition = async () => {
    const savedState = sessionStorage.getItem('collection-scroll-state')
    if (!savedState || !isMobileView.value) return

    try {
      const state = JSON.parse(savedState)

      // Check if filters match
      const filtersMatch =
        state.filters.folder === currentFolder.value &&
        state.filters.sort === currentSort.value &&
        state.filters.order === currentSortOrder.value &&
        state.filters.search === searchQuery.value

      if (!filtersMatch || !state.loadedPages || state.loadedPages.length <= 1) {
        sessionStorage.removeItem('collection-scroll-state')
        return
      }

      // Load all previously loaded pages
      const maxPage = Math.max(...state.loadedPages)
      if (maxPage > 1) {
        for (let page = 2; page <= maxPage; page++) {
          currentPage.value = page
          await fetchCollection(false, true)
        }

        // Restore scroll position after a short delay
        setTimeout(() => {
          const mainScroll = document.getElementById('main-scroll')
          if (mainScroll && state.position) {
            mainScroll.scrollTo({
              top: state.position,
              behavior: 'auto'
            })
          }
        }, 100)
      }
    } catch (err) {
      console.error('Error restoring scroll state:', err)
      sessionStorage.removeItem('collection-scroll-state')
    }
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

  // Initialize with URL params
  const initializeFromUrl = async () => {
    // Set values from URL params
    if (route.query.folder) currentFolder.value = Number(route.query.folder)
    if (route.query.sort) currentSort.value = route.query.sort as SortField
    if (route.query.order) currentSortOrder.value = route.query.order as SortOrder
    if (route.query.search) searchQuery.value = route.query.search as string
    if (route.query.page) currentPage.value = Number(route.query.page)

    // Fetch folders first
    await fetchFolders()

    // Try to restore scroll state (mobile only)
    if (isMobileView.value) {
      await restoreScrollPosition()
    }

    // If restoration didn't happen, fetch normally
    if (!isMobileView.value || currentPage.value === 1) {
      await fetchCollection()
    }

    return true
  }

  // Setup responsive listener
  onMounted(() => {
    window.addEventListener('resize', updateMobileView)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateMobileView)
    // Save scroll state on unmount (navigation)
    if (isMobileView.value) {
      saveScrollRestoration()
    }
  })

  // Watch for URL changes (back/forward navigation)
  watch([currentFolder, currentSort, currentSortOrder, searchQuery, currentPage], () => {
    updateUrlParams()
  })

  // Clear scroll restoration on filter changes
  watch([currentFolder, currentSort, currentSortOrder, searchQuery], () => {
    if (isMobileView.value) {
      sessionStorage.removeItem('collection-scroll-state')
      scrollRestoration.value = null
    }
  })

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
    saveScrollRestoration
  }
}
