import { Hono } from 'hono'

const returnRoutes = new Hono()

returnRoutes.get('/returns', (c) => c.json({ message: 'List returns — coming soon' }))
returnRoutes.post('/returns', (c) => c.json({ message: 'Create return — coming soon' }))
returnRoutes.get('/returns/:id', (c) => c.json({ message: 'Get return — coming soon' }))
returnRoutes.patch('/returns/:id/approve', (c) => c.json({ message: 'Approve return — coming soon' }))
returnRoutes.patch('/returns/:id/reject', (c) => c.json({ message: 'Reject return — coming soon' }))
returnRoutes.post('/returns/:id/qc', (c) => c.json({ message: 'QC return — coming soon' }))

export default returnRoutes
