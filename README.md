# Space is the Place

A modern web application for browsing and managing vinyl record collections using the Discogs API. Built with Vue.js and Express, this application provides a clean, responsive interface for exploring your music collection.

## Overview

Space is the Place allows users to view and explore their Discogs vinyl collection through an intuitive web interface. The application features advanced filtering, sorting, and search capabilities, along with integration with Apple Music for audio previews.

## Features

### Collection Management
- Browse your complete Discogs collection with pagination
- Filter releases by folder
- Sort by various criteria (date added, artist, title, label, year, format)
- Search across artists, titles, labels, and catalog numbers using full-text search
- Responsive grid layout that adapts to different screen sizes

### Release Details
- View detailed information about individual releases
- Display cover art, track listings, and release metadata
- Apple Music integration for audio previews
- Image carousel for viewing multiple release images

### User Experience
- Smooth page transitions and animations
- Skeleton loaders for improved perceived performance
- Real-time search with visual feedback
- Mobile-friendly responsive design
- Performance optimized with Lighthouse testing

## Technical Stack

### Frontend
- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **Icons**: Heroicons
- **Build Tool**: Vite
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Search Engine**: MiniSearch (in-memory full-text search)
- **APIs**: Discogs API, Apple Music API
- **Email**: Nodemailer

### Development Tools
- ESLint for code linting
- Prettier for code formatting
- Jest for testing
- Lighthouse for performance auditing
- TypeScript for type safety
- Nodemon for hot reloading

## Architecture

### Project Structure

The project is organized as a monorepo with two main workspaces:

```
space-is-the-place/
├── client/                 # Vue.js frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── views/          # Page components
│   │   ├── services/       # API clients
│   │   ├── composables/    # Vue composition functions
│   │   ├── stores/         # Pinia state stores
│   │   ├── router/         # Vue Router configuration
│   │   └── types/          # TypeScript type definitions
│   └── package.json
│
├── server/                 # Express backend server
│   ├── services/           # Business logic and API services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── server.ts           # Main server entry point
│   └── package.json
│
└── package.json            # Root workspace configuration
```

### Backend Services

The server implements a modular service architecture:

- **Collection Service**: Orchestrates collection data fetching, caching, and filtering
- **Discogs Client**: Handles API requests to Discogs with rate limiting and error handling
- **Search Service**: Implements full-text search using MiniSearch
- **Cache Service**: In-memory caching layer with TTL support
- **Contact Service**: Email functionality using Nodemailer
- **Image Proxy**: Secure proxy for Discogs images with caching headers

### Frontend Architecture

The client follows Vue 3 best practices:

- **Composition API**: Leverages Vue's Composition API for better code organization
- **Composables**: Reusable composition functions (e.g., `useCollection`)
- **Component Library**: Custom UI components with consistent styling
- **Type Safety**: Full TypeScript coverage for better development experience
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Prerequisites

- Node.js 20 or higher
- npm or equivalent package manager
- Discogs account and API credentials
- (Optional) Apple Music API credentials for music preview integration

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/space-is-the-place.git
cd space-is-the-place
```

### 2. Install dependencies

```bash
npm install
```

This will install dependencies for both the client and server workspaces.

### 3. Configure environment variables

Create a `.env` file in the `server/` directory:

```env
# Discogs API credentials
DISCOGS_USER_TOKEN=your_discogs_user_token
DISCOGS_USERNAME=your_discogs_username

# Apple Music API (optional)
APPLE_MUSIC_API_KEY=your_apple_music_key

# Email configuration (for contact form)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@example.com
EMAIL_TO=recipient@example.com

# Server configuration
PORT=3000
```

### 4. Obtain Discogs API credentials

1. Create a Discogs account at [discogs.com](https://www.discogs.com/)
2. Go to Settings > Developers
3. Generate a personal access token
4. Add items to your collection if you haven't already

## Development

### Run both client and server in development mode

```bash
npm run dev
```

This starts:
- Frontend dev server at `http://localhost:5173`
- Backend API server at `http://localhost:3000`

### Run client only

```bash
npm run dev:client
```

### Run server only

```bash
npm run dev:server
```

### Code Quality

```bash
# Lint frontend code
cd client && npm run lint

# Format code
cd client && npm run format

# Type check
cd client && npm run type-check

# Run tests
cd server && npm test
```

## Building for Production

### Build both client and server

```bash
npm run build
```

### Build client only

```bash
npm run build:client
```

### Build server only

```bash
npm run build:server
```

### Preview production build

```bash
cd client && npm run preview
```

## API Endpoints

### Collection

- `GET /api/collection` - Get collection with filters
  - Query params: `page`, `perPage`, `folderId`, `sort`, `sortOrder`, `search`

- `GET /api/folders` - Get user's collection folders

### Releases

- `GET /api/release/:id` - Get detailed release information

### Search

- `GET /api/search` - Full-text search across collection
  - Query params: `q` (search query)

### Utilities

- `GET /proxy/image/*` - Proxy for Discogs images
- `POST /api/contact` - Send contact form email

## Performance

The application is optimized for performance:

- **Code splitting**: Lazy-loaded routes for smaller initial bundle
- **Image optimization**: Responsive images with lazy loading
- **Caching**: In-memory cache for API responses (15-minute TTL)
- **Compression**: Gzip compression for production builds
- **Bundle analysis**: Rollup visualizer for analyzing bundle size
- **Lighthouse audits**: Automated performance testing

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is private and not licensed for public use.

## Acknowledgments

- [Discogs](https://www.discogs.com/) for the comprehensive music database API
- [Apple Music](https://www.apple.com/apple-music/) for music preview integration
- Inspired by the music collection management community
