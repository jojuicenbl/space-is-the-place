# Space is the Place

A modern web application for browsing and managing vinyl record collections using the Discogs API. Built with Vue.js and Express, this application provides a clean, responsive interface for exploring your music collection with secure OAuth authentication.

## Overview

Space is the Place is a multi-user application that allows users to connect their Discogs account via OAuth and view their personal vinyl collection through an intuitive web interface. Each user authenticates with their own Discogs account, ensuring secure access to their private collection data. The application features advanced filtering, sorting, and search capabilities, along with integration with Apple Music for audio previews.

## Features

### Authentication & Security
- **OAuth 1.0a Integration**: Secure authentication flow with Discogs
- **Multi-User Support**: Each user has their own authenticated session
- **Session Management**: Persistent sessions with automatic token refresh
- **Privacy First**: Users only see their own collection data

### Collection Management
- Browse your complete Discogs collection with pagination
- Filter releases by folder
- Sort by various criteria (date added, artist, title, label, year, format)
- Search across artists, titles, labels, and catalog numbers using full-text search
- Responsive grid layout that adapts to different screen sizes
- Background warmup for optimized performance

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
- Seamless OAuth authentication flow

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
- **Authentication**: OAuth 1.0a with Discogs
- **Session Management**: Express sessions with secure cookies
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

- **OAuth Service**: Manages OAuth 1.0a authentication flow with Discogs
- **Session Service**: Handles user sessions and authentication state
- **Collection Service**: Orchestrates collection data fetching, caching, and filtering per user
- **Discogs Client**: Handles authenticated API requests to Discogs with rate limiting and error handling
- **Search Service**: Implements full-text search using MiniSearch with per-user indexes
- **Cache Service**: In-memory caching layer with TTL support and user isolation
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
- Discogs Developer Application (for OAuth credentials)
- Discogs account for each user who wants to use the app
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
# Discogs OAuth credentials (from Developer Application)
DISCOGS_CONSUMER_KEY=your_consumer_key
DISCOGS_CONSUMER_SECRET=your_consumer_secret

# Session configuration
SESSION_SECRET=your_random_session_secret

# Application URL (for OAuth callback)
APP_URL=http://localhost:5173

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

### 4. Set up Discogs Developer Application

1. Create a Discogs account at [discogs.com](https://www.discogs.com/) if you don't have one
2. Go to Settings > Developers
3. Click "Create an Application"
4. Fill in the application details:
   - **Application Name**: Space is the Place (or your preferred name)
   - **Application Description**: Vinyl collection browser
   - **Callback URL**: `http://localhost:3000/auth/callback` (for local development)
5. Once created, copy your **Consumer Key** and **Consumer Secret** to the `.env` file
6. Generate a strong random string for `SESSION_SECRET` (e.g., using `openssl rand -hex 32`)

**Note**: Each user will authenticate with their own Discogs account when they first visit the application. They don't need developer credentials, just a regular Discogs account with a collection.

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

### Authentication

- `GET /auth/login` - Initiate OAuth login flow with Discogs
- `GET /auth/callback` - OAuth callback endpoint (handled automatically)
- `POST /auth/logout` - Logout and clear session
- `GET /auth/status` - Check current authentication status

### Collection

- `GET /api/collection` - Get authenticated user's collection with filters
  - Query params: `page`, `perPage`, `folderId`, `sort`, `sortOrder`, `search`
  - Requires authentication

- `GET /api/folders` - Get authenticated user's collection folders
  - Requires authentication

### Releases

- `GET /api/release/:id` - Get detailed release information
  - Requires authentication

### Search

- `GET /api/search` - Full-text search across authenticated user's collection
  - Query params: `q` (search query)
  - Requires authentication

### Utilities

- `GET /proxy/image/*` - Proxy for Discogs images
- `POST /api/contact` - Send contact form email

**Note**: All collection-related endpoints require authentication. Unauthenticated requests will return a 401 status code.

## User Workflow

1. **First Visit**: User is greeted with a login page
2. **Authentication**: User clicks "Connect with Discogs" to start OAuth flow
3. **Authorization**: User is redirected to Discogs to authorize the application
4. **Callback**: After authorization, user is redirected back to the app
5. **Collection Access**: User can now browse their personal Discogs collection
6. **Session Persistence**: User stays logged in across browser sessions
7. **Logout**: User can logout at any time to clear their session

## Performance

The application is optimized for performance:

- **Code splitting**: Lazy-loaded routes for smaller initial bundle
- **Image optimization**: Responsive images with lazy loading
- **Caching**: In-memory cache for API responses with user isolation (15-minute TTL)
- **Background warmup**: Collection data is warmed up in the background for faster initial loads
- **Compression**: Gzip compression for production builds
- **Bundle analysis**: Rollup visualizer for analyzing bundle size
- **Lighthouse audits**: Automated performance testing
- **Session management**: Efficient session handling with minimal overhead

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
