import { mysqlTable, varchar, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core'

export const warehouses = mysqlTable('warehouses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  address: varchar('address', { length: 500 }),
  type: mysqlEnum('type', ['warehouse', 'store', 'transit']).notNull().default('warehouse'),
  isActive: int('is_active').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})
