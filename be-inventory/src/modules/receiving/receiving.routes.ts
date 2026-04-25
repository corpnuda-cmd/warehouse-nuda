import { Hono } from 'hono'

const receivingRoutes = new Hono()

receivingRoutes.get('/goods-receipts', (c) => c.json({ message: 'GR list — coming soon' }))
receivingRoutes.post('/goods-receipts', (c) => c.json({ message: 'Create GR — coming soon' }))
receivingRoutes.get('/goods-receipts/:id', (c) => c.json({ message: 'Get GR — coming soon' }))
receivingRoutes.post('/goods-receipts/:id/qc', (c) => c.json({ message: 'QC goods receipt — coming soon' }))
receivingRoutes.patch('/goods-receipts/:id/complete', (c) => c.json({ message: 'Complete GR — coming soon' }))

export default receivingRoutes
