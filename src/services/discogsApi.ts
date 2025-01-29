import axios from "axios"

const API_URL = "https://api.discogs.com"

const token = import.meta.env.VITE_DISCOGS_TOKEN

const discogsApi = axios.create({
  baseURL: API_URL,
  headers: {
    "User-Agent": "SpaceIsThePlace/1.0",
    Authorization: `Discogs token=${token}`,
  },
})

export const getUserCollection = async (username: string) => {
  try {
    const response = await discogsApi.get(
      `/users/${username}/collection/folders/0/releases`,
    )
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération de la collection:", error)
    throw error
  }
}

export const getOneRelease = async (releaseId: number) => {
  try {
    const response = await discogsApi.get(`/releases/${releaseId}`)
    return response.data
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du vinyle:",
      error,
    )
    throw error
  }
}

export default discogsApi
