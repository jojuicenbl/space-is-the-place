import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { getCollection, searchCollection, getFolders } from '@/services/collectionApi'
import type { CollectionRelease } from '@/types/models/Release'
import type { DiscogsFolder, SortField, SortOrder } from '@/services/collectionApi'

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

  // Main fetch function - now much simpler
  const fetchCollection = async (resetPage = false) => {
    if (resetPage) {
      currentPage.value = 1
    }

    try {
      isLoading.value = true
      error.value = null

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

      releases.value = result.releases
      totalPages.value = result.pagination.pages
      totalItems.value = result.pagination.items
      currentPageItems.value = result.releases.length

      // Update folders if they come with the response
      if (result.folders && result.folders.length > 0) {
        folders.value = result.folders
      }

      updateUrlParams()
    } catch (err) {
      console.error('Error loading collection:', err)
      error.value = 'Failed to load collection'
    } finally {
      isLoading.value = false
      isInitialized.value = true
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((e as any).name !== 'CanceledError' && (e as any).name !== 'AbortError') {
        console.error(e)
        error.value = 'Failed to load collection'
      }
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

    // Then fetch collection with the current params
    await fetchCollection()

    return true
  }

  // Watch for URL changes (back/forward navigation)
  watch([currentFolder, currentSort, currentSortOrder, searchQuery, currentPage], () => {
    updateUrlParams()
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

    // Methods
    fetchFolders,
    fetchCollection,
    initializeFromUrl,
    handleSearch,
    handleFolderChange,
    handleSortChange,
    handleSortOrderChange,
    handlePageChange
  }
}
