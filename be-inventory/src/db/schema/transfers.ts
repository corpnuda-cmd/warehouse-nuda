import { mysqlTable, varchar, timestamp, text, mysqlEnum, decimal } from 'drizzle-orm/mysql-core'
import { warehouses } from './warehouses.js'
import { users } from './users.js'
import { items } from './items.js'

export const transfers = mysqlTable('transfers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  transferNumber: varchar('transfer_number', { length: 30 }).notNull().unique(),
  fromWarehouseId: varchar('from_warehouse_id', { length: 36 }).notNull().references(() => warehouses.id),
  toWarehouseId: varchar('to_warehouse_id', { length: 36 }).notNull().references(() => warehouses.id),
  requestedBy: varchar('requested_by', { length: 36 }).notNull().references(() => users.id),
  approvedBy: varchar('approved_by', { length: 36 }).references(() => users.id),
  status: mysqlEnum('status', ['DRAFT', 'PENDING', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED']).notNull().default('DRAFT'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const transferItems = mysqlTable('transfer_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  transferId: varchar('transfer_id', { length: 36 }).notNull().references(() => transfers.id),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  qty: decimal('qty', { precision: 15, scale: 3 }).notNull(),
})
