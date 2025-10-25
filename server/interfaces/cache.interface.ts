/**
 * Generic cache interface for future abstraction (Map → Redis, etc.)
 */
export interface ICacheService<T> {
  get(key: string): T | undefined
  set(key: string, value: T): void
  has(key: string): boolean
  delete(key: string): boolean
  clear(): void
  cleanup(): void
}

export interface CachedData<T> {
  data: T
  lastUpdated: number
}
