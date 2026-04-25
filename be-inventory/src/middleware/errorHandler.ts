import type { Context, Next } from 'hono'
import { errorResponse } from '../utils/response.js'

export async function errorHandler(c: Context, next: Next): Promise<Response> {
  try {
    await next()
    return c.res
  } catch (err) {
    const error = err as Error

    console.error(`[ErrorHandler] ${error.message}`, {
      stack: error.stack,
      path: c.req.path,
      method: c.req.method,
    })

    // Zod validation error
    if (error.name === 'ZodError') {
      return c.json(errorResponse('Validation error: ' + error.message), 422)
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      return c.json(errorResponse('Invalid token'), 401)
    }
    if (error.name === 'TokenExpiredError') {
      return c.json(errorResponse('Token expired'), 401)
    }

    // Generic
    return c.json(
      errorResponse(
        process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      ),
      500
    )
  }
}
