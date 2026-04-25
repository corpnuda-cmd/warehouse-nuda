import { Hono } from 'hono'

// Users routes — will be implemented in Phase 1.3
const usersRoutes = new Hono()

usersRoutes.get('/', (c) => c.json({ message: 'Users list — coming soon' }))
usersRoutes.post('/', (c) => c.json({ message: 'Create user — coming soon' }))
usersRoutes.get('/:id', (c) => c.json({ message: 'Get user — coming soon' }))
usersRoutes.put('/:id', (c) => c.json({ message: 'Update user — coming soon' }))
usersRoutes.delete('/:id', (c) => c.json({ message: 'Delete user — coming soon' }))

export default usersRoutes
