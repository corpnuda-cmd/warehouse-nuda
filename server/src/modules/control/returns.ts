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

function generateReturnNumber(db: Database.Database, type: string): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const prefix = type === 'supplier' ? 'RTN-S' : 'RTN-C'
  const countResult = db.prepare(`SELECT COUNT(*) as count FROM returns WHERE return_number LIKE ?`).get(`${prefix}-${year}${month}${day}%`) as { count: number }
  const seq = String(countResult.count + 1).padStart(4, '0')
  return `${prefix}-${year}${month}${day}-${seq}`
}

const returnsRoutes = new Hono()

// GET /api/v1/control/returns - List all returns
returnsRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const type = c.req.query('type')
    const status = c.req.query('status')
    const db = getDb()
    let query = `
      SELECT
        r.*,
        s.name as supplier_name,
        u.name as created_by_name
      FROM returns r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE 1=1
    `
    const params: any[] = []
    if (type) { query += ' AND r.type = ?'; params.push(type) }
    if (status) { query += ' AND r.status = ?'; params.push(status) }
    query += ' ORDER BY r.created_at DESC'

    const returns = db.prepare(query).all(...params)
    const getItems = db.prepare(`
      SELECT ri.*, i.code as item_code, i.name as item_name
      FROM return_items ri
      LEFT JOIN items i ON ri.item_id = i.id
      WHERE ri.return_id = ?
    `)
    const result = returns.map((r: any) => ({ ...r, items: getItems.all(r.id) }))
    db.close()
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Get returns error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/control/returns/:id
returnsRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const returnRecord = db.prepare(`
      SELECT r.*, s.name as supplier_name, u.name as created_by_name
      FROM returns r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = ?
    `).get(id)
    if (!returnRecord) { db.close(); return c.json({ success: false, message: 'Return not found' }, 404) }

    const items = db.prepare(`
      SELECT ri.*, i.code as item_code, i.name as item_name
      FROM return_items ri
      LEFT JOIN items i ON ri.item_id = i.id
      WHERE ri.return_id = ?
    `).all(id)
    db.close()
    return c.json({ success: true, data: { ...returnRecord, items } })
  } catch (error) {
    console.error('Get return error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/control/returns - Create return request
returnsRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const { type, supplierId, referenceId, referenceType, reason, items } = body

    if (!type || !items || items.length === 0) {
      return c.json({ success: false, message: 'Type and items are required' }, 400)
    }

    const db = getDb()
    const returnNumber = generateReturnNumber(db, type)

    const insertReturn = db.prepare('INSERT INTO returns (return_number, type, supplier_id, reference_id, reference_type, reason, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    const insertItem = db.prepare('INSERT INTO return_items (return_id, item_id, qty, reason) VALUES (?, ?, ?, ?)')

    const transaction = db.transaction(() => {
      const result = insertReturn.run(returnNumber, type, supplierId || null, referenceId || null, referenceType || null, reason || null, 'pending', payload.userId)
      const returnId = result.lastInsertRowid
      for (const item of items) {
        insertItem.run(returnId, item.itemId, item.qty, item.reason || null)
      }
      return returnId
    })

    const returnId = transaction()
    const returnRecord = db.prepare(`
      SELECT r.*, s.name as supplier_name
      FROM returns r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      WHERE r.id = ?
    `).get(returnId)
    db.close()
    return c.json({ success: true, data: returnRecord, message: `Return ${returnNumber} created` }, 201)
  } catch (error) {
    console.error('Create return error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/control/returns/:id - Update return status (QC, approve, process)
returnsRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { status, qcResults } = body // qcResults: [{itemId, qtyAccepted, qtyRejected, notes}]

    const db = getDb()
    const existing = db.prepare('SELECT * FROM returns WHERE id = ?').get(id) as any
    if (!existing) { db.close(); return c.json({ success: false, message: 'Return not found' }, 404) }

    const transaction = db.transaction(() => {
      // If QC results are provided
      if (qcResults && qcResults.length > 0) {
        const updateItem = db.prepare('UPDATE return_items SET qty_accepted = ?, qty_rejected = ?, qc_notes = ? WHERE return_id = ? AND item_id = ?')
        for (const result of qcResults) {
          updateItem.run(result.qtyAccepted, result.qtyRejected || 0, result.notes || null, id, result.itemId)
        }
      }

      // Update status
      if (status) {
        db.prepare('UPDATE returns SET status = ? WHERE id = ?').run(status, id)

        // If processed, update stock (for supplier returns: add back stock, for customer returns: deduct)
        if (status === 'processed') {
          const returnItems = db.prepare('SELECT * FROM return_items WHERE return_id = ?').all(id) as any[]
          const warehouseId = existing.warehouse_id || 1 // default warehouse

          const insertMovement = db.prepare(`
            INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
            VALUES (?, ?, ?, ?, ?, 'return', ?, ?)
          `)
          const updateStock = db.prepare('UPDATE stocks SET qty_available = qty_available + ? WHERE item_id = ? AND warehouse_id = ?')
          const insertStock = db.prepare('INSERT INTO stocks (item_id, warehouse_id, qty_available) VALUES (?, ?, ?)')

          for (const item of returnItems) {
            const acceptedQty = item.qty_accepted || item.qty
            if (acceptedQty > 0) {
              // Log movement
              const movType = existing.type === 'supplier' ? 'IN' : 'OUT'
              insertMovement.run(item.item_id, warehouseId, acceptedQty, id, `Return ${existing.return_number} processed`, payload.userId)

              // Update stock
              const existingStock = db.prepare('SELECT id FROM stocks WHERE item_id = ? AND warehouse_id = ?').get(item.item_id, warehouseId)
              if (existingStock) {
                updateStock.run(acceptedQty, item.item_id, warehouseId)
              } else {
                insertStock.run(item.item_id, warehouseId, acceptedQty)
              }
            }
          }
        }
      }

      return id
    })

    transaction()
    const updated = db.prepare(`
      SELECT r.*, s.name as supplier_name
      FROM returns r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      WHERE r.id = ?
    `).get(id)
    db.close()
    return c.json({ success: true, data: updated, message: `Return ${status}` })
  } catch (error) {
    console.error('Update return error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/control/returns/:id - Cancel return (pending only)
returnsRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const existing = db.prepare('SELECT * FROM returns WHERE id = ? AND status = ?').get(id, 'pending')
    if (!existing) { db.close(); return c.json({ success: false, message: 'Return not found or cannot be cancelled' }, 404) }

    db.prepare('DELETE FROM return_items WHERE return_id = ?').run(id)
    db.prepare('DELETE FROM returns WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'Return cancelled' })
  } catch (error) {
    console.error('Cancel return error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default returnsRoutes