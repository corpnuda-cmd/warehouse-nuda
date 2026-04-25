import { mysqlTable, varchar, timestamp, text } from 'drizzle-orm/mysql-core'
import { users } from './users.js'

export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id),
  action: varchar('action', { length: 30 }).notNull(),       // CREATE, UPDATE, DELETE, LOGIN, dsb
  module: varchar('module', { length: 50 }).notNull(),       // AUTH, ITEMS, PROCUREMENT, dsb
  referenceId: varchar('reference_id', { length: 36 }),
  oldData: text('old_data'),   // JSON string
  newData: text('new_data'),   // JSON string
  ip: varchar('ip', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
