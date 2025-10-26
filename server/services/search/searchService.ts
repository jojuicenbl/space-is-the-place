/**
 * Search service using MiniSearch with DRY normalization utilities
 */

import MiniSearch from 'minisearch'
import type { DiscogsCollectionRelease } from '../../types/discogs'
import { normalizeText } from '../../utils/normalization'

export interface SearchDocument {
  id: number
  folder_id: number
  title: string
  artists: string
  label: string
  catno: string
  genre: string
  style: string
  basic_information: any
}

export class SearchService {
  private indexes: Map<number, MiniSearch<SearchDocument>> = new Map()

  /**
   * Build search index for a collection
   */
  buildIndex(folderId: number, releases: DiscogsCollectionRelease[]): void {
    const mini = new MiniSearch<SearchDocument>({
      fields: ['title', 'artists', 'label', 'catno', 'genre', 'style'],
      storeFields: ['id', 'basic_information', 'folder_id'],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: {
          title: 2, // Title matches are more important
          artists: 1.5
        }
      },
      // Use DRY normalization
      processTerm: (term: string) => normalizeText(term)
    })

    const docs: SearchDocument[] = releases.map(release => {
      const bi = release.basic_information
      return {
        id: release.id,
        folder_id: release.folder_id,
        title: bi.title,
        artists: bi.artists?.map(a => a.name).join(' ') || '',
        label: bi.labels?.map(l => l.name).join(' ') || '',
        catno: bi.labels?.map(l => l.catno).join(' ') || '',
        genre: bi.genres?.join(' ') || '',
        style: bi.styles?.join(' ') || '',
        basic_information: bi
      }
    })

    mini.addAll(docs)
    this.indexes.set(folderId, mini)

    console.log(`Search index built for folder ${folderId} with ${docs.length} documents`)
  }

  /**
   * Search within a folder's index
   */
  search(
    folderId: number,
    query: string,
    options: {
      limit?: number
      prefix?: boolean
      fuzzy?: number | boolean
    } = {}
  ): Array<{ id: number; score: number; basic_information: any }> {
    const index = this.indexes.get(folderId)

    if (!index) {
      console.warn(`No search index found for folder ${folderId}`)
      return []
    }

    const normalizedQuery = normalizeText(query)

    if (!normalizedQuery) {
      return []
    }

    const results = index.search(normalizedQuery, {
      prefix: options.prefix ?? true,
      fuzzy: options.fuzzy ?? 0.2,
      combineWith: 'AND',
      boost: {
        title: 2,
        artists: 1.5
      }
    })

    const limit = options.limit || 100

    return results.slice(0, limit).map(result => ({
      id: result.id,
      score: result.score,
      basic_information: result.basic_information
    }))
  }

  /**
   * Check if index exists for folder
   */
  hasIndex(folderId: number): boolean {
    return this.indexes.has(folderId)
  }

  /**
   * Clear index for a folder
   */
  clearIndex(folderId: number): void {
    this.indexes.delete(folderId)
  }

  /**
   * Clear all indexes
   */
  clearAllIndexes(): void {
    this.indexes.clear()
  }

  /**
   * Get index stats
   */
  getIndexStats(folderId: number): { exists: boolean; documentCount?: number } {
    const index = this.indexes.get(folderId)

    if (!index) {
      return { exists: false }
    }

    return {
      exists: true,
      documentCount: index.documentCount
    }
  }
}

export const searchService = new SearchService()
