import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { createUoMSchema, updateUoMSchema } from './schema'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')

function getDb() {
  return Database(DB_PATH)
}

function getAuthPayload(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return verifyToken(authHeader.slice(7))
}

const uomRoutes = new Hono()

// GET /api/v1/uoms
uomRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const db = getDb()
    const uoms = db.prepare('SELECT * FROM uoms ORDER BY name ASC').all()
    db.close()
    return c.json({ success: true, data: uoms })
  } catch (error) {
    console.error('Get uoms error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/uoms/:id
uomRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const uom = db.prepare('SELECT * FROM uoms WHERE id = ?').get(id)
    db.close()

    if (!uom) return c.json({ success: false, message: 'UoM not found' }, 404)
    return c.json({ success: true, data: uom })
  } catch (error) {
    console.error('Get uom error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/uoms
uomRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const validation = createUoMSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const { name, symbol } = validation.data
    const db = getDb()

    // Check duplicate symbol
    const existing = db.prepare('SELECT id FROM uoms WHERE symbol = ?').get(symbol)
    if (existing) {
      db.close()
      return c.json({ success: false, message: 'Symbol already exists' }, 400)
    }

    const result = db.prepare('INSERT INTO uoms (name, symbol) VALUES (?, ?)').run(name, symbol)
    const uom = db.prepare('SELECT * FROM uoms WHERE id = ?').get(result.lastInsertRowid)
    db.close()

    return c.json({ success: true, data: uom, message: 'UoM created successfully' }, 201)
  } catch (error) {
    console.error('Create uom error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/uoms/:id
uomRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const validation = updateUoMSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM uoms WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'UoM not found' }, 404) }

    const { name, symbol } = validation.data
    if (symbol) {
      const duplicate = db.prepare('SELECT id FROM uoms WHERE symbol = ? AND id != ?').get(symbol, id)
      if (duplicate) { db.close(); return c.json({ success: false, message: 'Symbol already exists' }, 400) }
    }

    db.prepare('UPDATE uoms SET name = COALESCE(?, name), symbol = COALESCE(?, symbol) WHERE id = ?')
      .run(name || null, symbol || null, id)
    const uom = db.prepare('SELECT * FROM uoms WHERE id = ?').get(id)
    db.close()
    return c.json({ success: true, data: uom, message: 'UoM updated successfully' })
  } catch (error) {
    console.error('Update uom error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/uoms/:id
uomRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()

    const existing = db.prepare('SELECT * FROM uoms WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'UoM not found' }, 404) }

    // Check if used by items
    const inUse = db.prepare('SELECT id FROM items WHERE uom_id = ? LIMIT 1').get(id)
    if (inUse) { db.close(); return c.json({ success: false, message: 'Cannot delete: UoM is in use by items' }, 400) }

    db.prepare('DELETE FROM uoms WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'UoM deleted successfully' })
  } catch (error) {
    console.error('Delete uom error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default uomRoutes