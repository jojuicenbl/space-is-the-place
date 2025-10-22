/**
 * Unit tests for normalization utilities
 */

import {
  normalizeText,
  normalizeAlbumTitle,
  normalizeArtistName,
  extractYear,
  parseDiscogsYear,
  cleanAndDedupeArray,
  removeBrackets,
  isSimilar
} from '../../utils/normalization'

describe('Normalization Utilities', () => {
  describe('normalizeText', () => {
    test('should convert to lowercase and trim', () => {
      expect(normalizeText('  Hello WORLD  ')).toBe('hello world')
    })

    test('should remove special characters', () => {
      expect(normalizeText('Hello-World!')).toBe('hello world')
    })

    test('should remove accents/diacritics', () => {
      expect(normalizeText('Café Münchën')).toBe('cafe munchen')
    })

    test('should collapse multiple spaces', () => {
      expect(normalizeText('Hello    World')).toBe('hello world')
    })
  })

  describe('normalizeAlbumTitle', () => {
    test('should remove noise tokens', () => {
      expect(normalizeAlbumTitle('Dark Side of the Moon [Deluxe Edition]')).toBe(
        'dark side of the moon'
      )
    })

    test('should remove remastered tokens', () => {
      expect(normalizeAlbumTitle('Abbey Road (Remastered)')).toBe('abbey road')
    })

    test('should handle multiple noise tokens', () => {
      expect(normalizeAlbumTitle('Album Title - Deluxe Remastered Edition')).toBe('album title')
    })
  })

  describe('normalizeArtistName', () => {
    test('should remove "The" prefix', () => {
      expect(normalizeArtistName('The Beatles')).toBe('beatles')
    })

    test('should remove "A" prefix', () => {
      expect(normalizeArtistName('A Tribe Called Quest')).toBe('tribe called quest')
    })

    test('should handle artist without prefix', () => {
      expect(normalizeArtistName('Pink Floyd')).toBe('pink floyd')
    })
  })

  describe('extractYear', () => {
    test('should extract year from date string', () => {
      expect(extractYear('2023-05-15')).toBe(2023)
    })

    test('should extract year from full date', () => {
      expect(extractYear('15/01/2019')).toBe(2019)
    })

    test('should extract year from year-only', () => {
      expect(extractYear('2020')).toBe(2020)
    })

    test('should return undefined for invalid input', () => {
      expect(extractYear('invalid')).toBeUndefined()
      expect(extractYear()).toBeUndefined()
    })
  })

  describe('parseDiscogsYear', () => {
    test('should parse Discogs date format', () => {
      expect(parseDiscogsYear('2023-05-15T12:34:56Z')).toBe(2023)
    })

    test('should parse simple date', () => {
      expect(parseDiscogsYear('2022-03-10')).toBe(2022)
    })

    test('should parse year only', () => {
      expect(parseDiscogsYear('2021')).toBe(2021)
    })

    test('should return undefined for invalid input', () => {
      expect(parseDiscogsYear('invalid')).toBeUndefined()
      expect(parseDiscogsYear()).toBeUndefined()
    })
  })

  describe('cleanAndDedupeArray', () => {
    test('should remove duplicates', () => {
      expect(cleanAndDedupeArray(['Rock', 'Jazz', 'rock', 'JAZZ'])).toEqual(['rock', 'jazz'])
    })

    test('should normalize and dedupe', () => {
      expect(cleanAndDedupeArray(['  Rock  ', 'Rock!', 'rock'])).toEqual(['rock'])
    })
  })

  describe('removeBrackets', () => {
    test('should remove square brackets', () => {
      expect(removeBrackets('Album [Bonus Edition]')).toBe('Album')
    })

    test('should remove parentheses', () => {
      expect(removeBrackets('Album (Remastered)')).toBe('Album')
    })

    test('should remove curly braces', () => {
      expect(removeBrackets('Album {Special}')).toBe('Album')
    })

    test('should handle multiple brackets', () => {
      expect(removeBrackets('Album [Deluxe] (2023) {Vinyl}')).toBe('Album')
    })
  })

  describe('isSimilar', () => {
    test('should match exact strings', () => {
      expect(isSimilar('Hello', 'hello')).toBe(true)
    })

    test('should match substrings', () => {
      expect(isSimilar('Hello World', 'Hello')).toBe(true)
    })

    test('should not match completely different strings', () => {
      expect(isSimilar('Hello', 'Goodbye')).toBe(false)
    })
  })
})
