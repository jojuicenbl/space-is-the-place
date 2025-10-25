/**
 * iTunes Search API client
 * Official docs: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI
 */

import axios, { type AxiosInstance } from 'axios'
import type { ItunesSearchResult, ItunesAlbum } from '../../interfaces/itunes.interface'
import { normalizeText } from '../../utils/normalization'

const ITUNES_API_URL = 'https://itunes.apple.com'
const RATE_LIMIT_DELAY = 100 // 100ms between requests (conservative, limit is 20/min)

export class ItunesClient {
  private axiosInstance: AxiosInstance
  private lastRequestTime: number = 0

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: ITUNES_API_URL,
      timeout: 10000,
      headers: {
        'User-Agent': 'SpaceIsThePlace/1.0'
      }
    })
  }

  /**
   * Rate limiting to respect iTunes API limits (20 calls/min)
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
    }

    this.lastRequestTime = Date.now()
  }

  /**
   * Search for albums by artist and title
   */
  async searchAlbum(artist: string, album: string, limit: number = 10): Promise<ItunesAlbum[]> {
    await this.rateLimit()

    try {
      const query = `${normalizeText(artist)} ${normalizeText(album)}`

      const response = await this.axiosInstance.get<ItunesSearchResult>('/search', {
        params: {
          term: query,
          media: 'music',
          entity: 'album',
          limit,
          country: 'US' // Can be made configurable
        }
      })

      return response.data.results.filter(result => result.wrapperType === 'collection')
    } catch (error) {
      console.error('iTunes API search error:', error)
      return []
    }
  }

  /**
   * Search by album title only
   */
  async searchByTitle(title: string, limit: number = 10): Promise<ItunesAlbum[]> {
    await this.rateLimit()

    try {
      const response = await this.axiosInstance.get<ItunesSearchResult>('/search', {
        params: {
          term: normalizeText(title),
          media: 'music',
          entity: 'album',
          limit,
          country: 'US'
        }
      })

      return response.data.results.filter(result => result.wrapperType === 'collection')
    } catch (error) {
      console.error('iTunes API search error:', error)
      return []
    }
  }

  /**
   * Search by artist name only
   */
  async searchByArtist(artist: string, limit: number = 20): Promise<ItunesAlbum[]> {
    await this.rateLimit()

    try {
      const response = await this.axiosInstance.get<ItunesSearchResult>('/search', {
        params: {
          term: normalizeText(artist),
          media: 'music',
          entity: 'album',
          limit,
          country: 'US'
        }
      })

      return response.data.results.filter(result => result.wrapperType === 'collection')
    } catch (error) {
      console.error('iTunes API search error:', error)
      return []
    }
  }

  /**
   * Lookup album by iTunes collection ID
   */
  async lookupById(collectionId: number): Promise<ItunesAlbum | null> {
    await this.rateLimit()

    try {
      const response = await this.axiosInstance.get<ItunesSearchResult>('/lookup', {
        params: {
          id: collectionId,
          entity: 'album'
        }
      })

      const album = response.data.results.find(result => result.wrapperType === 'collection')
      return album || null
    } catch (error) {
      console.error('iTunes API lookup error:', error)
      return null
    }
  }
}

export const itunesClient = new ItunesClient()
