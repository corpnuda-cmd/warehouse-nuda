import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const suppliers = mysqlTable('suppliers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  contact: varchar('contact', { length: 100 }),
  address: varchar('address', { length: 500 }),
  email: varchar('email', { length: 100 }),
  phone: varchar('phone', { length: 30 }),
  isActive: int('is_active').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})
