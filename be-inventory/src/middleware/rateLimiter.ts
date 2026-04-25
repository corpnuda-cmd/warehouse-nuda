import type { Context, Next } from 'hono'
import { errorResponse } from '../utils/response.js'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (untuk production gunakan Redis)
const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  windowMs?: number   // Window dalam ms, default 60000 (1 menit)
  max?: number        // Max request per window, default 100
  message?: string
}

export function rateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000
  const max = options.max ?? 100
  const message = options.message ?? 'Too many requests, please try again later'

  return async (c: Context, next: Next): Promise<Response | void> => {
    // Gunakan IP sebagai key
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0] ??
      c.req.header('x-real-ip') ??
      'unknown'

    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs })
      await next()
      return
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      c.header('Retry-After', String(retryAfter))
      return c.json(errorResponse(message), 429)
    }

    entry.count++
    await next()
  }
}

// Preset: strict untuk auth endpoints
export const strictLimiter = rateLimiter({ windowMs: 15 * 60_000, max: 10 })

// Preset: normal untuk API umum
export const apiLimiter = rateLimiter({ windowMs: 60_000, max: 100 })
