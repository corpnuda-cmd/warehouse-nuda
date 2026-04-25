import { mysqlTable, varchar, timestamp, text, mysqlEnum, decimal } from 'drizzle-orm/mysql-core'
import { purchaseRequests } from './purchase_requests.js'
import { suppliers } from './suppliers.js'
import { users } from './users.js'
import { items } from './items.js'

export const purchaseOrders = mysqlTable('purchase_orders', {
  id: varchar('id', { length: 36 }).primaryKey(),
  poNumber: varchar('po_number', { length: 30 }).notNull().unique(),
  prId: varchar('pr_id', { length: 36 }).references(() => purchaseRequests.id),
  supplierId: varchar('supplier_id', { length: 36 }).notNull().references(() => suppliers.id),
  createdBy: varchar('created_by', { length: 36 }).notNull().references(() => users.id),
  status: mysqlEnum('status', ['DRAFT', 'CONFIRMED', 'PARTIAL', 'COMPLETED', 'CANCELLED']).notNull().default('DRAFT'),
  total: decimal('total', { precision: 15, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const purchaseOrderItems = mysqlTable('purchase_order_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  poId: varchar('po_id', { length: 36 }).notNull().references(() => purchaseOrders.id),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  qty: decimal('qty', { precision: 15, scale: 3 }).notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
})
