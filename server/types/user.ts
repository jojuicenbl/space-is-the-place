/**
 * User model for multi-user authentication system
 */

/**
 * Discogs OAuth authentication credentials
 * Stored securely, never exposed in API responses
 */
export interface DiscogsAuth {
  discogsUsername: string
  accessToken: string // NEVER expose in API responses
  accessTokenSecret: string // NEVER expose in API responses
  linkedAt: Date
}

/**
 * User model
 */
export interface User {
  id: string
  email: string
  createdAt: Date
  discogsAuth?: DiscogsAuth | null
}

/**
 * Public user data safe to expose to frontend
 * Excludes sensitive OAuth tokens
 */
export interface PublicUserData {
  id: string
  email: string
  discogs: {
    isLinked: boolean
    username: string | null
  }
}
