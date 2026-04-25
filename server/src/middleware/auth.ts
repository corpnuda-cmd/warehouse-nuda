import type { Context } from 'hono'
import { generateToken, verifyToken, type TokenPayload } from '../../lib/jwt'

// In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Set<string>()

export function setTokenToBlacklist(token: string): void {
  tokenBlacklist.add(token)
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token)
}

export function getAuthUser(c: Context): TokenPayload | null {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)

  if (isTokenBlacklisted(token)) {
    return null
  }

  return verifyToken(token)
}

export function requireAuth(c: Context): TokenPayload {
  const user = getAuthUser(c)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}