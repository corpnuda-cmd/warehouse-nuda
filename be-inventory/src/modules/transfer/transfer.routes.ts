import { Hono } from 'hono'

const transferRoutes = new Hono()

transferRoutes.get('/transfers', (c) => c.json({ message: 'List transfers — coming soon' }))
transferRoutes.post('/transfers', (c) => c.json({ message: 'Create transfer — coming soon' }))
transferRoutes.get('/transfers/:id', (c) => c.json({ message: 'Get transfer — coming soon' }))
transferRoutes.patch('/transfers/:id/approve', (c) => c.json({ message: 'Approve transfer — coming soon' }))
transferRoutes.patch('/transfers/:id/process', (c) => c.json({ message: 'Process transfer — coming soon' }))
transferRoutes.patch('/transfers/:id/complete', (c) => c.json({ message: 'Complete transfer — coming soon' }))
transferRoutes.patch('/transfers/:id/cancel', (c) => c.json({ message: 'Cancel transfer — coming soon' }))

export default transferRoutes
