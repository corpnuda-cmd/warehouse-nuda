import { mysqlTable, varchar, timestamp, text, mysqlEnum, decimal, date } from 'drizzle-orm/mysql-core'
import { warehouses } from './warehouses.js'
import { users } from './users.js'
import { items } from './items.js'

export const stockOpnames = mysqlTable('stock_opnames', {
  id: varchar('id', { length: 36 }).primaryKey(),
  soNumber: varchar('so_number', { length: 30 }).notNull().unique(),
  warehouseId: varchar('warehouse_id', { length: 36 }).notNull().references(() => warehouses.id),
  planDate: date('plan_date').notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdBy: varchar('created_by', { length: 36 }).notNull().references(() => users.id),
  approvedBy: varchar('approved_by', { length: 36 }).references(() => users.id),
  status: mysqlEnum('status', ['PLANNED', 'IN_PROGRESS', 'RECONCILING', 'COMPLETED', 'CANCELLED']).notNull().default('PLANNED'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const stockOpnameItems = mysqlTable('stock_opname_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  soId: varchar('so_id', { length: 36 }).notNull().references(() => stockOpnames.id),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  qtySystem: decimal('qty_system', { precision: 15, scale: 3 }).notNull().default('0'),
  qtyActual: decimal('qty_actual', { precision: 15, scale: 3 }),
  variance: decimal('variance', { precision: 15, scale: 3 }),
  notes: text('notes'),
})
