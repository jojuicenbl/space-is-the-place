/**
 * Unit tests for scoring utilities
 */

import {
  levenshteinDistance,
  similarityRatio,
  fuzzyMatchScore,
  scoreTitleMatch,
  scoreArtistMatch,
  scoreYearMatch,
  scoreTrackCountMatch,
  calculateWeightedScore,
  clamp,
  roundTo
} from '../../utils/scoring'

describe('Scoring Utilities', () => {
  describe('levenshteinDistance', () => {
    test('should calculate distance for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0)
    })

    test('should calculate distance for different strings', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
    })

    test('should calculate distance for completely different strings', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3)
    })
  })

  describe('similarityRatio', () => {
    test('should return 1 for identical strings', () => {
      expect(similarityRatio('hello', 'hello')).toBe(1)
    })

    test('should return value between 0 and 1 for similar strings', () => {
      const ratio = similarityRatio('hello', 'hallo')
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThan(1)
    })

    test('should return lower value for very different strings', () => {
      const ratio = similarityRatio('abc', 'xyz')
      expect(ratio).toBe(0)
    })
  })

  describe('fuzzyMatchScore', () => {
    test('should return 1 for exact match after normalization', () => {
      expect(fuzzyMatchScore('Hello World', 'hello world')).toBe(1)
    })

    test('should return high score for substring match', () => {
      const score = fuzzyMatchScore('Hello World', 'Hello')
      expect(score).toBeGreaterThanOrEqual(0.85)
    })

    test('should return similarity ratio for partial matches', () => {
      const score = fuzzyMatchScore('Hello', 'Hallo')
      expect(score).toBeGreaterThan(0.5)
    })
  })

  describe('scoreTitleMatch', () => {
    test('should match identical titles', () => {
      expect(scoreTitleMatch('Dark Side of the Moon', 'Dark Side of the Moon')).toBe(1)
    })

    test('should match titles with noise tokens removed', () => {
      const score = scoreTitleMatch(
        'Dark Side of the Moon',
        'Dark Side of the Moon [Deluxe Edition]'
      )
      expect(score).toBeGreaterThan(0.9)
    })
  })

  describe('scoreArtistMatch', () => {
    test('should match identical artists', () => {
      expect(scoreArtistMatch('Pink Floyd', 'Pink Floyd')).toBe(1)
    })

    test('should match artists with "The" prefix', () => {
      expect(scoreArtistMatch('The Beatles', 'Beatles')).toBe(1)
    })
  })

  describe('scoreYearMatch', () => {
    test('should return 1 for exact year match', () => {
      expect(scoreYearMatch(2023, 2023)).toBe(1)
    })

    test('should return 0.7 for 1 year difference', () => {
      expect(scoreYearMatch(2023, 2024)).toBe(0.7)
    })

    test('should return 0.4 for 2 year difference', () => {
      expect(scoreYearMatch(2023, 2025)).toBe(0.4)
    })

    test('should return 0 for large difference', () => {
      expect(scoreYearMatch(2023, 2030)).toBe(0)
    })

    test('should return neutral for missing years', () => {
      expect(scoreYearMatch(undefined, 2023)).toBe(0.5)
    })
  })

  describe('scoreTrackCountMatch', () => {
    test('should return 1 for exact match', () => {
      expect(scoreTrackCountMatch(12, 12)).toBe(1)
    })

    test('should return 0.8 for 1 track difference', () => {
      expect(scoreTrackCountMatch(12, 13)).toBe(0.8)
    })

    test('should return 0.6 for 2 track difference', () => {
      expect(scoreTrackCountMatch(12, 14)).toBe(0.6)
    })

    test('should return neutral for missing counts', () => {
      expect(scoreTrackCountMatch(undefined, 12)).toBe(0.5)
    })
  })

  describe('calculateWeightedScore', () => {
    test('should calculate weighted average correctly', () => {
      const scores = { a: 1, b: 0.5 }
      const weights = { a: 2, b: 1 }
      const result = calculateWeightedScore(scores, weights)
      expect(result).toBeCloseTo(0.833, 2)
    })

    test('should handle equal weights', () => {
      const scores = { a: 1, b: 0 }
      const weights = { a: 1, b: 1 }
      const result = calculateWeightedScore(scores, weights)
      expect(result).toBe(0.5)
    })
  })

  describe('clamp', () => {
    test('should clamp value to min', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    test('should clamp value to max', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    test('should not clamp value in range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })
  })

  describe('roundTo', () => {
    test('should round to 2 decimals by default', () => {
      expect(roundTo(3.14159)).toBe(3.14)
    })

    test('should round to specified decimals', () => {
      expect(roundTo(3.14159, 3)).toBe(3.142)
    })
  })
})
