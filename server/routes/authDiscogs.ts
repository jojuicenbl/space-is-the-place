/**
 * Discogs OAuth Authentication Routes
 * Handles the OAuth 1.0a flow for user authentication
 *
 * Flow:
 * 1. POST /api/auth/discogs/request - Get authorization URL
 * 2. User authorizes on Discogs website
 * 3. GET /api/auth/discogs/callback - Complete OAuth and get user identity
 */

import { Router, Request, Response } from 'express'
import { discogsOAuthClient } from '../services/discogsOAuthClient'
import { userService } from '../services/userService'
import crypto from 'crypto'

const router = Router()

/**
 * Temporary in-memory store for OAuth tokens
 * Maps stateId -> { oauthToken, oauthTokenSecret, timestamp }
 *
 * TODO: In production, this should be stored in:
 * - Redis (recommended for distributed systems)
 * - Database with expiration
 * - Session store
 */
interface OAuthState {
  oauthToken: string
  oauthTokenSecret: string
  timestamp: number
}

const oauthStateStore = new Map<string, OAuthState>()

// Cleanup expired states every 10 minutes
const OAUTH_STATE_TTL = 15 * 60 * 1000 // 15 minutes
setInterval(() => {
  const now = Date.now()
  for (const [stateId, state] of oauthStateStore.entries()) {
    if (now - state.timestamp > OAUTH_STATE_TTL) {
      oauthStateStore.delete(stateId)
    }
  }
}, 10 * 60 * 1000)

/**
 * POST /api/auth/discogs/request
 * Initiates OAuth flow by requesting a token and returning the authorization URL
 */
router.post('/request', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user exists (using default user for now)
    // TODO: Replace with session-based auth when full auth system is implemented
    const currentUser = userService.getDefaultUser()
    if (!currentUser) {
      res.status(401).json({ error: 'Unauthorized - No user found' })
      return
    }

    // Generate callback URL
    const protocol = req.protocol
    const host = req.get('host')
    const callbackUrl = `${protocol}://${host}/api/auth/discogs/callback`

    // Get request token from Discogs
    const { oauthToken, oauthTokenSecret, authorizeUrl } =
      await discogsOAuthClient.getRequestToken(callbackUrl)

    // Generate state ID for CSRF protection
    const stateId = crypto.randomBytes(16).toString('hex')

    // Store token secret temporarily (needed for next step)
    oauthStateStore.set(stateId, {
      oauthToken,
      oauthTokenSecret,
      timestamp: Date.now()
    })

    // Return authorization URL and state ID
    res.json({
      authorizeUrl,
      stateId
    })
  } catch (error) {
    console.error('OAuth request error:', error)
    res.status(500).json({
      error: 'Failed to initiate OAuth flow',
      message: (error as Error).message
    })
  }
})

/**
 * GET /api/auth/discogs/callback
 * Callback endpoint after user authorizes on Discogs
 * Completes OAuth flow and retrieves user identity
 */
router.get('/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { oauth_token, oauth_verifier } = req.query

    if (!oauth_token || !oauth_verifier) {
      res.status(400).json({
        error: 'Missing OAuth parameters',
        message: 'oauth_token and oauth_verifier are required'
      })
      return
    }

    // Find stored state by oauth_token
    let storedState: OAuthState | undefined
    let stateId: string | undefined

    for (const [id, state] of oauthStateStore.entries()) {
      if (state.oauthToken === oauth_token) {
        storedState = state
        stateId = id
        break
      }
    }

    if (!storedState || !stateId) {
      res.status(400).json({
        error: 'Invalid or expired OAuth state',
        message: 'OAuth token not found or expired. Please restart the authorization flow.'
      })
      return
    }

    // Exchange request token for access token
    const { accessToken, accessTokenSecret } = await discogsOAuthClient.getAccessToken(
      oauth_token as string,
      storedState.oauthTokenSecret,
      oauth_verifier as string
    )

    // Get user identity from Discogs
    const discogsIdentity = await discogsOAuthClient.getIdentity(accessToken, accessTokenSecret)

    // Clean up state
    oauthStateStore.delete(stateId)

    // Get current user (for now, using default user)
    // TODO: Replace with session-based user lookup when full auth is implemented
    const currentUser = userService.getDefaultUser()

    if (!currentUser) {
      res.status(500).json({
        error: 'User not found',
        message: 'Unable to find current user'
      })
      return
    }

    // Store access tokens in user
    const updatedUser = userService.updateDiscogsAuth(currentUser.id, {
      discogsUsername: discogsIdentity.username,
      accessToken,
      accessTokenSecret
    })

    if (!updatedUser) {
      res.status(500).json({
        error: 'Failed to update user',
        message: 'Unable to store Discogs authentication'
      })
      return
    }

    // Redirect to frontend with success indicator
    // Frontend can then call /api/me to get updated user data
    const frontendUrl = process.env.VITE_CLIENT_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/collection?discogs_connected=1`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    res.status(500).json({
      error: 'Failed to complete OAuth flow',
      message: (error as Error).message
    })
  }
})

/**
 * GET /api/auth/discogs/status
 * Check OAuth connection status
 * Useful for debugging and testing
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const isConfigured = !!(
      process.env.DISCOGS_CONSUMER_KEY && process.env.DISCOGS_CONSUMER_SECRET
    )

    res.json({
      configured: isConfigured,
      activeStates: oauthStateStore.size,
      message: isConfigured
        ? 'OAuth is configured and ready'
        : 'OAuth credentials not configured. Set DISCOGS_CONSUMER_KEY and DISCOGS_CONSUMER_SECRET.'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check OAuth status',
      message: (error as Error).message
    })
  }
})

export default router
