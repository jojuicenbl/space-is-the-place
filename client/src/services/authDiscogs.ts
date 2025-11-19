import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface DiscogsAuthRequestResponse {
  authorizeUrl: string
}

/**
 * Initiates the Discogs OAuth flow by requesting an authorization URL
 * and redirecting the user to Discogs for authentication.
 *
 * This function does NOT handle the callback or store tokens - that happens
 * server-side after the user completes the OAuth flow on Discogs.
 */
export async function requestDiscogsAuth(): Promise<void> {
  try {
    const response = await axios.post<DiscogsAuthRequestResponse>(
      `${API_URL}/api/auth/discogs/request`
    )

    const { authorizeUrl } = response.data

    // Redirect user to Discogs authorization page
    window.location.href = authorizeUrl
  } catch (error) {
    console.error('Failed to initiate Discogs OAuth:', error)
    throw new Error('Failed to connect to Discogs. Please try again.')
  }
}
