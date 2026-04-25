import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core'
import { roles } from './roles.js'

export const permissions = mysqlTable('permissions', {
  id: int('id').primaryKey().autoincrement(),
  roleId: int('role_id').notNull().references(() => roles.id),
  module: varchar('module', { length: 50 }).notNull(),   // e.g. 'items', 'procurement'
  action: varchar('action', { length: 50 }).notNull(),   // e.g. 'read', 'create', 'approve'
})
