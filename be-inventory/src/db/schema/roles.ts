import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core'

export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
})

// Default roles seed data
export const DEFAULT_ROLES = [
  { id: 1, name: 'super_admin', description: 'Full access to all modules and system settings' },
  { id: 2, name: 'admin', description: 'User management, master data, approval' },
  { id: 3, name: 'purchasing', description: 'PR, PO, Vendor management' },
  { id: 4, name: 'gudang', description: 'Receiving, issuing, transfer, stock opname' },
  { id: 5, name: 'store_user', description: 'Request items, receive transfers' },
  { id: 6, name: 'finance', description: 'Financial reports, purchasing reports' },
  { id: 7, name: 'auditor', description: 'Read-only access to audit trails and reports' },
] as const
