/**
 * Collection service - Lightweight orchestrator
 * Delegates to specialized services following DRY principle
 * Supports both demo mode (app token) and user mode (OAuth)
 */

import type {
  DiscogsCollectionRelease,
  DiscogsFolder,
  SortField,
  SortOrder,
  CollectionFilters,
  DiscogsPagination
} from '../types/discogs'
import {
  DiscogsClient,
  createDemoDiscogsClient,
  createUserDiscogsClient
} from './discogs/discogsClient'
import type { User } from '../types/user'
import { searchService } from './search/searchService'
import { InMemoryCacheService, createCacheEntry } from './cache/cacheService'
import type { CachedData } from '../interfaces/cache.interface'
import { parseDiscogsYear } from '../utils/normalization'

/**
 * Collection query parameters
 */
export interface CollectionQuery {
  mode: 'demo' | 'user'
  page?: number
  perPage?: number
  folderId?: number
  sort?: SortField
  sortOrder?: SortOrder
  search?: string
  currentUser?: User | null
}

/**
 * Collection result with mode information
 */
export interface CollectionResult {
  mode: 'demo' | 'user' | 'unlinked' | 'empty'
  discogsUsername: string | null
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  releases: DiscogsCollectionRelease[]
  folders: DiscogsFolder[]
}

interface CachedCollection {
  releases: DiscogsCollectionRelease[]
  totalItems: number
  folders: DiscogsFolder[]
}

export class CollectionService {
  private cache: InMemoryCacheService<CachedCollection>
  private readonly DEFAULT_PER_PAGE = 50
  private loadingPromises: Map<string, Promise<CachedData<CachedCollection>>> = new Map()
  private demoUsername: string

  constructor() {
    this.cache = new InMemoryCacheService<CachedCollection>(15) // 15min TTL
    // Get demo username from environment
    this.demoUsername = process.env.DISCOGS_APP_DEMO_USERNAME || ''
  }

  /**
   * Create appropriate Discogs client based on mode and user
   */
  private createDiscogsClient(query: CollectionQuery): {
    client: DiscogsClient
    username: string
  } {
    if (query.mode === 'demo') {
      return {
        client: createDemoDiscogsClient(),
        username: this.demoUsername
      }
    } else {
      // User mode
      if (!query.currentUser?.discogsAuth) {
        throw new Error('User not authenticated with Discogs')
      }

      const { accessToken, accessTokenSecret, discogsUsername } = query.currentUser.discogsAuth

      return {
        client: createUserDiscogsClient(accessToken, accessTokenSecret),
        username: discogsUsername
      }
    }
  }

  /**
   * Main method: Get collection by mode (demo or user)
   */
  async getCollectionByMode(query: CollectionQuery): Promise<CollectionResult> {
    const {
      mode,
      page = 1,
      perPage = this.DEFAULT_PER_PAGE,
      folderId = 0,
      sort = 'added',
      sortOrder = 'desc',
      search,
      currentUser
    } = query

    // Handle user mode with no Discogs auth
    if (mode === 'user' && !currentUser?.discogsAuth) {
      return {
        mode: 'unlinked',
        discogsUsername: null,
        page,
        perPage,
        totalItems: 0,
        totalPages: 0,
        releases: [],
        folders: []
      }
    }

    // Create appropriate client
    const { client, username } = this.createDiscogsClient(query)

    // Get folders
    const folders = await client.getFolders(username)

    // If there's a search query, use search mode
    if (search && search.trim() !== '') {
      return this.getCollectionByModeWithSearch(query, client, username, folders)
    }

    // Direct page fetch from Discogs
    console.log(`Fetching page ${page} for ${mode} mode (${username})...`)

    const data = await client.getCollectionPage(username, folderId, page, perPage, sort, sortOrder)

    // Check if empty collection for user mode
    const actualMode =
      mode === 'user' && data.pagination.items === 0
        ? 'empty'
        : mode === 'user'
          ? 'user'
          : 'demo'

    return {
      mode: actualMode,
      discogsUsername: username,
      page: data.pagination.page,
      perPage: data.pagination.per_page,
      totalItems: data.pagination.items,
      totalPages: data.pagination.pages,
      releases: data.releases,
      folders
    }
  }

  /**
   * Get collection by mode with search (loads full collection into cache)
   */
  private async getCollectionByModeWithSearch(
    query: CollectionQuery,
    client: DiscogsClient,
    username: string,
    folders: DiscogsFolder[]
  ): Promise<CollectionResult> {
    const {
      mode,
      page = 1,
      perPage = this.DEFAULT_PER_PAGE,
      folderId = 0,
      sort = 'added',
      sortOrder = 'desc',
      search,
      currentUser
    } = query

    const cacheKey = this.getCacheKeyForMode(mode, folderId, currentUser)

    // Check if already loading
    const existingPromise = this.loadingPromises.get(cacheKey)
    if (existingPromise) {
      console.log('Waiting for existing cache fetch...')
      await existingPromise
    }

    // Check cache
    let cachedData = this.cache.get(cacheKey)
    if (!cachedData) {
      console.log(`Search initiated - loading full collection for ${mode} mode...`)

      const loadingPromise = this.fetchAndCacheCollectionForMode(
        client,
        username,
        folderId,
        folders,
        cacheKey
      )
      this.loadingPromises.set(cacheKey, loadingPromise)

      try {
        cachedData = await loadingPromise
      } finally {
        this.loadingPromises.delete(cacheKey)
      }
    }

    const cached = cachedData.data

    // Apply search filter
    let filteredReleases = this.filterReleases(cached.releases, search)

    // Apply sorting
    filteredReleases = this.sortReleases(filteredReleases, sort, sortOrder)

    // Apply pagination
    const result = this.paginateReleases(filteredReleases, page, perPage)

    // Determine actual mode
    const actualMode =
      mode === 'user' && cached.totalItems === 0
        ? 'empty'
        : mode === 'user'
          ? 'user'
          : 'demo'

    return {
      mode: actualMode,
      discogsUsername: username,
      page: result.pagination.page,
      perPage: result.pagination.per_page,
      totalItems: result.pagination.items,
      totalPages: result.pagination.pages,
      releases: result.releases,
      folders: cached.folders
    }
  }

  /**
   * Fetch and cache full collection for a specific mode
   */
  private async fetchAndCacheCollectionForMode(
    client: DiscogsClient,
    username: string,
    folderId: number,
    folders: DiscogsFolder[],
    cacheKey: string
  ): Promise<CachedData<CachedCollection>> {
    const data = await client.getAllCollectionReleases(username, folderId)

    const cached: CachedCollection = {
      releases: data.releases,
      totalItems: data.pagination.items,
      folders
    }

    const cachedData = createCacheEntry(cached)
    this.cache.set(cacheKey, cachedData)

    // Build search index
    searchService.buildIndex(folderId, data.releases)

    return cachedData
  }

  /**
   * Get cache key based on mode and user
   */
  private getCacheKeyForMode(
    mode: 'demo' | 'user',
    folderId: number,
    currentUser?: User | null
  ): string {
    if (mode === 'demo') {
      return `discogs:demo:collection:folder:${folderId}`
    } else {
      const userId = currentUser?.id || 'unknown'
      return `discogs:user:${userId}:collection:folder:${folderId}`
    }
  }

  /**
   * Get collection with filtering, sorting, and pagination
   * DEPRECATED: Use getCollectionByMode instead
   * This method is kept for backwards compatibility and uses demo mode
   */
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

    // Use new getCollectionByMode with demo mode
    const result = await this.getCollectionByMode({
      mode: 'demo',
      page,
      perPage,
      folderId,
      sort,
      sortOrder,
      search
    })

    // Convert to old format for backwards compatibility
    return {
      releases: result.releases,
      pagination: {
        page: result.page,
        pages: result.totalPages,
        per_page: result.perPage,
        items: result.totalItems,
        urls: {
          first: result.page > 1 ? `?page=1` : undefined,
          prev: result.page > 1 ? `?page=${result.page - 1}` : undefined,
          next: result.page < result.totalPages ? `?page=${result.page + 1}` : undefined,
          last: result.page < result.totalPages ? `?page=${result.totalPages}` : undefined
        }
      },
      folders: result.folders
    }
  }

  /**
   * Get collection with search (loads full collection into cache + search index)
   * DEPRECATED: Use getCollectionByMode instead
   */
  private async getCollectionWithSearch(filters: CollectionFilters): Promise<{
    releases: DiscogsCollectionRelease[]
    pagination: DiscogsPagination
    folders: DiscogsFolder[]
  }> {
    // This now delegates to getCollectionByMode
    const result = await this.getCollectionByMode({
      mode: 'demo',
      ...filters
    })

    return {
      releases: result.releases,
      pagination: {
        page: result.page,
        pages: result.totalPages,
        per_page: result.perPage,
        items: result.totalItems,
        urls: {
          first: result.page > 1 ? `?page=1` : undefined,
          prev: result.page > 1 ? `?page=${result.page - 1}` : undefined,
          next: result.page < result.totalPages ? `?page=${result.page + 1}` : undefined,
          last: result.page < result.totalPages ? `?page=${result.totalPages}` : undefined
        }
      },
      folders: result.folders
    }
  }

  /**
   * Search collection using search service
   * DEPRECATED: Use getCollectionByMode with search parameter
   */
  async searchCollection(query: string, filters: CollectionFilters = {}) {
    // Delegate to getCollectionByMode
    const result = await this.getCollectionByMode({
      mode: 'demo',
      ...filters,
      search: query
    })

    return {
      releases: result.releases,
      pagination: {
        page: result.page,
        pages: result.totalPages,
        per_page: result.perPage,
        items: result.totalItems,
        urls: {
          first: result.page > 1 ? `?page=1` : undefined,
          prev: result.page > 1 ? `?page=${result.page - 1}` : undefined,
          next: result.page < result.totalPages ? `?page=${result.page + 1}` : undefined,
          last: result.page < result.totalPages ? `?page=${result.totalPages}` : undefined
        }
      },
      folders: result.folders,
      totalResults: result.totalItems
    }
  }

  /**
   * Get folders
   * DEPRECATED: Use getCollectionByMode instead
   */
  async getFolders(): Promise<DiscogsFolder[]> {
    const client = createDemoDiscogsClient()
    return client.getFolders(this.demoUsername)
  }

  /**
   * Refresh cache for a folder (demo mode)
   * DEPRECATED: This only works for demo mode
   */
  async refreshCache(folderId: number = 0): Promise<{
    success: boolean
    message: string
    cacheCleared: boolean
    dataRefreshed: boolean
  }> {
    const cacheKey = this.getCacheKeyForMode('demo', folderId)
    const hadCache = this.cache.has(cacheKey)

    // Clear cache and search index
    this.cache.delete(cacheKey)
    searchService.clearIndex(folderId)

    try {
      await this.getCollection({ folderId })

      return {
        success: true,
        message: `Cache refreshed successfully for folder ${folderId}`,
        cacheCleared: hadCache,
        dataRefreshed: true
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to refresh cache for folder ${folderId}: ${(error as Error).message}`,
        cacheCleared: hadCache,
        dataRefreshed: false
      }
    }
  }

  /**
   * Cleanup expired cache entries
   */
  cleanup(): void {
    this.cache.cleanup()
  }

  // ============ PRIVATE UTILITY METHODS ============

  private sortReleases(
    releases: DiscogsCollectionRelease[],
    sort: SortField,
    order: SortOrder
  ): DiscogsCollectionRelease[] {
    const sorted = [...releases]

    sorted.sort((a, b) => {
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
          comparison = a.basic_information.title
            .toLowerCase()
            .localeCompare(b.basic_information.title.toLowerCase())
          break
        case 'year': {
          const yearA = parseDiscogsYear(a.basic_information.year?.toString()) || 0
          const yearB = parseDiscogsYear(b.basic_information.year?.toString()) || 0
          comparison = yearA - yearB
          break
        }
      }

      return order === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  private filterReleases(
    releases: DiscogsCollectionRelease[],
    search?: string
  ): DiscogsCollectionRelease[] {
    if (!search || search.trim() === '') {
      return releases
    }

    const query = search.toLowerCase().trim()

    return releases.filter(release => {
      const basicInfo = release.basic_information

      const artistMatch = basicInfo.artists.some(artist =>
        artist.name.toLowerCase().includes(query)
      )

      const titleMatch = basicInfo.title.toLowerCase().includes(query)

      const genreMatch =
        basicInfo.genres?.some(genre => genre.toLowerCase().includes(query)) || false

      const styleMatch =
        basicInfo.styles?.some(style => style.toLowerCase().includes(query)) || false

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
}

export const collectionService = new CollectionService()

// Run cleanup every 30 minutes
setInterval(
  () => {
    collectionService.cleanup()
  },
  30 * 60 * 1000
)
