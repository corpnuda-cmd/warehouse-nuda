import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../../database/schema/sqlite'

// Database configuration
const DB_PATH = process.env.DB_PATH || './warehouse_nuda.db'

// Create SQLite connection
const sqlite = new Database(DB_PATH)

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

// Create Drizzle instance
export const db = drizzle(sqlite, { schema })

export default db