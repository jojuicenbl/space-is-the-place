/**
 * Monitoring Service
 * Tracks application metrics and health
 *
 * Usage:
 *   - View metrics in console (logged every 5 minutes)
 *   - Access via GET /api/health endpoint
 */

interface Metrics {
  // OAuth metrics
  oauthRequestsTotal: number
  oauthSuccessTotal: number
  oauthFailuresTotal: number
  oauthActiveStates: number
  oauthPendingResults: number

  // Session metrics
  activeSessions: number

  // API metrics
  apiRequestsLast5Min: number
  apiErrorsLast5Min: number

  // System metrics
  memoryUsageMB: number
  uptimeSeconds: number
  nodeVersion: string
  environment: string

  // Timestamps
  lastUpdated: Date
  serverStartedAt: Date
}

class MonitoringService {
  private metrics: Metrics
  private apiRequestCounter = 0
  private apiErrorCounter = 0
  private readonly startTime: Date

  constructor() {
    this.startTime = new Date()
    this.metrics = this.getInitialMetrics()

    // Reset API counters every 5 minutes
    setInterval(() => {
      this.apiRequestCounter = 0
      this.apiErrorCounter = 0
    }, 5 * 60 * 1000)

    // Log metrics every 5 minutes
    setInterval(() => {
      this.logMetrics()
    }, 5 * 60 * 1000)

    // Log initial metrics after 30 seconds
    setTimeout(() => {
      this.logMetrics()
    }, 30000)
  }

  private getInitialMetrics(): Metrics {
    return {
      oauthRequestsTotal: 0,
      oauthSuccessTotal: 0,
      oauthFailuresTotal: 0,
      oauthActiveStates: 0,
      oauthPendingResults: 0,
      activeSessions: 0,
      apiRequestsLast5Min: 0,
      apiErrorsLast5Min: 0,
      memoryUsageMB: 0,
      uptimeSeconds: 0,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      lastUpdated: new Date(),
      serverStartedAt: this.startTime
    }
  }

  private formatBytes(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(2)
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  /**
   * Update current metrics snapshot
   */
  updateMetrics(updates: Partial<Metrics>): void {
    this.metrics = {
      ...this.metrics,
      ...updates,
      lastUpdated: new Date()
    }
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): Metrics {
    const memUsage = process.memoryUsage()
    const uptimeSeconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000)

    return {
      ...this.metrics,
      memoryUsageMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      uptimeSeconds,
      apiRequestsLast5Min: this.apiRequestCounter,
      apiErrorsLast5Min: this.apiErrorCounter,
      lastUpdated: new Date()
    }
  }

  /**
   * Log formatted metrics to console
   */
  logMetrics(): void {
    const metrics = this.getMetrics()
    const memUsage = process.memoryUsage()

    console.log('\n' + '='.repeat(60))
    console.log('📊 APPLICATION METRICS')
    console.log('='.repeat(60))
    console.log('🔐 OAuth Statistics:')
    console.log(`   Total requests:     ${metrics.oauthRequestsTotal}`)
    console.log(`   Successful:         ${metrics.oauthSuccessTotal}`)
    console.log(`   Failed:             ${metrics.oauthFailuresTotal}`)
    console.log(`   Active states:      ${metrics.oauthActiveStates}`)
    console.log(`   Pending results:    ${metrics.oauthPendingResults}`)
    console.log()
    console.log('🔗 Sessions:')
    console.log(`   Active sessions:    ${metrics.activeSessions}`)
    console.log()
    console.log('📡 API (last 5 min):')
    console.log(`   Requests:           ${metrics.apiRequestsLast5Min}`)
    console.log(`   Errors:             ${metrics.apiErrorsLast5Min}`)
    console.log()
    console.log('💾 System:')
    console.log(`   Memory (heap):      ${this.formatBytes(memUsage.heapUsed)} MB / ${this.formatBytes(memUsage.heapTotal)} MB`)
    console.log(`   Memory (RSS):       ${this.formatBytes(memUsage.rss)} MB`)
    console.log(`   Uptime:             ${this.formatUptime(metrics.uptimeSeconds)}`)
    console.log(`   Node version:       ${metrics.nodeVersion}`)
    console.log(`   Environment:        ${metrics.environment}`)
    console.log('='.repeat(60) + '\n')
  }

  /**
   * Track OAuth request
   */
  trackOAuthRequest(): void {
    this.metrics.oauthRequestsTotal++
  }

  /**
   * Track OAuth success
   */
  trackOAuthSuccess(): void {
    this.metrics.oauthSuccessTotal++
  }

  /**
   * Track OAuth failure
   */
  trackOAuthFailure(): void {
    this.metrics.oauthFailuresTotal++
  }

  /**
   * Track API request
   */
  trackApiRequest(): void {
    this.apiRequestCounter++
  }

  /**
   * Track API error
   */
  trackApiError(): void {
    this.apiErrorCounter++
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical'
    checks: Record<string, boolean>
    metrics: Metrics
  } {
    const metrics = this.getMetrics()
    const memUsage = process.memoryUsage()
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100

    const checks = {
      memoryOk: memUsagePercent < 90,
      oauthStatesReasonable: metrics.oauthActiveStates < 1000,
      oauthResultsReasonable: metrics.oauthPendingResults < 100,
      errorsLow: metrics.apiErrorsLast5Min < 50
    }

    const allHealthy = Object.values(checks).every(Boolean)
    const someUnhealthy = Object.values(checks).some(check => !check)

    return {
      status: allHealthy ? 'healthy' : someUnhealthy ? 'warning' : 'critical',
      checks,
      metrics
    }
  }
}

// Singleton instance
export const monitoringService = new MonitoringService()
