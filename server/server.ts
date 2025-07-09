import dotenv from 'dotenv'

// Load environment variables first
dotenv.config()

import express, { Request, Response, RequestHandler } from 'express'
import cors from 'cors'
import axios, { AxiosError } from 'axios'
import { URL } from 'url'
import { collectionService } from './services/collectionService'
import type { CollectionFilters } from './types/discogs'

const app = express()

// Security: Configure CORS properly
const corsOptions = {
  origin: process.env.VITE_CLIENT_URL || 'http://localhost:5173',
  methods: ['GET'],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.json())

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

// Collection endpoints
app.get('/api/collection', async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Collection API error:', error)
    res.status(500).json({ error: 'Failed to fetch collection' })
  }
})

app.get('/api/collection/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string
    if (!query || query.trim() === '') {
      res.status(400).json({ error: 'Search query is required' })
      return
    }

    const filters: CollectionFilters = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      perPage: req.query.perPage ? parseInt(req.query.perPage as string) : undefined,
      folderId: req.query.folder ? parseInt(req.query.folder as string) : undefined,
      sort: req.query.sort as 'added' | 'artist' | 'title',
      sortOrder: req.query.order as 'asc' | 'desc'
    }

    const result = await collectionService.searchCollection(query, filters)
    res.json(result)
  } catch (error) {
    console.error('Search API error:', error)
    res.status(500).json({ error: 'Failed to search collection' })
  }
})

app.get('/api/folders', async (req: Request, res: Response): Promise<void> => {
  try {
    const folders = await collectionService.getFolders()
    res.json({ folders })
  } catch (error) {
    console.error('Folders API error:', error)
    res.status(500).json({ error: 'Failed to fetch folders' })
  }
})

// Register routes
app.get('/api/proxy/images/*', setCacheHeaders, proxyImageHandler)

// Error handling middleware
app.use((err: Error, _req: Request, res: Response) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Image proxy server running on port ${PORT}`)
})
