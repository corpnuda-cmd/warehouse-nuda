import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  parentId: varchar('parent_id', { length: 36 }),  // self-reference untuk hierarki
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})
