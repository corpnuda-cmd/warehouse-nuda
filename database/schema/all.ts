import { mysqlTable, serial, varchar, timestamp, int, decimal, text, boolean, mysqlEnum } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

// Users Table
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: mysqlEnum('role', ['super_admin', 'admin', 'purchasing', 'gudang', 'store_user', 'finance', 'auditor']).notNull().default('store_user'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Categories Table
export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  parentId: int('parent_id'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// UoM (Unit of Measure) Table
export const uoms = mysqlTable('uoms', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Suppliers Table
export const suppliers = mysqlTable('suppliers', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  email: varchar('email', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Warehouses Table
export const warehouses = mysqlTable('warehouses', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address'),
  type: mysqlEnum('type', ['main', 'distribution', 'store']).notNull().default('distribution'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Racks Table
export const racks = mysqlTable('racks', {
  id: serial('id').primaryKey(),
  warehouseId: int('warehouse_id').notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Bins Table
export const bins = mysqlTable('bins', {
  id: serial('id').primaryKey(),
  rackId: int('rack_id').notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  capacity: int('capacity').default(100),
  createdAt: timestamp('created_at').defaultNow(),
})

// Items Table
export const items = mysqlTable('items', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  categoryId: int('category_id'),
  uomId: int('uom_id').notNull(),
  minStock: int('min_stock').default(0),
  reorderPoint: int('reorder_point').default(0),
  price: decimal('price', { precision: 15, scale: 2 }).default('0'),
  barcode: varchar('barcode', { length: 50 }),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Vendor Price List Table
export const vendorPriceList = mysqlTable('vendor_price_list', {
  id: serial('id').primaryKey(),
  supplierId: int('supplier_id').notNull(),
  itemId: int('item_id').notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  validFrom: timestamp('valid_from'),
  validTo: timestamp('valid_to'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Stocks Table
export const stocks = mysqlTable('stocks', {
  id: serial('id').primaryKey(),
  itemId: int('item_id').notNull(),
  warehouseId: int('warehouse_id').notNull(),
  binId: int('bin_id'),
  qtyAvailable: int('qty_available').notNull().default(0),
  qtyReserved: int('qty_reserved').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Stock Movements Table
export const stockMovements = mysqlTable('stock_movements', {
  id: serial('id').primaryKey(),
  itemId: int('item_id').notNull(),
  warehouseId: int('warehouse_id').notNull(),
  type: mysqlEnum('type', ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVATION', 'RELEASE']).notNull(),
  qty: int('qty').notNull(),
  referenceId: int('reference_id'),
  referenceType: varchar('reference_type', { length: 50 }),
  notes: text('notes'),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Purchase Requests Table
export const purchaseRequests = mysqlTable('purchase_requests', {
  id: serial('id').primaryKey(),
  prNumber: varchar('pr_number', { length: 30 }).notNull().unique(),
  requestedBy: int('requested_by').notNull(),
  warehouseId: int('warehouse_id'),
  status: mysqlEnum('status', ['draft', 'pending', 'approved', 'rejected', 'closed']).notNull().default('draft'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Purchase Request Items Table
export const purchaseRequestItems = mysqlTable('purchase_request_items', {
  id: serial('id').primaryKey(),
  prId: int('pr_id').notNull(),
  itemId: int('item_id').notNull(),
  qty: int('qty').notNull(),
  notes: text('notes'),
})

// Purchase Orders Table
export const purchaseOrders = mysqlTable('purchase_orders', {
  id: serial('id').primaryKey(),
  poNumber: varchar('po_number', { length: 30 }).notNull().unique(),
  prId: int('pr_id'),
  supplierId: int('supplier_id').notNull(),
  status: mysqlEnum('status', ['draft', 'pending', 'approved', 'sent', 'partial_received', 'received', 'rejected', 'closed']).notNull().default('draft'),
  total: decimal('total', { precision: 15, scale: 2 }).default('0'),
  notes: text('notes'),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Purchase Order Items Table
export const purchaseOrderItems = mysqlTable('purchase_order_items', {
  id: serial('id').primaryKey(),
  poId: int('po_id').notNull(),
  itemId: int('item_id').notNull(),
  qty: int('qty').notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
})

// Goods Receipts Table
export const goodsReceipts = mysqlTable('goods_receipts', {
  id: serial('id').primaryKey(),
  grNumber: varchar('gr_number', { length: 30 }).notNull().unique(),
  poId: int('po_id'),
  receivedBy: int('received_by').notNull(),
  qcStatus: mysqlEnum('qc_status', ['pending', 'passed', 'failed', 'partial']).notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Goods Receipt Items Table
export const goodsReceiptItems = mysqlTable('goods_receipt_items', {
  id: serial('id').primaryKey(),
  grId: int('gr_id').notNull(),
  itemId: int('item_id').notNull(),
  qtyReceived: int('qty_received').notNull(),
  qtyAccepted: int('qty_accepted').notNull(),
  qtyRejected: int('qty_rejected').notNull().default(0),
  notes: text('notes'),
})

// Issue Requests Table
export const issueRequests = mysqlTable('issue_requests', {
  id: serial('id').primaryKey(),
  irNumber: varchar('ir_number', { length: 30 }).notNull().unique(),
  requestedBy: int('requested_by').notNull(),
  warehouseId: int('warehouse_id').notNull(),
  status: mysqlEnum('status', ['draft', 'pending', 'approved', 'rejected', 'fulfilled', 'cancelled']).notNull().default('draft'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Issue Request Items Table
export const issueRequestItems = mysqlTable('issue_request_items', {
  id: serial('id').primaryKey(),
  irId: int('ir_id').notNull(),
  itemId: int('item_id').notNull(),
  qty: int('qty').notNull(),
})

// Goods Issues Table
export const goodsIssues = mysqlTable('goods_issues', {
  id: serial('id').primaryKey(),
  giNumber: varchar('gi_number', { length: 30 }).notNull().unique(),
  irId: int('ir_id'),
  issuedBy: int('issued_by').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Goods Issue Items Table
export const goodsIssueItems = mysqlTable('goods_issue_items', {
  id: serial('id').primaryKey(),
  giId: int('gi_id').notNull(),
  itemId: int('item_id').notNull(),
  qty: int('qty').notNull(),
})

// Transfers Table
export const transfers = mysqlTable('transfers', {
  id: serial('id').primaryKey(),
  transferNumber: varchar('transfer_number', { length: 30 }).notNull().unique(),
  fromWarehouseId: int('from_warehouse_id').notNull(),
  toWarehouseId: int('to_warehouse_id').notNull(),
  status: mysqlEnum('status', ['draft', 'pending', 'approved', 'shipped', 'received', 'rejected', 'cancelled']).notNull().default('draft'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Transfer Items Table
export const transferItems = mysqlTable('transfer_items', {
  id: serial('id').primaryKey(),
  transferId: int('transfer_id').notNull(),
  itemId: int('item_id').notNull(),
  qty: int('qty').notNull(),
})

// Stock Opnames Table
export const stockOpnames = mysqlTable('stock_opnames', {
  id: serial('id').primaryKey(),
  soNumber: varchar('so_number', { length: 30 }).notNull().unique(),
  warehouseId: int('warehouse_id').notNull(),
  planDate: timestamp('plan_date').notNull(),
  status: mysqlEnum('status', ['planned', 'in_progress', 'completed', 'cancelled']).notNull().default('planned'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Stock Opname Items Table
export const stockOpnameItems = mysqlTable('stock_opname_items', {
  id: serial('id').primaryKey(),
  soId: int('so_id').notNull(),
  itemId: int('item_id').notNull(),
  qtySystem: int('qty_system').notNull(),
  qtyActual: int('qty_actual'),
  variance: int('variance'),
  notes: text('notes'),
})

// Returns Table
export const returns = mysqlTable('returns', {
  id: serial('id').primaryKey(),
  returnNumber: varchar('return_number', { length: 30 }).notNull().unique(),
  type: mysqlEnum('type', ['supplier', 'customer']).notNull(),
  referenceId: int('reference_id'),
  referenceType: varchar('reference_type', { length: 50 }),
  status: mysqlEnum('status', ['draft', 'pending', 'approved', 'rejected', 'completed']).notNull().default('draft'),
  reason: text('reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// Return Items Table
export const returnItems = mysqlTable('return_items', {
  id: serial('id').primaryKey(),
  returnId: int('return_id').notNull(),
  itemId: int('item_id').notNull(),
  qty: int('qty').notNull(),
  reason: text('reason'),
})

// Audit Logs Table
export const auditLogs = mysqlTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: int('user_id'),
  action: varchar('action', { length: 50 }).notNull(),
  module: varchar('module', { length: 50 }).notNull(),
  referenceId: int('reference_id'),
  oldData: text('old_data'),
  newData: text('new_data'),
  ip: varchar('ip', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow(),
})

// Export all schema
export const schema = {
  users,
  categories,
  uoms,
  suppliers,
  warehouses,
  racks,
  bins,
  items,
  vendorPriceList,
  stocks,
  stockMovements,
  purchaseRequests,
  purchaseRequestItems,
  purchaseOrders,
  purchaseOrderItems,
  goodsReceipts,
  goodsReceiptItems,
  issueRequests,
  issueRequestItems,
  goodsIssues,
  goodsIssueItems,
  transfers,
  transferItems,
  stockOpnames,
  stockOpnameItems,
  returns,
  returnItems,
  auditLogs,
}