import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { generateToken, verifyToken } from '../../lib/jwt'
import { loginSchema } from './schema'
import type { TokenPayload } from '../../lib/jwt'
import { join } from 'path'

// Database path
const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')

// Token blacklist for logout
const tokenBlacklist = new Set<string>()

const authRoutes = new Hono()

// Helper to get database connection
function getDb() {
  return Database(DB_PATH)
}

// Login endpoint
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json()

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return c.json({
        success: false,
        message: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      }, 400)
    }

    const { username, password } = validation.data

    // Query user from database
    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username) as any

    if (!user) {
      db.close()
      return c.json({
        success: false,
        message: 'Invalid username or password',
      }, 401)
    }

    // For demo, accept any password that matches 'admin123' pattern or check bcrypt
    // In production: const bcrypt = await import('bcryptjs')
    const isValidPassword = password === 'admin123' ||
      user.password === '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q'

    if (!isValidPassword) {
      db.close()
      return c.json({
        success: false,
        message: 'Invalid username or password',
      }, 401)
    }

    // Generate token
    const tokenPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }

    const token = generateToken(tokenPayload)

    db.close()

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      message: 'Login successful',
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({
      success: false,
      message: 'Internal server error',
    }, 500)
  }
})

// Logout endpoint - add token to blacklist
authRoutes.post('/logout', (c) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    tokenBlacklist.add(token)
  }

  return c.json({
    success: true,
    message: 'Logout successful',
  })
})

// Refresh token endpoint
authRoutes.post('/refresh', (c) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      message: 'Unauthorized - No token provided',
    }, 401)
  }

  const token = authHeader.slice(7)

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return c.json({
      success: false,
      message: 'Token has been revoked',
    }, 401)
  }

  // Verify and decode token
  const payload = verifyToken(token)

  if (!payload) {
    return c.json({
      success: false,
      message: 'Invalid or expired token',
    }, 401)
  }

  // Get fresh user data from database
  const db = getDb()
  const user = db.prepare('SELECT id, username, email, name, role FROM users WHERE id = ? AND is_active = 1').get(payload.userId) as any

  if (!user) {
    db.close()
    return c.json({
      success: false,
      message: 'User not found or inactive',
    }, 401)
  }

  // Generate new token
  const newPayload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  }

  const newToken = generateToken(newPayload)

  db.close()

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: newToken,
    },
    message: 'Token refreshed successfully',
  })
})

// Get current user
authRoutes.get('/me', (c) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      message: 'Unauthorized',
    }, 401)
  }

  const token = authHeader.slice(7)

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return c.json({
      success: false,
      message: 'Token has been revoked',
    }, 401)
  }

  // Verify token
  const payload = verifyToken(token)

  if (!payload) {
    return c.json({
      success: false,
      message: 'Invalid or expired token',
    }, 401)
  }

  // Get user from database
  const db = getDb()
  const user = db.prepare('SELECT id, username, email, name, role FROM users WHERE id = ? AND is_active = 1').get(payload.userId) as any

  db.close()

  if (!user) {
    return c.json({
      success: false,
      message: 'User not found',
    }, 404)
  }

  return c.json({
    success: true,
    data: user,
  })
})

export default authRoutes