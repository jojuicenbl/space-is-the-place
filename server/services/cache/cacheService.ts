/**
 * Generic cache service with Map implementation
 * Can be easily swapped for Redis or other cache backends
 */

import type { ICacheService, CachedData } from '../../interfaces/cache.interface'

export class InMemoryCacheService<T> implements ICacheService<CachedData<T>> {
  private cache: Map<string, CachedData<T>> = new Map()
  private readonly ttl: number // Time to live in milliseconds

  constructor(ttlMinutes: number = 15) {
    this.ttl = ttlMinutes * 60 * 1000
  }

  get(key: string): CachedData<T> | undefined {
    const cached = this.cache.get(key)

    if (!cached) return undefined

    // Check if expired
    if (this.isExpired(cached)) {
      this.cache.delete(key)
      return undefined
    }

    return cached
  }

  set(key: string, value: CachedData<T>): void {
    this.cache.set(key, value)
  }

  has(key: string): boolean {
    const cached = this.cache.get(key)

    if (!cached) return false

    if (this.isExpired(cached)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  cleanup(): void {
    for (const [key, value] of this.cache.entries()) {
      if (this.isExpired(value)) {
        this.cache.delete(key)
      }
    }
  }

  private isExpired(cached: CachedData<T>): boolean {
    return Date.now() - cached.lastUpdated > this.ttl
  }

  // Utility methods
  getSize(): number {
    return this.cache.size
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }
}

/**
 * Wrapper for easier data caching
 */
export function createCacheEntry<T>(data: T): CachedData<T> {
  return {
    data,
    lastUpdated: Date.now()
  }
}
