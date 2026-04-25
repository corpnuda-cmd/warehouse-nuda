import { Hono } from 'hono'
import { generateToken } from '../../lib/jwt'
import { loginSchema } from './schema'
import type { TokenPayload } from '../../lib/jwt'

// Mock user for demo - in production, fetch from database
const MOCK_USER = {
  id: 1,
  username: 'admin',
  // Password: 'admin123' - hashed with bcrypt
  password: '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q',
  email: 'admin@warehouse.com',
  name: 'Administrator',
  role: 'admin',
}

const authRoutes = new Hono()

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

    // Demo mode - accept admin/admin123
    if (username === 'admin' && password === 'admin123') {
      const tokenPayload: TokenPayload = {
        userId: MOCK_USER.id,
        username: MOCK_USER.username,
        email: MOCK_USER.email,
        role: MOCK_USER.role,
      }

      const token = generateToken(tokenPayload)

      return c.json({
        success: true,
        data: {
          user: {
            id: MOCK_USER.id,
            username: MOCK_USER.username,
            email: MOCK_USER.email,
            name: MOCK_USER.name,
            role: MOCK_USER.role,
          },
          token,
        },
        message: 'Login successful',
      })
    }

    // Demo mode - accept any username/password
    if (username && password) {
      const tokenPayload: TokenPayload = {
        userId: 1,
        username: username,
        email: `${username}@example.com`,
        role: 'admin',
      }

      const token = generateToken(tokenPayload)

      return c.json({
        success: true,
        data: {
          user: {
            id: 1,
            username: username,
            email: `${username}@example.com`,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            role: 'admin',
          },
          token,
        },
        message: 'Login successful (demo mode)',
      })
    }

    return c.json({
      success: false,
      message: 'Invalid username or password',
    }, 401)

  } catch (error) {
    console.error('Login error:', error)
    return c.json({
      success: false,
      message: 'Internal server error',
    }, 500)
  }
})

// Logout endpoint
authRoutes.post('/logout', (c) => {
  // In production, add token to blacklist
  return c.json({
    success: true,
    message: 'Logout successful',
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

  // Simple token decode (in production, verify with JWT)
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      return c.json({
        success: true,
        data: {
          id: payload.userId,
          username: payload.username,
          email: payload.email,
          role: payload.role,
        },
      })
    }
  } catch {
    // Ignore parse errors
  }

  // For demo mode, return mock user if token exists
  if (token.startsWith('demo-') || token.length > 10) {
    return c.json({
      success: true,
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@warehouse.com',
        name: 'Administrator',
        role: 'admin',
      },
    })
  }

  return c.json({
    success: false,
    message: 'Invalid token',
  }, 401)
})

export default authRoutes