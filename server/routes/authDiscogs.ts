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
import { v4 as uuidv4 } from 'uuid'
import { discogsOAuthClient } from '../services/discogsOAuthClient'
import { monitoringService } from '../services/monitoringService'

const router = Router()

/**
 * Temporary in-memory store for OAuth tokens
 * Maps oauth_token -> { oauthTokenSecret, stateId, timestamp }
 *
 * After successful OAuth, we also store the result temporarily keyed by stateId
 * so the frontend can retrieve it.
 *
 * stateId is a unique UUID generated for each OAuth flow, independent of sessions.
 * This allows the flow to work across different domains (frontend/backend on separate domains).
 *
 * TODO: In production, this should be stored in:
 * - Redis (recommended for distributed systems)
 * - Database with expiration
 */
interface OAuthState {
  oauthTokenSecret: string
  stateId: string // Unique ID for this OAuth flow
  timestamp: number
}

interface OAuthResult {
  discogsUsername: string
  accessToken: string
  accessTokenSecret: string
  linkedAt: Date
  timestamp: number
}

const oauthStateStore = new Map<string, OAuthState>()
const oauthResultStore = new Map<string, OAuthResult>()

// Cleanup expired states and results every 10 minutes
const OAUTH_STATE_TTL = 15 * 60 * 1000 // 15 minutes
const OAUTH_RESULT_TTL = 5 * 60 * 1000 // 5 minutes
setInterval(() => {
  const now = Date.now()

  // Cleanup OAuth states
  for (const [token, state] of oauthStateStore.entries()) {
    if (now - state.timestamp > OAUTH_STATE_TTL) {
      oauthStateStore.delete(token)
    }
  }

  // Cleanup OAuth results
  for (const [sessionId, result] of oauthResultStore.entries()) {
    if (now - result.timestamp > OAUTH_RESULT_TTL) {
      oauthResultStore.delete(sessionId)
    }
  }
}, 10 * 60 * 1000)

/**
 * POST /api/auth/discogs/request
 * Initiates OAuth flow by requesting a token and returning the authorization URL
 */
router.post('/request', async (req: Request, res: Response): Promise<void> => {
  try {
    // Track OAuth request
    monitoringService.trackOAuthRequest()

    // Generate a unique state ID for this OAuth flow (independent of sessions)
    const stateId = uuidv4()

    // Generate callback URL
    // In development, use the frontend URL (Vite proxy handles /api routes)
    // In production, use the backend API URL directly (no proxy in production)
    const isDevelopment = process.env.NODE_ENV === 'development'
    const callbackBaseUrl = isDevelopment
      ? (process.env.VITE_CLIENT_URL || 'http://localhost:5173')
      : (process.env.VITE_API_URL || 'http://localhost:3000')
    const callbackUrl = `${callbackBaseUrl}/api/auth/discogs/callback`

    // Get request token from Discogs
    const { oauthToken, oauthTokenSecret, authorizeUrl } =
      await discogsOAuthClient.getRequestToken(callbackUrl)

    // Store token secret with unique state ID (keyed by oauth_token for callback lookup)
    oauthStateStore.set(oauthToken, {
      oauthTokenSecret,
      stateId,
      timestamp: Date.now()
    })

    // Update monitoring metrics
    monitoringService.updateMetrics({
      oauthActiveStates: oauthStateStore.size
    })

    // Return authorization URL
    res.json({
      authorizeUrl
    })
  } catch (error) {
    console.error('OAuth request error:', error)
    monitoringService.trackOAuthFailure()
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
      monitoringService.trackOAuthFailure()
      res.status(400).json({
        error: 'Missing OAuth parameters',
        message: 'oauth_token and oauth_verifier are required'
      })
      return
    }

    // Find stored state by oauth_token
    const storedState = oauthStateStore.get(oauth_token as string)

    if (!storedState) {
      console.error('OAuth state not found for token:', oauth_token)
      monitoringService.trackOAuthFailure()
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

    // Clean up OAuth state
    oauthStateStore.delete(oauth_token as string)

    // Store the OAuth result temporarily (keyed by the unique stateId)
    // The frontend will claim it using a separate endpoint
    const result: OAuthResult = {
      discogsUsername: discogsIdentity.username,
      accessToken,
      accessTokenSecret,
      linkedAt: new Date(),
      timestamp: Date.now()
    }

    oauthResultStore.set(storedState.stateId, result)

    // Track success and update metrics
    monitoringService.trackOAuthSuccess()
    monitoringService.updateMetrics({
      oauthActiveStates: oauthStateStore.size,
      oauthPendingResults: oauthResultStore.size
    })

    // Redirect to frontend with unique state ID in URL
    // Frontend will use this to claim the OAuth result
    const frontendUrl = process.env.VITE_CLIENT_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/collection?discogs_auth_state=${storedState.stateId}`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    monitoringService.trackOAuthFailure()
    res.status(500).json({
      error: 'Failed to complete OAuth flow',
      message: (error as Error).message
    })
  }
})

/**
 * POST /api/auth/discogs/claim
 * Claim OAuth result and store in current session
 * Called by frontend after OAuth redirect
 */
router.post('/claim', async (req: Request, res: Response): Promise<void> => {
  try {
    const { authStateId } = req.body

    if (!authStateId) {
      res.status(400).json({
        error: 'Missing authStateId',
        message: 'authStateId parameter is required'
      })
      return
    }

    // Retrieve the OAuth result from temporary store
    const oauthResult = oauthResultStore.get(authStateId)

    if (!oauthResult) {
      console.error('OAuth result not found for state:', authStateId)
      res.status(404).json({
        error: 'OAuth result not found',
        message: 'OAuth result expired or invalid. Please try connecting again.'
      })
      return
    }

    // Check if result is not too old (5 minutes max)
    const age = Date.now() - oauthResult.timestamp
    if (age > 5 * 60 * 1000) {
      oauthResultStore.delete(authStateId)
      res.status(410).json({
        error: 'OAuth result expired',
        message: 'OAuth result expired. Please try connecting again.'
      })
      return
    }

    // Ensure session exists
    if (!req.session) {
      res.status(500).json({ error: 'Session not initialized' })
      return
    }

    // Store in current session
    req.session.discogsAuth = {
      discogsUsername: oauthResult.discogsUsername,
      accessToken: oauthResult.accessToken,
      accessTokenSecret: oauthResult.accessTokenSecret,
      linkedAt: oauthResult.linkedAt
    }

    // Clean up temporary store
    oauthResultStore.delete(authStateId)

    // Update metrics
    monitoringService.updateMetrics({
      oauthPendingResults: oauthResultStore.size
    })

    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err)
        res.status(500).json({
          error: 'Failed to save session',
          message: err.message
        })
        return
      }

      res.json({
        success: true,
        username: oauthResult.discogsUsername
      })
    })
  } catch (error) {
    console.error('Claim error:', error)
    res.status(500).json({
      error: 'Failed to claim OAuth result',
      message: (error as Error).message
    })
  }
})

/**
 * POST /api/auth/discogs/disconnect
 * Disconnect user's Discogs account
 */
router.post('/disconnect', async (req: Request, res: Response): Promise<void> => {
  try {
    // Remove Discogs authentication from session
    req.session.discogsAuth = undefined

    res.json({
      success: true,
      message: 'Discogs account disconnected successfully'
    })
  } catch (error) {
    console.error('Disconnect error:', error)
    res.status(500).json({
      error: 'Failed to disconnect',
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
