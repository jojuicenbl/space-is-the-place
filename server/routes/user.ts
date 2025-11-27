/**
 * User Routes
 * Handles user-related endpoints
 */

import { Router, Request, Response } from 'express'

const router = Router()

/**
 * GET /api/me
 * Returns current session's public data
 *
 * Response format:
 * {
 *   "id": "session-id",
 *   "email": "session@visitor.local",
 *   "discogs": {
 *     "isLinked": true | false,
 *     "username": "discogs-username" | null
 *   }
 * }
 *
 * SECURITY: This endpoint NEVER returns sensitive data like:
 * - accessToken
 * - accessTokenSecret
 * - consumerKey
 * - consumerSecret
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get Discogs auth from session
    const discogsAuth = req.session.discogsAuth

    // Return public data (strips sensitive OAuth tokens)
    const publicData = {
      id: req.sessionID,
      email: 'session@visitor.local', // Placeholder for session-based visitors
      discogs: {
        isLinked: !!discogsAuth,
        username: discogsAuth?.discogsUsername || null
      }
    }

    res.json(publicData)
  } catch (error) {
    console.error('Error fetching user data:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user data'
    })
  }
})

/**
 * POST /api/me/discogs/unlink
 * Unlink Discogs account from current session
 */
router.post('/me/discogs/unlink', async (req: Request, res: Response): Promise<void> => {
  try {
    // Remove Discogs auth from session
    req.session.discogsAuth = undefined

    // Return updated public data
    const publicData = {
      id: req.sessionID,
      email: 'session@visitor.local',
      discogs: {
        isLinked: false,
        username: null
      }
    }

    res.json({
      success: true,
      user: publicData,
      message: 'Discogs account unlinked successfully'
    })
  } catch (error) {
    console.error('Error unlinking Discogs account:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to unlink Discogs account'
    })
  }
})

export default router
