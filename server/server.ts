import dotenv from 'dotenv'

// Load environment variables first
dotenv.config()

import express, { Request, Response, RequestHandler, NextFunction } from 'express'
import cors from 'cors'
import axios, { AxiosError } from 'axios'
import { URL } from 'url'
import { collectionService } from './services/collectionService'
import type { CollectionFilters } from './types/discogs'

const app = express()

// Security: Configure CORS properly
const corsOptions = {
  origin: process.env.VITE_CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json())

import { sendContactMail } from './services/contactService'
// ...middlewares...

interface ImageRouteParams {
  '0': string
}

type ImageRequestHandler = RequestHandler<ImageRouteParams>

const isValidDiscogsUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname === 'i.discogs.com'
  } catch {
    return false
  }
}

// Cache headers middleware
const setCacheHeaders: ImageRequestHandler = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=86400')
  next()
}

// Main image proxy handler
const proxyImageHandler: ImageRequestHandler = async (req, res) => {
  try {
    const imagePath = req.params['0']

    if (!imagePath) {
      return res.status(400).json({ error: 'Image path is required' })
    }

    const imageUrl = `https://i.discogs.com/${imagePath}`

    if (!isValidDiscogsUrl(imageUrl)) {
      return res.status(400).json({ error: 'Invalid Discogs image URL' })
    }

    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 5000,
      headers: {
        'User-Agent': 'SpaceIsThePlace/1.0',
        Accept: 'image/*',
        Referer: 'https://www.discogs.com'
      },
      validateStatus: status => status === 200
    })

    const contentType = response.headers['content-type']
    if (!contentType?.startsWith('image/')) {
      return res.status(400).json({ error: 'Invalid content type' })
    }

    res.set({
      'Content-Type': contentType,
      'Content-Length': response.headers['content-length'],
      'Accept-Ranges': 'bytes',
      'X-Content-Type-Options': 'nosniff'
    })

    return response.data.pipe(res)
  } catch (error) {
    console.error('Image proxy error:', error)

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError

      if (axiosError.response?.status === 404) {
        return res.status(404).json({ error: 'Image not found' })
      }

      if (axiosError.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Request timeout' })
      }
    }

    return res.status(500).json({ error: 'Failed to proxy image' })
  }
}

type AsyncHandler = (req: Request, res: Response) => Promise<void>

// Collection endpoints
const asyncHandler = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next)
}

// Route pour le formulaire de contact (après déclaration de app et middlewares)
app.post('/api/contact', asyncHandler(sendContactMail))

app.get(
  '/api/collection',
  asyncHandler(async (req: Request, res: Response) => {
    const filters: CollectionFilters = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      perPage: req.query.perPage ? parseInt(req.query.perPage as string) : undefined,
      folderId: req.query.folder ? parseInt(req.query.folder as string) : undefined,
      sort: req.query.sort as 'added' | 'artist' | 'title',
      sortOrder: req.query.order as 'asc' | 'desc',
      search: req.query.search as string
    }

    const result = await collectionService.getCollection(filters)
    res.json(result)
  })
)

app.get(
  '/api/collection/search',
  asyncHandler(async (req, res): Promise<void> => {
    const query = (req.query.q as string) || ''
    if (!query.trim()) {
      res.status(400).json({ error: 'Search query is required' })
      return
    }

    const filters: CollectionFilters = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      perPage: req.query.perPage ? parseInt(req.query.perPage as string) : undefined,
      folderId: req.query.folder ? parseInt(req.query.folder as string) : undefined,
      sort: req.query.sort as 'added' | 'artist' | 'title',
      // IMPORTANT : le type s’appelle "sortOrder"
      sortOrder: req.query.order as 'asc' | 'desc'
    }

    // <-- ici: 2 arguments, la query string PUIS l'objet filters
    const result = await collectionService.searchCollection(query, filters)
    res.json(result)
  })
)

app.get(
  '/api/folders',
  asyncHandler(async (req: Request, res: Response) => {
    const folders = await collectionService.getFolders()
    res.json({ folders })
  })
)

app.post(
  '/api/collection/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const folderId = req.query.folder ? parseInt(req.query.folder as string) : 0
    const result = await collectionService.refreshCache(folderId)
    res.json(result)
  })
)

// Register routes
app.get('/api/proxy/images/*', setCacheHeaders, proxyImageHandler)

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err)

  // Don't send stack trace in production
  const errorResponse = {
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  }

  res.status(500).json(errorResponse)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Image proxy server running on port ${PORT}`)

  // Warm-up non bloquant
  void collectionService
    .getCollection({
      folderId: 0,
      page: 1,
      perPage: 50,
      sort: 'added',
      sortOrder: 'desc',
      search: 'a'
    })
    .then(() => console.log('[warmup] cache prêt'))
    .catch(err => console.warn('[warmup] échec', err))
})
