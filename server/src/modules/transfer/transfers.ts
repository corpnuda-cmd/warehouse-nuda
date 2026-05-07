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

function generateTransferNumber(db: Database.Database): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const countResult = db.prepare(`SELECT COUNT(*) as count FROM transfers WHERE transfer_number LIKE ?`).get(`TRF-${year}${month}${day}%`) as { count: number }
  const seq = String(countResult.count + 1).padStart(4, '0')
  return `TRF-${year}${month}${day}-${seq}`
}

const transferRoutes = new Hono()

// GET /api/v1/transfers - List all transfers
transferRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const status = c.req.query('status')
    const db = getDb()
    let query = `
      SELECT
        t.*,
        fw.code as from_warehouse_code, fw.name as from_warehouse_name,
        tw.code as to_warehouse_code, tw.name as to_warehouse_name
      FROM transfers t
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
    `
    const params: any[] = []
    if (status) { query += ' WHERE t.status = ?'; params.push(status) }
    query += ' ORDER BY t.created_at DESC'

    const transfers = db.prepare(query).all(...params)
    const getItems = db.prepare(`
      SELECT ti.*, i.code as item_code, i.name as item_name
      FROM transfer_items ti
      LEFT JOIN items i ON ti.item_id = i.id
      WHERE ti.transfer_id = ?
    `)
    const result = transfers.map((t: any) => ({ ...t, items: getItems.all(t.id) }))
    db.close()
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Get transfers error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/transfers/:id
transferRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const transfer = db.prepare(`
      SELECT
        t.*,
        fw.code as from_warehouse_code, fw.name as from_warehouse_name,
        tw.code as to_warehouse_code, tw.name as to_warehouse_name
      FROM transfers t
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
      WHERE t.id = ?
    `).get(id)
    if (!transfer) { db.close(); return c.json({ success: false, message: 'Transfer not found' }, 404) }

    const items = db.prepare(`
      SELECT ti.*, i.code as item_code, i.name as item_name
      FROM transfer_items ti
      LEFT JOIN items i ON ti.item_id = i.id
      WHERE ti.transfer_id = ?
    `).all(id)
    db.close()
    return c.json({ success: true, data: { ...transfer, items } })
  } catch (error) {
    console.error('Get transfer error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/transfers - Create transfer
transferRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const { fromWarehouseId, toWarehouseId, notes, items } = body

    if (!fromWarehouseId || !toWarehouseId || !items || items.length === 0) {
      return c.json({ success: false, message: 'From warehouse, to warehouse, and items are required' }, 400)
    }

    if (fromWarehouseId === toWarehouseId) {
      return c.json({ success: false, message: 'From and to warehouse cannot be the same' }, 400)
    }

    const db = getDb()

    // Check stock availability at source
    for (const item of items) {
      const stock = db.prepare(`
        SELECT SUM(qty_available) as total FROM stocks
        WHERE item_id = ? AND warehouse_id = ?
      `).get(item.itemId, fromWarehouseId) as any

      if (!stock || stock.total < item.qty) {
        db.close()
        return c.json({ success: false, message: `Insufficient stock at source warehouse for item ${item.itemId}` }, 400)
      }
    }

    const transferNumber = generateTransferNumber(db)

    const insertTransfer = db.prepare('INSERT INTO transfers (transfer_number, from_warehouse_id, to_warehouse_id, status, notes) VALUES (?, ?, ?, ?, ?)')
    const insertItem = db.prepare('INSERT INTO transfer_items (transfer_id, item_id, qty) VALUES (?, ?, ?)')

    const transaction = db.transaction(() => {
      const result = insertTransfer.run(transferNumber, fromWarehouseId, toWarehouseId, 'draft', notes || null)
      const transferId = result.lastInsertRowid
      for (const item of items) {
        insertItem.run(transferId, item.itemId, item.qty)
      }
      return transferId
    })

    const transferId = transaction()
    const transfer = db.prepare(`
      SELECT t.*, fw.code as from_warehouse_code, fw.name as from_warehouse_name, tw.code as to_warehouse_code, tw.name as to_warehouse_name
      FROM transfers t
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
      WHERE t.id = ?
    `).get(transferId)
    db.close()
    return c.json({ success: true, data: transfer, message: `Transfer ${transferNumber} created` }, 201)
  } catch (error) {
    console.error('Create transfer error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/transfers/:id - Update transfer status
transferRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { status } = body

    const db = getDb()
    const existing = db.prepare('SELECT * FROM transfers WHERE id = ?').get(id) as any
    if (!existing) { db.close(); return c.json({ success: false, message: 'Transfer not found' }, 404) }

    // Handle status transitions
    if (status === 'approved') {
      // Deduct from source
      const items = db.prepare('SELECT * FROM transfer_items WHERE transfer_id = ?').all(id) as any[]
      for (const item of items) {
        db.prepare('UPDATE stocks SET qty_available = qty_available - ? WHERE item_id = ? AND warehouse_id = ?')
          .run(item.qty, item.item_id, existing.from_warehouse_id)
        db.prepare(`
          INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
          VALUES (?, ?, 'TRANSFER_OUT', ?, ?, 'transfer', ?, ?)
        `).run(item.item_id, existing.from_warehouse_id, item.qty, id, 'Transfer approved', payload.userId)
      }
    } else if (status === 'received') {
      // Add to destination
      const items = db.prepare('SELECT * FROM transfer_items WHERE transfer_id = ?').all(id) as any[]
      for (const item of items) {
        // Check if stock record exists at destination
        const existingStock = db.prepare('SELECT id FROM stocks WHERE item_id = ? AND warehouse_id = ?').get(item.item_id, existing.to_warehouse_id)
        if (existingStock) {
          db.prepare('UPDATE stocks SET qty_available = qty_available + ? WHERE id = ?').run(item.qty, (existingStock as any).id)
        } else {
          db.prepare('INSERT INTO stocks (item_id, warehouse_id, qty_available) VALUES (?, ?, ?)').run(item.item_id, existing.to_warehouse_id, item.qty)
        }
        db.prepare(`
          INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
          VALUES (?, ?, 'TRANSFER_IN', ?, ?, 'transfer', ?, ?)
        `).run(item.item_id, existing.to_warehouse_id, item.qty, id, 'Transfer received', payload.userId)
      }
    }

    db.prepare('UPDATE transfers SET status = ? WHERE id = ?').run(status, id)
    const updated = db.prepare(`
      SELECT t.*, fw.code as from_warehouse_code, fw.name as from_warehouse_name, tw.code as to_warehouse_code, tw.name as to_warehouse_name
      FROM transfers t
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
      WHERE t.id = ?
    `).get(id)
    db.close()
    return c.json({ success: true, data: updated, message: `Transfer ${status}` })
  } catch (error) {
    console.error('Update transfer error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/transfers/:id - Delete transfer (draft only)
transferRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const existing = db.prepare('SELECT * FROM transfers WHERE id = ? AND status = ?').get(id, 'draft')
    if (!existing) { db.close(); return c.json({ success: false, message: 'Transfer not found or cannot be deleted' }, 404) }

    db.prepare('DELETE FROM transfer_items WHERE transfer_id = ?').run(id)
    db.prepare('DELETE FROM transfers WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'Transfer deleted' })
  } catch (error) {
    console.error('Delete transfer error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default transferRoutes