/**
 * iTunes matching service with multi-signal scoring
 * Uses DRY utilities from utils/scoring and utils/normalization
 */

import { itunesClient } from './itunesClient'
import type {
  ItunesAlbum,
  ItunesMatchResult,
  ItunesMatchCandidate,
  MatchInput,
  MatchingConfig
} from '../../interfaces/itunes.interface'
import {
  scoreTitleMatch,
  scoreArtistMatch,
  scoreYearMatch,
  scoreTrackCountMatch,
  calculateWeightedScore,
  roundTo
} from '../../utils/scoring'
import { extractYear } from '../../utils/normalization'
import { InMemoryCacheService, createCacheEntry } from '../cache/cacheService'

const DEFAULT_CONFIG: MatchingConfig = {
  confidenceThreshold: 0.75, // Auto-match if score >= 75%
  maxCandidates: 5,
  weights: {
    title: 0.4, // 40% weight on title match
    artist: 0.35, // 35% weight on artist match
    year: 0.15, // 15% weight on year match
    trackCount: 0.1 // 10% weight on track count
  }
}

export class ItunesMatchingService {
  private config: MatchingConfig
  private cache: InMemoryCacheService<ItunesMatchResult>
  private correctionLog: Array<{
    input: MatchInput
    result: ItunesMatchResult
    userCorrected?: boolean
    timestamp: number
  }> = []

  constructor(config: Partial<MatchingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.cache = new InMemoryCacheService<ItunesMatchResult>(30) // 30min cache
  }

  /**
   * Find best iTunes match for a release
   */
  async findMatch(input: MatchInput): Promise<ItunesMatchResult> {
    const cacheKey = this.getCacheKey(input)

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log(`iTunes match cache hit for: ${input.artist} - ${input.title}`)
      return cached.data
    }

    console.log(`Searching iTunes for: ${input.artist} - ${input.title}`)

    // Search iTunes API
    const candidates = await itunesClient.searchAlbum(input.artist, input.title, 20)

    if (candidates.length === 0) {
      const noMatchResult: ItunesMatchResult = {
        matched: false,
        confidence: 0,
        reason: 'No results found in iTunes'
      }

      this.cache.set(cacheKey, createCacheEntry(noMatchResult))
      this.logMatch(input, noMatchResult)

      return noMatchResult
    }

    // Score all candidates
    const scoredCandidates = this.scoreCandidates(input, candidates)

    // Sort by score (descending)
    scoredCandidates.sort((a, b) => b.score - a.score)

    const bestCandidate = scoredCandidates[0]
    const confidence = roundTo(bestCandidate.score, 3)

    let result: ItunesMatchResult

    if (confidence >= this.config.confidenceThreshold) {
      // High confidence - auto-match
      result = {
        matched: true,
        confidence,
        result: bestCandidate.album,
        reason: `High confidence match (${(confidence * 100).toFixed(1)}%)`
      }
    } else {
      // Low confidence - return candidates for manual selection
      result = {
        matched: false,
        confidence,
        candidates: scoredCandidates.slice(0, this.config.maxCandidates),
        reason: `Ambiguous match - ${scoredCandidates.length} candidates found (best: ${(confidence * 100).toFixed(1)}%)`
      }
    }

    this.cache.set(cacheKey, createCacheEntry(result))
    this.logMatch(input, result)

    return result
  }

  /**
   * Score all candidates against input
   */
  private scoreCandidates(input: MatchInput, candidates: ItunesAlbum[]): ItunesMatchCandidate[] {
    return candidates.map(album => {
      const titleScore = scoreTitleMatch(input.title, album.collectionName)
      const artistScore = scoreArtistMatch(input.artist, album.artistName)

      const albumYear = extractYear(album.releaseDate)
      const yearScore = scoreYearMatch(input.year, albumYear)

      const trackCountScore = scoreTrackCountMatch(input.trackCount, album.trackCount)

      const scores = {
        title: titleScore,
        artist: artistScore,
        year: yearScore,
        trackCount: trackCountScore
      }

      const totalScore = calculateWeightedScore(scores, this.config.weights)

      return {
        album,
        score: totalScore,
        breakdown: {
          titleScore: roundTo(titleScore, 3),
          artistScore: roundTo(artistScore, 3),
          yearScore: roundTo(yearScore, 3),
          trackCountScore: roundTo(trackCountScore, 3)
        }
      }
    })
  }

  /**
   * Get cache key for a match input
   */
  private getCacheKey(input: MatchInput): string {
    return `itunes_match_${input.artist}_${input.title}_${input.year || 'unknown'}`
      .toLowerCase()
      .replace(/\s+/g, '_')
  }

  /**
   * Log matches for future heuristic improvements
   */
  private logMatch(input: MatchInput, result: ItunesMatchResult): void {
    this.correctionLog.push({
      input,
      result,
      timestamp: Date.now()
    })

    // Keep only last 1000 entries
    if (this.correctionLog.length > 1000) {
      this.correctionLog.shift()
    }
  }

  /**
   * Record user correction (for future ML/heuristic improvements)
   */
  recordCorrection(input: MatchInput, correctedAlbum: ItunesAlbum): void {
    const entry = this.correctionLog.find(
      log =>
        log.input.artist === input.artist &&
        log.input.title === input.title &&
        log.input.year === input.year
    )

    if (entry) {
      entry.userCorrected = true
    }

    console.log(`User correction recorded: ${input.artist} - ${input.title}`)
  }

  /**
   * Get correction stats (for analysis)
   */
  getCorrectionStats(): {
    totalMatches: number
    userCorrected: number
    correctionRate: number
  } {
    const totalMatches = this.correctionLog.length
    const userCorrected = this.correctionLog.filter(log => log.userCorrected).length

    return {
      totalMatches,
      userCorrected,
      correctionRate: totalMatches > 0 ? roundTo(userCorrected / totalMatches, 3) : 0
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Update matching configuration
   */
  updateConfig(config: Partial<MatchingConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

export const itunesMatchingService = new ItunesMatchingService()
