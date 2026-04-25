import { mysqlTable, varchar, timestamp, int } from 'drizzle-orm/mysql-core'
import { racks } from './racks.js'

export const bins = mysqlTable('bins', {
  id: varchar('id', { length: 36 }).primaryKey(),
  rackId: varchar('rack_id', { length: 36 }).notNull().references(() => racks.id),
  code: varchar('code', { length: 50 }).notNull(),
  capacity: int('capacity'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
