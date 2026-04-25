import { Hono } from 'hono'

const reportsRoutes = new Hono()

reportsRoutes.get('/reports/stock-on-hand', (c) => c.json({ message: 'Stock on hand report — coming soon' }))
reportsRoutes.get('/reports/stock-movements', (c) => c.json({ message: 'Stock movements report — coming soon' }))
reportsRoutes.get('/reports/procurement', (c) => c.json({ message: 'Procurement report — coming soon' }))
reportsRoutes.get('/reports/issuing', (c) => c.json({ message: 'Issuing report — coming soon' }))
reportsRoutes.get('/reports/aging-inventory', (c) => c.json({ message: 'Aging inventory report — coming soon' }))
reportsRoutes.get('/reports/stock-opname', (c) => c.json({ message: 'Stock opname report — coming soon' }))
reportsRoutes.get('/dashboard/summary', (c) => c.json({ message: 'Dashboard summary — coming soon' }))
reportsRoutes.get('/dashboard/stock-chart', (c) => c.json({ message: 'Dashboard stock chart — coming soon' }))
reportsRoutes.get('/dashboard/activity-feed', (c) => c.json({ message: 'Dashboard activity feed — coming soon' }))

export default reportsRoutes
