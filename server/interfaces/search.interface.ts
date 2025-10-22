/**
 * Search service interfaces
 */
export interface SearchResult<T> {
  id: string | number
  score: number
  item: T
  match?: Record<string, string[]>
}

export interface SearchConfig {
  fuzzyThreshold?: number // 0-1, how fuzzy the search should be
  prefixSearch?: boolean
  fields?: string[]
  boostFields?: Record<string, number>
}
