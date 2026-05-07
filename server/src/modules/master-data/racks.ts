import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { createRackSchema, updateRackSchema } from './schema'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')
function getDb() { return Database(DB_PATH) }
function getAuthPayload(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return verifyToken(authHeader.slice(7))
}

const rackRoutes = new Hono()

// GET /api/v1/racks
rackRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const warehouseId = c.req.query('warehouseId')
    const db = getDb()
    let racks
    if (warehouseId) {
      racks = db.prepare('SELECT r.*, w.name as warehouse_name FROM racks r LEFT JOIN warehouses w ON r.warehouse_id = w.id WHERE r.warehouse_id = ? ORDER BY r.code ASC').all(parseInt(warehouseId))
    } else {
      racks = db.prepare('SELECT r.*, w.name as warehouse_name FROM racks r LEFT JOIN warehouses w ON r.warehouse_id = w.id ORDER BY r.code ASC').all()
    }
    db.close()
    return c.json({ success: true, data: racks })
  } catch (error) {
    console.error('Get racks error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/racks/:id
rackRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const rack = db.prepare('SELECT r.*, w.name as warehouse_name FROM racks r LEFT JOIN warehouses w ON r.warehouse_id = w.id WHERE r.id = ?').get(id)
    db.close()

    if (!rack) return c.json({ success: false, message: 'Rack not found' }, 404)
    return c.json({ success: true, data: rack })
  } catch (error) {
    console.error('Get rack error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/racks
rackRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const validation = createRackSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const { warehouseId, code, name } = validation.data
    const db = getDb()

    const whExists = db.prepare('SELECT id FROM warehouses WHERE id = ?').get(warehouseId)
    if (!whExists) { db.close(); return c.json({ success: false, message: 'Warehouse not found' }, 404) }

    const existing = db.prepare('SELECT id FROM racks WHERE warehouse_id = ? AND code = ?').get(warehouseId, code)
    if (existing) { db.close(); return c.json({ success: false, message: 'Rack code already exists in this warehouse' }, 400) }

    const result = db.prepare('INSERT INTO racks (warehouse_id, code, name) VALUES (?, ?, ?)').run(warehouseId, code, name)
    const rack = db.prepare('SELECT r.*, w.name as warehouse_name FROM racks r LEFT JOIN warehouses w ON r.warehouse_id = w.id WHERE r.id = ?').get(result.lastInsertRowid)
    db.close()
    return c.json({ success: true, data: rack, message: 'Rack created successfully' }, 201)
  } catch (error) {
    console.error('Create rack error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/racks/:id
rackRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const validation = updateRackSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM racks WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Rack not found' }, 404) }

    const { code, name } = validation.data
    if (code) {
      const duplicate = db.prepare('SELECT id FROM racks WHERE warehouse_id = ? AND code = ? AND id != ?').get((existing as any).warehouse_id, code, id)
      if (duplicate) { db.close(); return c.json({ success: false, message: 'Rack code already exists in this warehouse' }, 400) }
    }

    db.prepare('UPDATE racks SET code = COALESCE(?, code), name = COALESCE(?, name) WHERE id = ?').run(code || null, name || null, id)
    const rack = db.prepare('SELECT r.*, w.name as warehouse_name FROM racks r LEFT JOIN warehouses w ON r.warehouse_id = w.id WHERE r.id = ?').get(id)
    db.close()
    return c.json({ success: true, data: rack, message: 'Rack updated successfully' })
  } catch (error) {
    console.error('Update rack error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/racks/:id
rackRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()

    const existing = db.prepare('SELECT * FROM racks WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Rack not found' }, 404) }

    const inUse = db.prepare('SELECT id FROM bins WHERE rack_id = ? LIMIT 1').get(id)
    if (inUse) { db.close(); return c.json({ success: false, message: 'Cannot delete: Rack has bins' }, 400) }

    db.prepare('DELETE FROM racks WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'Rack deleted successfully' })
  } catch (error) {
    console.error('Delete rack error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default rackRoutes