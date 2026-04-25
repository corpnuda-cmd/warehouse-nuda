import { mysqlTable, varchar, timestamp, text, mysqlEnum, decimal } from 'drizzle-orm/mysql-core'
import { users } from './users.js'
import { items } from './items.js'

export const returns = mysqlTable('returns', {
  id: varchar('id', { length: 36 }).primaryKey(),
  returnNumber: varchar('return_number', { length: 30 }).notNull().unique(),
  type: mysqlEnum('type', ['TO_SUPPLIER', 'FROM_CUSTOMER']).notNull(),
  referenceId: varchar('reference_id', { length: 36 }),   // GR id or GI id
  referenceType: varchar('reference_type', { length: 20 }), // 'GR' | 'GI'
  createdBy: varchar('created_by', { length: 36 }).notNull().references(() => users.id),
  approvedBy: varchar('approved_by', { length: 36 }).references(() => users.id),
  status: mysqlEnum('status', ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).notNull().default('DRAFT'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const returnItems = mysqlTable('return_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  returnId: varchar('return_id', { length: 36 }).notNull().references(() => returns.id),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  qty: decimal('qty', { precision: 15, scale: 3 }).notNull(),
  reason: text('reason'),
})
