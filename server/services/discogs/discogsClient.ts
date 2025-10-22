/**
 * Discogs API client with retry logic and rate limiting
 */

import axios, { type AxiosInstance } from 'axios'
import type { RetryConfig } from '../../interfaces/http.interface'
import type {
  DiscogsCollectionResponse,
  DiscogsFoldersResponse,
  DiscogsFolder
} from '../../types/discogs'

const DISCOGS_API_URL = 'https://api.discogs.com'
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
const USERNAME = process.env.DISCOGS_USERNAME

if (!DISCOGS_TOKEN || !USERNAME) {
  throw new Error('DISCOGS_TOKEN and DISCOGS_USERNAME environment variables are required')
}

export class DiscogsClient {
  private axiosInstance: AxiosInstance
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    delayMs: 1000,
    backoffFactor: 2
  }

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: DISCOGS_API_URL,
      headers: {
        Authorization: `Discogs token=${DISCOGS_TOKEN}`,
        'User-Agent': 'SpaceIsThePlace/1.0'
      },
      timeout: 15000
    })
  }

  /**
   * Sleep utility for rate limiting and retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Fetch with exponential backoff retry
   */
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

  /**
   * Get user's collection folders
   */
  async getFolders(): Promise<DiscogsFolder[]> {
    return this.fetchWithRetry(async () => {
      const response = await this.axiosInstance.get<DiscogsFoldersResponse>(
        `/users/${USERNAME}/collection/folders`
      )
      return response.data.folders
    })
  }

  /**
   * Get a single page of collection releases
   */
  async getCollectionPage(
    folderId: number,
    page: number,
    perPage: number,
    sort: string,
    sortOrder: string
  ): Promise<DiscogsCollectionResponse> {
    return this.fetchWithRetry(async () => {
      const response = await this.axiosInstance.get<DiscogsCollectionResponse>(
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
      return response.data
    })
  }

  /**
   * Fetch all pages of a folder's collection with rate limiting
   */
  async getAllCollectionReleases(
    folderId: number = 0,
    sort: string = 'added',
    sortOrder: string = 'desc',
    perPage: number = 50
  ): Promise<DiscogsCollectionResponse> {
    console.log(`Fetching all releases for folder ${folderId}...`)

    // Get first page to determine total count
    const firstPage = await this.getCollectionPage(folderId, 1, perPage, sort, sortOrder)

    const totalPages = firstPage.pagination.pages
    const allReleases = [...firstPage.releases]

    console.log(`Total pages: ${totalPages}, Total items: ${firstPage.pagination.items}`)

    // Fetch remaining pages with rate limiting
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        try {
          // Rate limiting: 250ms between requests (Discogs limit is 60/min)
          await this.sleep(250)

          const pageData = await this.getCollectionPage(folderId, page, perPage, sort, sortOrder)
          allReleases.push(...pageData.releases)

          console.log(`Fetched page ${page}/${totalPages}`)
        } catch (error) {
          console.error(`Failed to fetch page ${page}:`, error)
          // Continue with other pages
        }
      }
    }

    console.log(`Successfully loaded ${allReleases.length} releases`)

    return {
      ...firstPage,
      releases: allReleases,
      pagination: {
        ...firstPage.pagination,
        page: 1,
        pages: 1,
        per_page: allReleases.length,
        items: allReleases.length
      }
    }
  }

  /**
   * Get username (for testing/validation)
   */
  getUsername(): string {
    return USERNAME || ''
  }
}

export const discogsClient = new DiscogsClient()
