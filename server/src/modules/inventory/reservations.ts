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

const reservationRoutes = new Hono()

// GET /api/v1/inventory/reservations - List all reservations
reservationRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const status = c.req.query('status')
    const db = getDb()
    let query = `
      SELECT
        sr.*,
        i.code as item_code, i.name as item_name,
        w.code as warehouse_code, w.name as warehouse_name,
        b.code as bin_code,
        ir.ir_number as reference_ir,
        u.name as reserved_by_name
      FROM stock_reservations sr
      LEFT JOIN items i ON sr.item_id = i.id
      LEFT JOIN warehouses w ON sr.warehouse_id = w.id
      LEFT JOIN bins b ON sr.bin_id = b.id
      LEFT JOIN issue_requests ir ON sr.reference_id = ir.id AND sr.reference_type = 'issue_request'
      LEFT JOIN users u ON sr.reserved_by = u.id
      WHERE sr.reference_type = 'issue_request'
    `
    const params: any[] = []
    if (status) { query += ' AND sr.status = ?'; params.push(status) }
    query += ' ORDER BY sr.created_at DESC'

    const reservations = db.prepare(query).all(...params)
    db.close()
    return c.json({ success: true, data: reservations })
  } catch (error) {
    console.error('Get reservations error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/inventory/reservations - Reserve stock for IR
reservationRoutes.post('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const { irId, items } = body

    const db = getDb()

    // Get IR details
    const ir = db.prepare('SELECT * FROM issue_requests WHERE id = ?').get(irId) as any
    if (!ir) { db.close(); return c.json({ success: false, message: 'Issue Request not found' }, 404) }
    if (ir.status !== 'pending') { db.close(); return c.json({ success: false, message: 'IR must be in pending status to reserve stock' }, 400) }

    const insertReservation = db.prepare(`
      INSERT INTO stock_reservations (item_id, warehouse_id, bin_id, qty_reserved, reference_id, reference_type, reserved_by, status, notes)
      VALUES (?, ?, ?, ?, ?, 'issue_request', ?, 'reserved', ?)
    `)
    const insertMovement = db.prepare(`
      INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
      VALUES (?, ?, 'RESERVATION', ?, ?, 'stock_reservation', ?, ?)
    `)

    // Get items if not provided
    const irItems = items || db.prepare('SELECT * FROM issue_request_items WHERE ir_id = ?').all(irId) as any[]

    const transaction = db.transaction(() => {
      for (const item of irItems) {
        // Find available stock with bin
        const stock = db.prepare(`
          SELECT s.*, b.code as bin_code FROM stocks s
          LEFT JOIN bins b ON s.bin_id = b.id
          WHERE s.item_id = ? AND s.warehouse_id = ? AND s.qty_available >= ?
          ORDER BY b.code ASC LIMIT 1
        `).get(item.item_id, ir.warehouse_id, item.qty) as any

        if (!stock) {
          throw new Error(`Insufficient stock for item ${item.item_id}`)
        }

        // Deduct from available, add to reserved
        db.prepare('UPDATE stocks SET qty_available = qty_available - ?, qty_reserved = qty_reserved + ? WHERE id = ?')
          .run(item.qty, item.qty, stock.id)

        // Create reservation record
        insertReservation.run(item.item_id, ir.warehouse_id, stock.bin_id, item.qty, irId, payload.userId, `Reserved for IR ${ir.ir_number}`)

        // Log movement
        insertMovement.run(item.item_id, ir.warehouse_id, item.qty, irId, `Reserved for IR ${ir.ir_number}`, payload.userId)
      }

      // Update IR status to approved (stock reserved)
      db.prepare("UPDATE issue_requests SET status = 'approved' WHERE id = ?").run(irId)
      return irId
    })

    const result = transaction()
    db.close()
    return c.json({ success: true, data: { irId: result }, message: 'Stock reserved successfully' }, 201)
  } catch (error: any) {
    console.error('Reserve stock error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

// PATCH /api/v1/inventory/reservations/:id - Release or confirm reservation
reservationRoutes.patch('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const { status } = body // 'released' or 'fulfilled'

    const db = getDb()
    const reservation = db.prepare('SELECT * FROM stock_reservations WHERE id = ?').get(id) as any
    if (!reservation) { db.close(); return c.json({ success: false, message: 'Reservation not found' }, 404) }

    const transaction = db.transaction(() => {
      if (status === 'released') {
        // Return stock to available
        db.prepare('UPDATE stocks SET qty_available = qty_available + ?, qty_reserved = qty_reserved - ? WHERE id = (SELECT id FROM stocks WHERE item_id = ? AND warehouse_id = ? AND (bin_id = ? OR (bin_id IS NULL AND ? IS NULL)))')
          .run(reservation.qty_reserved, reservation.qty_reserved, reservation.item_id, reservation.warehouse_id, reservation.bin_id, reservation.bin_id)

        // Log release movement
        db.prepare(`
          INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
          VALUES (?, ?, 'RELEASE', ?, ?, 'stock_reservation', 'Released', ?)
        `).run(reservation.item_id, reservation.warehouse_id, reservation.qty_reserved, id, payload.userId)

        db.prepare('UPDATE stock_reservations SET status = ? WHERE id = ?').run('released', id)

      } else if (status === 'fulfilled') {
        // Stock already deducted during GI, just mark fulfilled
        db.prepare('UPDATE stock_reservations SET status = ? WHERE id = ?').run('fulfilled', id)
      }

      return id
    })

    transaction()
    db.close()
    return c.json({ success: true, data: { id, status }, message: `Reservation ${status}` })
  } catch (error) {
    console.error('Update reservation error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// DELETE /api/v1/inventory/reservations/:id - Cancel reservation
reservationRoutes.delete('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()

    const reservation = db.prepare('SELECT * FROM stock_reservations WHERE id = ? AND status = ?').get(id, 'reserved') as any
    if (!reservation) { db.close(); return c.json({ success: false, message: 'Reservation not found or already processed' }, 404) }

    const transaction = db.transaction(() => {
      // Return stock to available
      db.prepare('UPDATE stocks SET qty_available = qty_available + ?, qty_reserved = qty_reserved - ? WHERE item_id = ? AND warehouse_id = ?')
        .run(reservation.qty_reserved, reservation.qty_reserved, reservation.item_id, reservation.warehouse_id)

      // Log release
      db.prepare(`
        INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by)
        VALUES (?, ?, 'RELEASE', ?, ?, 'stock_reservation', 'Cancelled', ?)
      `).run(reservation.item_id, reservation.warehouse_id, reservation.qty_reserved, id, payload.userId)

      db.prepare('DELETE FROM stock_reservations WHERE id = ?').run(id)
    })

    transaction()
    db.close()
    return c.json({ success: true, message: 'Reservation cancelled' })
  } catch (error) {
    console.error('Cancel reservation error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default reservationRoutes