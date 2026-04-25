import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const uoms = mysqlTable('uoms', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
