-- ============================================================
-- Warehouse Management System - Seed Data
-- MySQL Version
-- Created: 2026-04-26
-- ============================================================

USE warehouse_nuda;

-- ============================================================
-- INSERT ROLES
-- ============================================================
INSERT INTO roles (name, description) VALUES
('super_admin', 'Full access to all modules and system settings'),
('admin', 'User management, master data, approvals'),
('purchasing', 'Purchase requests, purchase orders, vendor management'),
('gudang', 'Receiving, issuing, transfer, stock opname'),
('store_user', 'Request items, receive transfers'),
('finance', 'Financial reports, purchase reports'),
('auditor', 'Read-only access for audit trail and reports');

-- ============================================================
-- INSERT USERS (Password: admin123 for admin, user123 for others)
-- ============================================================
-- Using bcrypt hashed passwords
-- admin123 = $2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q
INSERT INTO users (username, email, password, name, role, is_active) VALUES
('admin', 'admin@warehouse.com', '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q', 'Administrator', 'super_admin', TRUE),
('manager', 'manager@warehouse.com', '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q', 'Manager Gudang', 'admin', TRUE),
('purchasing', 'purchasing@warehouse.com', '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q', 'Staff Purchasing', 'purchasing', TRUE),
('gudang', 'gudang@warehouse.com', '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q', 'Staff Gudang', 'gudang', TRUE),
('store01', 'store01@warehouse.com', '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q', 'Store Jakarta', 'store_user', TRUE),
('finance', 'finance@warehouse.com', '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q', 'Staff Finance', 'finance', TRUE),
('auditor', 'auditor@warehouse.com', '$2a$10$8K1p/a0dL3.HKwHkqhIW4u7ELKPLs6eEHqKr2jB7LRxYqH.aNqm2q', 'Internal Auditor', 'auditor', TRUE);

-- ============================================================
-- INSERT UOM (Unit of Measure)
-- ============================================================
INSERT INTO uoms (name, symbol) VALUES
('Piece', 'pcs'),
('Box', 'box'),
('Pack', 'pack'),
('Kilogram', 'kg'),
('Gram', 'g'),
('Liter', 'L'),
('Milliliter', 'mL'),
('Meter', 'm'),
('Centimeter', 'cm'),
('Roll', 'roll'),
('Set', 'set'),
('Pair', 'pair'),
('Dozen', 'doz'),
('Carton', 'ctn');

-- ============================================================
-- INSERT CATEGORIES
-- ============================================================
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Office Supplies', 'General office supplies and stationery'),
('Furniture', 'Office and warehouse furniture'),
('Raw Materials', 'Raw materials for production'),
('Packaging', 'Packaging materials'),
('Safety Equipment', 'Safety gear and equipment'),
('Tools', 'Hand tools and power tools'),
('Cleaning Supplies', 'Cleaning and maintenance supplies'),
('Spare Parts', 'Machine and equipment spare parts'),
('Consumables', 'General consumable items');

-- ============================================================
-- INSERT WAREHOUSES
-- ============================================================
INSERT INTO warehouses (code, name, address, type) VALUES
('WH-MAIN', 'Gudang Utama Jakarta', 'Jl. Industri Raya No. 123, Jakarta Timur', 'main'),
('WH-DIST-JKT', 'Gudang Distribusi Jakarta', 'Jl. Pem鲁斯 Raya No. 45, Jakarta Utara', 'distribution'),
('WH-DIST-BDG', 'Gudang Distribusi Bandung', 'Jl. Pasteur No. 78, Bandung', 'distribution'),
('WH-DIST-SBY', 'Gudang Distribusi Surabaya', 'Jl. Margomulyo No. 56, Surabaya', 'distribution'),
('STORE-JKT-01', 'Toko Jakarta 01', 'Jl. Sudirman No. 100, Jakarta Pusat', 'store'),
('STORE-JKT-02', 'Toko Jakarta 02', 'Jl. Thamrin No. 50, Jakarta Pusat', 'store'),
('STORE-BDG-01', 'Toko Bandung 01', 'Jl. Braga No. 25, Bandung', 'store');

-- ============================================================
-- INSERT RACKS (Sample for main warehouse)
-- ============================================================
INSERT INTO racks (warehouse_id, code, name) VALUES
(1, 'RACK-A1', 'Rak A1 - Elektronik'),
(1, 'RACK-A2', 'Rak A2 - Elektronik'),
(1, 'RACK-B1', 'Rak B1 - Office Supplies'),
(1, 'RACK-B2', 'Rak B2 - Office Supplies'),
(1, 'RACK-C1', 'Rak C1 - Tools'),
(1, 'RACK-C2', 'Rak C2 - Safety'),
(1, 'RACK-D1', 'Rak D1 - Spare Parts'),
(1, 'RACK-D2', 'Rak D2 - Raw Materials');

-- ============================================================
-- INSERT BINS (Sample)
-- ============================================================
INSERT INTO bins (rack_id, code, capacity) VALUES
(1, 'A1-01', 100),
(1, 'A1-02', 100),
(1, 'A1-03', 100),
(2, 'A2-01', 100),
(2, 'A2-02', 100),
(2, 'A2-03', 100),
(3, 'B1-01', 150),
(3, 'B1-02', 150),
(4, 'B2-01', 150),
(4, 'B2-02', 150),
(5, 'C1-01', 80),
(5, 'C1-02', 80),
(6, 'C2-01', 100),
(7, 'D1-01', 200),
(7, 'D1-02', 200),
(8, 'D2-01', 250);

-- ============================================================
-- INSERT SUPPLIERS
-- ============================================================
INSERT INTO suppliers (code, name, contact_person, email, phone, address, is_active) VALUES
('SUP-001', 'PT. Sumber Makmur', 'Budi Santoso', 'budi@sumbermakmur.co.id', '021-1234567', 'Jl. Merdeka No. 10, Jakarta', TRUE),
('SUP-002', 'CV. Jaya Abadi', 'Siti Rahayu', 'siti@jayaabadi.com', '021-2345678', 'Jl. Pangeran Diponegoro No. 25, Bandung', TRUE),
('SUP-003', 'PT. Indo Supply', 'Ahmad Wijaya', 'ahmad@indosupply.id', '031-3456789', 'Jl. Pemuda No. 40, Surabaya', TRUE),
('SUP-004', 'Toko Electronics Grosir', 'Diana Putri', 'diana@electgrosir.com', '021-4567890', 'Jl. Mangga Besar No. 88, Jakarta', TRUE),
('SUP-005', 'PT. Safety First', 'Rudi Hermawan', 'rudi@safetyfirst.co.id', '022-5678901', 'Jl. Asia Afrika No. 15, Bandung', TRUE);

-- ============================================================
-- INSERT ITEMS
-- ============================================================
INSERT INTO items (code, name, category_id, uom_id, min_stock, reorder_point, price, barcode, description, is_active) VALUES
('ITEM-001', 'Laptop ASUS VivoBook 15', 1, 1, 5, 10, 7500000, '8901234567890', 'Laptop 15 inch Intel Core i5', TRUE),
('ITEM-002', 'Mouse Wireless Logitech', 1, 1, 20, 50, 150000, '8901234567891', 'Mouse wireless USB', TRUE),
('ITEM-003', 'Keyboard Mechanical RGB', 1, 1, 15, 30, 450000, '8901234567892', 'Keyboard mechanical gaming', TRUE),
('ITEM-004', 'Monitor LG 24 inch', 1, 1, 10, 20, 2500000, '8901234567893', 'Monitor LED Full HD', TRUE),
('ITEM-005', 'Kertas A4 Double Folio', 2, 3, 100, 200, 35000, '8901234567894', 'Kertas A4 80gsm 500 lembar', TRUE),
('ITEM-006', 'Ballpoint Pilot G2', 2, 1, 50, 100, 5000, '8901234567895', 'Ballpoint hitam 0.7mm', TRUE),
('ITEM-007', 'Map File Folder', 2, 1, 30, 60, 8000, '8901234567896', 'Map folder plastik A4', TRUE),
('ITEM-008', 'Stapler Big', 2, 1, 20, 40, 25000, '8901234567897', 'Stapler besar kapasitas 50 lembar', TRUE),
('ITEM-009', 'Meja Kerja Standard', 3, 1, 5, 10, 1500000, '8901234567898', 'Meja kerja 120x60x75cm', TRUE),
('ITEM-010', 'Kursi Kantor Ergonomis', 3, 1, 5, 15, 850000, '8901234567899', 'Kursi kantor dengan armrest', TRUE),
('ITEM-011', 'Safety Helmet', 6, 1, 20, 50, 75000, '8901234567900', 'Helm safety warna kuning', TRUE),
('ITEM-012', 'Safety Gloves', 6, 3, 30, 60, 45000, '8901234567901', 'Sarung tangan safety ukuran L', TRUE),
('ITEM-013', 'Safety Shoes', 6, 1, 15, 30, 350000, '8901234567902', 'Sepatu safety size 42', TRUE),
('ITEM-014', 'Obat-obat P3K', 10, 1, 10, 20, 125000, '8901234567903', 'Kit P3K lengkap', TRUE),
('ITEM-015', 'Sabun Cuci Tangan', 8, 2, 20, 40, 25000, '8901234567904', 'Sabun cair 500ml', TRUE);

-- ============================================================
-- INSERT VENDOR PRICE LIST
-- ============================================================
INSERT INTO vendor_price_list (supplier_id, item_id, price, valid_from, valid_to) VALUES
(1, 1, 7200000, '2026-01-01', '2026-12-31'),
(1, 2, 140000, '2026-01-01', '2026-12-31'),
(4, 1, 7100000, '2026-01-01', '2026-12-31'),
(4, 3, 420000, '2026-01-01', '2026-12-31'),
(4, 4, 2400000, '2026-01-01', '2026-12-31'),
(2, 5, 32000, '2026-01-01', '2026-12-31'),
(2, 6, 4500, '2026-01-01', '2026-12-31'),
(2, 7, 7000, '2026-01-01', '2026-12-31'),
(5, 11, 70000, '2026-01-01', '2026-12-31'),
(5, 12, 40000, '2026-01-01', '2026-12-31'),
(5, 13, 320000, '2026-01-01', '2026-12-31');

-- ============================================================
-- INSERT INITIAL STOCKS
-- ============================================================
INSERT INTO stocks (item_id, warehouse_id, bin_id, qty_available, qty_reserved) VALUES
-- Gudang Utama Jakarta (WH-MAIN)
(1, 1, 1, 15, 2),
(2, 1, 1, 100, 10),
(3, 1, 2, 50, 5),
(4, 1, 2, 25, 3),
(5, 1, 3, 500, 50),
(6, 1, 3, 200, 20),
(7, 1, 4, 150, 10),
(8, 1, 4, 80, 5),
(9, 1, NULL, 20, 2),
(10, 1, NULL, 15, 1),
(11, 1, 6, 100, 10),
(12, 1, 6, 150, 20),
(13, 1, NULL, 30, 5),
-- Gudang Distribusi Jakarta
(1, 2, NULL, 10, 1),
(2, 2, NULL, 80, 8),
(5, 2, NULL, 300, 30),
(6, 2, NULL, 150, 15),
-- Gudang Distribusi Bandung
(1, 3, NULL, 8, 1),
(2, 3, NULL, 60, 6),
(3, 3, NULL, 40, 4),
(5, 3, NULL, 250, 25),
-- Gudang Distribusi Surabaya
(1, 4, NULL, 12, 2),
(2, 4, NULL, 70, 7),
(5, 4, NULL, 200, 20),
-- Toko Jakarta 01
(2, 5, NULL, 30, 3),
(5, 5, NULL, 100, 10),
(6, 5, NULL, 50, 5),
-- Toko Jakarta 02
(2, 6, NULL, 25, 2),
(5, 6, NULL, 80, 8),
(6, 6, NULL, 40, 4),
-- Toko Bandung 01
(2, 7, NULL, 20, 2),
(5, 7, NULL, 60, 6),
(6, 7, NULL, 30, 3);

-- ============================================================
-- INSERT SAMPLE STOCK MOVEMENTS
-- ============================================================
INSERT INTO stock_movements (item_id, warehouse_id, type, qty, reference_id, reference_type, notes, created_by, created_at) VALUES
(1, 1, 'IN', 20, 1, 'goods_receipt', 'Receiving from PO-001', 1, '2026-04-20 10:00:00'),
(1, 1, 'OUT', 5, 1, 'goods_issue', 'Issue to STORE-JKT-01', 1, '2026-04-21 14:00:00'),
(2, 1, 'IN', 150, 2, 'goods_receipt', 'Receiving from PO-002', 1, '2026-04-18 09:00:00'),
(2, 1, 'OUT', 40, 2, 'goods_issue', 'Issue to various stores', 1, '2026-04-19 11:00:00'),
(5, 1, 'IN', 500, 3, 'goods_receipt', 'Receiving from PO-003', 1, '2026-04-15 08:00:00'),
(5, 1, 'OUT', 150, 3, 'goods_issue', 'Monthly distribution', 1, '2026-04-22 10:00:00'),
(11, 1, 'IN', 100, 4, 'goods_receipt', 'Receiving from PO-004', 1, '2026-04-10 13:00:00');

-- ============================================================
-- INSERT SAMPLE PURCHASE REQUEST
-- ============================================================
INSERT INTO purchase_requests (pr_number, requested_by, warehouse_id, status, notes, created_at) VALUES
('PR-20260425-0001', 3, 1, 'approved', 'Restok item prioritas tinggi', '2026-04-25 09:00:00'),
('PR-20260425-0002', 4, 1, 'pending', 'Kebutuhan operasional gudang', '2026-04-25 14:00:00');

INSERT INTO purchase_request_items (pr_id, item_id, qty, notes) VALUES
(1, 1, 10, 'Restok laptop'),
(1, 2, 50, 'Mouse wireless'),
(1, 3, 30, 'Keyboard'),
(2, 5, 200, 'Kertas A4'),
(2, 6, 100, 'Ballpoint');

-- ============================================================
-- INSERT SAMPLE PURCHASE ORDER
-- ============================================================
INSERT INTO purchase_orders (po_number, pr_id, supplier_id, status, total, expected_delivery_date, created_at) VALUES
('PO-20260425-0001', 1, 1, 'sent', 82000000, '2026-05-01', '2026-04-25 10:00:00');

INSERT INTO purchase_order_items (po_id, item_id, qty, price, subtotal) VALUES
(1, 1, 10, 7200000, 72000000),
(1, 2, 50, 140000, 7000000),
(1, 3, 30, 420000, 12600000);

-- ============================================================
-- COMPLETE
-- ============================================================
SELECT 'Seed data inserted successfully!' AS message;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_items FROM items;
SELECT COUNT(*) AS total_warehouses FROM warehouses;