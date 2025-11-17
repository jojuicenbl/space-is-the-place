# Mobile Infinite Scroll Implementation

## Overview

This document describes the implementation of infinite scroll pagination for mobile devices while preserving the classic pager on desktop.

## Features Implemented

### ✅ Core Features

- **Responsive Pagination Modes**
  - Mobile (< 768px): Infinite scroll with IntersectionObserver
  - Desktop (≥ 768px): Classic pager (unchanged)

- **Unified State Management**
  - Pinia store (`usePaginationStore`) manages both modes
  - DRY principle: single source of truth for pagination logic
  - Automatic mode switching based on breakpoint

- **Performance Optimizations**
  - IntersectionObserver triggers load 600px before reaching bottom
  - DOM cap at 10 batches (480 items) to prevent memory issues
  - Request deduplication and AbortController for cancellation
  - Throttled resize detection (150ms debounce)

- **Accessibility**
  - ARIA live regions announce new items loaded
  - Screen reader friendly messaging
  - Keyboard navigation preserved
  - Focus management

- **User Experience**
  - Back to top button (mobile only, appears after 800px scroll)
  - Manual load more fallback on error
  - DOM cap message with manual continue option
  - Skeleton loaders during loading states
  - Smooth scroll animations
  - Error recovery with retry button

- **URL State Management**
  - All filters, sort, and page state synced to URL
  - Browser back/forward navigation support
  - Scroll position restoration (ready for future enhancement)

## Architecture

### File Structure

```
client/src/
├── stores/
│   └── usePaginationStore.ts          # Unified pagination state (Pinia)
├── composables/
│   ├── useResponsive.ts               # Breakpoint detection
│   ├── useIntersectionObserver.ts     # Infinite scroll observer
│   └── useCollection.ts               # (existing, kept for compatibility)
├── components/
│   └── UI/
│       ├── BackToTop.vue              # Floating back to top button
│       ├── LoadMore.vue               # Manual load more button
│       ├── InfiniteScrollSentinel.vue # Intersection observer target
│       ├── LiveRegion.vue             # ARIA live announcements
│       ├── DomCapMessage.vue          # DOM cap warning/CTA
│       └── Pager.vue                  # (existing, unchanged)
└── views/
    └── CollectionView.vue             # Main view with unified pagination
```

### Key Components

#### 1. usePaginationStore (Pinia Store)

**Location:** `client/src/stores/usePaginationStore.ts`

**Responsibilities:**
- Manages pagination mode (`infinite` | `pager`)
- Handles data fetching (initial load, load more, page change)
- Tracks loading states, errors, and DOM cap
- URL state synchronization
- Request cancellation

**Key Methods:**
- `setMode(mode)` - Switch between infinite/pager modes
- `loadInitial()` - Load first page/batch
- `loadMore()` - Load next batch (infinite mode only)
- `changePage(page)` - Change page (pager mode only)
- `applyFiltersAndSort(filters)` - Apply filters and reset pagination
- `retry()` - Retry after error

**Key State:**
- `mode` - Current pagination mode
- `items` - Collection items (cumulative in infinite mode)
- `batchesLoaded` - Number of batches loaded (infinite mode)
- `domCapReached` - Whether DOM cap (480 items) has been reached
- `canLoadMore` - Computed flag for whether more items can be loaded

#### 2. useResponsive Composable

**Location:** `client/src/composables/useResponsive.ts`

**Responsibilities:**
- Detects current breakpoint (mobile vs desktop)
- Provides reactive `isMobile` and `isDesktop` refs
- Debounced resize handling (150ms)

**Breakpoint:** 768px (Tailwind `md` breakpoint)

#### 3. useIntersectionObserver Composable

**Location:** `client/src/composables/useIntersectionObserver.ts`

**Responsibilities:**
- Wraps IntersectionObserver API
- Triggers callback when sentinel becomes visible
- Configurable rootMargin (default 600px) and threshold
- Prevents multiple simultaneous triggers
- Auto cleanup on unmount

#### 4. CollectionView Component

**Location:** `client/src/views/CollectionView.vue`

**Responsibilities:**
- Orchestrates all pagination logic
- Renders grid of vinyl cards
- Conditionally shows pager (desktop) or infinite scroll UI (mobile)
- Manages filters, search, and sort
- Handles scroll restoration

**Key Features:**
- Responsive grid (2/3/4/6 columns)
- Ghost cards to fill incomplete rows
- Staggered reveal animations
- Error states with retry
- Empty states

## Pagination Modes

### Desktop Mode (Pager)

**Trigger:** Window width ≥ 768px

**Behavior:**
- Classic pagination with page numbers
- Delta=2 page range with ellipsis
- Previous/Next buttons
- Clicking page number loads that specific page
- Items are replaced on page change (not accumulated)

**UI Components:**
- `Pager.vue` - Classic pager component (unchanged)

### Mobile Mode (Infinite Scroll)

**Trigger:** Window width < 768px

**Behavior:**
- Automatic loading as user scrolls
- New items appended to existing list
- IntersectionObserver triggers load 600px before reaching bottom
- Loading skeletons during fetch
- Back to top button appears after 800px scroll
- DOM cap at 480 items (10 batches × 48 items/batch)

**UI Components:**
- `InfiniteScrollSentinel.vue` - Invisible trigger element
- `BackToTop.vue` - Floating scroll-to-top button
- `LoadMore.vue` - Manual load button (fallback)
- `DomCapMessage.vue` - DOM cap warning
- `LiveRegion.vue` - Accessibility announcements

## Flow Diagrams

### Initial Load Flow

```
User navigates to /collection
    ↓
CollectionView.onMounted()
    ↓
paginationStore.initializeFromUrl() → Parse URL params
    ↓
paginationStore.loadInitial()
    ↓
API: GET /api/collection?page=1&perPage=48
    ↓
paginationStore.items = [...48 items]
    ↓
if (isMobile) → setupInfiniteScroll()
    ↓
observe(sentinelRef)
```

### Infinite Scroll Load More Flow

```
User scrolls down
    ↓
IntersectionObserver detects sentinel visible
    ↓
Callback triggered (with 600px root margin)
    ↓
Check paginationStore.canLoadMore
    ↓
if (true) → handleLoadMore()
    ↓
paginationStore.loadMore()
    ↓
API: GET /api/collection?page=2&perPage=48
    ↓
paginationStore.items = [...96 items]
    ↓
batchesLoaded++
    ↓
if (batchesLoaded >= 10) → domCapReached = true
    ↓
Display DomCapMessage component
```

### Mode Switching Flow

```
User resizes window crossing 768px breakpoint
    ↓
useResponsive detects change
    ↓
isMobile.value updates
    ↓
watch(isMobile) triggered
    ↓
paginationStore.setMode(mobile ? 'infinite' : 'pager')
    ↓
if (switching to infinite && items exist)
    ↓
setupInfiniteScroll()
    ↓
observe(sentinelRef)
```

## Configuration

### Breakpoint

Defined in `useResponsive.ts`:

```typescript
const MOBILE_BREAKPOINT = 768 // md breakpoint
```

To change: Update this constant.

### Items Per Page

Defined in `usePaginationStore.ts`:

```typescript
const ITEMS_PER_PAGE = 48
```

To change: Update this constant.

### DOM Cap

Defined in `usePaginationStore.ts`:

```typescript
const MAX_BATCHES = 10
const DOM_CAP_LIMIT = MAX_BATCHES * ITEMS_PER_PAGE // 480 items
```

To change: Update `MAX_BATCHES` constant.

### IntersectionObserver Settings

Defined in `CollectionView.vue`:

```typescript
const { observe, disconnect } = useIntersectionObserver(
  callback,
  { rootMargin: '600px', threshold: 0.1 }
)
```

To change:
- `rootMargin`: Distance before trigger (e.g., '300px', '1000px')
- `threshold`: Visibility percentage (0.0 to 1.0)

### Back to Top Threshold

Defined in `CollectionView.vue`:

```vue
<BackToTop :threshold="800" />
```

To change: Update `:threshold` prop (in pixels).

## API Integration

### Endpoints Used

#### GET /api/collection

**Query Parameters:**
- `page` - Page number (1-indexed)
- `perPage` - Items per page (default 48)
- `folder` - Folder ID filter
- `sort` - Sort field (`added` | `artist` | `title`)
- `order` - Sort order (`asc` | `desc`)
- `search` - Search query (optional)

**Response:**
```typescript
{
  releases: CollectionRelease[]
  pagination: {
    page: number
    pages: number
    per_page: number
    items: number
    urls: {
      first?: string
      prev?: string
      next?: string
      last?: string
    }
  }
  folders: DiscogsFolder[]
}
```

#### GET /api/collection/search

Same as above but optimized for search queries.

## Observability

### Custom Events

The store dispatches custom events for monitoring:

```typescript
// Infinite scroll load requested
window.dispatchEvent(new CustomEvent('infinite_load_requested'))

// Infinite scroll load success
window.dispatchEvent(new CustomEvent('infinite_load_success', {
  detail: { page, itemsLoaded, totalLoaded }
}))

// Infinite scroll load error
window.dispatchEvent(new CustomEvent('infinite_load_error', {
  detail: { error }
}))
```

You can listen to these events in your analytics/monitoring code:

```typescript
window.addEventListener('infinite_load_success', (e) => {
  console.log('Loaded batch', e.detail)
  // Send to analytics...
})
```

### Console Logging

The implementation includes strategic console logs:

```typescript
console.log('[PaginationStore] Initial load complete', {...})
console.log('[PaginationStore] Load more complete', {...})
console.log('[PaginationStore] DOM cap reached')
console.log('[CollectionView] Breakpoint changed, setting mode to:', mode)
console.log('[CollectionView] Setting up IntersectionObserver')
console.log('[CollectionView] Sentinel visible, loading more...')
```

## Testing Strategy

### Manual Testing Checklist

#### Mobile Infinite Scroll (< 768px)

- [ ] Initial load shows 48 items
- [ ] Scrolling down automatically loads more items
- [ ] Loading skeletons appear during fetch
- [ ] Back to top button appears after scrolling ~800px
- [ ] Back to top button scrolls to top smoothly
- [ ] DOM cap message appears after 480 items (10 batches)
- [ ] Manual "Continue Loading" button works after DOM cap
- [ ] Network error shows retry button
- [ ] Retry button successfully retries
- [ ] ARIA live region announces new items (test with screen reader)
- [ ] Filter change resets scroll and items
- [ ] Search resets scroll and items
- [ ] URL updates with page/filters
- [ ] Browser back/forward navigation works

#### Desktop Pager (≥ 768px)

- [ ] Pager component visible at bottom
- [ ] Page numbers show correctly with ellipsis
- [ ] Clicking page number loads that page
- [ ] Previous/Next buttons work
- [ ] First/Last navigation works
- [ ] Items replace on page change (not accumulated)
- [ ] Filter change resets to page 1
- [ ] Search resets to page 1
- [ ] URL updates with page/filters
- [ ] Browser back/forward navigation works

#### Responsive Switching

- [ ] Resizing from desktop to mobile switches to infinite mode
- [ ] Resizing from mobile to desktop switches to pager mode
- [ ] No duplicate requests on mode switch
- [ ] Items preserved on mode switch
- [ ] No visual glitches on mode switch

#### Accessibility

- [ ] Screen reader announces "X new items loaded"
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus management correct
- [ ] All interactive elements have aria-labels
- [ ] Color contrast meets WCAG AA standards

#### Performance

- [ ] No memory leaks (check DevTools Memory profiler)
- [ ] No orphaned event listeners
- [ ] Smooth scrolling (60fps on average mobile device)
- [ ] No layout shifts (CLS score)
- [ ] AbortController cancels pending requests

## Known Limitations

1. **Scroll Restoration:** Currently, scroll position is saved but not fully restored on back navigation. This is prepared in the store but requires router integration.

2. **Cursor-Based Pagination:** The API currently uses offset-based pagination (page/perPage). Cursor-based pagination would be more efficient for large collections but requires backend changes.

3. **Virtualization:** For very large collections (>1000 items), virtual scrolling would improve performance. This is mentioned in the DOM cap message but not implemented.

4. **Search Deep Pagination:** Search results beyond page 10 may have performance issues due to full collection loading for search indexing on the backend.

## Future Enhancements

### Priority 1: Essential

- [ ] Implement full scroll restoration on back navigation
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Performance monitoring integration (Web Vitals)

### Priority 2: Nice to Have

- [ ] Virtual scrolling for very large collections (vue-virtual-scroller)
- [ ] Pull-to-refresh on mobile
- [ ] Sticky filters bar on mobile scroll
- [ ] Swipe gestures for mobile navigation

### Priority 3: Backend

- [ ] Cursor-based pagination API endpoint
- [ ] Incremental search indexing (avoid full collection load)
- [ ] GraphQL alternative for flexible data fetching

## Rollback Plan

If issues arise in production, you can quickly roll back using a feature flag:

### Option 1: Environment Variable

Add to `.env`:

```bash
VITE_ENABLE_INFINITE_SCROLL=false
```

Update `CollectionView.vue`:

```typescript
const enableInfiniteScroll = import.meta.env.VITE_ENABLE_INFINITE_SCROLL !== 'false'

watch(isMobile, (mobile) => {
  const newMode = (mobile && enableInfiniteScroll) ? 'infinite' : 'pager'
  // ...
})
```

### Option 2: Store Flag

Add to `usePaginationStore.ts`:

```typescript
const ENABLE_INFINITE_SCROLL = false // Toggle here

// In setMode method:
function setMode(newMode: PaginationMode) {
  if (!ENABLE_INFINITE_SCROLL) {
    mode.value = 'pager'
    return
  }
  // ... rest of logic
}
```

### Option 3: Git Revert

If more serious:

```bash
git revert <commit-hash>
git push origin claude/mobile-infinite-scroll-011CUfA6TTGBMJZYygWALz31
```

## Troubleshooting

### Infinite scroll not triggering

**Symptoms:** Scrolling down doesn't load more items.

**Checks:**
1. Open DevTools Console
2. Look for `[CollectionView] Setting up IntersectionObserver`
3. Scroll and look for `[CollectionView] Sentinel visible, loading more...`
4. Check Network tab for API requests

**Possible causes:**
- Window width ≥ 768px (desktop mode)
- DOM cap reached (480 items)
- `hasMore = false` (no more items)
- Network error
- Sentinel not in viewport (root margin too small)

**Solutions:**
- Verify window width < 768px
- Check `paginationStore.domCapReached`
- Check `paginationStore.hasMore`
- Check Network tab for errors
- Increase `rootMargin` in IntersectionObserver options

### Pager not showing on desktop

**Symptoms:** No pagination controls on desktop.

**Checks:**
1. Verify window width ≥ 768px
2. Check `paginationStore.isPagerMode` in Vue DevTools
3. Check `totalPages > 1`

**Possible causes:**
- Window width < 768px (mobile mode)
- Only one page of results
- Component not rendered (v-show condition)

**Solutions:**
- Resize window to ≥ 768px
- Verify data has multiple pages
- Check CollectionView template conditions

### Back to top button not appearing

**Symptoms:** Button doesn't show when scrolling.

**Checks:**
1. Verify mobile mode (< 768px)
2. Scroll at least 800px down
3. Check `#main-scroll` element exists

**Possible causes:**
- Desktop mode (≥ 768px)
- Scroll threshold not reached
- Scroll target element ID incorrect

**Solutions:**
- Resize to mobile width
- Scroll further down
- Verify `scroll-target="main-scroll"` prop

### TypeError: Cannot read property 'length' of undefined

**Symptoms:** App crashes with this error.

**Possible cause:** Store not initialized before CollectionView mounts.

**Solution:** Verify Pinia is registered in `main.ts`:

```typescript
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia())
app.use(router)
```

## Support

For questions or issues:

1. Check this documentation
2. Check console logs for errors
3. Use Vue DevTools to inspect store state
4. Open an issue on GitHub with:
   - Browser and version
   - Window dimensions
   - Console errors
   - Steps to reproduce

## Changelog

### v1.0.0 - Initial Implementation

**Added:**
- Unified pagination store (Pinia)
- Responsive pagination modes (infinite/pager)
- IntersectionObserver for infinite scroll
- Back to top button (mobile)
- Manual load more fallback
- DOM cap at 480 items
- ARIA live regions
- URL state synchronization
- Error recovery with retry

**Changed:**
- CollectionView.vue refactored to use new store
- Removed direct usage of useCollection composable in CollectionView

**Fixed:**
- None (initial release)

## Credits

Implemented by Claude for the Space is the Place music collection app.
