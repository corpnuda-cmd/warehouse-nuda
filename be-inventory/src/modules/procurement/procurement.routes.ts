import { Hono } from 'hono'

const procurementRoutes = new Hono()

// Purchase Requests
procurementRoutes.get('/purchase-requests', (c) => c.json({ message: 'PR list — coming soon' }))
procurementRoutes.post('/purchase-requests', (c) => c.json({ message: 'Create PR — coming soon' }))
procurementRoutes.get('/purchase-requests/:id', (c) => c.json({ message: 'Get PR — coming soon' }))
procurementRoutes.patch('/purchase-requests/:id/approve', (c) => c.json({ message: 'Approve PR — coming soon' }))
procurementRoutes.patch('/purchase-requests/:id/reject', (c) => c.json({ message: 'Reject PR — coming soon' }))
procurementRoutes.delete('/purchase-requests/:id', (c) => c.json({ message: 'Delete PR — coming soon' }))

// Purchase Orders
procurementRoutes.get('/purchase-orders', (c) => c.json({ message: 'PO list — coming soon' }))
procurementRoutes.post('/purchase-orders', (c) => c.json({ message: 'Create PO — coming soon' }))
procurementRoutes.get('/purchase-orders/:id', (c) => c.json({ message: 'Get PO — coming soon' }))
procurementRoutes.patch('/purchase-orders/:id/confirm', (c) => c.json({ message: 'Confirm PO — coming soon' }))
procurementRoutes.patch('/purchase-orders/:id/cancel', (c) => c.json({ message: 'Cancel PO — coming soon' }))

export default procurementRoutes
