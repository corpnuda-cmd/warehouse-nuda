import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database path - go up to project root
const DB_PATH = join(__dirname, '../../../warehouse_nuda.db')

console.log('Creating SQLite database...')
console.log('Database path:', DB_PATH)

// Create database
const db = new Database(DB_PATH)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Read and execute schema
console.log('Creating tables...')
const schema = readFileSync(join(__dirname, '../../../database/migrations/001_schema.sqlite.sql'), 'utf-8')

// Split by semicolons and execute each statement
const statements = schema.split(';').filter(s => s.trim())
for (const statement of statements) {
  if (statement.trim()) {
    try {
      db.exec(statement)
    } catch (e: any) {
      if (!e.message.includes('already exists')) {
        console.log('Statement:', statement.substring(0, 100))
        console.error('Error:', e.message)
      }
    }
  }
}

console.log('Tables created successfully!')

// Read and execute seed data
console.log('Inserting seed data...')
let seedData = readFileSync(join(__dirname, '../../../database/seeds/001_initial_data.sqlite.sql'), 'utf-8')

const seedStatements = seedData.split(';').filter(s => s.trim())
for (const statement of seedStatements) {
  if (statement.trim()) {
    try {
      db.exec(statement)
    } catch (e: any) {
      if (!e.message.includes('UNIQUE constraint failed')) {
        console.log('Statement:', statement.substring(0, 100))
        console.error('Error:', e.message)
      }
    }
  }
}

console.log('Seed data inserted!')

// Verify data
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number }
const warehouseCount = db.prepare('SELECT COUNT(*) as count FROM warehouses').get() as { count: number }

console.log('\n=== Database Created Successfully! ===')
console.log(`Users: ${userCount.count}`)
console.log(`Items: ${itemCount.count}`)
console.log(`Warehouses: ${warehouseCount.count}`)
console.log(`Database: ${DB_PATH}`)

db.close()