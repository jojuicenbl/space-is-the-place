/**
 * Scoring and similarity utilities (DRY principle)
 * Used by: itunesMatchingService, searchService
 */

import { normalizeText, normalizeAlbumTitle, normalizeArtistName } from './normalization'

/**
 * Calculate Levenshtein distance between two strings
 * (edit distance - number of operations to transform str1 into str2)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length

  // Create 2D array
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0))

  // Initialize first column and row
  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate similarity ratio (0-1) between two strings
 * 1 = identical, 0 = completely different
 */
export function similarityRatio(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)

  if (maxLength === 0) return 1

  return 1 - distance / maxLength
}

/**
 * Fuzzy match score (normalized + similarity ratio)
 */
export function fuzzyMatchScore(str1: string, str2: string): number {
  const norm1 = normalizeText(str1)
  const norm2 = normalizeText(str2)

  // Exact match after normalization
  if (norm1 === norm2) return 1

  // Substring match (high priority)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const longerLength = Math.max(norm1.length, norm2.length)
    const shorterLength = Math.min(norm1.length, norm2.length)
    return 0.85 + (shorterLength / longerLength) * 0.14 // 0.85-0.99
  }

  // Levenshtein similarity
  return similarityRatio(norm1, norm2)
}

/**
 * Score title match (with album-specific normalization)
 */
export function scoreTitleMatch(title1: string, title2: string): number {
  const norm1 = normalizeAlbumTitle(title1)
  const norm2 = normalizeAlbumTitle(title2)

  return fuzzyMatchScore(norm1, norm2)
}

/**
 * Score artist match (with artist-specific normalization)
 */
export function scoreArtistMatch(artist1: string, artist2: string): number {
  const norm1 = normalizeArtistName(artist1)
  const norm2 = normalizeArtistName(artist2)

  return fuzzyMatchScore(norm1, norm2)
}

/**
 * Score year match
 * Returns:
 * - 1.0 if years are identical
 * - 0.7 if within 1 year (remaster tolerance)
 * - 0.4 if within 2 years
 * - 0.0 otherwise
 */
export function scoreYearMatch(year1?: number, year2?: number): number {
  if (!year1 || !year2) return 0.5 // neutral if missing

  const diff = Math.abs(year1 - year2)

  if (diff === 0) return 1.0
  if (diff === 1) return 0.7
  if (diff === 2) return 0.4

  return 0.0
}

/**
 * Score track count match
 * Returns:
 * - 1.0 if counts match exactly
 * - 0.8 if within 1 track
 * - 0.6 if within 2 tracks
 * - 0.3 if within 5 tracks
 * - 0.0 otherwise
 */
export function scoreTrackCountMatch(count1?: number, count2?: number): number {
  if (!count1 || !count2) return 0.5 // neutral if missing

  const diff = Math.abs(count1 - count2)

  if (diff === 0) return 1.0
  if (diff === 1) return 0.8
  if (diff === 2) return 0.6
  if (diff <= 5) return 0.3

  return 0.0
}

/**
 * Calculate weighted average score
 */
export function calculateWeightedScore(
  scores: Record<string, number>,
  weights: Record<string, number>
): number {
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const [key, score] of Object.entries(scores)) {
    const weight = weights[key] ?? 0
    totalWeightedScore += score * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Round to N decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
