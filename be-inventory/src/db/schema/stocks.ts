import { mysqlTable, varchar, timestamp, decimal } from 'drizzle-orm/mysql-core'
import { items } from './items.js'
import { warehouses } from './warehouses.js'
import { bins } from './bins.js'

export const stocks = mysqlTable('stocks', {
  id: varchar('id', { length: 36 }).primaryKey(),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  warehouseId: varchar('warehouse_id', { length: 36 }).notNull().references(() => warehouses.id),
  binId: varchar('bin_id', { length: 36 }).references(() => bins.id),
  qtyAvailable: decimal('qty_available', { precision: 15, scale: 3 }).notNull().default('0'),
  qtyReserved: decimal('qty_reserved', { precision: 15, scale: 3 }).notNull().default('0'),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})
