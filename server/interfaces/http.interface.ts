/**
 * HTTP client retry configuration
 */
export interface RetryConfig {
  maxRetries: number
  delayMs: number
  backoffFactor: number
}

/**
 * Generic HTTP client interface
 */
export interface IHttpClient {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T>
  post<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T>
}
