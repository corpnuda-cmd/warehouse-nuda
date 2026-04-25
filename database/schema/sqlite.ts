import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// Users Table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('store_user'), // super_admin, admin, purchasing, gudang, store_user, finance, auditor
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Roles Table
export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Categories Table
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  parentId: integer('parent_id'),
  description: text('description'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// UoM Table
export const uoms = sqliteTable('uoms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  symbol: text('symbol').notNull().unique(),
  createdAt: text('created_at').default(new Date().toISOString()),
})

// Suppliers Table
export const suppliers = sqliteTable('suppliers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Warehouses Table
export const warehouses = sqliteTable('warehouses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  address: text('address'),
  type: text('type').notNull().default('distribution'), // main, distribution, store
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Racks Table
export const racks = sqliteTable('racks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  warehouseId: integer('warehouse_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').default(new Date().toISOString()),
})

// Bins Table
export const bins = sqliteTable('bins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  rackId: integer('rack_id').notNull(),
  code: text('code').notNull(),
  capacity: integer('capacity').default(100),
  createdAt: text('created_at').default(new Date().toISOString()),
})

// Items Table
export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  categoryId: integer('category_id'),
  uomId: integer('uom_id').notNull(),
  minStock: integer('min_stock').default(0),
  reorderPoint: integer('reorder_point').default(0),
  price: real('price').default(0),
  barcode: text('barcode'),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Vendor Price List Table
export const vendorPriceList = sqliteTable('vendor_price_list', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  supplierId: integer('supplier_id').notNull(),
  itemId: integer('item_id').notNull(),
  price: real('price').notNull(),
  validFrom: text('valid_from'),
  validTo: text('valid_to'),
  createdAt: text('created_at').default(new Date().toISOString()),
})

// Stocks Table
export const stocks = sqliteTable('stocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id').notNull(),
  warehouseId: integer('warehouse_id').notNull(),
  binId: integer('bin_id'),
  qtyAvailable: integer('qty_available').notNull().default(0),
  qtyReserved: integer('qty_reserved').notNull().default(0),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Stock Movements Table
export const stockMovements = sqliteTable('stock_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id').notNull(),
  warehouseId: integer('warehouse_id').notNull(),
  type: text('type').notNull(), // IN, OUT, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, RESERVATION, RELEASE
  qty: integer('qty').notNull(),
  referenceId: integer('reference_id'),
  referenceType: text('reference_type'),
  notes: text('notes'),
  createdBy: integer('created_by'),
  createdAt: text('created_at').default(new Date().toISOString()),
})

// Purchase Requests Table
export const purchaseRequests = sqliteTable('purchase_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  prNumber: text('pr_number').notNull().unique(),
  requestedBy: integer('requested_by').notNull(),
  warehouseId: integer('warehouse_id'),
  status: text('status').notNull().default('draft'), // draft, pending, approved, rejected, closed
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Purchase Request Items Table
export const purchaseRequestItems = sqliteTable('purchase_request_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  prId: integer('pr_id').notNull(),
  itemId: integer('item_id').notNull(),
  qty: integer('qty').notNull(),
  notes: text('notes'),
})

// Purchase Orders Table
export const purchaseOrders = sqliteTable('purchase_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  poNumber: text('po_number').notNull().unique(),
  prId: integer('pr_id'),
  supplierId: integer('supplier_id').notNull(),
  status: text('status').notNull().default('draft'),
  total: real('total').default(0),
  notes: text('notes'),
  expectedDeliveryDate: text('expected_delivery_date'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Purchase Order Items Table
export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  poId: integer('po_id').notNull(),
  itemId: integer('item_id').notNull(),
  qty: integer('qty').notNull(),
  price: real('price').notNull(),
  subtotal: real('subtotal').notNull(),
})

// Goods Receipts Table
export const goodsReceipts = sqliteTable('goods_receipts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  grNumber: text('gr_number').notNull().unique(),
  poId: integer('po_id'),
  receivedBy: integer('received_by').notNull(),
  qcStatus: text('qc_status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Goods Receipt Items Table
export const goodsReceiptItems = sqliteTable('goods_receipt_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  grId: integer('gr_id').notNull(),
  itemId: integer('item_id').notNull(),
  qtyReceived: integer('qty_received').notNull(),
  qtyAccepted: integer('qty_accepted').notNull(),
  qtyRejected: integer('qty_rejected').notNull().default(0),
  notes: text('notes'),
})

// Issue Requests Table
export const issueRequests = sqliteTable('issue_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  irNumber: text('ir_number').notNull().unique(),
  requestedBy: integer('requested_by').notNull(),
  warehouseId: integer('warehouse_id').notNull(),
  status: text('status').notNull().default('draft'),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Issue Request Items Table
export const issueRequestItems = sqliteTable('issue_request_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  irId: integer('ir_id').notNull(),
  itemId: integer('item_id').notNull(),
  qty: integer('qty').notNull(),
})

// Goods Issues Table
export const goodsIssues = sqliteTable('goods_issues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  giNumber: text('gi_number').notNull().unique(),
  irId: integer('ir_id'),
  issuedBy: integer('issued_by').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()),
})

// Goods Issue Items Table
export const goodsIssueItems = sqliteTable('goods_issue_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  giId: integer('gi_id').notNull(),
  itemId: integer('item_id').notNull(),
  qty: integer('qty').notNull(),
})

// Transfers Table
export const transfers = sqliteTable('transfers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  transferNumber: text('transfer_number').notNull().unique(),
  fromWarehouseId: integer('from_warehouse_id').notNull(),
  toWarehouseId: integer('to_warehouse_id').notNull(),
  status: text('status').notNull().default('draft'),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Transfer Items Table
export const transferItems = sqliteTable('transfer_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  transferId: integer('transfer_id').notNull(),
  itemId: integer('item_id').notNull(),
  qty: integer('qty').notNull(),
})

// Stock Opnames Table
export const stockOpnames = sqliteTable('stock_opnames', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  soNumber: text('so_number').notNull().unique(),
  warehouseId: integer('warehouse_id').notNull(),
  planDate: text('plan_date').notNull(),
  status: text('status').notNull().default('planned'),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Stock Opname Items Table
export const stockOpnameItems = sqliteTable('stock_opname_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  soId: integer('so_id').notNull(),
  itemId: integer('item_id').notNull(),
  qtySystem: integer('qty_system').notNull(),
  qtyActual: integer('qty_actual'),
  variance: integer('variance'),
  notes: text('notes'),
})

// Returns Table
export const returns = sqliteTable('returns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  returnNumber: text('return_number').notNull().unique(),
  type: text('type').notNull(), // supplier, customer
  referenceId: integer('reference_id'),
  referenceType: text('reference_type'),
  status: text('status').notNull().default('draft'),
  reason: text('reason'),
  notes: text('notes'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
})

// Return Items Table
export const returnItems = sqliteTable('return_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  returnId: integer('return_id').notNull(),
  itemId: integer('item_id').notNull(),
  qty: integer('qty').notNull(),
  reason: text('reason'),
})

// Audit Logs Table
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  action: text('action').notNull(),
  module: text('module').notNull(),
  referenceId: integer('reference_id'),
  oldData: text('old_data'),
  newData: text('new_data'),
  ip: text('ip'),
  createdAt: text('created_at').default(new Date().toISOString()),
})

// Export all schema
export const schema = {
  users,
  roles,
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