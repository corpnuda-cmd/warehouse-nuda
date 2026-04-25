import { mysqlTable, varchar, timestamp, text, mysqlEnum, decimal } from 'drizzle-orm/mysql-core'
import { users } from './users.js'
import { items } from './items.js'
import { warehouses } from './warehouses.js'

export const issueRequests = mysqlTable('issue_requests', {
  id: varchar('id', { length: 36 }).primaryKey(),
  irNumber: varchar('ir_number', { length: 30 }).notNull().unique(),
  requestedBy: varchar('requested_by', { length: 36 }).notNull().references(() => users.id),
  approvedBy: varchar('approved_by', { length: 36 }).references(() => users.id),
  warehouseId: varchar('warehouse_id', { length: 36 }).references(() => warehouses.id),
  status: mysqlEnum('status', ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']).notNull().default('DRAFT'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const issueRequestItems = mysqlTable('issue_request_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  irId: varchar('ir_id', { length: 36 }).notNull().references(() => issueRequests.id),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  qty: decimal('qty', { precision: 15, scale: 3 }).notNull(),
  notes: text('notes'),
})
