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

const importExportRoutes = new Hono()

// ============ EXPORT CSV ============

// GET /api/v1/import-export/export/:type - Export data as CSV
importExportRoutes.get('/export/:type', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const type = c.req.param('type')
    const db = getDb()

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'items':
        data = db.prepare(`
          SELECT i.code, i.name, c.name as category, u.name as uom, i.min_stock, i.reorder_point, i.price, i.barcode, i.is_active
          FROM items i
          LEFT JOIN categories c ON i.category_id = c.id
          LEFT JOIN uoms u ON i.uom_id = u.id
          ORDER BY i.code ASC
        `).all()
        filename = 'items_export.csv'
        break

      case 'categories':
        data = db.prepare('SELECT name, description FROM categories ORDER BY name ASC').all()
        filename = 'categories_export.csv'
        break

      case 'suppliers':
        data = db.prepare('SELECT code, name, contact_person, email, phone, address, is_active FROM suppliers ORDER BY code ASC').all()
        filename = 'suppliers_export.csv'
        break

      case 'warehouses':
        data = db.prepare('SELECT code, name, address, type, is_active FROM warehouses ORDER BY code ASC').all()
        filename = 'warehouses_export.csv'
        break

      case 'uoms':
        data = db.prepare('SELECT name, symbol FROM uoms ORDER BY name ASC').all()
        filename = 'uoms_export.csv'
        break

      default:
        db.close()
        return c.json({ success: false, message: 'Invalid export type' }, 400)
    }

    db.close()

    if (data.length === 0) {
      return c.json({ success: false, message: 'No data to export' }, 400)
    }

    // Generate CSV
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    for (const row of data) {
      const values = headers.map(h => {
        const val = row[h]
        const str = val === null || val === undefined ? '' : String(val)
        // Escape quotes and wrap in quotes if contains comma or newline
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      csvRows.push(values.join(','))
    }
    const csv = csvRows.join('\n')

    return c.newResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// ============ IMPORT CSV ============

// POST /api/v1/import-export/import/:type - Import data from CSV
importExportRoutes.post('/import/:type', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const type = c.req.param('type')
    const body = await c.req.json()
    const { data } = body

    if (!Array.isArray(data) || data.length === 0) {
      return c.json({ success: false, message: 'Invalid or empty data array' }, 400)
    }

    const db = getDb()
    let imported = 0
    let errors: string[] = []

    const transaction = db.transaction(() => {
      switch (type) {
        case 'items': {
          // Expected columns: code, name, category, uom, min_stock, reorder_point, price, barcode
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i]
              if (!row.code || !row.name) throw new Error('Missing code or name')

              // Find category_id
              let categoryId: number | null = null
              if (row.category) {
                const cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(row.category) as any
                categoryId = cat ? cat.id : null
              }

              // Find uom_id
              if (!row.uom) throw new Error('UoM is required')
              const uom = db.prepare('SELECT id FROM uoms WHERE name = ? OR symbol = ?').get(row.uom, row.uom) as any
              if (!uom) throw new Error(`UoM "${row.uom}" not found`)

              // Check if code exists
              const existing = db.prepare('SELECT id FROM items WHERE code = ?').get(row.code)
              if (existing) {
                // Update
                db.prepare(`
                  UPDATE items SET name = ?, category_id = ?, uom_id = ?, min_stock = ?, reorder_point = ?, price = ?, barcode = ?
                  WHERE code = ?
                `).run(row.name, categoryId, uom.id, parseInt(row.min_stock) || 0, parseInt(row.reorder_point) || 0, parseFloat(row.price) || 0, row.barcode || null, row.code)
              } else {
                // Insert
                db.prepare(`
                  INSERT INTO items (code, name, category_id, uom_id, min_stock, reorder_point, price, barcode, is_active)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(row.code, row.name, categoryId, uom.id, parseInt(row.min_stock) || 0, parseInt(row.reorder_point) || 0, parseFloat(row.price) || 0, row.barcode || null, row.is_active !== '0' ? 1 : 0)
              }
              imported++
            } catch (err: any) {
              errors.push(`Row ${i + 1}: ${err.message}`)
            }
          }
          break
        }

        case 'categories': {
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i]
              if (!row.name) throw new Error('Missing name')
              db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(row.name, row.description || null)
              imported++
            } catch (err: any) {
              errors.push(`Row ${i + 1}: ${err.message}`)
            }
          }
          break
        }

        case 'suppliers': {
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i]
              if (!row.code || !row.name) throw new Error('Missing code or name')

              const existing = db.prepare('SELECT id FROM suppliers WHERE code = ?').get(row.code)
              if (existing) {
                db.prepare(`
                  UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, is_active = ?
                  WHERE code = ?
                `).run(row.name, row.contact_person || null, row.email || null, row.phone || null, row.address || null, row.is_active !== '0' ? 1 : 0, row.code)
              } else {
                db.prepare(`
                  INSERT INTO suppliers (code, name, contact_person, email, phone, address, is_active)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(row.code, row.name, row.contact_person || null, row.email || null, row.phone || null, row.address || null, row.is_active !== '0' ? 1 : 0)
              }
              imported++
            } catch (err: any) {
              errors.push(`Row ${i + 1}: ${err.message}`)
            }
          }
          break
        }

        case 'uoms': {
          for (let i = 0; i < data.length; i++) {
            try {
              const row = data[i]
              if (!row.name || !row.symbol) throw new Error('Missing name or symbol')
              db.prepare('INSERT INTO uoms (name, symbol) VALUES (?, ?)').run(row.name, row.symbol)
              imported++
            } catch (err: any) {
              errors.push(`Row ${i + 1}: ${err.message}`)
            }
          }
          break
        }

        default:
          throw new Error('Invalid import type')
      }
    })

    transaction()
    db.close()

    return c.json({
      success: true,
      message: `Imported ${imported} of ${data.length} rows`,
      data: { imported, total: data.length, errors: errors.length > 0 ? errors : undefined },
    })

  } catch (error) {
    console.error('Import error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// GET template CSV for a type
importExportRoutes.get('/template/:type', async (c) => {
  try {
    const payload = getAuthPayload(c)
    if (!payload) return c.json({ success: false, message: 'Unauthorized' }, 401)

    const type = c.req.param('type')
    let template = ''

    switch (type) {
      case 'items':
        template = 'code,name,category,uom,min_stock,reorder_point,price,barcode,is_active\nITEM001,Item Name,Category Name,pc,0,10,15000,,1'
        break
      case 'categories':
        template = 'name,description\nElectronics,Electronic items and accessories'
        break
      case 'suppliers':
        template = 'code,name,contact_person,email,phone,address,is_active\nSUP001,Supplier Name,John Doe,email@example.com,0812,,1'
        break
      case 'warehouses':
        template = 'code,name,address,type,is_active\nWH001,Main Warehouse,Jl. Raya No.1,main,1'
        break
      case 'uoms':
        template = 'name,symbol\nPiece,pc\nKilogram,kg'
        break
      default:
        return c.json({ success: false, message: 'Invalid template type' }, 400)
    }

    return c.newResponse(template, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_template.csv"`,
      },
    })
  } catch (error) {
    console.error('Template error:', error)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

export default importExportRoutes