import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')
function getDb() { return Database(DB_PATH) }
function getAuthPayload(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return verifyToken(authHeader.slice(7))
}

const inventoryRoutes = new Hono()

// GET /api/v1/inventory/stocks - View all stocks
inventoryRoutes.get('/stocks', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const warehouseId = c.req.query('warehouseId')
    const itemId = c.req.query('itemId')
    const lowStock = c.req.query('lowStock')

    const db = getDb()
    let query = `
      SELECT
        s.*,
        i.code as item_code, i.name as item_name, i.min_stock, i.reorder_point,
        w.code as warehouse_code, w.name as warehouse_name,
        b.code as bin_code
      FROM stocks s
      LEFT JOIN items i ON s.item_id = i.id
      LEFT JOIN warehouses w ON s.warehouse_id = w.id
      LEFT JOIN bins b ON s.bin_id = b.id
      WHERE 1=1
    `
    const params: any[] = []

    if (warehouseId) {
      query += ' AND s.warehouse_id = ?'
      params.push(parseInt(warehouseId))
    }
    if (itemId) {
      query += ' AND s.item_id = ?'
      params.push(parseInt(itemId))
    }
    if (lowStock === 'true') {
      query += ' AND s.qty_available <= i.min_stock'
    }

    query += ' ORDER BY w.code, i.code ASC'

    const stocks = db.prepare(query).all(...params)
    db.close()
    return c.json({ success: true, data: stocks })
  } catch (error) {
    console.error('Get stocks error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/inventory/stocks/:id - Get single stock
inventoryRoutes.get('/stocks/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const stock = db.prepare(`
      SELECT
        s.*,
        i.code as item_code, i.name as item_name, i.min_stock, i.reorder_point,
        w.code as warehouse_code, w.name as warehouse_name,
        b.code as bin_code
      FROM stocks s
      LEFT JOIN items i ON s.item_id = i.id
      LEFT JOIN warehouses w ON s.warehouse_id = w.id
      LEFT JOIN bins b ON s.bin_id = b.id
      WHERE s.id = ?
    `).get(id)
    db.close()

    if (!stock) return c.json({ success: false, message: 'Stock not found' }, 404)
    return c.json({ success: true, data: stock })
  } catch (error) {
    console.error('Get stock error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/inventory/stocks/:id - Manual adjustment
inventoryRoutes.patch('/stocks/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { qty_available, notes } = body

    const db = getDb()
    const existing = db.prepare('SELECT * FROM stocks WHERE id = ?').get(id) as any
    if (!existing) { db.close(); return c.json({ success: false, message: 'Stock not found' }, 404) }

    const oldQty = existing.qty_available
    const newQty = qty_available !== undefined ? qty_available : oldQty
    const diff = newQty - oldQty

    // Update stock
    db.prepare('UPDATE stocks SET qty_available = ? WHERE id = ?').run(newQty, id)

    // Log movement
    const movementType = diff > 0 ? 'ADJUSTMENT' : 'ADJUSTMENT'
    db.prepare(`
      INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(existing.item_id, existing.warehouse_id, movementType, Math.abs(diff), id, 'stock_adjustment', notes || 'Manual adjustment', payload.userId)

    const updated = db.prepare('SELECT * FROM stocks WHERE id = ?').get(id)
    db.close()
    return c.json({ success: true, data: updated, message: 'Stock adjusted successfully' })
  } catch (error) {
    console.error('Adjust stock error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/inventory/movements - Stock movement history
inventoryRoutes.get('/movements', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const warehouseId = c.req.query('warehouseId')
    const itemId = c.req.query('itemId')
    const type = c.req.query('type')
    const limit = parseInt(c.req.query('limit') || '100')

    const db = getDb()
    let query = `
      SELECT
        sm.*,
        i.code as item_code, i.name as item_name,
        w.code as warehouse_code, w.name as warehouse_name,
        u.name as created_by_name
      FROM stock_movements sm
      LEFT JOIN items i ON sm.item_id = i.id
      LEFT JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (warehouseId) { query += ' AND sm.warehouse_id = ?'; params.push(parseInt(warehouseId)) }
    if (itemId) { query += ' AND sm.item_id = ?'; params.push(parseInt(itemId)) }
    if (type) { query += ' AND sm.type = ?'; params.push(type) }

    query += ' ORDER BY sm.created_at DESC LIMIT ?'
    params.push(limit)

    const movements = db.prepare(query).all(...params)
    db.close()
    return c.json({ success: true, data: movements })
  } catch (error) {
    console.error('Get movements error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/inventory/alerts - Low stock alerts
inventoryRoutes.get('/alerts', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const db = getDb()
    const alerts = db.prepare(`
      SELECT
        s.*,
        i.code as item_code, i.name as item_name, i.min_stock, i.reorder_point,
        w.code as warehouse_code, w.name as warehouse_name
      FROM stocks s
      LEFT JOIN items i ON s.item_id = i.id
      LEFT JOIN warehouses w ON s.warehouse_id = w.id
      WHERE s.qty_available <= i.min_stock
      ORDER BY s.qty_available ASC
    `).all()
    db.close()
    return c.json({ success: true, data: alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/inventory/stocks - Create stock record (for initial setup)
inventoryRoutes.post('/stocks', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const { itemId, warehouseId, binId, qtyAvailable } = body

    const db = getDb()

    // Check if stock record already exists
    const existing = db.prepare('SELECT id FROM stocks WHERE item_id = ? AND warehouse_id = ? AND (bin_id = ? OR (bin_id IS NULL AND ? IS NULL))')
      .get(itemId, warehouseId, binId || null, binId || null) as any

    if (existing) {
      // Update existing
      db.prepare('UPDATE stocks SET qty_available = qty_available + ? WHERE id = ?').run(qtyAvailable, existing.id)
      const updated = db.prepare('SELECT * FROM stocks WHERE id = ?').get(existing.id)
      db.close()
      return c.json({ success: true, data: updated, message: 'Stock updated' })
    }

    // Insert new
    const result = db.prepare('INSERT INTO stocks (item_id, warehouse_id, bin_id, qty_available) VALUES (?, ?, ?, ?)')
      .run(itemId, warehouseId, binId || null, qtyAvailable || 0)

    // Log initial stock
    db.prepare(`
      INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
      VALUES (?, ?, 'IN', ?, ?, 'initial_stock', 'Initial stock entry', ?)
    `).run(itemId, warehouseId, qtyAvailable || 0, result.lastInsertRowid, payload.userId)

    const stock = db.prepare('SELECT * FROM stocks WHERE id = ?').get(result.lastInsertRowid)
    db.close()
    return c.json({ success: true, data: stock, message: 'Stock created' }, 201)
  } catch (error) {
    console.error('Create stock error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default inventoryRoutes