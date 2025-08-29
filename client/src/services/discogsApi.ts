import axios from 'axios'
import type { CollectionResponse, CollectionRelease } from '@/types/models/Release'

const API_URL = 'https://api.discogs.com'

const token = import.meta.env.VITE_DISCOGS_TOKEN

const discogsApi = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Discogs token=${token}`
  },
  timeout: 10000,
  params: {
    fields: ['id', 'title', 'artist', 'cover_image', 'year'].join(',')
  }
})

export interface DiscogsFolder {
  id: number
  name: string
  count: number
}

export interface FoldersResponse {
  folders: DiscogsFolder[]
}

export type SortField = 'added' | 'artist' | 'title'
export type SortOrder = 'asc' | 'desc'

// Enhanced cache implementation with global collection cache
const collectionCache = new Map<
  string,
  {
    data: CollectionResponse
    timestamp: number
    expiresIn: number
  }
>()

// Global cache for complete collections to avoid re-fetching all pages
const globalCollectionCache = new Map<
  string,
  {
    releases: CollectionRelease[]
    timestamp: number
    expiresIn: number
    totalItems: number
  }
>()

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes for better performance
const GLOBAL_CACHE_DURATION = 15 * 60 * 1000 // 15 minutes for complete collections

interface RetryConfig {
  maxRetries: number
  delayMs: number
  backoffFactor: number
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000, // initial delay of 1 second
  backoffFactor: 2 // each retry will wait 2x longer
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig
): Promise<T> => {
  let lastError: Error | null = null
  let delay = config.delayMs

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fetchFn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      lastError = error

      // no retry on certain errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error
      }

      // if it's the last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw error
      }

      console.warn(
        `Request failed (attempt ${attempt}/${config.maxRetries}). Retrying in ${delay}ms...`,
        error
      )

      // wait before retrying
      await sleep(delay)

      // increase delay for next attempt
      delay *= config.backoffFactor
    }
  }

  throw lastError || new Error('Retry failed')
}

export const getUserFolders = async (username: string): Promise<FoldersResponse> => {
  return fetchWithRetry(async () => {
    const response = await discogsApi.get(`/users/${username}/collection/folders`)
    return response.data
  })
}

export const getUserCollection = async (
  username: string,
  options: {
    page?: number
    perPage?: number
    folderId?: number
    sort?: SortField
    sortOrder?: SortOrder
  } = {}
): Promise<CollectionResponse> => {
  const { page = 1, perPage = 50, folderId = 0, sort = 'added', sortOrder = 'desc' } = options

  const cacheKey = `${username}-${folderId}-${page}-${perPage}-${sort}-${sortOrder}`

  const cached = collectionCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
    return cached.data
  }

  return fetchWithRetry(async () => {
    const response = await discogsApi.get(
      `/users/${username}/collection/folders/${folderId}/releases`,
      {
        params: {
          page,
          per_page: perPage,
          sort,
          sort_order: sortOrder
        }
      }
    )

    collectionCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
      expiresIn: CACHE_DURATION
    })

    return response.data
  })
}

export const getOneRelease = async (releaseId: number) => {
  return fetchWithRetry(async () => {
    const response = await discogsApi.get(`/releases/${releaseId}`)
    return response.data
  })
}

// cache cleanup function
const cleanupCache = () => {
  const now = Date.now()
  for (const [key, value] of collectionCache.entries()) {
    if (now - value.timestamp > value.expiresIn) {
      collectionCache.delete(key)
    }
  }
  for (const [key, value] of globalCollectionCache.entries()) {
    if (now - value.timestamp > value.expiresIn) {
      globalCollectionCache.delete(key)
    }
  }
}

// run cleanup every 5 minutes
setInterval(cleanupCache, CACHE_DURATION)

// Optimized function to fetch all releases - now with rate limiting and smart caching
export const getAllUserReleases = async (
  username: string,
  options: {
    folderId?: number
    sort?: SortField
    sortOrder?: SortOrder
    onProgress?: (current: number, total: number) => void
  } = {}
): Promise<CollectionRelease[]> => {
  const { folderId = 0, sort = 'added', sortOrder = 'desc', onProgress } = options

  // Check global cache first
  const globalCacheKey = `${username}-${folderId}-${sort}-${sortOrder}-complete`
  const cachedComplete = globalCollectionCache.get(globalCacheKey)
  if (cachedComplete && Date.now() - cachedComplete.timestamp < cachedComplete.expiresIn) {
    return cachedComplete.releases
  }

  // First get the first page to know total pages
  const firstPageData = await getUserCollection(username, {
    page: 1,
    perPage: 50,
    folderId,
    sort,
    sortOrder
  })

  const totalPages = Math.ceil(firstPageData.pagination.items / firstPageData.pagination.per_page)
  const allReleases = [...firstPageData.releases]

  onProgress?.(1, totalPages)

  // If there are more pages, fetch them sequentially with rate limiting
  if (totalPages > 1) {
    for (let page = 2; page <= totalPages; page++) {
      try {
        // Add delay between requests to respect API rate limits
        if (page > 2) {
          await sleep(250) // 250ms delay between requests
        }

        const result = await getUserCollection(username, {
          page,
          perPage: 50,
          folderId,
          sort,
          sortOrder
        })

        allReleases.push(...result.releases)
        onProgress?.(page, totalPages)
      } catch (error) {
        console.error(`Failed to fetch page ${page}:`, error)
        // Continue with other pages even if one fails
      }
    }
  }

  // Cache the complete collection
  globalCollectionCache.set(globalCacheKey, {
    releases: allReleases,
    timestamp: Date.now(),
    expiresIn: GLOBAL_CACHE_DURATION,
    totalItems: firstPageData.pagination.items
  })

  return allReleases
}

// Progressive loading function for better UX
export const getAllUserReleasesProgressive = async (
  username: string,
  options: {
    folderId?: number
    sort?: SortField
    sortOrder?: SortOrder
    onChunkLoaded?: (
      releases: CollectionRelease[],
      progress: { current: number; total: number }
    ) => void
  } = {}
): Promise<CollectionRelease[]> => {
  const { folderId = 0, sort = 'added', sortOrder = 'desc', onChunkLoaded } = options

  // Check global cache first
  const globalCacheKey = `${username}-${folderId}-${sort}-${sortOrder}-complete`
  const cachedComplete = globalCollectionCache.get(globalCacheKey)
  if (cachedComplete && Date.now() - cachedComplete.timestamp < cachedComplete.expiresIn) {
    onChunkLoaded?.(cachedComplete.releases, { current: 1, total: 1 })
    return cachedComplete.releases
  }

  // Get first page
  const firstPageData = await getUserCollection(username, {
    page: 1,
    perPage: 50,
    folderId,
    sort,
    sortOrder
  })

  const totalPages = Math.ceil(firstPageData.pagination.items / firstPageData.pagination.per_page)
  let allReleases = [...firstPageData.releases]

  // Notify with first chunk
  onChunkLoaded?.(allReleases, { current: 1, total: totalPages })

  // If there are more pages, fetch them progressively
  if (totalPages > 1) {
    for (let page = 2; page <= totalPages; page++) {
      try {
        // Add delay between requests
        await sleep(200)

        const result = await getUserCollection(username, {
          page,
          perPage: 50,
          folderId,
          sort,
          sortOrder
        })

        allReleases = [...allReleases, ...result.releases]

        // Notify with new chunk
        onChunkLoaded?.(allReleases, { current: page, total: totalPages })
      } catch (error) {
        console.error(`Failed to fetch page ${page}:`, error)
      }
    }
  }

  // Cache the complete collection
  globalCollectionCache.set(globalCacheKey, {
    releases: allReleases,
    timestamp: Date.now(),
    expiresIn: GLOBAL_CACHE_DURATION,
    totalItems: firstPageData.pagination.items
  })

  return allReleases
}

export const prefetchNextPage = async (
  username: string,
  currentPage: number,
  options: {
    perPage?: number
    folderId?: number
    sort?: SortField
    sortOrder?: SortOrder
  } = {}
) => {
  // add a 1-second delay before prefetching
  setTimeout(() => {
    getUserCollection(username, {
      ...options,
      page: currentPage + 1
    }).catch(error => {
      console.error('Prefetch failed:', error)
    })
  }, 1000)
}

export default discogsApi
