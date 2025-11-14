/**
 * User Routes
 * Handles user-related endpoints
 */

import { Router, Request, Response } from 'express'
import { userService } from '../services/userService'

const router = Router()

/**
 * GET /api/me
 * Returns current user's public data
 *
 * Response format:
 * {
 *   "id": "user-uuid",
 *   "email": "user@example.com",
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
    // Get current user (using default user for now)
    // TODO: Replace with session-based auth when full auth system is implemented
    const currentUser = userService.getDefaultUser()

    if (!currentUser) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No user found'
      })
      return
    }

    // Convert to public data (strips sensitive OAuth tokens)
    const publicData = userService.toPublicData(currentUser)

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
 * Unlink Discogs account from current user
 */
router.post('/me/discogs/unlink', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get current user
    const currentUser = userService.getDefaultUser()

    if (!currentUser) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No user found'
      })
      return
    }

    // Remove Discogs auth
    const updatedUser = userService.removeDiscogsAuth(currentUser.id)

    if (!updatedUser) {
      res.status(500).json({
        error: 'Failed to unlink account',
        message: 'Unable to remove Discogs authentication'
      })
      return
    }

    // Return updated public data
    const publicData = userService.toPublicData(updatedUser)
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
