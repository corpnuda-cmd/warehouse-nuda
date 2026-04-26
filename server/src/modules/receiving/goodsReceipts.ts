import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { createGoodsReceiptSchema, updateGoodsReceiptSchema, qcGoodsReceiptSchema } from './schema'
import { join } from 'path'

// Database path
const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')

// Helper to get database connection
function getDb() {
  return Database(DB_PATH)
}

// Generate GR number
function generateGRNumber(db: Database.Database): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  const countResult = db.prepare(`
    SELECT COUNT(*) as count FROM goods_receipts
    WHERE gr_number LIKE ?
  `).get(`GR-${year}${month}${day}%`) as { count: number }

  const seq = String(countResult.count + 1).padStart(4, '0')
  return `GR-${year}${month}${day}-${seq}`
}

// Auth middleware helper
function getAuthPayload(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.slice(7)
  return verifyToken(token)
}

const receivingRoutes = new Hono()

// GET /api/v1/receiving/goods-receipts - List all GRs
receivingRoutes.get('/goods-receipts', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const db = getDb()
    const grs = db.prepare(`
      SELECT
        gr.*,
        u.username as received_by_username,
        u.name as received_by_name,
        po.po_number,
        s.name as supplier_name
      FROM goods_receipts gr
      LEFT JOIN users u ON gr.received_by = u.id
      LEFT JOIN purchase_orders po ON gr.po_id = po.id
      LEFT JOIN purchase_orders po2 ON po.supplier_id = s.id
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY gr.created_at DESC
    `).all()

    // Get items for each GR
    const grItems = db.prepare(`
      SELECT gri.*, i.code as item_code, i.name as item_name, u.symbol as uom_symbol
      FROM goods_receipt_items gri
      LEFT JOIN items i ON gri.item_id = i.id
      LEFT JOIN uoms u ON i.uom_id = u.id
      WHERE gri.gr_id = ?
    `)

    const result = grs.map((gr: any) => ({
      ...gr,
      items: grItems.all(gr.id),
    }))

    db.close()
    return c.json({ success: true, data: result })

  } catch (error) {
    console.error('Get GRs error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/receiving/goods-receipts/:id - Get single GR
receivingRoutes.get('/goods-receipts/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid GR ID' }, 400)
    }

    const db = getDb()
    const gr = db.prepare(`
      SELECT
        gr.*,
        u.username as received_by_username,
        u.name as received_by_name,
        po.po_number,
        s.name as supplier_name
      FROM goods_receipts gr
      LEFT JOIN users u ON gr.received_by = u.id
      LEFT JOIN purchase_orders po ON gr.po_id = po.id
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE gr.id = ?
    `).get(id)

    if (!gr) {
      db.close()
      return c.json({ success: false, message: 'Goods Receipt not found' }, 404)
    }

    const items = db.prepare(`
      SELECT gri.*, i.code as item_code, i.name as item_name, u.symbol as uom_symbol
      FROM goods_receipt_items gri
      LEFT JOIN items i ON gri.item_id = i.id
      LEFT JOIN uoms u ON i.uom_id = u.id
      WHERE gri.gr_id = ?
    `).all(id)

    db.close()
    return c.json({ success: true, data: { ...gr, items } })

  } catch (error) {
    console.error('Get GR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/receiving/goods-receipts - Create new GR
receivingRoutes.post('/goods-receipts', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const body = await c.req.json()
    const validation = createGoodsReceiptSchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        message: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      }, 400)
    }

    const { poId, notes, items } = validation.data

    const db = getDb()
    const grNumber = generateGRNumber(db)

    // Start transaction
    const insertGR = db.prepare(`
      INSERT INTO goods_receipts (gr_number, po_id, received_by, qc_status, notes)
      VALUES (?, ?, ?, 'pending', ?)
    `)

    const insertItem = db.prepare(`
      INSERT INTO goods_receipt_items (gr_id, item_id, qty_received, qty_accepted, qty_rejected, notes)
      VALUES (?, ?, ?, 0, 0, ?)
    `)

    const transaction = db.transaction(() => {
      const result = insertGR.run(grNumber, poId || null, payload.userId, notes || null)
      const grId = result.lastInsertRowid

      for (const item of items) {
        insertItem.run(grId, item.itemId, item.qtyReceived, null)
      }

      // Update PO status if linked
      if (poId) {
        db.prepare('UPDATE purchase_orders SET status = ? WHERE id = ?').run('received', poId)
      }

      return grId
    })

    const grId = transaction()

    // Get created GR
    const gr = db.prepare('SELECT * FROM goods_receipts WHERE id = ?').get(grId)

    db.close()
    return c.json({
      success: true,
      data: gr,
      message: `Goods Receipt ${grNumber} created successfully`,
    })

  } catch (error) {
    console.error('Create GR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/receiving/goods-receipts/:id - Update GR
receivingRoutes.patch('/goods-receipts/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid GR ID' }, 400)
    }

    const body = await c.req.json()
    const validation = updateGoodsReceiptSchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        message: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      }, 400)
    }

    const { qcStatus, notes } = validation.data

    const db = getDb()

    // Check if GR exists
    const existing = db.prepare('SELECT * FROM goods_receipts WHERE id = ?').get(id)
    if (!existing) {
      db.close()
      return c.json({ success: false, message: 'Goods Receipt not found' }, 404)
    }

    // Update GR
    const update = db.prepare(`
      UPDATE goods_receipts
      SET qc_status = COALESCE(?, qc_status),
          notes = COALESCE(?, notes),
          updated_at = ?
      WHERE id = ?
    `)

    update.run(qcStatus || null, notes || null, new Date().toISOString(), id)

    const updated = db.prepare('SELECT * FROM goods_receipts WHERE id = ?').get(id)

    db.close()
    return c.json({
      success: true,
      data: updated,
      message: 'Goods Receipt updated successfully',
    })

  } catch (error) {
    console.error('Update GR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/receiving/goods-receipts/:id/qc - QC for GR
receivingRoutes.post('/goods-receipts/:id/qc', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid GR ID' }, 400)
    }

    const body = await c.req.json()
    const validation = qcGoodsReceiptSchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        message: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      }, 400)
    }

    const { items } = validation.data

    const db = getDb()

    // Check if GR exists
    const gr = db.prepare('SELECT * FROM goods_receipts WHERE id = ?').get(id) as any
    if (!gr) {
      db.close()
      return c.json({ success: false, message: 'Goods Receipt not found' }, 404)
    }

    // Get warehouse for default stock (main warehouse)
    const warehouse = db.prepare('SELECT id FROM warehouses WHERE type = ? ORDER BY id LIMIT 1').get('main') as any

    // Update items and add to stock
    const updateItem = db.prepare(`
      UPDATE goods_receipt_items
      SET qty_accepted = ?, qty_rejected = ?, notes = ?
      WHERE gr_id = ? AND item_id = ?
    `)

    const upsertStock = db.prepare(`
      INSERT INTO stocks (item_id, warehouse_id, qty_available, qty_reserved)
      VALUES (?, ?, ?, 0)
      ON CONFLICT(item_id, warehouse_id) DO UPDATE SET
      qty_available = qty_available + ?
    `)

    const insertMovement = db.prepare(`
      INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
      VALUES (?, ?, 'IN', ?, ?, 'goods_receipt', ?, ?)
    `)

    let totalAccepted = 0
    let totalRejected = 0

    const transaction = db.transaction(() => {
      for (const item of items) {
        // Update GR item with QC results
        updateItem.run(item.qtyAccepted, item.qtyRejected, item.notes || null, id, item.itemId)

        totalAccepted += item.qtyAccepted
        totalRejected += item.qtyRejected

        // If QC passed or partial, add to stock
        if (item.qtyAccepted > 0 && warehouse) {
          // Upsert stock
          const existingStock = db.prepare('SELECT * FROM stocks WHERE item_id = ? AND warehouse_id = ?').get(item.itemId, warehouse.id)

          if (existingStock) {
            db.prepare(`
              UPDATE stocks
              SET qty_available = qty_available + ?
              WHERE item_id = ? AND warehouse_id = ?
            `).run(item.qtyAccepted, item.itemId, warehouse.id)
          } else {
            db.prepare(`
              INSERT INTO stocks (item_id, warehouse_id, qty_available)
              VALUES (?, ?, ?)
            `).run(item.itemId, warehouse.id, item.qtyAccepted)
          }

          // Record movement
          insertMovement.run(
            item.itemId,
            warehouse.id,
            item.qtyAccepted,
            id,
            `QC accepted: ${item.qtyAccepted}`,
            payload.userId
          )
        }
      }

      // Determine overall QC status
      let qcStatus = 'pending'
      if (totalRejected === 0 && totalAccepted > 0) {
        qcStatus = 'qc_passed'
      } else if (totalAccepted === 0 && totalRejected > 0) {
        qcStatus = 'qc_failed'
      } else if (totalAccepted > 0 && totalRejected > 0) {
        qcStatus = 'qc_partial'
      }

      // Update GR status
      db.prepare('UPDATE goods_receipts SET qc_status = ?, updated_at = ? WHERE id = ?')
        .run(qcStatus, new Date().toISOString(), id)

      return { totalAccepted, totalRejected, qcStatus }
    })

    const result = transaction()

    // Get updated GR
    const updatedGR = db.prepare('SELECT * FROM goods_receipts WHERE id = ?').get(id)

    db.close()
    return c.json({
      success: true,
      data: { ...updatedGR, qcResult: result },
      message: 'QC completed successfully',
    })

  } catch (error) {
    console.error('QC error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/receiving/goods-receipts/:id - Delete GR (only pending)
receivingRoutes.delete('/goods-receipts/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid GR ID' }, 400)
    }

    const db = getDb()

    // Check if GR exists and is pending
    const existing = db.prepare('SELECT * FROM goods_receipts WHERE id = ? AND qc_status = ?').get(id, 'pending')
    if (!existing) {
      db.close()
      return c.json({
        success: false,
        message: 'Goods Receipt not found or cannot be deleted (must be pending)',
      }, 404)
    }

    // Delete items first
    db.prepare('DELETE FROM goods_receipt_items WHERE gr_id = ?').run(id)

    // Delete GR
    db.prepare('DELETE FROM goods_receipts WHERE id = ?').run(id)

    db.close()
    return c.json({
      success: true,
      message: 'Goods Receipt deleted successfully',
    })

  } catch (error) {
    console.error('Delete GR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default receivingRoutes