import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { createPurchaseOrderSchema, updatePurchaseOrderSchema } from './purchaseOrdersSchema'
import { join } from 'path'

// Database path
const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')

// Helper to get database connection
function getDb() {
  return Database(DB_PATH)
}

// Generate PO number
function generatePONumber(db: Database.Database): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  const countResult = db.prepare(`
    SELECT COUNT(*) as count FROM purchase_orders
    WHERE po_number LIKE ?
  `).get(`PO-${year}${month}${day}%`) as { count: number }

  const seq = String(countResult.count + 1).padStart(4, '0')
  return `PO-${year}${month}${day}-${seq}`
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

const purchaseOrderRoutes = new Hono()

// GET /api/v1/procurement/purchase-orders - List all POs
purchaseOrderRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const db = getDb()
    const pos = db.prepare(`
      SELECT
        po.*,
        s.name as supplier_name,
        s.code as supplier_code,
        pr.pr_number as pr_number
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_requests pr ON po.pr_id = pr.id
      ORDER BY po.created_at DESC
    `).all()

    // Get items for each PO
    const poItems = db.prepare(`
      SELECT poi.*, i.code as item_code, i.name as item_name, u.symbol as uom_symbol
      FROM purchase_order_items poi
      LEFT JOIN items i ON poi.item_id = i.id
      LEFT JOIN uoms u ON i.uom_id = u.id
      WHERE poi.po_id = ?
    `)

    const result = pos.map((po: any) => ({
      ...po,
      items: poItems.all(po.id),
    }))

    db.close()
    return c.json({ success: true, data: result })

  } catch (error) {
    console.error('Get POs error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/procurement/purchase-orders/:id - Get single PO
purchaseOrderRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid PO ID' }, 400)
    }

    const db = getDb()
    const po = db.prepare(`
      SELECT
        po.*,
        s.name as supplier_name,
        s.code as supplier_code,
        pr.pr_number as pr_number
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_requests pr ON po.pr_id = pr.id
      WHERE po.id = ?
    `).get(id)

    if (!po) {
      db.close()
      return c.json({ success: false, message: 'Purchase Order not found' }, 404)
    }

    const items = db.prepare(`
      SELECT poi.*, i.code as item_code, i.name as item_name, u.symbol as uom_symbol
      FROM purchase_order_items poi
      LEFT JOIN items i ON poi.item_id = i.id
      LEFT JOIN uoms u ON i.uom_id = u.id
      WHERE poi.po_id = ?
    `).all(id)

    db.close()
    return c.json({ success: true, data: { ...po, items } })

  } catch (error) {
    console.error('Get PO error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/procurement/purchase-orders - Create new PO
purchaseOrderRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const body = await c.req.json()
    const validation = createPurchaseOrderSchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        message: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      }, 400)
    }

    const { prId, supplierId, expectedDeliveryDate, notes, items } = validation.data

    // Calculate total
    let total = 0
    for (const item of items) {
      total += item.qty * item.price
    }

    const db = getDb()
    const poNumber = generatePONumber(db)

    // Start transaction
    const insertPO = db.prepare(`
      INSERT INTO purchase_orders (po_number, pr_id, supplier_id, status, total, expected_delivery_date, notes)
      VALUES (?, ?, ?, 'draft', ?, ?, ?)
    `)

    const insertItem = db.prepare(`
      INSERT INTO purchase_order_items (po_id, item_id, qty, price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      const result = insertPO.run(poNumber, prId || null, supplierId, total, expectedDeliveryDate || null, notes || null)
      const poId = result.lastInsertRowid

      for (const item of items) {
        const subtotal = item.qty * item.price
        insertItem.run(poId, item.itemId, item.qty, item.price, subtotal)
      }

      // Update PR status if linked
      if (prId) {
        db.prepare('UPDATE purchase_requests SET status = ? WHERE id = ?').run('approved', prId)
      }

      return poId
    })

    const poId = transaction()

    // Get created PO
    const po = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `).get(poId)

    db.close()
    return c.json({
      success: true,
      data: po,
      message: `Purchase Order ${poNumber} created successfully`,
    })

  } catch (error) {
    console.error('Create PO error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/procurement/purchase-orders/:id - Update PO status
purchaseOrderRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid PO ID' }, 400)
    }

    const body = await c.req.json()
    const validation = updatePurchaseOrderSchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        message: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      }, 400)
    }

    const { status, notes } = validation.data

    const db = getDb()

    // Check if PO exists
    const existing = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id)
    if (!existing) {
      db.close()
      return c.json({ success: false, message: 'Purchase Order not found' }, 404)
    }

    // Update PO
    const update = db.prepare(`
      UPDATE purchase_orders
      SET status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          updated_at = ?
      WHERE id = ?
    `)

    update.run(status || null, notes || null, new Date().toISOString(), id)

    const updated = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id)

    db.close()
    return c.json({
      success: true,
      data: updated,
      message: 'Purchase Order updated successfully',
    })

  } catch (error) {
    console.error('Update PO error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/procurement/purchase-orders/:id - Delete PO (only draft)
purchaseOrderRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid PO ID' }, 400)
    }

    const db = getDb()

    // Check if PO exists and is draft
    const existing = db.prepare('SELECT * FROM purchase_orders WHERE id = ? AND status = ?').get(id, 'draft')
    if (!existing) {
      db.close()
      return c.json({
        success: false,
        message: 'Purchase Order not found or cannot be deleted (must be draft)',
      }, 404)
    }

    // Delete items first
    db.prepare('DELETE FROM purchase_order_items WHERE po_id = ?').run(id)

    // Delete PO
    db.prepare('DELETE FROM purchase_orders WHERE id = ?').run(id)

    db.close()
    return c.json({
      success: true,
      message: 'Purchase Order deleted successfully',
    })

  } catch (error) {
    console.error('Delete PO error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default purchaseOrderRoutes