import { Hono } from 'hono'

// Auth routes — will be implemented in Phase 1.3
const authRoutes = new Hono()

authRoutes.post('/login', (c) => c.json({ message: 'Login endpoint — coming soon' }))
authRoutes.post('/logout', (c) => c.json({ message: 'Logout endpoint — coming soon' }))
authRoutes.get('/me', (c) => c.json({ message: 'Me endpoint — coming soon' }))

export default authRoutes
