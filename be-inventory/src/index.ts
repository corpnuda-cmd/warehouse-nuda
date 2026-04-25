import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from './config/env.js'
import { testConnection } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'

// Route modules
import authRoutes from './modules/auth/auth.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import itemsRoutes from './modules/master-data/items.routes.js'
import procurementRoutes from './modules/procurement/procurement.routes.js'
import receivingRoutes from './modules/receiving/receiving.routes.js'
import inventoryRoutes from './modules/inventory/inventory.routes.js'
import issuingRoutes from './modules/issuing/issuing.routes.js'
import transferRoutes from './modules/transfer/transfer.routes.js'
import stockOpnameRoutes from './modules/stock-opname/stock-opname.routes.js'
import returnRoutes from './modules/return/return.routes.js'
import reportsRoutes from './modules/reports/reports.routes.js'

const app = new Hono()

// Global middleware
app.use('*', cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('*', logger())
app.use('*', errorHandler)
app.use('/api/*', apiLimiter)

// Health check
app.get('/health', (c) => c.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  env: env.NODE_ENV,
}))

// API v1 info
app.get('/api/v1', (c) => {
  return c.json({
    message: 'Inventory WMS API v1',
    version: '1.0.0',
    endpoints: [
      '/api/v1/auth',
      '/api/v1/users',
      '/api/v1/items',
      '/api/v1/purchase-requests',
      '/api/v1/purchase-orders',
      '/api/v1/goods-receipts',
      '/api/v1/stocks',
      '/api/v1/issue-requests',
      '/api/v1/goods-issues',
      '/api/v1/transfers',
      '/api/v1/stock-opnames',
      '/api/v1/returns',
      '/api/v1/reports',
    ],
  })
})

// Mount routes
app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/users', usersRoutes)
app.route('/api/v1/items', itemsRoutes)
app.route('/api/v1', procurementRoutes)
app.route('/api/v1', receivingRoutes)
app.route('/api/v1', inventoryRoutes)
app.route('/api/v1', issuingRoutes)
app.route('/api/v1', transferRoutes)
app.route('/api/v1', stockOpnameRoutes)
app.route('/api/v1', returnRoutes)
app.route('/api/v1', reportsRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, data: null, message: 'Endpoint not found' }, 404)
})

// Start server
const port = env.PORT

testConnection().then(() => {
  serve({
    fetch: app.fetch,
    port,
  })
  console.log(`🚀 Backend server running on http://localhost:${port}`)
})

export default app
