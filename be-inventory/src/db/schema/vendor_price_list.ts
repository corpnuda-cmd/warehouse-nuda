import { mysqlTable, varchar, timestamp, decimal, date, int } from 'drizzle-orm/mysql-core'
import { suppliers } from './suppliers.js'
import { items } from './items.js'

export const vendorPriceList = mysqlTable('vendor_price_list', {
  id: varchar('id', { length: 36 }).primaryKey(),
  supplierId: varchar('supplier_id', { length: 36 }).notNull().references(() => suppliers.id),
  itemId: varchar('item_id', { length: 36 }).notNull().references(() => items.id),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  validFrom: date('valid_from').notNull(),
  validTo: date('valid_to'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
