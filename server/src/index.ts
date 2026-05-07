import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { initDatabase } from './lib/initDb'
import authRoutes from './modules/auth/routes'
import procurementRoutes from './modules/procurement/purchaseRequests'
import purchaseOrderRoutes from './modules/procurement/purchaseOrders'
import receivingRoutes from './modules/receiving/goodsReceipts'
import uomRoutes from './modules/master-data/uoms'
import warehouseRoutes from './modules/master-data/warehouses'
import rackRoutes from './modules/master-data/racks'
import binRoutes from './modules/master-data/bins'
import vendorPriceRoutes from './modules/master-data/vendorPrices'
import importExportRoutes from './modules/master-data/importExport'
import inventoryRoutes from './modules/inventory/stocks'
import reservationRoutes from './modules/inventory/reservations'
import issuingRoutes from './modules/issuing/issuing'
import transferRoutes from './modules/transfer/transfers'
import stockOpnameRoutes from './modules/control/stockOpnames'
import returnsRoutes from './modules/control/returns'
import auditRoutes from './modules/control/auditLogs'

// Initialize database on startup
initDatabase()

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

// Mount procurement routes
app.route('/api/v1/procurement', procurementRoutes)
app.route('/api/v1/purchase-orders', purchaseOrderRoutes)

// Mount receiving routes
app.route('/api/v1/receiving', receivingRoutes)

// Mount master-data routes
app.route('/api/v1/uoms', uomRoutes)
app.route('/api/v1/warehouses', warehouseRoutes)
app.route('/api/v1/racks', rackRoutes)
app.route('/api/v1/bins', binRoutes)
app.route('/api/v1/vendor-prices', vendorPriceRoutes)
app.route('/api/v1/import-export', importExportRoutes)
app.route('/api/v1/inventory', inventoryRoutes)
app.route('/api/v1/inventory/reservations', reservationRoutes)
app.route('/api/v1/issuing', issuingRoutes)
app.route('/api/v1/transfers', transferRoutes)
app.route('/api/v1/control/stock-opnames', stockOpnameRoutes)
app.route('/api/v1/control/returns', returnsRoutes)
app.route('/api/v1/control/audit-logs', auditRoutes)

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