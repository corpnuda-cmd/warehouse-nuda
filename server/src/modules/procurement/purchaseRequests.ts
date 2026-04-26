import { Hono } from 'hono'
import Database from 'better-sqlite3'
import { verifyToken } from '../../lib/jwt'
import { createPurchaseRequestSchema, updatePurchaseRequestSchema } from './schema'
import { join } from 'path'

// Database path
const DB_PATH = join(process.cwd(), 'warehouse_nuda.db')

// Helper to get database connection
function getDb() {
  return Database(DB_PATH)
}

// Generate PR number
function generatePRNumber(db: Database.Database): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  const countResult = db.prepare(`
    SELECT COUNT(*) as count FROM purchase_requests
    WHERE pr_number LIKE ?
  `).get(`PR-${year}${month}${day}%`) as { count: number }

  const seq = String(countResult.count + 1).padStart(4, '0')
  return `PR-${year}${month}${day}-${seq}`
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

const procurementRoutes = new Hono()

// GET /api/v1/procurement/purchase-requests - List all PRs
procurementRoutes.get('/purchase-requests', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const db = getDb()
    const prs = db.prepare(`
      SELECT
        pr.*,
        u.username as requested_by_username,
        u.name as requested_by_name,
        w.name as warehouse_name
      FROM purchase_requests pr
      LEFT JOIN users u ON pr.requested_by = u.id
      LEFT JOIN warehouses w ON pr.warehouse_id = w.id
      ORDER BY pr.created_at DESC
    `).all()

    // Get items for each PR
    const prItems = db.prepare(`
      SELECT pri.*, i.code as item_code, i.name as item_name, u.symbol as uom_symbol
      FROM purchase_request_items pri
      LEFT JOIN items i ON pri.item_id = i.id
      LEFT JOIN uoms u ON i.uom_id = u.id
      WHERE pri.pr_id = ?
    `)

    const result = prs.map((pr: any) => ({
      ...pr,
      items: prItems.all(pr.id),
    }))

    db.close()
    return c.json({ success: true, data: result })

  } catch (error) {
    console.error('Get PRs error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/procurement/purchase-requests/:id - Get single PR
procurementRoutes.get('/purchase-requests/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid PR ID' }, 400)
    }

    const db = getDb()
    const pr = db.prepare(`
      SELECT
        pr.*,
        u.username as requested_by_username,
        u.name as requested_by_name,
        w.name as warehouse_name
      FROM purchase_requests pr
      LEFT JOIN users u ON pr.requested_by = u.id
      LEFT JOIN warehouses w ON pr.warehouse_id = w.id
      WHERE pr.id = ?
    `).get(id)

    if (!pr) {
      db.close()
      return c.json({ success: false, message: 'Purchase Request not found' }, 404)
    }

    const items = db.prepare(`
      SELECT pri.*, i.code as item_code, i.name as item_name, u.symbol as uom_symbol
      FROM purchase_request_items pri
      LEFT JOIN items i ON pri.item_id = i.id
      LEFT JOIN uoms u ON i.uom_id = u.id
      WHERE pri.pr_id = ?
    `).all(id)

    db.close()
    return c.json({ success: true, data: { ...pr, items } })

  } catch (error) {
    console.error('Get PR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/procurement/purchase-requests - Create new PR
procurementRoutes.post('/purchase-requests', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const body = await c.req.json()
    const validation = createPurchaseRequestSchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        message: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      }, 400)
    }

    const { warehouseId, notes, items } = validation.data

    const db = getDb()
    const prNumber = generatePRNumber(db)

    // Start transaction
    const insertPR = db.prepare(`
      INSERT INTO purchase_requests (pr_number, requested_by, warehouse_id, status, notes)
      VALUES (?, ?, ?, 'draft', ?)
    `)

    const insertItem = db.prepare(`
      INSERT INTO purchase_request_items (pr_id, item_id, qty, notes)
      VALUES (?, ?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      const result = insertPR.run(prNumber, payload.userId, warehouseId || null, notes || null)
      const prId = result.lastInsertRowid

      for (const item of items) {
        insertItem.run(prId, item.itemId, item.qty, item.notes || null)
      }

      return prId
    })

    const prId = transaction()

    // Get created PR
    const pr = db.prepare('SELECT * FROM purchase_requests WHERE id = ?').get(prId)

    db.close()
    return c.json({
      success: true,
      data: pr,
      message: `Purchase Request ${prNumber} created successfully`,
    })

  } catch (error) {
    console.error('Create PR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/procurement/purchase-requests/:id - Update PR status
procurementRoutes.patch('/purchase-requests/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid PR ID' }, 400)
    }

    const body = await c.req.json()
    const validation = updatePurchaseRequestSchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        message: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      }, 400)
    }

    const { status, notes } = validation.data

    const db = getDb()

    // Check if PR exists
    const existing = db.prepare('SELECT * FROM purchase_requests WHERE id = ?').get(id)
    if (!existing) {
      db.close()
      return c.json({ success: false, message: 'Purchase Request not found' }, 404)
    }

    // Update PR
    const update = db.prepare(`
      UPDATE purchase_requests
      SET status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          updated_at = ?
      WHERE id = ?
    `)

    update.run(status || null, notes || null, new Date().toISOString(), id)

    const updated = db.prepare('SELECT * FROM purchase_requests WHERE id = ?').get(id)

    db.close()
    return c.json({
      success: true,
      data: updated,
      message: 'Purchase Request updated successfully',
    })

  } catch (error) {
    console.error('Update PR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/procurement/purchase-requests/:id - Delete PR (only draft)
procurementRoutes.delete('/purchase-requests/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const id = parseInt(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ success: false, message: 'Invalid PR ID' }, 400)
    }

    const db = getDb()

    // Check if PR exists and is draft
    const existing = db.prepare('SELECT * FROM purchase_requests WHERE id = ? AND status = ?').get(id, 'draft')
    if (!existing) {
      db.close()
      return c.json({
        success: false,
        message: 'Purchase Request not found or cannot be deleted (must be draft)',
      }, 404)
    }

    // Delete items first
    db.prepare('DELETE FROM purchase_request_items WHERE pr_id = ?').run(id)

    // Delete PR
    db.prepare('DELETE FROM purchase_requests WHERE id = ?').run(id)

    db.close()
    return c.json({
      success: true,
      message: 'Purchase Request deleted successfully',
    })

  } catch (error) {
    console.error('Delete PR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default procurementRoutes