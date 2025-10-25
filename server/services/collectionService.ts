/**
 * Collection service - Lightweight orchestrator
 * Delegates to specialized services following DRY principle
 */

import type {
  DiscogsCollectionRelease,
  DiscogsFolder,
  SortField,
  SortOrder,
  CollectionFilters,
  DiscogsPagination
} from '../types/discogs'
import { discogsClient } from './discogs/discogsClient'
import { searchService } from './search/searchService'
import { InMemoryCacheService, createCacheEntry } from './cache/cacheService'
import type { CachedData } from '../interfaces/cache.interface'
import { parseDiscogsYear } from '../utils/normalization'

interface CachedCollection {
  releases: DiscogsCollectionRelease[]
  totalItems: number
  folders: DiscogsFolder[]
}

export class CollectionService {
  private cache: InMemoryCacheService<CachedCollection>
  private readonly DEFAULT_PER_PAGE = 50
  private loadingPromises: Map<string, Promise<CachedData<CachedCollection>>> = new Map()

  constructor() {
    this.cache = new InMemoryCacheService<CachedCollection>(15) // 15min TTL
  }

  /**
   * Get collection with filtering, sorting, and pagination
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

    // Get folders (lightweight call)
    const folders = await this.getFolders()

    // If there's a search query, we need the full collection
    if (search && search.trim() !== '') {
      return this.getCollectionWithSearch(filters)
    }

    // For normal pagination, fetch only the requested page from Discogs directly
    console.log(`Fetching page ${page} directly from Discogs API...`)

    const data = await discogsClient.getCollectionPage(folderId, page, perPage, sort, sortOrder)

    return {
      releases: data.releases,
      pagination: data.pagination,
      folders
    }
  }

  /**
   * Get collection with search (loads full collection into cache + search index)
   */
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
    let cachedData = this.cache.get(cacheKey)
    if (!cachedData) {
      console.log(`Search initiated - loading full collection for folder ${folderId}...`)

      // Create loading promise to prevent multiple simultaneous fetches
      const loadingPromise = this.fetchAndCacheCollection(folderId)
      this.loadingPromises.set(cacheKey, loadingPromise)

      try {
        cachedData = await loadingPromise
      } finally {
        this.loadingPromises.delete(cacheKey)
      }
    }

    const cached = cachedData.data

    // Apply search filter using search service
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

  /**
   * Fetch and cache full collection
   */
  private async fetchAndCacheCollection(folderId: number): Promise<CachedData<CachedCollection>> {
    const data = await discogsClient.getAllCollectionReleases(folderId)
    const folders = await discogsClient.getFolders()

    const cached: CachedCollection = {
      releases: data.releases,
      totalItems: data.pagination.items,
      folders
    }

    const cachedData = createCacheEntry(cached)
    this.cache.set(this.getCacheKey(folderId), cachedData)

    // Build search index
    searchService.buildIndex(folderId, data.releases)

    return cachedData
  }

  /**
   * Search collection using search service
   */
  async searchCollection(query: string, filters: CollectionFilters = {}) {
    const {
      page = 1,
      perPage = this.DEFAULT_PER_PAGE,
      folderId = 0,
      sort = 'added',
      sortOrder = 'desc'
    } = filters

    const cacheKey = this.getCacheKey(folderId)
    const cached = this.cache.get(cacheKey)

    // Ensure cache and index are warmed up
    if (!cached || !searchService.hasIndex(folderId)) {
      const hydrated = await this.getCollectionWithSearch({ ...filters, search: query })
      return {
        ...hydrated,
        totalResults: hydrated.pagination.items
      }
    }

    // Use search service
    const hits = searchService.search(folderId, query.trim())

    // Map search results to releases
    const byId = new Map(cached.data.releases.map(r => [r.id, r]))
    let releases = hits.map(h => byId.get(h.id)).filter(Boolean) as DiscogsCollectionRelease[]

    // Apply sorting and pagination
    releases = this.sortReleases(releases, sort, sortOrder)
    const result = this.paginateReleases(releases, page, perPage)

    return {
      releases: result.releases,
      pagination: result.pagination,
      folders: cached.data.folders,
      totalResults: releases.length
    }
  }

  /**
   * Get folders
   */
  async getFolders(): Promise<DiscogsFolder[]> {
    const cacheKey = this.getCacheKey(0)
    const cached = this.cache.get(cacheKey)

    if (cached) {
      return cached.data.folders
    }

    return discogsClient.getFolders()
  }

  /**
   * Refresh cache for a folder
   */
  async refreshCache(folderId: number = 0): Promise<{
    success: boolean
    message: string
    cacheCleared: boolean
    dataRefreshed: boolean
  }> {
    const cacheKey = this.getCacheKey(folderId)
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

  private getCacheKey(folderId: number = 0): string {
    return `collection_${discogsClient.getUsername()}_${folderId}`
  }

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
