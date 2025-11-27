import axios from 'axios'

// In development, use relative URLs so Vite proxy handles it (same-origin)
// In production, use the full API URL
const API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3000')

interface DiscogsAuthRequestResponse {
  authorizeUrl: string
}

interface DiscogsAuthClaimResponse {
  success: boolean
  username: string
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
      `${API_URL}/api/auth/discogs/request`,
      {},
      { withCredentials: true } // Important: send cookies
    )

    const { authorizeUrl } = response.data

    // Redirect user to Discogs authorization page
    window.location.href = authorizeUrl
  } catch (error) {
    console.error('Failed to initiate Discogs OAuth:', error)
    throw new Error('Failed to connect to Discogs. Please try again.')
  }
}

/**
 * Claims the OAuth result after callback redirect
 * This stores the Discogs tokens in the current session
 */
export async function claimDiscogsAuth(authSessionId: string): Promise<string> {
  try {
    const response = await axios.post<DiscogsAuthClaimResponse>(
      `${API_URL}/api/auth/discogs/claim`,
      { authSessionId },
      { withCredentials: true } // Important: send cookies
    )

    return response.data.username
  } catch (error) {
    console.error('Failed to claim Discogs auth:', error)
    throw new Error('Failed to complete Discogs connection. Please try again.')
  }
}
