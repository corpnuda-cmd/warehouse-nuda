import { Hono } from 'hono'

const itemsRoutes = new Hono()

itemsRoutes.get('/', (c) => c.json({ message: 'Items list — coming soon' }))
itemsRoutes.post('/', (c) => c.json({ message: 'Create item — coming soon' }))
itemsRoutes.get('/:id', (c) => c.json({ message: 'Get item — coming soon' }))
itemsRoutes.put('/:id', (c) => c.json({ message: 'Update item — coming soon' }))
itemsRoutes.delete('/:id', (c) => c.json({ message: 'Delete item — coming soon' }))

export default itemsRoutes
