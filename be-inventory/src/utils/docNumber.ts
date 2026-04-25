// Generator nomor dokumen otomatis
// Format: PREFIX-YYYYMMDD-XXXX (misal: PR-20260425-0001)

import { db } from '../config/db.js'
import { sql } from 'drizzle-orm'

function getTodayStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

export async function generateDocNumber(
  prefix: string,
  tableName: string,
  numberColumn: string
): Promise<string> {
  const today = getTodayStr()
  const pattern = `${prefix}-${today}-%`

  // Ambil nomor terakhir hari ini dari tabel yg bersangkutan
  const result = await db.execute(
    sql`SELECT ${sql.identifier(numberColumn)} FROM ${sql.identifier(tableName)}
        WHERE ${sql.identifier(numberColumn)} LIKE ${pattern}
        ORDER BY ${sql.identifier(numberColumn)} DESC
        LIMIT 1`
  )

  const rows = result[0] as Array<Record<string, string>>
  let sequence = 1

  if (rows.length > 0) {
    const lastNum = rows[0][numberColumn]
    const lastSeq = parseInt(lastNum.split('-')[2] ?? '0', 10)
    sequence = lastSeq + 1
  }

  return `${prefix}-${today}-${String(sequence).padStart(4, '0')}`
}
