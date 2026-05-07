import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { createWarehouseSchema, updateWarehouseSchema } from './schema'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')
function getDb() { return Database(DB_PATH) }
function getAuthPayload(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return verifyToken(authHeader.slice(7))
}

const warehouseRoutes = new Hono()

// GET /api/v1/warehouses
warehouseRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const db = getDb()
    const warehouses = db.prepare('SELECT * FROM warehouses ORDER BY code ASC').all()
    db.close()
    return c.json({ success: true, data: warehouses })
  } catch (error) {
    console.error('Get warehouses error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/warehouses/:id
warehouseRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const wh = db.prepare('SELECT * FROM warehouses WHERE id = ?').get(id)
    db.close()

    if (!wh) return c.json({ success: false, message: 'Warehouse not found' }, 404)
    return c.json({ success: true, data: wh })
  } catch (error) {
    console.error('Get warehouse error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/warehouses
warehouseRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const validation = createWarehouseSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const { code, name, address, type } = validation.data
    const db = getDb()

    const existing = db.prepare('SELECT id FROM warehouses WHERE code = ?').get(code)
    if (existing) { db.close(); return c.json({ success: false, message: 'Code already exists' }, 400) }

    const result = db.prepare('INSERT INTO warehouses (code, name, address, type) VALUES (?, ?, ?, ?)')
      .run(code, name, address || null, type || 'distribution')
    const wh = db.prepare('SELECT * FROM warehouses WHERE id = ?').get(result.lastInsertRowid)
    db.close()
    return c.json({ success: true, data: wh, message: 'Warehouse created successfully' }, 201)
  } catch (error) {
    console.error('Create warehouse error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/warehouses/:id
warehouseRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const validation = updateWarehouseSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM warehouses WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Warehouse not found' }, 404) }

    const { name, address, type, isActive } = validation.data
    db.prepare('UPDATE warehouses SET name = COALESCE(?, name), address = COALESCE(?, address), type = COALESCE(?, type), is_active = COALESCE(?, is_active) WHERE id = ?')
      .run(name || null, address || null, type || null, isActive !== undefined ? (isActive ? 1 : 0) : null, id)
    const wh = db.prepare('SELECT * FROM warehouses WHERE id = ?').get(id)
    db.close()
    return c.json({ success: true, data: wh, message: 'Warehouse updated successfully' })
  } catch (error) {
    console.error('Update warehouse error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/warehouses/:id
warehouseRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()

    const existing = db.prepare('SELECT * FROM warehouses WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Warehouse not found' }, 404) }

    // Check if in use by stocks or transfers
    const inUse = db.prepare('SELECT id FROM stocks WHERE warehouse_id = ? UNION SELECT id FROM transfers WHERE from_warehouse_id = ? OR to_warehouse_id = ? LIMIT 1').get(id, id, id)
    if (inUse) { db.close(); return c.json({ success: false, message: 'Cannot delete: Warehouse is in use' }, 400) }

    db.prepare('DELETE FROM warehouses WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'Warehouse deleted successfully' })
  } catch (error) {
    console.error('Delete warehouse error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default warehouseRoutes