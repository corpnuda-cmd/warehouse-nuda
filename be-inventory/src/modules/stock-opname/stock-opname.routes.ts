import { Hono } from 'hono'

const stockOpnameRoutes = new Hono()

stockOpnameRoutes.get('/stock-opnames', (c) => c.json({ message: 'List stock opnames — coming soon' }))
stockOpnameRoutes.post('/stock-opnames', (c) => c.json({ message: 'Create stock opname — coming soon' }))
stockOpnameRoutes.get('/stock-opnames/:id', (c) => c.json({ message: 'Get stock opname — coming soon' }))
stockOpnameRoutes.patch('/stock-opnames/:id/start', (c) => c.json({ message: 'Start stock opname — coming soon' }))
stockOpnameRoutes.post('/stock-opnames/:id/items', (c) => c.json({ message: 'Input count results — coming soon' }))
stockOpnameRoutes.patch('/stock-opnames/:id/reconcile', (c) => c.json({ message: 'Reconcile stock opname — coming soon' }))
stockOpnameRoutes.patch('/stock-opnames/:id/complete', (c) => c.json({ message: 'Complete stock opname — coming soon' }))

export default stockOpnameRoutes
