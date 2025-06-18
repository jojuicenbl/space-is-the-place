import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserCollection, getAllUserReleases, getAllUserReleasesProgressive, getUserFolders } from '@/services/discogsApi'
import type { CollectionRelease } from '@/types/models/Release'
import type { DiscogsFolder, SortField, SortOrder } from '@/services/discogsApi'

const ITEMS_PER_PAGE = 50

export function useCollection() {
  const route = useRoute()
  const router = useRouter()
  
  // State
  const allReleases = ref<CollectionRelease[]>([])
  const filteredReleases = ref<CollectionRelease[]>([])
  const displayedReleases = ref<CollectionRelease[]>([])
  const folders = ref<DiscogsFolder[]>([])
  const isLoading = ref(false)
  const isSearchLoading = ref(false)
  const isInitialized = ref(false)
  const hasAllReleases = ref(false) // Track if we have all releases in memory
  const totalReleasesCount = ref(0) // Total count from API
  const error = ref<string | null>(null)
  
  // Enhanced state for hybrid approach
  const isBackgroundLoading = ref(false) // Loading rest of collection in background
  const backgroundProgress = ref({ current: 0, total: 0 })
  const pagesLoaded = ref(new Set<number>()) // Track which pages we have
  const maxPageLoaded = ref(0) // Track the highest page loaded
  
  // Progress tracking for search operations
  const loadingProgress = ref({ current: 0, total: 0 })
  const isProgressiveLoading = ref(false)
  
  // Search state management
  const isSearchingAllData = ref(false) // Flag for when search needs all data
  const searchResultsReady = ref(false) // Flag for when search results are complete
  
  // Filters state - initialized from URL params
  const currentFolder = ref<number>(Number(route.query.folder) || 0)
  const currentSort = ref<SortField>((route.query.sort as SortField) || 'added')
  const currentSortOrder = ref<SortOrder>((route.query.order as SortOrder) || 'desc')
  const searchQuery = ref<string>((route.query.search as string) || '')
  const currentPage = ref<number>(Number(route.query.page) || 1)
  
  // Computed
  const totalPages = computed(() => {
    if (hasAllReleases.value) {
      // If we have all releases in memory, calculate pages based on filtered results
      return Math.ceil(filteredReleases.value.length / ITEMS_PER_PAGE)
    } else {
      // If we only have partial data, calculate based on total count from API
      return Math.ceil(totalReleasesCount.value / ITEMS_PER_PAGE)
    }
  })
  
  const isSearchActive = computed(() => {
    return searchQuery.value.trim().length > 0
  })
  
  const loadingPercentage = computed(() => {
    if (loadingProgress.value.total === 0) return 0
    return Math.round((loadingProgress.value.current / loadingProgress.value.total) * 100)
  })
  
  const backgroundLoadingPercentage = computed(() => {
    if (backgroundProgress.value.total === 0) return 0
    return Math.round((backgroundProgress.value.current / backgroundProgress.value.total) * 100)
  })
  
  // Check if we can handle search locally (have enough data)
  const canSearchLocally = computed(() => {
    if (!isSearchActive.value) return true
    return hasAllReleases.value || searchResultsReady.value
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
  
  // Filter and search logic
  const applyFilters = () => {
    let results = [...allReleases.value]
    
    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      results = results.filter(release => {
        const basicInfo = release.basic_information
        
        // Search in artist names
        const artistMatch = basicInfo.artists.some(artist => 
          artist.name.toLowerCase().includes(query)
        )
        
        // Search in album title
        const titleMatch = basicInfo.title.toLowerCase().includes(query)
        
        // Search in genres
        const genreMatch = basicInfo.genres?.some(genre => 
          genre.toLowerCase().includes(query)
        ) || false
        
        // Search in styles
        const styleMatch = basicInfo.styles?.some(style => 
          style.toLowerCase().includes(query)
        ) || false
        
        return artistMatch || titleMatch || genreMatch || styleMatch
      })
    }
    
    filteredReleases.value = results
    updatePagination()
  }
  
  // Update displayed releases based on current page
  const updatePagination = () => {
    if (hasAllReleases.value) {
      // Client-side pagination: slice the filtered results
      const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      displayedReleases.value = filteredReleases.value.slice(startIndex, endIndex)
    } else {
      // Server-side pagination: display all filtered results (already the right page)
      displayedReleases.value = filteredReleases.value
    }
    updateUrlParams()
  }
  
  // Fetch functions
  const fetchFolders = async () => {
    try {
      const username = import.meta.env.VITE_USERNAME
      const data = await getUserFolders(username)
      folders.value = data.folders
    } catch (err) {
      console.error('Error loading folders:', err)
      error.value = 'Failed to load folders'
    }
  }
  
  // Background loading of remaining pages
  const startBackgroundLoading = async () => {
    if (isBackgroundLoading.value || hasAllReleases.value) return
    
    const username = import.meta.env.VITE_USERNAME
    isBackgroundLoading.value = true
    
    try {
      // Load all releases in background
      const allData = await getAllUserReleasesProgressive(username, {
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value,
        onChunkLoaded: (releases, progress) => {
          // Only update allReleases if we don't have search results yet
          if (!isSearchActive.value || !searchResultsReady.value) {
            allReleases.value = releases
            backgroundProgress.value = progress
            
            // Mark that we have all releases
            if (progress.current === progress.total) {
              hasAllReleases.value = true
              searchResultsReady.value = true
            }
            
            applyFilters()
          }
        }
      })
      
      allReleases.value = allData
      hasAllReleases.value = true
      searchResultsReady.value = true
      
    } catch (err) {
      console.error('Background loading failed:', err)
    } finally {
      isBackgroundLoading.value = false
      backgroundProgress.value = { current: 0, total: 0 }
    }
  }
  
  // Fast initial fetch (single page) + smart background loading
  const fetchCollectionHybrid = async (forceRefresh = false) => {
    const username = import.meta.env.VITE_USERNAME
    
    try {
      isLoading.value = true
      error.value = null
      loadingProgress.value = { current: 0, total: 0 }
      
      // Reset states
      hasAllReleases.value = false
      searchResultsReady.value = false
      
      // STEP 1: Fast load of current page for immediate display
      const data = await getUserCollection(username, {
        page: currentPage.value,
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value,
      })
      
      allReleases.value = data.releases
      totalReleasesCount.value = data.pagination.items
      pagesLoaded.value = new Set([currentPage.value])
      maxPageLoaded.value = currentPage.value
      
      applyFilters()
      
      // STEP 2: Start background loading if collection is large enough
      const totalPages = Math.ceil(data.pagination.items / ITEMS_PER_PAGE)
      if (totalPages > 1 && !forceRefresh) {
        // Start background loading after a short delay
        setTimeout(() => {
          startBackgroundLoading()
        }, 500)
      }
      
    } catch (err) {
      error.value = 'Failed to load collection'
      console.error('Error loading collection:', err)
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }
  
  // Enhanced search that adapts to available data
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      // Clear search - use whatever data we have
      applyFilters()
      return
    }
    
    // If we have all data, search immediately
    if (hasAllReleases.value) {
      applyFilters()
      return
    }
    
    // If we don't have all data, we need to load it for comprehensive search
    const username = import.meta.env.VITE_USERNAME
    
    try {
      isSearchLoading.value = true
      isSearchingAllData.value = true
      loadingProgress.value = { current: 0, total: 0 }
      
      // Load all releases with progress tracking
      allReleases.value = await getAllUserReleases(username, {
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value,
        onProgress: (current, total) => {
          loadingProgress.value = { current, total }
        }
      })
      
      hasAllReleases.value = true
      searchResultsReady.value = true
      totalReleasesCount.value = allReleases.value.length
      
      applyFilters()
      
    } catch (err) {
      error.value = 'Search failed'
      console.error('Error during search:', err)
    } finally {
      isSearchLoading.value = false
      isSearchingAllData.value = false
      loadingProgress.value = { current: 0, total: 0 }
    }
  }
  
  // Event handlers
  const handleSearch = async (query: string) => {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page
    await performSearch(query)
  }
  
  const handleFolderChange = async (folderId: number) => {
    currentFolder.value = folderId
    currentPage.value = 1
    allReleases.value = [] // Clear current data
    hasAllReleases.value = false
    searchResultsReady.value = false
    await fetchCollectionHybrid(true)
  }
  
  const handleSortChange = async (sort: SortField) => {
    currentSort.value = sort
    currentPage.value = 1
    allReleases.value = [] // Clear current data
    hasAllReleases.value = false
    searchResultsReady.value = false
    await fetchCollectionHybrid(true)
  }
  
  const handleSortOrderChange = async (order: SortOrder) => {
    currentSortOrder.value = order
    currentPage.value = 1
    allReleases.value = [] // Clear current data
    hasAllReleases.value = false
    searchResultsReady.value = false
    await fetchCollectionHybrid(true)
  }
  
  const handlePageChange = async (page: number) => {
    currentPage.value = page
    
    if (hasAllReleases.value) {
      // If we have all releases in memory, just update pagination client-side
      updatePagination()
    } else {
      // If we need to fetch a specific page, do it quickly
      const username = import.meta.env.VITE_USERNAME
      
      try {
        isLoading.value = true
        const data = await getUserCollection(username, {
          page,
          folderId: currentFolder.value,
          sort: currentSort.value,
          sortOrder: currentSortOrder.value,
        })
        
        allReleases.value = data.releases
        pagesLoaded.value.add(page)
        maxPageLoaded.value = Math.max(maxPageLoaded.value, page)
        
        applyFilters()
      } catch (err) {
        error.value = 'Failed to load page'
        console.error('Error loading page:', err)
      } finally {
        isLoading.value = false
      }
    }
  }
  
  // Initialize with URL params
  const initializeFromUrl = async () => {
    // If we have URL params indicating previous state, start loading immediately
    if (route.query.search || route.query.folder || route.query.sort || route.query.page) {
      await fetchCollectionHybrid()
      
      // If there's a search query, perform the search
      if (route.query.search) {
        await performSearch(route.query.search as string)
      }
      
      return true // Indicate that we handled initialization
    }
    return false // Indicate that no URL params were found
  }
  
  // Watchers to update URL when state changes
  watch([currentFolder, currentSort, currentSortOrder, searchQuery, currentPage], () => {
    updateUrlParams()
  })
  
  return {
    // State
    allReleases,
    filteredReleases,
    displayedReleases,
    folders,
    isLoading,
    isSearchLoading,
    isInitialized,
    hasAllReleases,
    totalReleasesCount,
    error,
    
    // Enhanced state for hybrid approach
    isBackgroundLoading,
    backgroundProgress,
    backgroundLoadingPercentage,
    isSearchingAllData,
    searchResultsReady,
    canSearchLocally,
    
    // Progress tracking
    loadingProgress,
    loadingPercentage,
    isProgressiveLoading,
    
    // Filters
    currentFolder,
    currentSort,
    currentSortOrder,
    searchQuery,
    currentPage,
    totalPages,
    isSearchActive,
    
    // Methods
    fetchFolders,
    fetchCollection: fetchCollectionHybrid,
    initializeFromUrl,
    handleSearch,
    handleFolderChange,
    handleSortChange,
    handleSortOrderChange,
    handlePageChange,
  }
} 