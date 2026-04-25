import { mysqlTable, varchar, timestamp, text, mysqlEnum, decimal } from 'drizzle-orm/mysql-core'
import { purchaseOrders } from './purchase_orders.js'
import { users } from './users.js'
import { items } from './items.js'

export const goodsReceipts = mysqlTable('goods_receipts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  grNumber: varchar('gr_number', { length: 30 }).notNull().unique(),
  poId: varchar('po_id', { length: 36 }).references(() => purchaseOrders.id),
  receivedBy: varchar('received_by', { length: 36 }).notNull().references(() => users.id),
  qcStatus: mysqlEnum('qc_status', ['PENDING', 'PASSED', 'PARTIAL', 'FAILED']).notNull().default('PENDING'),
  status: mysqlEnum('status', ['DRAFT', 'QC_PENDING', 'COMPLETED', 'CANCELLED']).notNull().default('DRAFT'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const goodsReceiptItems = mysqlTable('goods_receipt_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  grId: varchar('gr_id', { length: 36 }).notNull().references(() => goodsReceipts.id),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  qtyReceived: decimal('qty_received', { precision: 15, scale: 3 }).notNull(),
  qtyAccepted: decimal('qty_accepted', { precision: 15, scale: 3 }).notNull().default('0'),
  qtyRejected: decimal('qty_rejected', { precision: 15, scale: 3 }).notNull().default('0'),
  rejectionReason: text('rejection_reason'),
})
