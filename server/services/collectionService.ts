import axios from 'axios'
import type {
  DiscogsCollectionResponse,
  DiscogsCollectionRelease,
  DiscogsFoldersResponse,
  DiscogsFolder,
  SortField,
  SortOrder,
  CollectionFilters,
  DiscogsPagination
} from '../types/discogs'

const DISCOGS_API_URL = 'https://api.discogs.com'
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
const USERNAME = process.env.DISCOGS_USERNAME

if (!DISCOGS_TOKEN || !USERNAME) {
  throw new Error('DISCOGS_TOKEN and DISCOGS_USERNAME environment variables are required')
}

const discogsApi = axios.create({
  baseURL: DISCOGS_API_URL,
  headers: {
    Authorization: `Discogs token=${DISCOGS_TOKEN}`,
    'User-Agent': 'SpaceIsThePlace/1.0'
  },
  timeout: 15000
})

interface CachedCollection {
  releases: DiscogsCollectionRelease[]
  lastUpdated: number
  totalItems: number
  folders: DiscogsFolder[]
}

interface RetryConfig {
  maxRetries: number
  delayMs: number
  backoffFactor: number
}

class CollectionService {
  private cache: Map<string, CachedCollection> = new Map()
  private readonly CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
  private readonly DEFAULT_PER_PAGE = 50
  private loadingPromises: Map<string, Promise<CachedCollection>> = new Map()

  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    delayMs: 1000,
    backoffFactor: 2
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    config: RetryConfig = this.defaultRetryConfig
  ): Promise<T> {
    let lastError: Error | null = null
    let delay = config.delayMs

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        return await fetchFn()
      } catch (error: unknown) {
        lastError = error as Error

        // Don't retry on auth errors
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          throw error
        }

        if (attempt === config.maxRetries) {
          throw error
        }

        console.warn(
          `Request failed (attempt ${attempt}/${config.maxRetries}). Retrying in ${delay}ms...`,
          (error as Error).message
        )

        await this.sleep(delay)
        delay *= config.backoffFactor
      }
    }

    throw lastError || new Error('Retry failed')
  }

  private getCacheKey(folderId: number = 0): string {
    return `collection_${USERNAME}_${folderId}`
  }

  private isCacheValid(cached: CachedCollection): boolean {
    return Date.now() - cached.lastUpdated < this.CACHE_DURATION
  }

  private async fetchFolders(): Promise<DiscogsFolder[]> {
    return this.fetchWithRetry(async () => {
      const response = await discogsApi.get<DiscogsFoldersResponse>(`/users/${USERNAME}/collection/folders`)
      return response.data.folders
    })
  }

  private async fetchAllReleases(folderId: number = 0): Promise<{
    releases: DiscogsCollectionRelease[]
    totalItems: number
    folders: DiscogsFolder[]
  }> {
    console.log(`Fetching all releases for folder ${folderId}...`)

    // Fetch folders first
    const folders = await this.fetchFolders()

    // Get first page to know total count
    const firstPageResponse = await this.fetchWithRetry(async () => {
      return discogsApi.get<DiscogsCollectionResponse>(
        `/users/${USERNAME}/collection/folders/${folderId}/releases`,
        {
          params: {
            page: 1,
            per_page: this.DEFAULT_PER_PAGE,
            sort: 'added',
            sort_order: 'desc'
          }
        }
      )
    })

    const firstPageData = firstPageResponse.data
    const totalPages = firstPageData.pagination.pages
    const totalItems = firstPageData.pagination.items
    const allReleases = [...firstPageData.releases]

    console.log(`Total pages: ${totalPages}, Total items: ${totalItems}`)

    // Fetch remaining pages with rate limiting
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        try {
          // Rate limiting: 250ms between requests
          await this.sleep(250)

          const response = await this.fetchWithRetry(async () => {
            return discogsApi.get<DiscogsCollectionResponse>(
              `/users/${USERNAME}/collection/folders/${folderId}/releases`,
              {
                params: {
                  page,
                  per_page: this.DEFAULT_PER_PAGE,
                  sort: 'added',
                  sort_order: 'desc'
                }
              }
            )
          })

          allReleases.push(...response.data.releases)
          console.log(`Fetched page ${page}/${totalPages}`)
        } catch (error) {
          console.error(`Failed to fetch page ${page}:`, error)
          // Continue with other pages
        }
      }
    }

    console.log(`Successfully loaded ${allReleases.length} releases`)

    return {
      releases: allReleases,
      totalItems,
      folders
    }
  }

  private sortReleases(releases: DiscogsCollectionRelease[], sort: SortField, order: SortOrder): DiscogsCollectionRelease[] {
    const sortedReleases = [...releases]

    sortedReleases.sort((a, b) => {
      let comparison = 0

      switch (sort) {
        case 'added':
          comparison = new Date(a.date_added).getTime() - new Date(b.date_added).getTime()
          break
        case 'artist': {
          const artistA = a.basic_information.artists[0]?.name.toLowerCase() || ''
          const artistB = b.basic_information.artists[0]?.name.toLowerCase() || ''
          comparison = artistA.localeCompare(artistB)
          break
        }
        case 'title':
          comparison = a.basic_information.title.toLowerCase().localeCompare(b.basic_information.title.toLowerCase())
          break
      }

      return order === 'asc' ? comparison : -comparison
    })

    return sortedReleases
  }

  private filterReleases(releases: DiscogsCollectionRelease[], search?: string): DiscogsCollectionRelease[] {
    if (!search || search.trim() === '') {
      return releases
    }

    const query = search.toLowerCase().trim()

    return releases.filter(release => {
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

  private paginateReleases(releases: DiscogsCollectionRelease[], page: number, perPage: number) {
    const totalItems = releases.length
    const totalPages = Math.ceil(totalItems / perPage)
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedReleases = releases.slice(startIndex, endIndex)

    return {
      releases: paginatedReleases,
      pagination: {
        page,
        pages: totalPages,
        per_page: perPage,
        items: totalItems,
        urls: {
          first: page > 1 ? `?page=1` : undefined,
          prev: page > 1 ? `?page=${page - 1}` : undefined,
          next: page < totalPages ? `?page=${page + 1}` : undefined,
          last: page < totalPages ? `?page=${totalPages}` : undefined
        }
      }
    }
  }

  async getCollection(filters: CollectionFilters = {}): Promise<{
    releases: DiscogsCollectionRelease[]
    pagination: DiscogsPagination
    folders: DiscogsFolder[]
  }> {
    const {
      page = 1,
      perPage = this.DEFAULT_PER_PAGE,
      folderId = 0,
      sort = 'added',
      sortOrder = 'desc',
      search
    } = filters

    // Get folders (lightweight call)
    const folders = await this.fetchFolders()

    // If there's a search query, we need the full collection
    if (search && search.trim() !== '') {
      return this.getCollectionWithSearch(filters)
    }

    // For normal pagination, fetch only the requested page from Discogs directly
    console.log(`Fetching page ${page} directly from Discogs API...`)
    
    const response = await this.fetchWithRetry(async () => {
      return discogsApi.get<DiscogsCollectionResponse>(
        `/users/${USERNAME}/collection/folders/${folderId}/releases`,
        {
          params: {
            page,
            per_page: perPage,
            sort,
            sort_order: sortOrder
          }
        }
      )
    })

    const data = response.data

    return {
      releases: data.releases,
      pagination: data.pagination,
      folders
    }
  }

  // Method for search that loads full collection into cache
  private async getCollectionWithSearch(filters: CollectionFilters): Promise<{
    releases: DiscogsCollectionRelease[]
    pagination: DiscogsPagination
    folders: DiscogsFolder[]
  }> {
    const {
      page = 1,
      perPage = this.DEFAULT_PER_PAGE,
      folderId = 0,
      sort = 'added',
      sortOrder = 'desc',
      search
    } = filters

    const cacheKey = this.getCacheKey(folderId)

    // Check if we're already loading this collection
    const existingPromise = this.loadingPromises.get(cacheKey)
    if (existingPromise) {
      console.log('Waiting for existing search cache fetch to complete...')
      await existingPromise
    }

    // Check cache
    let cached = this.cache.get(cacheKey)
    if (!cached || !this.isCacheValid(cached)) {
      console.log(`Search initiated - loading full collection for folder ${folderId}...`)

      // Create loading promise to prevent multiple simultaneous fetches
      const loadingPromise = this.fetchAllReleases(folderId).then(data => {
        const cachedData: CachedCollection = {
          releases: data.releases,
          totalItems: data.totalItems,
          folders: data.folders,
          lastUpdated: Date.now()
        }
        this.cache.set(cacheKey, cachedData)
        return cachedData
      }).finally(() => {
        this.loadingPromises.delete(cacheKey)
      })

      this.loadingPromises.set(cacheKey, loadingPromise)
      cached = await loadingPromise
    }

    // Apply search filter
    let filteredReleases = this.filterReleases(cached.releases, search)

    // Apply sorting
    filteredReleases = this.sortReleases(filteredReleases, sort, sortOrder)

    // Apply pagination
    const result = this.paginateReleases(filteredReleases, page, perPage)

    return {
      releases: result.releases,
      pagination: result.pagination,
      folders: cached.folders
    }
  }

  async searchCollection(query: string, filters: CollectionFilters = {}): Promise<{
    releases: DiscogsCollectionRelease[]
    pagination: DiscogsPagination
    folders: DiscogsFolder[]
    totalResults: number
  }> {
    // Delegate to getCollection with search parameter
    const result = await this.getCollection({
      ...filters,
      search: query
    })

    return {
      ...result,
      totalResults: result.pagination.items
    }
  }

  async getFolders(): Promise<DiscogsFolder[]> {
    // Try to get folders from cache first
    const cacheKey = this.getCacheKey(0)
    const cached = this.cache.get(cacheKey)
    
    if (cached && this.isCacheValid(cached)) {
      return cached.folders
    }

    // If not in cache, fetch them
    return this.fetchFolders()
  }

  // Method to force refresh cache
  async refreshCache(folderId: number = 0): Promise<void> {
    const cacheKey = this.getCacheKey(folderId)
    this.cache.delete(cacheKey)
    await this.getCollection({ folderId })
  }

  // Cleanup method
  cleanup(): void {
    for (const [key, cached] of this.cache.entries()) {
      if (!this.isCacheValid(cached)) {
        this.cache.delete(key)
      }
    }
  }
}

export const collectionService = new CollectionService()

// Run cleanup every 30 minutes
setInterval(() => {
  collectionService.cleanup()
}, 30 * 60 * 1000) 