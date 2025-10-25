# Collection Service Refactoring

## 📋 Overview

This refactoring splits the monolithic `collectionService.ts` (526 lines) into modular, reusable components following the DRY (Don't Repeat Yourself) principle.

## 🏗️ New Architecture

```
server/
├── interfaces/           # TypeScript interfaces & contracts
│   ├── cache.interface.ts
│   ├── http.interface.ts
│   ├── itunes.interface.ts
│   └── search.interface.ts
│
├── utils/               # DRY utilities (reusable everywhere)
│   ├── normalization.ts  # Text normalization, artist/title cleaning, year parsing
│   └── scoring.ts        # Similarity scoring, Levenshtein, fuzzy matching
│
├── services/
│   ├── cache/
│   │   └── cacheService.ts         # Generic cache abstraction (Map → Redis ready)
│   │
│   ├── discogs/
│   │   └── discogsClient.ts        # Discogs API calls + retry logic
│   │
│   ├── itunes/
│   │   ├── itunesClient.ts         # iTunes Search API client
│   │   └── itunesMatchingService.ts # Multi-signal matching algorithm
│   │
│   ├── search/
│   │   └── searchService.ts        # MiniSearch index management
│   │
│   └── collectionService.ts        # Lightweight orchestrator (290 lines)
│
└── __tests__/           # Unit tests
    └── utils/
        ├── normalization.test.ts
        └── scoring.test.ts
```

## ✅ Key Improvements

### 1. DRY Principle Enforced
- **Before:** `toLowerCase()`, `trim()`, normalization repeated 15+ times
- **After:** Single source of truth in `utils/normalization.ts`
- **Reusability:** Used by collectionService, itunesMatchingService, searchService

### 2. Separation of Concerns
| Module | Responsibility |
|--------|---------------|
| `discogsClient` | HTTP calls, retry logic, rate limiting |
| `itunesClient` | iTunes API communication |
| `itunesMatchingService` | Scoring algorithm with configurable weights |
| `searchService` | MiniSearch indexing |
| `cacheService` | Generic cache (swappable to Redis) |
| `collectionService` | Orchestration only |

### 3. New Features Added

#### iTunes Matching Service
```typescript
const result = await itunesMatchingService.findMatch({
  title: 'Dark Side of the Moon',
  artist: 'Pink Floyd',
  year: 1973,
  trackCount: 10
})

// Returns:
// {
//   matched: true,
//   confidence: 0.95,
//   result: { ...itunesAlbum },
//   reason: "High confidence match (95.0%)"
// }
```

**Features:**
- Multi-signal scoring (title, artist, year, track count)
- Configurable confidence threshold (default: 75%)
- Ambiguity handling (returns candidates if uncertain)
- Correction logging for future ML improvements

**Scoring Breakdown:**
- Title: 40% weight
- Artist: 35% weight
- Year: 15% weight (with remaster tolerance ±1 year)
- Track count: 10% weight

### 4. TypeScript Interfaces
All services now have typed contracts in `interfaces/` for better type safety and documentation.

### 5. Test Coverage
- `normalization.test.ts`: 15 test cases
- `scoring.test.ts`: 20 test cases
- Coverage target: 70%

## 🔄 Migration Guide

### Before (old code):
```typescript
const query = search.toLowerCase().trim()
```

### After (using DRY utilities):
```typescript
import { normalizeText } from '../utils/normalization'
const query = normalizeText(search)
```

## 📊 Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| collectionService.ts | 526 lines | 290 lines | -45% |
| Code duplication | High | Low | ✅ |
| Test coverage | 0% | 70% target | ✅ |
| Modularity | Monolith | 9 modules | ✅ |
| iTunes matching | ❌ | ✅ | NEW |

## 🧪 Running Tests

```bash
cd server
npm install
npm test
```

## 🔧 Configuration

### iTunes Matching Config
```typescript
const matching = new ItunesMatchingService({
  confidenceThreshold: 0.8,  // Require 80% confidence to auto-match
  maxCandidates: 5,           // Return top 5 candidates if ambiguous
  weights: {
    title: 0.5,
    artist: 0.3,
    year: 0.1,
    trackCount: 0.1
  }
})
```

### Cache Config
```typescript
const cache = new InMemoryCacheService<MyData>(30) // 30min TTL
// Easy to swap:
// const cache = new RedisCacheService<MyData>(config)
```

## 📝 API Changes

### No Breaking Changes
The `collectionService` public API remains **100% compatible**. All existing endpoints continue to work.

### New Endpoints (to be added)
```typescript
// GET /api/collection/:releaseId/match-itunes
// Returns iTunes match for a Discogs release

// POST /api/collection/:releaseId/correct-match
// Record user correction for ML improvements

// GET /api/collection/matching-stats
// Get matching accuracy statistics
```

## 🚀 Future Enhancements

1. **Redis Cache**: Swap `InMemoryCacheService` with `RedisCacheService`
2. **Apple Music API**: Add as fallback if iTunes Search fails
3. **ML Matching**: Use correction logs to train better matching heuristics
4. **Parallel Search**: Search Discogs + iTunes simultaneously
5. **GraphQL**: Add GraphQL layer on top of services

## 🎯 Acceptance Criteria

- [x] Modular architecture with clear separation
- [x] DRY utilities centralized
- [x] iTunes matching service implemented
- [x] TypeScript interfaces for all services
- [x] Unit tests with 70% coverage target
- [x] No breaking changes to existing API
- [x] Cache abstraction (Redis-ready)
- [x] Documentation (this file)

## 👥 Review Checklist

- [ ] All TypeScript types compile without errors
- [ ] Tests pass: `npm test`
- [ ] No `any` types without justification
- [ ] DRY utilities are reused across modules
- [ ] Cache service is generic and swappable
- [ ] iTunes API calls respect rate limits
- [ ] Existing collection endpoints still work

## 📖 References

- [iTunes Search API Docs](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI)
- [MiniSearch Documentation](https://lucaong.github.io/minisearch/)
- [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)
