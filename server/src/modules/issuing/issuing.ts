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

function generateIRNumber(db: Database.Database): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const countResult = db.prepare(`SELECT COUNT(*) as count FROM issue_requests WHERE ir_number LIKE ?`).get(`IR-${year}${month}${day}%`) as { count: number }
  const seq = String(countResult.count + 1).padStart(4, '0')
  return `IR-${year}${month}${day}-${seq}`
}

function generateGINumber(db: Database.Database): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const countResult = db.prepare(`SELECT COUNT(*) as count FROM goods_issues WHERE gi_number LIKE ?`).get(`GI-${year}${month}${day}%`) as { count: number }
  const seq = String(countResult.count + 1).padStart(4, '0')
  return `GI-${year}${month}${day}-${seq}`
}

const issuingRoutes = new Hono()

// GET /api/v1/issuing/issue-requests - List all IRs
issuingRoutes.get('/issue-requests', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const status = c.req.query('status')
    const db = getDb()
    let query = `
      SELECT
        ir.*,
        u.name as requested_by_name,
        w.code as warehouse_code, w.name as warehouse_name
      FROM issue_requests ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN warehouses w ON ir.warehouse_id = w.id
    `
    const params: any[] = []
    if (status) { query += ' WHERE ir.status = ?'; params.push(status) }
    query += ' ORDER BY ir.created_at DESC'

    const irs = db.prepare(query).all(...params)
    const getItems = db.prepare(`
      SELECT iri.*, i.code as item_code, i.name as item_name
      FROM issue_request_items iri
      LEFT JOIN items i ON iri.item_id = i.id
      WHERE iri.ir_id = ?
    `)
    const result = irs.map((ir: any) => ({ ...ir, items: getItems.all(ir.id) }))
    db.close()
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Get IRs error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/issuing/issue-requests/:id
issuingRoutes.get('/issue-requests/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const ir = db.prepare(`
      SELECT ir.*, u.name as requested_by_name, w.code as warehouse_code, w.name as warehouse_name
      FROM issue_requests ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN warehouses w ON ir.warehouse_id = w.id
      WHERE ir.id = ?
    `).get(id)
    if (!ir) { db.close(); return c.json({ success: false, message: 'Issue Request not found' }, 404) }

    const items = db.prepare(`
      SELECT iri.*, i.code as item_code, i.name as item_name
      FROM issue_request_items iri
      LEFT JOIN items i ON iri.item_id = i.id
      WHERE iri.ir_id = ?
    `).all(id)
    db.close()
    return c.json({ success: true, data: { ...ir, items } })
  } catch (error) {
    console.error('Get IR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/issuing/issue-requests - Create IR
issuingRoutes.post('/issue-requests', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const { warehouseId, notes, items } = body
    if (!warehouseId || !items || items.length === 0) {
      return c.json({ success: false, message: 'Warehouse and items are required' }, 400)
    }

    const db = getDb()
    const irNumber = generateIRNumber(db)

    const insertIR = db.prepare('INSERT INTO issue_requests (ir_number, requested_by, warehouse_id, status, notes) VALUES (?, ?, ?, ?, ?)')
    const insertItem = db.prepare('INSERT INTO issue_request_items (ir_id, item_id, qty) VALUES (?, ?, ?)')

    const transaction = db.transaction(() => {
      const result = insertIR.run(irNumber, payload.userId, warehouseId, 'draft', notes || null)
      const irId = result.lastInsertRowid
      for (const item of items) {
        insertItem.run(irId, item.itemId, item.qty)
      }
      return irId
    })

    const irId = transaction()
    const ir = db.prepare('SELECT * FROM issue_requests WHERE id = ?').get(irId)
    db.close()
    return c.json({ success: true, data: ir, message: `Issue Request ${irNumber} created` }, 201)
  } catch (error) {
    console.error('Create IR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/issuing/issue-requests/:id - Update IR status
issuingRoutes.patch('/issue-requests/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { status, notes } = body

    const db = getDb()
    const existing = db.prepare('SELECT * FROM issue_requests WHERE id = ?').get(id)
    if (!existing) { db.close(); return c.json({ success: false, message: 'Issue Request not found' }, 404) }

    db.prepare('UPDATE issue_requests SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?')
      .run(status || null, notes || null, id)
    const updated = db.prepare('SELECT * FROM issue_requests WHERE id = ?').get(id)
    db.close()
    return c.json({ success: true, data: updated, message: 'Issue Request updated' })
  } catch (error) {
    console.error('Update IR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/issuing/issue-requests/:id - Delete IR (draft only)
issuingRoutes.delete('/issue-requests/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const existing = db.prepare('SELECT * FROM issue_requests WHERE id = ? AND status = ?').get(id, 'draft')
    if (!existing) { db.close(); return c.json({ success: false, message: 'Issue Request not found or cannot be deleted' }, 404) }

    db.prepare('DELETE FROM issue_request_items WHERE ir_id = ?').run(id)
    db.prepare('DELETE FROM issue_requests WHERE id = ?').run(id)
    db.close()
    return c.json({ success: true, message: 'Issue Request deleted' })
  } catch (error) {
    console.error('Delete IR error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/issuing/goods-issues - List all GIs
issuingRoutes.get('/goods-issues', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const db = getDb()
    const gis = db.prepare(`
      SELECT gi.*, u.name as issued_by_name, ir.ir_number
      FROM goods_issues gi
      LEFT JOIN users u ON gi.issued_by = u.id
      LEFT JOIN issue_requests ir ON gi.ir_id = ir.id
      ORDER BY gi.created_at DESC
    `).all()

    const getItems = db.prepare(`
      SELECT gii.*, i.code as item_code, i.name as item_name
      FROM goods_issue_items gii
      LEFT JOIN items i ON gii.item_id = i.id
      WHERE gii.gi_id = ?
    `)
    const result = gis.map((gi: any) => ({ ...gi, items: getItems.all(gi.id) }))
    db.close()
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Get GIs error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/issuing/goods-issues - Create GI from IR
issuingRoutes.post('/goods-issues', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const { irId, notes } = body

    const db = getDb()

    // Get IR if provided
    let items: any[] = []
    if (irId) {
      const ir = db.prepare('SELECT * FROM issue_requests WHERE id = ?').get(irId) as any
      if (!ir) { db.close(); return c.json({ success: false, message: 'Issue Request not found' }, 404) }
      if (ir.status === 'fulfilled') { db.close(); return c.json({ success: false, message: 'IR already fulfilled' }, 400) }

      items = db.prepare('SELECT * FROM issue_request_items WHERE ir_id = ?').all(irId)
    } else if (body.items) {
      items = body.items.map((i: any) => ({ item_id: i.itemId, qty: i.qty }))
    } else {
      return c.json({ success: false, message: 'IR or items required' }, 400)
    }

    // Check stock availability
    for (const item of items) {
      const stock = db.prepare(`
        SELECT SUM(qty_available) as total FROM stocks
        WHERE item_id = ? AND warehouse_id = ?
      `).get(item.item_id, body.warehouseId || (db.prepare('SELECT warehouse_id FROM issue_requests WHERE id = ?').get(irId) as any)?.warehouse_id) as any

      if (!stock || stock.total < item.qty) {
        db.close()
        return c.json({ success: false, message: `Insufficient stock for item ${item.item_id}` }, 400)
      }
    }

    const giNumber = generateGINumber(db)
    const warehouseId = body.warehouseId || (db.prepare('SELECT warehouse_id FROM issue_requests WHERE id = ?').get(irId) as any)?.warehouse_id

    const insertGI = db.prepare('INSERT INTO goods_issues (gi_number, ir_id, issued_by, notes) VALUES (?, ?, ?, ?)')
    const insertItem = db.prepare('INSERT INTO goods_issue_items (gi_id, item_id, qty) VALUES (?, ?, ?)')
    const updateStock = db.prepare('UPDATE stocks SET qty_available = qty_available - ? WHERE item_id = ? AND warehouse_id = ?')
    const insertMovement = db.prepare(`
      INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
      VALUES (?, ?, 'OUT', ?, ?, 'goods_issue', ?, ?)
    `)

    const transaction = db.transaction(() => {
      const result = insertGI.run(giNumber, irId || null, payload.userId, notes || null)
      const giId = result.lastInsertRowid

      for (const item of items) {
        insertItem.run(giId, item.item_id, item.qty)
        updateStock.run(item.qty, item.item_id, warehouseId)
        insertMovement.run(item.item_id, warehouseId, item.qty, giId, notes || null, payload.userId)
      }

      // Update IR status to fulfilled if IR was provided
      if (irId) {
        db.prepare("UPDATE issue_requests SET status = 'fulfilled' WHERE id = ?").run(irId)
      }

      return giId
    })

    const giId = transaction()
    const gi = db.prepare(`
      SELECT gi.*, u.name as issued_by_name, ir.ir_number
      FROM goods_issues gi
      LEFT JOIN users u ON gi.issued_by = u.id
      LEFT JOIN issue_requests ir ON gi.ir_id = ir.id
      WHERE gi.id = ?
    `).get(giId)
    db.close()
    return c.json({ success: true, data: gi, message: `Goods Issue ${giNumber} created - Stock deducted` }, 201)
  } catch (error) {
    console.error('Create GI error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/issuing/pick-lists - Get pick lists (generated from reservations)
issuingRoutes.get('/pick-lists', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const db = getDb()
    const irs = db.prepare(`
      SELECT
        ir.*,
        u.name as requested_by_name,
        w.code as warehouse_code, w.name as warehouse_name
      FROM issue_requests ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN warehouses w ON ir.warehouse_id = w.id
      WHERE ir.status IN ('pending', 'approved')
      ORDER BY ir.created_at DESC
    `).all()

    const result = irs.map((ir: any) => {
      // Get reservation items with bin locations
      const reservations = db.prepare(`
        SELECT
          sr.*,
          i.code as item_code, i.name as item_name,
          b.code as bin_code, b.id as bin_id,
          r.code as rack_code
        FROM stock_reservations sr
        LEFT JOIN items i ON sr.item_id = i.id
        LEFT JOIN bins b ON sr.bin_id = b.id
        LEFT JOIN racks r ON b.rack_id = r.id
        WHERE sr.reference_id = ? AND sr.reference_type = 'issue_request' AND sr.status = 'reserved'
      `).all(ir.id)

      // Also get IR items not yet reserved
      const irItems = db.prepare('SELECT * FROM issue_request_items WHERE ir_id = ?').all(ir.id) as any[]
      const reservedItemIds = reservations.map((r: any) => r.item_id)

      return {
        ...ir,
        reservations,
        items: irItems.map((item: any) => {
          const reserved = reservations.find((r: any) => r.item_id === item.item_id)
          return {
            ...item,
            reserved_qty: reserved ? reserved.qty_reserved : 0,
            bin_code: reserved?.bin_code || null,
            rack_code: reserved?.rack_code || null,
            pick_status: reserved ? 'ready' : 'pending',
          }
        }),
      }
    })

    db.close()
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Get pick lists error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/issuing/pick-lists/:irId - Get pick list for specific IR
issuingRoutes.get('/pick-lists/:irId', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const irId = parseInt(c.req.param('irId'))
    const db = getDb()

    const ir = db.prepare(`
      SELECT ir.*, u.name as requested_by_name, w.code as warehouse_code, w.name as warehouse_name
      FROM issue_requests ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN warehouses w ON ir.warehouse_id = w.id
      WHERE ir.id = ?
    `).get(irId) as any

    if (!ir) { db.close(); return c.json({ success: false, message: 'Issue Request not found' }, 404) }

    const reservations = db.prepare(`
      SELECT
        sr.*,
        i.code as item_code, i.name as item_name,
        b.code as bin_code, b.id as bin_id,
        r.code as rack_code
      FROM stock_reservations sr
      LEFT JOIN items i ON sr.item_id = i.id
      LEFT JOIN bins b ON sr.bin_id = b.id
      LEFT JOIN racks r ON b.rack_id = r.id
      WHERE sr.reference_id = ? AND sr.reference_type = 'issue_request' AND sr.status = 'reserved'
    `).all(irId)

    const pickItems = reservations.map((r: any) => ({
      item_id: r.item_id,
      item_code: r.item_code,
      item_name: r.item_name,
      qty_requested: r.qty_reserved,
      bin_code: r.bin_code,
      rack_code: r.rack_code,
      location: r.rack_code && r.bin_code ? `${r.rack_code} > ${r.bin_code}` : 'Unassigned',
      picked: false,
    }))

    db.close()
    return c.json({
      success: true,
      data: {
        ir_number: ir.ir_number,
        warehouse: `${ir.warehouse_code} - ${ir.warehouse_name}`,
        requested_by: ir.requested_by_name,
        status: ir.status,
        items: pickItems,
        total_items: pickItems.length,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Get pick list error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default issuingRoutes