import type { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { errorResponse } from '../utils/response.js'

export interface JwtPayload {
  userId: string
  username: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// Simpan user di Hono context variable
declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload
  }
}

export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(errorResponse('Authorization token required'), 401)
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    c.set('user', payload)
    await next()
  } catch {
    return c.json(errorResponse('Invalid or expired token'), 401)
  }
}

// Role-based guard factory
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const user = c.get('user')
    if (!user) {
      return c.json(errorResponse('Unauthorized'), 401)
    }
    if (!roles.includes(user.role)) {
      return c.json(errorResponse(`Access denied. Required role: ${roles.join(' | ')}`), 403)
    }
    await next()
  }
}
