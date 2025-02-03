import axios from "axios"
import type { CollectionResponse } from "@/types/models/Release"

const API_URL = "https://api.discogs.com"

const token = import.meta.env.VITE_DISCOGS_TOKEN

const discogsApi = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Discogs token=${token}`,
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

export type SortField = 'added' | 'artist' | 'title'
export type SortOrder = 'asc' | 'desc'

export const getUserFolders = async (username: string): Promise<FoldersResponse> => {
  try {
    const response = await discogsApi.get(`/users/${username}/collection/folders`)
    return response.data
  } catch (error) {
    console.error("Error fetching folders:", error)
    throw error
  }
}

export const getUserCollection = async (
  username: string,
  options: {
    page?: number,
    perPage?: number,
    folderId?: number,
    sort?: SortField,
    sortOrder?: SortOrder
  } = {}
): Promise<CollectionResponse> => {
  const {
    page = 1,
    perPage = 50,
    folderId = 0,
    sort = 'added',
    sortOrder = 'desc'
  } = options

  try {
    const response = await discogsApi.get(
      `/users/${username}/collection/folders/${folderId}/releases`,
      {
        params: {
          page,
          per_page: perPage,
          sort,
          sort_order: sortOrder,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error("Error fetching collection:", error)
    throw error
  }
}

export const getOneRelease = async (releaseId: number) => {
  try {
    const response = await discogsApi.get(`/releases/${releaseId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching release details:", error)
    throw error
  }
}

export default discogsApi
