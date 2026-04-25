import { mysqlTable, varchar, timestamp, int } from 'drizzle-orm/mysql-core'
import { warehouses } from './warehouses.js'

export const racks = mysqlTable('racks', {
  id: varchar('id', { length: 36 }).primaryKey(),
  warehouseId: varchar('warehouse_id', { length: 36 }).notNull().references(() => warehouses.id),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
