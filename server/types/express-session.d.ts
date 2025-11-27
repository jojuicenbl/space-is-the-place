/**
 * Express Session Type Extensions
 * Adds custom session properties for Discogs OAuth
 */

import 'express-session'

/**
 * Discogs OAuth authentication credentials stored in session
 * SECURITY: These are per-visitor session data, never exposed in API responses
 */
export interface DiscogsAuth {
  discogsUsername: string
  accessToken: string // NEVER expose in API responses
  accessTokenSecret: string // NEVER expose in API responses
  linkedAt: Date
}

/**
 * Extend Express Session with custom data
 */
declare module 'express-session' {
  interface SessionData {
    discogsAuth?: DiscogsAuth
  }
}
