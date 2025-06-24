interface iTunesSearchResult {
  resultCount: number
  results: iTunesAlbum[]
}

interface iTunesAlbum {
  wrapperType: string
  collectionType: string
  artistId: number
  collectionId: number
  amgArtistId?: number
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

export interface AppleMusicMatch {
  collectionId: number
  artistName: string
  collectionName: string
  artworkUrl100: string
  collectionViewUrl: string
  releaseDate: string
  trackCount: number
}

class AppleMusicService {
  private static readonly ITUNES_SEARCH_BASE_URL = 'https://itunes.apple.com/search'
  private static readonly SEARCH_LIMIT = 5

  /**
   * Recherche un album sur iTunes Search API
   */
  static async searchAlbum(
    artistName: string,
    albumTitle: string,
    year?: number
  ): Promise<AppleMusicMatch | null> {
    try {
      // Nettoyer les termes de recherche
      const cleanArtist = this.cleanSearchTerm(artistName)
      const cleanAlbum = this.cleanSearchTerm(albumTitle)
      
      // Construire la requête de recherche
      const searchTerm = `${cleanArtist} ${cleanAlbum}`
      const params = new URLSearchParams({
        term: searchTerm,
        entity: 'album',
        media: 'music',
        limit: this.SEARCH_LIMIT.toString(),
        country: 'US' // Vous pouvez adapter selon votre région
      })

      const response = await fetch(`${this.ITUNES_SEARCH_BASE_URL}?${params}`)
      
      if (!response.ok) {
        throw new Error(`iTunes Search API error: ${response.status}`)
      }

      const data: iTunesSearchResult = await response.json()
      
      if (data.resultCount === 0) {
        return null
      }

      // Chercher la meilleure correspondance
      const bestMatch = this.findBestMatch(data.results, artistName, albumTitle, year)
      
      if (!bestMatch) {
        return null
      }

      return {
        collectionId: bestMatch.collectionId,
        artistName: bestMatch.artistName,
        collectionName: bestMatch.collectionName,
        artworkUrl100: bestMatch.artworkUrl100,
        collectionViewUrl: bestMatch.collectionViewUrl,
        releaseDate: bestMatch.releaseDate,
        trackCount: bestMatch.trackCount
      }
      
    } catch (error) {
      console.error('Error searching iTunes API:', error)
      return null
    }
  }

  /**
   * Génère l'URL d'embed Apple Music pour un album
   */
  static getAppleMusicEmbedUrl(collectionId: number, country: string = 'us'): string {
    return `https://embed.music.apple.com/${country}/album/${collectionId}`
  }

  /**
   * Nettoie les termes de recherche pour améliorer les résultats
   */
  private static cleanSearchTerm(term: string): string {
    return term
      .replace(/[^\w\s]/g, ' ') // Remplacer la ponctuation par des espaces
      .replace(/\s+/g, ' ') // Remplacer plusieurs espaces par un seul
      .trim()
  }

  /**
   * Trouve la meilleure correspondance parmi les résultats
   */
  private static findBestMatch(
    results: iTunesAlbum[],
    targetArtist: string,
    targetAlbum: string,
    targetYear?: number
  ): iTunesAlbum | null {
    let bestMatch: iTunesAlbum | null = null
    let bestScore = 0

    for (const result of results) {
      // Calculer un score de correspondance
      let score = 0
      
      // Score artiste (plus important)
      const artistSimilarity = this.calculateSimilarity(
        targetArtist.toLowerCase(),
        result.artistName.toLowerCase()
      )
      score += artistSimilarity * 0.6

      // Score album
      const albumSimilarity = this.calculateSimilarity(
        targetAlbum.toLowerCase(),
        result.collectionName.toLowerCase()
      )
      score += albumSimilarity * 0.3

      // Bonus si l'année correspond (optionnel)
      if (targetYear) {
        const releaseYear = new Date(result.releaseDate).getFullYear()
        if (Math.abs(releaseYear - targetYear) <= 1) {
          score += 0.1
        }
      }

      if (score > bestScore && score > 0.7) { // Seuil minimum de correspondance
        bestScore = score
        bestMatch = result
      }
    }

    return bestMatch
  }

  /**
   * Calcule la similarité entre deux chaînes (algorithme simple)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/)
    const words2 = str2.split(/\s+/)
    
    let matchCount = 0
    
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matchCount++
          break
        }
      }
    }
    
    return matchCount / Math.max(words1.length, words2.length)
  }
}

export default AppleMusicService 