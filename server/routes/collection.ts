/**
 * Collection Routes
 * Handles collection endpoints with demo/user mode support
 */

import { Router, Request, Response } from 'express'
import { collectionService, CollectionQuery } from '../services/collectionService'
import type { SortField, SortOrder } from '../types/discogs'
import { DiscogsRateLimitError } from '../services/discogs/discogsClient'
import type { User } from '../types/user'

const router = Router()

/**
 * GET /api/collection
 * Get user's Discogs collection with demo/user mode support
 *
 * Query params:
 * - mode: 'demo' | 'user' (default: 'demo')
 * - page: number (default: 1)
 * - perPage: number (default: 50)
 * - folder: number (default: 0)
 * - sort: 'added' | 'artist' | 'title' | 'year' (default: 'added')
 * - order: 'asc' | 'desc' (default: 'desc')
 * - search: string (optional)
 *
 * Response:
 * {
 *   mode: 'demo' | 'user' | 'unlinked' | 'empty',
 *   discogsUsername: string | null,
 *   page: number,
 *   perPage: number,
 *   totalItems: number,
 *   totalPages: number,
 *   releases: [...],
 *   folders: [...]
 * }
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse query parameters
    const mode = (req.query.mode as 'demo' | 'user') || 'demo'
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 50
    const folderId = req.query.folder ? parseInt(req.query.folder as string) : 0
    const sort = (req.query.sort as SortField) || 'added'
    const sortOrder = (req.query.order as SortOrder) || 'desc'
    const search = req.query.search as string | undefined

    // Validate mode
    if (mode !== 'demo' && mode !== 'user') {
      res.status(400).json({
        error: 'Invalid mode',
        message: 'Mode must be either "demo" or "user"'
      })
      return
    }

    // Get Discogs auth from session (for user mode)
    const currentUser: User | null = req.session.discogsAuth
      ? {
          id: req.sessionID,
          email: '', // Not needed for collection service
          createdAt: new Date(),
          discogsAuth: req.session.discogsAuth
        }
      : null

    // Build query
    const query: CollectionQuery = {
      mode,
      page,
      perPage,
      folderId,
      sort,
      sortOrder,
      search,
      currentUser
    }

    // Get collection
    const result = await collectionService.getCollectionByMode(query)

    // Transform to frontend-expected format with nested pagination
    res.json({
      mode: result.mode,
      discogsUsername: result.discogsUsername,
      releases: result.releases,
      folders: result.folders,
      pagination: {
        page: result.page,
        pages: result.totalPages,
        per_page: result.perPage,
        items: result.totalItems,
        urls: {
          first: result.page > 1 ? `?page=1` : undefined,
          prev: result.page > 1 ? `?page=${result.page - 1}` : undefined,
          next: result.page < result.totalPages ? `?page=${result.page + 1}` : undefined,
          last: result.page < result.totalPages ? `?page=${result.totalPages}` : undefined
        }
      }
    })
  } catch (error) {
    console.error('Error fetching collection:', error)

    // Handle rate limit errors
    if (error instanceof DiscogsRateLimitError) {
      res.status(429).json({
        error: 'discogs_rate_limited',
        message: 'Discogs is currently throttling requests. Please try again in a few seconds.'
      })
      return
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch collection'
    })
  }
})

/**
 * GET /api/collection/search
 * Search collection with mode support
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || ''
    if (!query.trim()) {
      res.status(400).json({ error: 'Search query is required' })
      return
    }

    const mode = (req.query.mode as 'demo' | 'user') || 'demo'
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 50
    const folderId = req.query.folder ? parseInt(req.query.folder as string) : 0
    const sort = (req.query.sort as SortField) || 'added'
    const sortOrder = (req.query.order as SortOrder) || 'desc'

    // Get Discogs auth from session (for user mode)
    const currentUser: User | null = req.session.discogsAuth
      ? {
          id: req.sessionID,
          email: '', // Not needed for collection service
          createdAt: new Date(),
          discogsAuth: req.session.discogsAuth
        }
      : null

    // Use new getCollectionByMode method with search
    const result = await collectionService.getCollectionByMode({
      mode,
      page,
      perPage,
      folderId,
      sort,
      sortOrder,
      search: query,
      currentUser
    })

    // Transform to frontend-expected format with nested pagination
    res.json({
      mode: result.mode,
      discogsUsername: result.discogsUsername,
      releases: result.releases,
      folders: result.folders,
      pagination: {
        page: result.page,
        pages: result.totalPages,
        per_page: result.perPage,
        items: result.totalItems,
        urls: {
          first: result.page > 1 ? `?page=1` : undefined,
          prev: result.page > 1 ? `?page=${result.page - 1}` : undefined,
          next: result.page < result.totalPages ? `?page=${result.page + 1}` : undefined,
          last: result.page < result.totalPages ? `?page=${result.totalPages}` : undefined
        }
      },
      totalResults: result.totalItems
    })
  } catch (error) {
    console.error('Error searching collection:', error)

    // Handle rate limit errors
    if (error instanceof DiscogsRateLimitError) {
      res.status(429).json({
        error: 'discogs_rate_limited',
        message: 'Discogs is currently throttling requests. Please try again in a few seconds.'
      })
      return
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search collection'
    })
  }
})

/**
 * GET /api/collection/folders
 * Get collection folders (demo mode only for now)
 */
router.get('/folders', async (req: Request, res: Response): Promise<void> => {
  try {
    const folders = await collectionService.getFolders()
    res.json({ folders })
  } catch (error) {
    console.error('Error fetching folders:', error)

    // Handle rate limit errors
    if (error instanceof DiscogsRateLimitError) {
      res.status(429).json({
        error: 'discogs_rate_limited',
        message: 'Discogs is currently throttling requests. Please try again in a few seconds.'
      })
      return
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch folders'
    })
  }
})

/**
 * POST /api/collection/refresh
 * Refresh cache for a folder (demo mode only for now)
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const folderId = req.query.folder ? parseInt(req.query.folder as string) : 0
    const result = await collectionService.refreshCache(folderId)
    res.json(result)
  } catch (error) {
    console.error('Error refreshing cache:', error)

    // Handle rate limit errors
    if (error instanceof DiscogsRateLimitError) {
      res.status(429).json({
        error: 'discogs_rate_limited',
        message: 'Discogs is currently throttling requests. Please try again in a few seconds.'
      })
      return
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to refresh cache'
    })
  }
})

export default router
