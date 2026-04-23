import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use('*', logger())

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// API routes placeholder
app.get('/api/v1', (c) => {
  return c.json({
    message: 'Inventory WMS API v1',
    docs: '/docs',
    endpoints: ['/auth', '/items', '/purchase-requests']
  })
})

// Auth routes placeholder
app.get('/api/v1/auth', (c) => c.json({ message: 'Auth endpoints' }))

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

const port = Number(process.env.PORT || 8787)

serve({
  fetch: app.fetch,
  port,
})

console.log(`🚀 Backend server running on http://localhost:${port}`)

export default app
