import axios from 'axios'
import type { CollectionResponse, CollectionRelease } from '@/types/models/Release'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const collectionApi = axios.create({
  baseURL: API_URL,
  timeout: 30000 // Increased timeout for initial collection loading
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

export interface CollectionFilters {
  page?: number
  perPage?: number
  folderId?: number
  sort?: SortField
  sortOrder?: SortOrder
  search?: string
  mode?: 'demo' | 'user'
}

export interface CollectionApiResponse {
  releases: CollectionRelease[]
  pagination: {
    page: number
    pages: number
    per_page: number
    items: number
    urls: {
      first?: string
      prev?: string
      next?: string
      last?: string
    }
  }
  folders: DiscogsFolder[]
  mode?: 'demo' | 'user' | 'unlinked' | 'empty'
  discogsUsername?: string
}

export interface SearchApiResponse extends CollectionApiResponse {
  totalResults: number
}

// Get paginated collection with filters
export const getCollection = async (
  filters: CollectionFilters = {},
  opts?: { signal?: AbortSignal }
): Promise<CollectionApiResponse> => {
  try {
    const params = new URLSearchParams()

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.perPage) params.append('perPage', filters.perPage.toString())
    if (filters.folderId) params.append('folder', filters.folderId.toString())
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.sortOrder) params.append('order', filters.sortOrder)
    if (filters.search) params.append('search', filters.search)
    if (filters.mode) params.append('mode', filters.mode)

    const response = await collectionApi.get<CollectionApiResponse>(
      `/api/collection?${params.toString()}`,
      { signal: opts?.signal }
    )
    return response.data
  } catch (error) {
    // If the request was canceled, re-throw the error as-is without logging
    if (axios.isCancel(error)) {
      throw error
    }
    console.error('Error fetching collection:', error)
    throw new Error('Failed to fetch collection')
  }
}

// Search collection
export const searchCollection = async (
  query: string,
  filters: CollectionFilters = {},
  opts?: { signal?: AbortSignal } // +++
): Promise<SearchApiResponse> => {
  try {
    const params = new URLSearchParams()
    params.append('q', query)

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.perPage) params.append('perPage', filters.perPage.toString())
    if (filters.folderId) params.append('folder', filters.folderId.toString())
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.sortOrder) params.append('order', filters.sortOrder)
    if (filters.mode) params.append('mode', filters.mode)

    const response = await collectionApi.get<SearchApiResponse>(
      `/api/collection/search?${params.toString()}`,
      { signal: opts?.signal } // +++
    )
    return response.data
  } catch (error) {
    // If the request was canceled, re-throw the error as-is without logging
    // This allows the caller to handle cancellations appropriately
    if (axios.isCancel(error)) {
      throw error
    }
    console.error('Error searching collection:', error)
    throw new Error('Failed to search collection')
  }
}

// Get folders
export const getFolders = async (): Promise<FoldersResponse> => {
  try {
    const response = await collectionApi.get<FoldersResponse>('/api/folders')
    return response.data
  } catch (error) {
    console.error('Error fetching folders:', error)
    throw new Error('Failed to fetch folders')
  }
}

// Legacy function for compatibility - now calls server endpoint
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
  // Transform the options to match our new API
  const filters: CollectionFilters = {
    page: options.page,
    perPage: options.perPage,
    folderId: options.folderId,
    sort: options.sort,
    sortOrder: options.sortOrder
  }

  const result = await getCollection(filters)

  // Transform response to match legacy format
  return {
    releases: result.releases,
    pagination: result.pagination
  }
}

// Legacy function for compatibility
export const getUserFolders = async (): Promise<FoldersResponse> => {
  return getFolders()
}

export default collectionApi
