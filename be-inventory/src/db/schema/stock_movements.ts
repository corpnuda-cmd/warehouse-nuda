import { mysqlTable, varchar, timestamp, decimal, mysqlEnum, text } from 'drizzle-orm/mysql-core'
import { items } from './items.js'
import { warehouses } from './warehouses.js'
import { users } from './users.js'

export const stockMovements = mysqlTable('stock_movements', {
  id: varchar('id', { length: 36 }).primaryKey(),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  warehouseId: varchar('warehouse_id', { length: 36 }).notNull().references(() => warehouses.id),
  type: mysqlEnum('type', ['IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'OPNAME']).notNull(),
  qty: decimal('qty', { precision: 15, scale: 3 }).notNull(),
  referenceId: varchar('reference_id', { length: 36 }),      // GR id / GI id / Transfer id dsb
  referenceType: varchar('reference_type', { length: 30 }),  // 'GR' | 'GI' | 'TRANSFER' | 'OPNAME'
  notes: text('notes'),
  createdBy: varchar('created_by', { length: 36 }).references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
