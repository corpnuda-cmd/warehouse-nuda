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

const auditRoutes = new Hono()

// GET /api/v1/control/audit-logs - List all audit logs
auditRoutes.get('/', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const module = c.req.query('module')
    const userId = c.req.query('userId')
    const action = c.req.query('action')
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    const limit = parseInt(c.req.query('limit') || '100')
    const offset = parseInt(c.req.query('offset') || '0')

    const db = getDb()
    let query = `
      SELECT
        al.*,
        u.name as user_name,
        u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (module) { query += ' AND al.module = ?'; params.push(module) }
    if (userId) { query += ' AND al.user_id = ?'; params.push(parseInt(userId)) }
    if (action) { query += ' AND al.action = ?'; params.push(action) }
    if (startDate) { query += ' AND al.created_at >= ?'; params.push(startDate) }
    if (endDate) { query += ' AND al.created_at <= ?'; params.push(endDate) }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const logs = db.prepare(query).all(...params)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1'
    const countParams: any[] = []
    if (module) { countQuery += ' AND module = ?'; countParams.push(module) }
    if (userId) { countQuery += ' AND user_id = ?'; countParams.push(parseInt(userId)) }
    if (action) { countQuery += ' AND action = ?'; countParams.push(action) }
    if (startDate) { countQuery += ' AND created_at >= ?'; countParams.push(startDate) }
    if (endDate) { countQuery += ' AND created_at <= ?'; countParams.push(endDate) }
    const countResult = db.prepare(countQuery).get(...countParams) as any

    db.close()
    return c.json({
      success: true,
      data: logs,
      pagination: {
        total: countResult.total,
        limit,
        offset,
        hasMore: offset + logs.length < countResult.total,
      },
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/control/audit-logs/:id
auditRoutes.get('/:id', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const id = parseInt(c.req.param('id'))
    const db = getDb()
    const log = db.prepare(`
      SELECT al.*, u.name as user_name, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.id = ?
    `).get(id)
    if (!log) { db.close(); return c.json({ success: false, message: 'Audit log not found' }, 404) }
    db.close()
    return c.json({ success: true, data: log })
  } catch (error) {
    console.error('Get audit log error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET /api/v1/control/audit-logs/modules - Get distinct modules
auditRoutes.get('/modules', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const db = getDb()
    const modules = db.prepare('SELECT DISTINCT module FROM audit_logs ORDER BY module ASC').all()
    db.close()
    return c.json({ success: true, data: modules.map((m: any) => m.module) })
  } catch (error) {
    console.error('Get modules error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// POST /api/v1/control/audit-logs/export - Export audit logs as CSV
auditRoutes.post('/export', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const { module, userId, action, startDate, endDate } = body

    const db = getDb()
    let query = `
      SELECT al.*, u.name as user_name, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (module) { query += ' AND al.module = ?'; params.push(module) }
    if (userId) { query += ' AND al.user_id = ?'; params.push(parseInt(userId)) }
    if (action) { query += ' AND al.action = ?'; params.push(action) }
    if (startDate) { query += ' AND al.created_at >= ?'; params.push(startDate) }
    if (endDate) { query += ' AND al.created_at <= ?'; params.push(endDate) }

    query += ' ORDER BY al.created_at DESC LIMIT 5000'
    const logs = db.prepare(query).all(...params)
    db.close()

    // Generate CSV
    const headers = ['id', 'timestamp', 'user', 'username', 'action', 'module', 'reference_id', 'reference_type', 'ip_address', 'details']
    const csvRows = [headers.join(',')]

    for (const log of logs) {
      const row = [
        log.id,
        log.created_at,
        log.user_name || '',
        log.username || '',
        log.action,
        log.module,
        log.reference_id || '',
        log.reference_type || '',
        log.ip_address || '',
        (log.old_data || '') + ' -> ' + (log.new_data || ''),
      ].map(val => {
        const str = String(val)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      csvRows.push(row.join(','))
    }

    const csv = csvRows.join('\n')
    return c.newResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="audit_logs_export.csv"',
      },
    })
  } catch (error) {
    console.error('Export audit logs error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default auditRoutes