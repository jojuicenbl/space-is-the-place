/**
 * iTunes Search API response types
 */
export interface ItunesSearchResult {
  resultCount: number
  results: ItunesAlbum[]
}

export interface ItunesAlbum {
  wrapperType: string
  collectionType: string
  artistId: number
  collectionId: number
  artistName: string
  collectionName: string
  collectionCensoredName: string
  artistViewUrl: string
  collectionViewUrl: string
  artworkUrl60: string
  artworkUrl100: string
  collectionPrice: number
  collectionExplicitness: string
  trackCount: number
  copyright: string
  country: string
  currency: string
  releaseDate: string
  primaryGenreName: string
}

/**
 * iTunes matching result with confidence score
 */
export interface ItunesMatchResult {
  matched: boolean
  confidence: number // 0-1 score
  result?: ItunesAlbum
  candidates?: ItunesMatchCandidate[]
  reason?: string
}

export interface ItunesMatchCandidate {
  album: ItunesAlbum
  score: number
  breakdown: {
    titleScore: number
    artistScore: number
    yearScore: number
    trackCountScore: number
  }
}

/**
 * Input for matching algorithm
 */
export interface MatchInput {
  title: string
  artist: string
  year?: number
  trackCount?: number
}

/**
 * Matching service configuration
 */
export interface MatchingConfig {
  confidenceThreshold: number // minimum score to auto-match (0-1)
  maxCandidates: number // max candidates to return when ambiguous
  weights: {
    title: number
    artist: number
    year: number
    trackCount: number
  }
}
