import { Hono } from 'hono'

const inventoryRoutes = new Hono()

inventoryRoutes.get('/stocks', (c) => c.json({ message: 'Stocks list — coming soon' }))
inventoryRoutes.get('/stocks/movements', (c) => c.json({ message: 'Stock movements — coming soon' }))
inventoryRoutes.get('/stocks/low-stock-alert', (c) => c.json({ message: 'Low stock alert — coming soon' }))

export default inventoryRoutes
