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

export const getUserCollection = async (
  username: string,
): Promise<CollectionResponse> => {
  try {
    const response = await discogsApi.get(
      `/users/${username}/collection/folders/0/releases`,
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
