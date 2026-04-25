import { mysqlTable, varchar, timestamp, text, mysqlEnum, decimal } from 'drizzle-orm/mysql-core'
import { issueRequests } from './issue_requests.js'
import { users } from './users.js'
import { items } from './items.js'

export const goodsIssues = mysqlTable('goods_issues', {
  id: varchar('id', { length: 36 }).primaryKey(),
  giNumber: varchar('gi_number', { length: 30 }).notNull().unique(),
  irId: varchar('ir_id', { length: 36 }).references(() => issueRequests.id),
  issuedBy: varchar('issued_by', { length: 36 }).notNull().references(() => users.id),
  status: mysqlEnum('status', ['DRAFT', 'COMPLETED', 'CANCELLED']).notNull().default('DRAFT'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const goodsIssueItems = mysqlTable('goods_issue_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  giId: varchar('gi_id', { length: 36 }).notNull().references(() => goodsIssues.id),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  qty: decimal('qty', { precision: 15, scale: 3 }).notNull(),
})
