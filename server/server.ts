import express, { Request, Response, RequestHandler } from 'express'
import cors from 'cors'
import axios, { AxiosError } from 'axios'
import { URL } from 'url'

const app = express()

// Security: Configure CORS properly
const corsOptions = {
  origin: process.env.VITE_CLIENT_URL || 'http://localhost:5173',
  methods: ['GET'],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

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

// Register routes
app.get('/api/proxy/images/*', setCacheHeaders, proxyImageHandler)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Image proxy server running on port ${PORT}`)
})
