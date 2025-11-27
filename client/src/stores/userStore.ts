import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

// In development, use relative URLs so Vite proxy handles it (same-origin)
// In production, use the full API URL
const API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3000')

export interface UserState {
  isAuthenticated: boolean
  id: string | null
  email: string | null

  discogs: {
    isLinked: boolean
    username: string | null
  }

  collectionMode: 'demo' | 'user'
}

interface MeApiResponse {
  id: string
  email: string
  discogs?: {
    isLinked: boolean
    username: string
  }
}

export const useUserStore = defineStore('user', () => {
  // State
  const isAuthenticated = ref(false)
  const id = ref<string | null>(null)
  const email = ref<string | null>(null)
  const discogsUsername = ref<string | null>(null)
  const discogsIsLinked = ref(false)
  const collectionMode = ref<'demo' | 'user'>('demo')
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Actions
  const loadUser = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      const response = await axios.get<MeApiResponse>(`${API_URL}/api/me`, {
        withCredentials: true // Important: send session cookies
      })
      const data = response.data

      isAuthenticated.value = true
      id.value = data.id
      email.value = data.email

      if (data.discogs?.isLinked && data.discogs?.username) {
        discogsIsLinked.value = true
        discogsUsername.value = data.discogs.username
        // If user has a Discogs account linked, ALWAYS default to 'user' mode
        collectionMode.value = 'user'
      } else {
        discogsIsLinked.value = false
        discogsUsername.value = null
        // If no Discogs account, force 'demo' mode
        collectionMode.value = 'demo'
      }
    } catch (error) {
      // User not authenticated or endpoint failed
      console.debug('User not authenticated or /api/me failed:', error)
      isAuthenticated.value = false
      id.value = null
      email.value = null
      discogsIsLinked.value = false
      discogsUsername.value = null
      collectionMode.value = 'demo'
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const setCollectionMode = (mode: 'demo' | 'user') => {
    // Only allow 'user' mode if Discogs is linked
    if (mode === 'user' && !discogsIsLinked.value) {
      console.warn('Cannot set collection mode to "user" without linked Discogs account')
      return
    }
    collectionMode.value = mode
  }

  const setDiscogsLinked = (linked: boolean, username: string | null = null) => {
    discogsIsLinked.value = linked
    discogsUsername.value = username
  }

  const reset = () => {
    isAuthenticated.value = false
    id.value = null
    email.value = null
    discogsIsLinked.value = false
    discogsUsername.value = null
    collectionMode.value = 'demo'
    isInitialized.value = false
  }

  return {
    // State
    isAuthenticated,
    id,
    email,
    discogsUsername,
    discogsIsLinked,
    collectionMode,
    isLoading,
    isInitialized,

    // Actions
    loadUser,
    setCollectionMode,
    setDiscogsLinked,
    reset
  }
})
