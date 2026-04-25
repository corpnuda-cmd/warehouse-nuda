import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import authRoutes from './modules/auth/routes'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

// Routes
app.get('/', (c) => c.json({ message: 'Warehouse Management API', version: '1.0.0' }))
app.get('/health', (c) => c.json({ status: 'ok' }))

// Mount auth routes
app.route('/api/v1/auth', authRoutes)

// 404 handler
app.notFound((c) => c.json({ success: false, message: 'Not Found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ success: false, message: err.message }, 500)
})

// Start server
const port = parseInt(process.env.PORT || '3000')

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})