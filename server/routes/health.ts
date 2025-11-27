/**
 * Health & Monitoring Routes
 * Provides application health status and metrics
 */

import { Router, Request, Response } from 'express'
import { monitoringService } from '../services/monitoringService'

const router = Router()

/**
 * GET /api/health
 * Returns application health status and metrics
 *
 * Response:
 * {
 *   status: 'healthy' | 'warning' | 'critical',
 *   checks: { ... },
 *   metrics: { ... }
 * }
 */
router.get('/', (_req: Request, res: Response) => {
  const health = monitoringService.getHealthStatus()

  // Set appropriate HTTP status based on health
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503

  res.status(statusCode).json(health)
})

/**
 * GET /api/health/metrics
 * Returns detailed metrics only
 */
router.get('/metrics', (_req: Request, res: Response) => {
  const metrics = monitoringService.getMetrics()
  res.json(metrics)
})

export default router
