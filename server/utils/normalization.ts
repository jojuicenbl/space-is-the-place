/**
 * Centralized normalization utilities (DRY principle)
 * Used by: collectionService, itunesMatchingService, searchService
 */

/**
 * Tokens to remove from album titles for better matching
 */
const NOISE_TOKENS = [
  'deluxe',
  'remaster',
  'remastered',
  'expanded',
  'edition',
  'anniversary',
  'bonus',
  'track',
  'version',
  'ep',
  'lp',
  'single',
  'remix',
  'remixes',
  'original',
  'soundtrack',
  'ost',
  'vol',
  'volume',
  'pt',
  'part'
]

/**
 * Normalize text for matching/searching
 * - Lowercase
 * - Trim whitespace
 * - Remove special characters
 * - Normalize unicode (accents, etc.)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // decompose unicode characters
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\w\s]/g, ' ') // replace special chars with space
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim()
}

/**
 * Normalize album title by removing common noise tokens
 */
export function normalizeAlbumTitle(title: string): string {
  let normalized = normalizeText(title)

  // Remove noise tokens
  const words = normalized.split(' ')
  const filtered = words.filter(word => !NOISE_TOKENS.includes(word))

  return filtered.join(' ')
}

/**
 * Normalize artist name
 * - Handles "The Beatles" → "beatles" for better matching
 * - Removes "The", "A", "An" prefixes
 */
export function normalizeArtistName(artist: string): string {
  const normalized = normalizeText(artist)

  // Remove common prefixes
  return normalized
    .replace(/^the\s+/i, '')
    .replace(/^a\s+/i, '')
    .replace(/^an\s+/i, '')
    .trim()
}

/**
 * Extract year from various formats
 * Examples: "2023", "2023-01-15", "15/01/2023", etc.
 */
export function extractYear(dateString?: string | number): number | undefined {
  if (!dateString) return undefined

  const str = String(dateString)

  // Match 4-digit year
  const yearMatch = str.match(/\b(19|20)\d{2}\b/)

  return yearMatch ? parseInt(yearMatch[0], 10) : undefined
}

/**
 * Parse year from Discogs date format (YYYY-MM-DD or YYYY)
 */
export function parseDiscogsYear(dateString?: string): number | undefined {
  if (!dateString) return undefined

  // Format: "2023-05-15T12:34:56Z" or "2023-05-15" or "2023"
  const year = dateString.split('-')[0]
  const parsed = parseInt(year, 10)

  return isNaN(parsed) ? undefined : parsed
}

/**
 * Clean array of strings and remove duplicates
 */
export function cleanAndDedupeArray(arr: string[]): string[] {
  return Array.from(new Set(arr.map(normalizeText).filter(Boolean)))
}

/**
 * Truncate string with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Remove brackets and their content from text
 * Example: "Album [Bonus Edition]" → "Album"
 */
export function removeBrackets(text: string): string {
  return text
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\{.*?\}/g, '')
    .trim()
}

/**
 * Check if two strings are similar enough (basic comparison)
 */
export function isSimilar(str1: string, str2: string): boolean {
  const norm1 = normalizeText(str1)
  const norm2 = normalizeText(str2)

  return norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)
}
