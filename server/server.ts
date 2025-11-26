import dotenv from 'dotenv'

// Load environment variables first
dotenv.config()

import express, { Request, Response, RequestHandler, NextFunction } from 'express'
import cors from 'cors'
import axios, { AxiosError } from 'axios'
import { URL } from 'url'

const app = express()

const allowedOrigins = [
  process.env.VITE_CLIENT_URL,        // prod : https://spaceistheplace.app (Render)
  'http://localhost:5173',            // dev Vite
  'http://localhost:4173'             // dev preview Vite (npm run preview)
].filter(Boolean) as string[]

// Security: Configure CORS properly
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Requêtes sans origin (curl, Postman, health checks, etc.) -> on autorise
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`))
  },
  methods: ['GET', 'POST'],
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())

import { sendContactMail } from './services/contactService'
import authDiscogsRouter from './routes/authDiscogs'
import userRouter from './routes/user'
import collectionRouter from './routes/collection'
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

// Helper for async route handlers
const asyncHandler = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next)
}

// Route pour le formulaire de contact
app.post('/api/contact', asyncHandler(sendContactMail))

// Register routes
app.use('/api/auth/discogs', authDiscogsRouter)
app.use('/api', userRouter)
app.use('/api/collection', collectionRouter)
// Backwards compatibility for /api/folders (redirects to /api/collection/folders)
app.get('/api/folders', (req, res) => res.redirect('/api/collection/folders'))
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
  console.log(`Server running on port ${PORT}`)
  console.log('Endpoints:')
  console.log('  - GET  /api/collection?mode=demo|user')
  console.log('  - GET  /api/collection/search')
  console.log('  - GET  /api/collection/folders')
  console.log('  - POST /api/collection/refresh')
  console.log('  - GET  /api/me')
  console.log('  - GET  /api/auth/discogs/request')
  console.log('  - GET  /api/auth/discogs/callback')
})
