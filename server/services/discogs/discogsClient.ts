/**
 * Discogs API client with retry logic and rate limiting
 * Supports both app token (demo mode) and user OAuth authentication
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import crypto from 'crypto'
import type { RetryConfig } from '../../interfaces/http.interface'
import type {
  DiscogsCollectionResponse,
  DiscogsFoldersResponse,
  DiscogsFolder
} from '../../types/discogs'

/**
 * Custom error for Discogs rate limiting
 */
export class DiscogsRateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message)
    this.name = 'DiscogsRateLimitError'
  }
}

const DISCOGS_API_URL = 'https://api.discogs.com'
const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN
const DISCOGS_APP_DEMO_USERNAME = process.env.DISCOGS_APP_DEMO_USERNAME
const DISCOGS_CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY
const DISCOGS_CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET
const DISCOGS_USER_AGENT = process.env.DISCOGS_USER_AGENT || 'SpaceIsThePlace/1.0'

// App token is required for demo mode
if (!DISCOGS_TOKEN || !DISCOGS_APP_DEMO_USERNAME) {
  console.warn(
    'WARNING: DISCOGS_TOKEN and DISCOGS_APP_DEMO_USERNAME not set. Demo mode will not work.'
  )
}

/**
 * Authentication mode for Discogs API calls
 */
export type DiscogsAuthMode =
  | { type: 'appToken' } // Demo mode - uses app token
  | { type: 'userOAuth'; accessToken: string; accessTokenSecret: string } // User mode - OAuth

/**
 * Rate limit configuration
 */
const RATE_LIMIT_BACKOFF_SECONDS = 30 // Backoff duration when rate limited
const RATE_LIMIT_PREVENTIVE_THRESHOLD = 2 // Trigger preventive backoff if remaining <= this
const RATE_LIMIT_PREVENTIVE_BACKOFF_SECONDS = 10 // Preventive backoff duration

export class DiscogsClient {
  private axiosInstance: AxiosInstance
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    delayMs: 1000,
    backoffFactor: 2
  }
  private authMode: DiscogsAuthMode
  private backoffUntil: Map<string, number> = new Map() // Map of backoff keys to expiry timestamps

  constructor(authMode: DiscogsAuthMode = { type: 'appToken' }) {
    this.authMode = authMode
    this.axiosInstance = axios.create({
      baseURL: DISCOGS_API_URL,
      timeout: 15000
    })
  }

  /**
   * Generate OAuth 1.0a nonce
   */
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * Get current Unix timestamp
   */
  private getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString()
  }

  /**
   * Percent-encode string according to RFC 3986
   */
  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
  }

  /**
   * Generate OAuth 1.0a signature using HMAC-SHA1
   */
  private generateSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    tokenSecret: string = ''
  ): string {
    if (!DISCOGS_CONSUMER_SECRET) {
      throw new Error('DISCOGS_CONSUMER_SECRET not configured')
    }

    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${this.percentEncode(key)}=${this.percentEncode(params[key])}`)
      .join('&')

    // Create signature base string
    const signatureBaseString = [
      method.toUpperCase(),
      this.percentEncode(url),
      this.percentEncode(sortedParams)
    ].join('&')

    // Create signing key
    const signingKey = `${this.percentEncode(DISCOGS_CONSUMER_SECRET)}&${this.percentEncode(tokenSecret)}`

    // Generate HMAC-SHA1 signature
    const hmac = crypto.createHmac('sha1', signingKey)
    hmac.update(signatureBaseString)
    return hmac.digest('base64')
  }

  /**
   * Build OAuth Authorization header
   */
  private buildOAuthHeader(params: Record<string, string>): string {
    const headerParams = Object.entries(params)
      .map(([key, value]) => `${this.percentEncode(key)}="${this.percentEncode(value)}"`)
      .join(', ')

    return `OAuth ${headerParams}`
  }

  /**
   * Get authorization headers based on auth mode
   */
  private getAuthHeaders(method: string, url: string): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': DISCOGS_USER_AGENT
    }

    if (this.authMode.type === 'appToken') {
      // App token mode (demo)
      if (!DISCOGS_TOKEN) {
        throw new Error('DISCOGS_TOKEN not configured for demo mode')
      }
      headers['Authorization'] = `Discogs token=${DISCOGS_TOKEN}`
    } else {
      // OAuth mode (user)
      if (!DISCOGS_CONSUMER_KEY || !DISCOGS_CONSUMER_SECRET) {
        throw new Error('OAuth credentials not configured')
      }

      const oauthParams: Record<string, string> = {
        oauth_consumer_key: DISCOGS_CONSUMER_KEY,
        oauth_nonce: this.generateNonce(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: this.getTimestamp(),
        oauth_token: this.authMode.accessToken
      }

      // Generate signature
      const signature = this.generateSignature(
        method,
        url,
        oauthParams,
        this.authMode.accessTokenSecret
      )
      oauthParams.oauth_signature = signature

      headers['Authorization'] = this.buildOAuthHeader(oauthParams)
    }

    return headers
  }

  /**
   * Get username based on auth mode
   */
  getUsername(): string {
    if (this.authMode.type === 'appToken') {
      return DISCOGS_APP_DEMO_USERNAME || ''
    }
    // For OAuth mode, username needs to be passed separately
    // (it's not in the authMode itself, but known by the caller)
    throw new Error('Username must be provided for userOAuth mode')
  }

  /**
   * Sleep utility for rate limiting and retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Check if currently in backoff mode
   */
  private isInBackoff(): boolean {
    const backoffKey = `discogs:backoff:${this.authMode.type}`
    const expiresAt = this.backoffUntil.get(backoffKey)

    if (!expiresAt) {
      return false
    }

    // Check if backoff has expired
    if (Date.now() >= expiresAt) {
      this.backoffUntil.delete(backoffKey)
      return false
    }

    return true
  }

  /**
   * Activate backoff mode for specified duration
   */
  private activateBackoff(seconds: number): void {
    const backoffKey = `discogs:backoff:${this.authMode.type}`
    const expiresAt = Date.now() + seconds * 1000
    this.backoffUntil.set(backoffKey, expiresAt)
    console.warn(`🚨 Discogs rate limit: Backoff activated for ${seconds} seconds`)
  }

  /**
   * Check rate limit headers and apply preventive backoff if needed
   */
  private checkRateLimitHeaders(response: AxiosResponse): void {
    const remaining = Number(response.headers['x-discogs-ratelimit-remaining'])
    const limit = Number(response.headers['x-discogs-ratelimit'])
    const used = Number(response.headers['x-discogs-ratelimit-used'])

    // Log rate limit status
    if (!isNaN(remaining) && !isNaN(limit)) {
      console.log(`📊 Discogs rate limit: ${used}/${limit} used, ${remaining} remaining`)

      // Preventive backoff if running low
      if (remaining <= RATE_LIMIT_PREVENTIVE_THRESHOLD && remaining > 0) {
        console.warn(
          `⚠️  Discogs rate limit running low (${remaining} remaining). Activating preventive backoff.`
        )
        this.activateBackoff(RATE_LIMIT_PREVENTIVE_BACKOFF_SECONDS)
      }
    }
  }

  /**
   * Check if we can make a request (not in backoff)
   * Throws DiscogsRateLimitError if in backoff
   */
  private checkBackoffBeforeRequest(): void {
    if (this.isInBackoff()) {
      throw new DiscogsRateLimitError(
        'Discogs is currently throttling requests. Please try again in a few seconds.',
        RATE_LIMIT_BACKOFF_SECONDS
      )
    }
  }

  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    config: RetryConfig = this.defaultRetryConfig
  ): Promise<T> {
    // Check backoff before attempting any request
    this.checkBackoffBeforeRequest()

    let lastError: Error | null = null
    let delay = config.delayMs

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await fetchFn()

        // Check rate limit headers on successful response
        if (result && typeof result === 'object' && 'headers' in result) {
          this.checkRateLimitHeaders(result as any)
        }

        return result
      } catch (error: unknown) {
        lastError = error as Error
        const axiosError = error as { response?: { status?: number; headers?: any } }

        // Handle 429 rate limit errors
        if (axiosError.response?.status === 429) {
          console.error('🚨 Discogs API returned 429 (Rate Limit Exceeded)')
          this.activateBackoff(RATE_LIMIT_BACKOFF_SECONDS)
          throw new DiscogsRateLimitError(
            'Discogs is currently throttling requests. Please try again in a few seconds.',
            RATE_LIMIT_BACKOFF_SECONDS
          )
        }

        // Don't retry on auth errors
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
  async getFolders(username: string): Promise<DiscogsFolder[]> {
    return this.fetchWithRetry(async () => {
      const url = `${DISCOGS_API_URL}/users/${username}/collection/folders`
      const headers = this.getAuthHeaders('GET', url)

      const response = await this.axiosInstance.get<DiscogsFoldersResponse>(
        `/users/${username}/collection/folders`,
        { headers }
      )

      // Check rate limit headers
      this.checkRateLimitHeaders(response)

      return response.data.folders
    })
  }

  /**
   * Get a single page of collection releases
   */
  async getCollectionPage(
    username: string,
    folderId: number,
    page: number,
    perPage: number,
    sort: string,
    sortOrder: string
  ): Promise<DiscogsCollectionResponse> {
    return this.fetchWithRetry(async () => {
      const path = `/users/${username}/collection/folders/${folderId}/releases`
      const url = `${DISCOGS_API_URL}${path}?page=${page}&per_page=${perPage}&sort=${sort}&sort_order=${sortOrder}`
      const headers = this.getAuthHeaders('GET', url)

      const response = await this.axiosInstance.get<DiscogsCollectionResponse>(path, {
        headers,
        params: {
          page,
          per_page: perPage,
          sort,
          sort_order: sortOrder
        }
      })

      // Check rate limit headers
      this.checkRateLimitHeaders(response)

      return response.data
    })
  }

  /**
   * Fetch all pages of a folder's collection with rate limiting
   */
  async getAllCollectionReleases(
    username: string,
    folderId: number = 0,
    sort: string = 'added',
    sortOrder: string = 'desc',
    perPage: number = 50
  ): Promise<DiscogsCollectionResponse> {
    console.log(`Fetching all releases for folder ${folderId}...`)

    // Get first page to determine total count
    const firstPage = await this.getCollectionPage(username, folderId, 1, perPage, sort, sortOrder)

    const totalPages = firstPage.pagination.pages
    const allReleases = [...firstPage.releases]

    console.log(`Total pages: ${totalPages}, Total items: ${firstPage.pagination.items}`)

    // Fetch remaining pages with rate limiting
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        try {
          // Rate limiting: 250ms between requests (Discogs limit is 60/min)
          await this.sleep(250)

          const pageData = await this.getCollectionPage(
            username,
            folderId,
            page,
            perPage,
            sort,
            sortOrder
          )
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
}

/**
 * Factory function to create a Discogs client for demo mode
 */
export function createDemoDiscogsClient(): DiscogsClient {
  return new DiscogsClient({ type: 'appToken' })
}

/**
 * Factory function to create a Discogs client for user OAuth mode
 */
export function createUserDiscogsClient(
  accessToken: string,
  accessTokenSecret: string
): DiscogsClient {
  return new DiscogsClient({ type: 'userOAuth', accessToken, accessTokenSecret })
}

// Default demo client for backwards compatibility
export const discogsClient = createDemoDiscogsClient()
