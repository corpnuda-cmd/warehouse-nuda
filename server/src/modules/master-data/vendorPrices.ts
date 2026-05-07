import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { createVendorPriceSchema, updateVendorPriceSchema } from './schema'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')
function getDb() { return Database(DB_PATH) }
function getAuthPayload(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return verifyToken(authHeader.slice(7))
}

const vendorPriceRoutes = new Hono()

// GET /api/v1/vendor-prices
vendorPriceRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const supplierId = c.req.query('supplierId')
    const itemId = c.req.query('itemId')
    const db = getDb()

    let vpl
    if (supplierId) {
      vpl = db.prepare(`
        SELECT vpl.*, s.name as supplier_name, i.code as item_code, i.name as item_name
        FROM vendor_price_list vpl
        LEFT JOIN suppliers s ON vpl.supplier_id = s.id
        LEFT JOIN items i ON vpl.item_id = i.id
        WHERE vpl.supplier_id = ?
        ORDER BY i.name ASC
      `).all(parseInt(supplierId))
    } else if (itemId) {
      vpl = db.prepare(`
        SELECT vpl.*, s.name as supplier_name, i.code as item_code, i.name as item_name
        FROM vendor_price_list vpl
        LEFT JOIN suppliers s ON vpl.supplier_id = s.id
        LEFT JOIN items i ON vpl.item_id = i.id
        WHERE vpl.item_id = ?
        ORDER BY vpl.price ASC
      `).all(parseInt(itemId))
    } else {
      vpl = db.prepare(`
        SELECT vpl.*, s.name as supplier_name, i.code as item_code, i.name as item_name
        FROM vendor_price_list vpl
        LEFT JOIN suppliers s ON vpl.supplier_id = s.id
        LEFT JOIN items i ON vpl.item_id = i.id
        ORDER BY s.name ASC, i.name ASC
      `).all()
    }
    db.close()
    return c.json({ success: true, data: vpl })
  } catch (error) {
    console.error('Get vendor prices error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/vendor-prices/:id
vendorPriceRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const vpl = db.prepare(`
      SELECT vpl.*, s.name as supplier_name, i.code as item_code, i.name as item_name
      FROM vendor_price_list vpl
      LEFT JOIN suppliers s ON vpl.supplier_id = s.id
      LEFT JOIN items i ON vpl.item_id = i.id
      WHERE vpl.id = ?
    `).get(id)
    db.close()

    if (!vpl) return c.json({ success: false, message: 'Vendor price not found' }, 404)
    return c.json({ success: true, data: vpl })
  } catch (error) {
    console.error('Get vendor price error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/vendor-prices
vendorPriceRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const validation = createVendorPriceSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const { supplierId, itemId, price, validFrom, validTo } = validation.data
    const db = getDb()

    const supplierExists = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(supplierId)
    if (!supplierExists) { db.close(); return c.json({ success: false, message: 'Supplier not found' }, 404) }

    const itemExists = db.prepare('SELECT id FROM items WHERE id = ?').get(itemId)
    if (!itemExists) { db.close(); return c.json({ success: false, message: 'Item not found' }, 404) }

    const result = db.prepare('INSERT INTO vendor_price_list (supplier_id, item_id, price, valid_from, valid_to) VALUES (?, ?, ?, ?, ?)')
      .run(supplierId, itemId, price, validFrom || null, validTo || null)
    const vpl = db.prepare(`
      SELECT vpl.*, s.name as supplier_name, i.code as item_code, i.name as item_name
      FROM vendor_price_list vpl
      LEFT JOIN suppliers s ON vpl.supplier_id = s.id
      LEFT JOIN items i ON vpl.item_id = i.id
      WHERE vpl.id = ?
    `).get(result.lastInsertRowid)
    db.close()
    return c.json({ success: true, data: vpl, message: 'Vendor price created successfully' }, 201)
  } catch (error) {
    console.error('Create vendor price error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/vendor-prices/:id
vendorPriceRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const validation = updateVendorPriceSchema.safeParse(body)
    if (!validation.success) {
      return c.json({ success: false, message: 'Validation error', errors: validation.error.flatten().fieldErrors }, 400)
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM vendor_price_list WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Vendor price not found' }, 404) }

    const { price, validFrom, validTo } = validation.data
    db.prepare('UPDATE vendor_price_list SET price = COALESCE(?, price), valid_from = COALESCE(?, valid_from), valid_to = COALESCE(?, valid_to) WHERE id = ?')
      .run(price || null, validFrom || null, validTo || null, id)
    const vpl = db.prepare(`
      SELECT vpl.*, s.name as supplier_name, i.code as item_code, i.name as item_name
      FROM vendor_price_list vpl
      LEFT JOIN suppliers s ON vpl.supplier_id = s.id
      LEFT JOIN items i ON vpl.item_id = i.id
      WHERE vpl.id = ?
    `).get(id)
    db.close()
    return c.json({ success: true, data: vpl, message: 'Vendor price updated successfully' })
  } catch (error) {
    console.error('Update vendor price error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/vendor-prices/:id
vendorPriceRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()

    const existing = db.prepare('SELECT * FROM vendor_price_list WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Vendor price not found' }, 404) }

    db.prepare('DELETE FROM vendor_price_list WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'Vendor price deleted successfully' })
  } catch (error) {
    console.error('Delete vendor price error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default vendorPriceRoutes