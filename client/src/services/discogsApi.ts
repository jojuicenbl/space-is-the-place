import axios from "axios"
import type { CollectionResponse } from "@/types/models/Release"

const API_URL = "https://api.discogs.com"

const token = import.meta.env.VITE_DISCOGS_TOKEN

const discogsApi = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Discogs token=${token}`,
  },
  timeout: 10000,
  params: {
    fields: ["id", "title", "artist", "cover_image", "year"].join(","),
  },
})

export interface DiscogsFolder {
  id: number
  name: string
  count: number
}

export interface FoldersResponse {
  folders: DiscogsFolder[]
}

export type SortField = "added" | "artist" | "title"
export type SortOrder = "asc" | "desc"

// cache implementation
const collectionCache = new Map<
  string,
  {
    data: CollectionResponse
    timestamp: number
    expiresIn: number
  }
>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface RetryConfig {
  maxRetries: number
  delayMs: number
  backoffFactor: number
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000, // initial delay of 1 second
  backoffFactor: 2, // each retry will wait 2x longer
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
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
        error,
      )

      // wait before retrying
      await sleep(delay)

      // increase delay for next attempt
      delay *= config.backoffFactor
    }
  }

  throw lastError || new Error("Retry failed")
}

export const getUserFolders = async (
  username: string,
): Promise<FoldersResponse> => {
  return fetchWithRetry(async () => {
    const response = await discogsApi.get(
      `/users/${username}/collection/folders`,
    )
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
  } = {},
): Promise<CollectionResponse> => {
  const {
    page = 1,
    perPage = 50,
    folderId = 0,
    sort = "added",
    sortOrder = "desc",
  } = options

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
          sort_order: sortOrder,
        },
      },
    )

    collectionCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
      expiresIn: CACHE_DURATION,
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
}

// run cleanup every 5 minutes
setInterval(cleanupCache, CACHE_DURATION)

export const prefetchNextPage = async (
  username: string,
  currentPage: number,
  options: {
    perPage?: number
    folderId?: number
    sort?: SortField
    sortOrder?: SortOrder
  } = {},
) => {
  // add a 1-second delay before prefetching
  setTimeout(() => {
    getUserCollection(username, {
      ...options,
      page: currentPage + 1,
    }).catch((error) => {
      console.error("Prefetch failed:", error)
    })
  }, 1000)
}

export default discogsApi
