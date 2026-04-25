import { mysqlTable, varchar, int, decimal, timestamp } from 'drizzle-orm/mysql-core'
import { categories } from './categories.js'
import { uoms } from './uoms.js'

export const items = mysqlTable('items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  categoryId: varchar('category_id', { length: 36 }).references(() => categories.id),
  uomId: varchar('uom_id', { length: 36 }).references(() => uoms.id),
  minStock: decimal('min_stock', { precision: 15, scale: 3 }).notNull().default('0'),
  reorderPoint: decimal('reorder_point', { precision: 15, scale: 3 }).notNull().default('0'),
  price: decimal('price', { precision: 15, scale: 2 }).notNull().default('0'),
  description: varchar('description', { length: 500 }),
  isActive: int('is_active').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})
