import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { createBinSchema, updateBinSchema } from './schema'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')
function getDb() { return Database(DB_PATH) }
function getAuthPayload(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return verifyToken(authHeader.slice(7))
}

const binRoutes = new Hono()

// GET /api/v1/bins
binRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const rackId = c.req.query('rackId')
    const db = getDb()
    let bins
    if (rackId) {
      bins = db.prepare('SELECT b.*, r.code as rack_code, r.name as rack_name, w.name as warehouse_name FROM bins b LEFT JOIN racks r ON b.rack_id = r.id LEFT JOIN warehouses w ON r.warehouse_id = w.id WHERE b.rack_id = ? ORDER BY b.code ASC').all(parseInt(rackId))
    } else {
      bins = db.prepare('SELECT b.*, r.code as rack_code, r.name as rack_name, w.name as warehouse_name FROM bins b LEFT JOIN racks r ON b.rack_id = r.id LEFT JOIN warehouses w ON r.warehouse_id = w.id ORDER BY b.code ASC').all()
    }
    db.close()
    return c.json({ success: true, data: bins })
  } catch (error) {
    console.error('Get bins error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/bins/:id
binRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const bin = db.prepare('SELECT b.*, r.code as rack_code, r.name as rack_name, w.name as warehouse_name FROM bins b LEFT JOIN racks r ON b.rack_id = r.id LEFT JOIN warehouses w ON r.warehouse_id = w.id WHERE b.id = ?').get(id)
    db.close()

    if (!bin) return c.json({ success: false, message: 'Bin not found' }, 404)
    return c.json({ success: true, data: bin })
  } catch (error) {
    console.error('Get bin error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/bins
binRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const validation = createBinSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const { rackId, code, capacity } = validation.data
    const db = getDb()

    const rackExists = db.prepare('SELECT id FROM racks WHERE id = ?').get(rackId)
    if (!rackExists) { db.close(); return c.json({ success: false, message: 'Rack not found' }, 404) }

    const existing = db.prepare('SELECT id FROM bins WHERE rack_id = ? AND code = ?').get(rackId, code)
    if (existing) { db.close(); return c.json({ success: false, message: 'Bin code already exists in this rack' }, 400) }

    const result = db.prepare('INSERT INTO bins (rack_id, code, capacity) VALUES (?, ?, ?)').run(rackId, code, capacity || 100)
    const bin = db.prepare('SELECT b.*, r.code as rack_code, r.name as rack_name, w.name as warehouse_name FROM bins b LEFT JOIN racks r ON b.rack_id = r.id LEFT JOIN warehouses w ON r.warehouse_id = w.id WHERE b.id = ?').get(result.lastInsertRowid)
    db.close()
    return c.json({ success: true, data: bin, message: 'Bin created successfully' }, 201)
  } catch (error) {
    console.error('Create bin error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/bins/:id
binRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const validation = updateBinSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM bins WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Bin not found' }, 404) }

    const { code, capacity } = validation.data
    if (code) {
      const duplicate = db.prepare('SELECT id FROM bins WHERE rack_id = ? AND code = ? AND id != ?').get((existing as any).rack_id, code, id)
      if (duplicate) { db.close(); return c.json({ success: false, message: 'Bin code already exists in this rack' }, 400) }
    }

    db.prepare('UPDATE bins SET code = COALESCE(?, code), capacity = COALESCE(?, capacity) WHERE id = ?').run(code || null, capacity || null, id)
    const bin = db.prepare('SELECT b.*, r.code as rack_code, r.name as rack_name, w.name as warehouse_name FROM bins b LEFT JOIN racks r ON b.rack_id = r.id LEFT JOIN warehouses w ON r.warehouse_id = w.id WHERE b.id = ?').get(id)
    db.close()
    return c.json({ success: true, data: bin, message: 'Bin updated successfully' })
  } catch (error) {
    console.error('Update bin error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/bins/:id
binRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()

    const existing = db.prepare('SELECT * FROM bins WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Bin not found' }, 404) }

    const inUse = db.prepare('SELECT id FROM stocks WHERE bin_id = ? LIMIT 1').get(id)
    if (inUse) { db.close(); return c.json({ success: false, message: 'Cannot delete: Bin is in use by stocks' }, 400) }

    db.prepare('DELETE FROM bins WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'Bin deleted successfully' })
  } catch (error) {
    console.error('Delete bin error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default binRoutes