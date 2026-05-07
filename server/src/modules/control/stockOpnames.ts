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

function generateSONumber(db: Database.Database): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const countResult = db.prepare(`SELECT COUNT(*) as count FROM stock_opnames WHERE so_number LIKE ?`).get(`SO-${year}${month}${day}%`) as { count: number }
  const seq = String(countResult.count + 1).padStart(4, '0')
  return `SO-${year}${month}${day}-${seq}`
}

const stockOpnameRoutes = new Hono()

// GET /api/v1/control/stock-opnames - List all stock opnames
stockOpnameRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const status = c.req.query('status')
    const db = getDb()
    let query = `
      SELECT
        so.*,
        w.code as warehouse_code, w.name as warehouse_name,
        u.name as created_by_name
      FROM stock_opnames so
      LEFT JOIN warehouses w ON so.warehouse_id = w.id
      LEFT JOIN users u ON so.created_by = u.id
    `
    const params: any[] = []
    if (status) { query += ' WHERE so.status = ?'; params.push(status) }
    query += ' ORDER BY so.created_at DESC'

    const stockOpnames = db.prepare(query).all(...params)
    const getItems = db.prepare(`
      SELECT soi.*, i.code as item_code, i.name as item_name
      FROM stock_opname_items soi
      LEFT JOIN items i ON soi.item_id = i.id
      WHERE soi.so_id = ?
    `)
    const result = stockOpnames.map((so: any) => ({ ...so, items: getItems.all(so.id) }))
    db.close()
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Get stock opnames error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/control/stock-opnames/:id
stockOpnameRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const so = db.prepare(`
      SELECT so.*, w.code as warehouse_code, w.name as warehouse_name, u.name as created_by_name
      FROM stock_opnames so
      LEFT JOIN warehouses w ON so.warehouse_id = w.id
      LEFT JOIN users u ON so.created_by = u.id
      WHERE so.id = ?
    `).get(id)
    if (!so) { db.close(); return c.json({ success: false, message: 'Stock Opname not found' }, 404) }

    const items = db.prepare(`
      SELECT soi.*, i.code as item_code, i.name as item_name
      FROM stock_opname_items soi
      LEFT JOIN items i ON soi.item_id = i.id
      WHERE soi.so_id = ?
    `).all(id)
    db.close()
    return c.json({ success: true, data: { ...so, items } })
  } catch (error) {
    console.error('Get stock opname error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/control/stock-opnames - Create stock opname plan
stockOpnameRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const { warehouseId, planDate, notes, itemIds } = body

    if (!warehouseId || !itemIds || itemIds.length === 0) {
      return c.json({ success: false, message: 'Warehouse and items are required' }, 400)
    }

    const db = getDb()
    const soNumber = generateSONumber(db)

    const insertSO = db.prepare('INSERT INTO stock_opnames (so_number, warehouse_id, plan_date, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)')
    const insertItem = db.prepare('INSERT INTO stock_opname_items (so_id, item_id, qty_system) VALUES (?, ?, ?)')

    // Get current stock for each item
    const getSystemQty = db.prepare('SELECT SUM(qty_available) as qty FROM stocks WHERE item_id = ? AND warehouse_id = ?')

    const transaction = db.transaction(() => {
      const result = insertSO.run(soNumber, warehouseId, planDate || new Date().toISOString().split('T')[0], 'planned', notes || null, payload.userId)
      const soId = result.lastInsertRowid

      for (const itemId of itemIds) {
        const stock = getSystemQty.get(itemId, warehouseId) as any
        const qtySystem = stock?.qty || 0
        insertItem.run(soId, itemId, qtySystem)
      }

      return soId
    })

    const soId = transaction()
    const so = db.prepare(`
      SELECT so.*, w.code as warehouse_code, w.name as warehouse_name
      FROM stock_opnames so
      LEFT JOIN warehouses w ON so.warehouse_id = w.id
      WHERE so.id = ?
    `).get(soId)
    db.close()
    return c.json({ success: true, data: so, message: `Stock Opname ${soNumber} created` }, 201)
  } catch (error) {
    console.error('Create stock opname error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/control/stock-opnames/:id - Update status or input counts
stockOpnameRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { status, counts } = body // counts: [{itemId, qtyActual}, ...]

    const db = getDb()
    const existing = db.prepare('SELECT * FROM stock_opnames WHERE id = ?').get(id) as any
    if (!existing) { db.close(); return c.json({ success: false, message: 'Stock Opname not found' }, 404) }

    const transaction = db.transaction(() => {
      // If counts are provided, update qty_actual and calculate variance
      if (counts && counts.length > 0) {
        const updateItem = db.prepare('UPDATE stock_opname_items SET qty_actual = ?, variance = qty_actual - qty_system WHERE item_id = ? AND so_id = ?')
        for (const count of counts) {
          updateItem.run(count.qtyActual, count.itemId, id)
        }
      }

      // Update status if provided
      if (status) {
        db.prepare('UPDATE stock_opnames SET status = ? WHERE id = ?').run(status, id)

        // If completed, apply adjustments
        if (status === 'completed') {
          const soItems = db.prepare('SELECT * FROM stock_opname_items WHERE so_id = ? AND variance != 0').all(id) as any[]
          const insertMovement = db.prepare(`
            INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
            VALUES (?, ?, 'ADJUSTMENT', ?, ?, 'stock_opname', ?, ?)
          `)
          const adjustStock = db.prepare('UPDATE stocks SET qty_available = ? WHERE item_id = ? AND warehouse_id = ?')

          for (const item of soItems) {
            const variance = item.qty_actual - item.qty_system
            if (variance !== 0) {
              // Log movement
              insertMovement.run(item.item_id, existing.warehouse_id, Math.abs(variance), id, `Stock Opname ${existing.so_number}`, payload.userId)
              // Update stock
              adjustStock.run(item.qty_actual, item.item_id, existing.warehouse_id)
            }
          }
        }
      }

      return id
    })

    transaction()
    const updated = db.prepare(`
      SELECT so.*, w.code as warehouse_code, w.name as warehouse_name
      FROM stock_opnames so
      LEFT JOIN warehouses w ON so.warehouse_id = w.id
      WHERE so.id = ?
    `).get(id)
    db.close()
    return c.json({ success: true, data: updated, message: 'Stock Opname updated' })
  } catch (error) {
    console.error('Update stock opname error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/control/stock-opnames/:id - Delete stock opname (planned only)
stockOpnameRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const existing = db.prepare('SELECT * FROM stock_opnames WHERE id = ? AND status = ?').get(id, 'planned')
    if (!existing) { db.close(); return c.json({ success: false, message: 'Stock Opname not found or cannot be deleted' }, 404) }

    db.prepare('DELETE FROM stock_opname_items WHERE so_id = ?').run(id)
    db.prepare('DELETE FROM stock_opnames WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'Stock Opname deleted' })
  } catch (error) {
    console.error('Delete stock opname error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default stockOpnameRoutes