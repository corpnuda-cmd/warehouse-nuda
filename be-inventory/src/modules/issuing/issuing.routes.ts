import { Hono } from 'hono'

const issuingRoutes = new Hono()

// Issue Requests
issuingRoutes.get('/issue-requests', (c) => c.json({ message: 'List issue requests — coming soon' }))
issuingRoutes.post('/issue-requests', (c) => c.json({ message: 'Create issue request — coming soon' }))
issuingRoutes.get('/issue-requests/:id', (c) => c.json({ message: 'Get issue request — coming soon' }))
issuingRoutes.patch('/issue-requests/:id/approve', (c) => c.json({ message: 'Approve issue request — coming soon' }))
issuingRoutes.patch('/issue-requests/:id/reject', (c) => c.json({ message: 'Reject issue request — coming soon' }))

// Goods Issues
issuingRoutes.get('/goods-issues', (c) => c.json({ message: 'List goods issues — coming soon' }))
issuingRoutes.post('/goods-issues', (c) => c.json({ message: 'Create goods issue — coming soon' }))
issuingRoutes.get('/goods-issues/:id', (c) => c.json({ message: 'Get goods issue — coming soon' }))

export default issuingRoutes
