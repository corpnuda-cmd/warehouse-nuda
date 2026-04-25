-- ============================================================
-- Warehouse Management System - Database Schema
-- MySQL Version
-- Created: 2026-04-26
-- ============================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS warehouse_nuda;
USE warehouse_nuda;

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'purchasing', 'gudang', 'store_user', 'finance', 'auditor') NOT NULL DEFAULT 'store_user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================================
-- MASTER DATA
-- ============================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id)
);

-- UoM (Unit of Measure) table
CREATE TABLE IF NOT EXISTS uoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_symbol (symbol)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    type ENUM('main', 'distribution', 'store') NOT NULL DEFAULT 'distribution',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_type (type)
);

-- Racks table
CREATE TABLE IF NOT EXISTS racks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rack (warehouse_id, code)
);

-- Bins table
CREATE TABLE IF NOT EXISTS bins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rack_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bin (rack_id, code)
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id INT,
    uom_id INT NOT NULL,
    min_stock INT DEFAULT 0,
    reorder_point INT DEFAULT 0,
    price DECIMAL(15,2) DEFAULT 0,
    barcode VARCHAR(50),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (uom_id) REFERENCES uoms(id),
    INDEX idx_code (code),
    INDEX idx_category (category_id),
    INDEX idx_name (name)
);

-- Vendor Price List table
CREATE TABLE IF NOT EXISTS vendor_price_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    item_id INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    valid_from TIMESTAMP NULL,
    valid_to TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_supplier_item (supplier_id, item_id, valid_from)
);

-- ============================================================
-- INVENTORY
-- ============================================================

-- Stocks table
CREATE TABLE IF NOT EXISTS stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    bin_id INT,
    qty_available INT NOT NULL DEFAULT 0,
    qty_reserved INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE SET NULL,
    UNIQUE KEY unique_stock (item_id, warehouse_id, bin_id),
    INDEX idx_item_warehouse (item_id, warehouse_id)
);

-- Stock Movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    type ENUM('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVATION', 'RELEASE') NOT NULL,
    qty INT NOT NULL,
    reference_id INT,
    reference_type VARCHAR(50),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_item (item_id),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- ============================================================
-- PROCUREMENT
-- ============================================================

-- Purchase Requests table
CREATE TABLE IF NOT EXISTS purchase_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pr_number VARCHAR(30) NOT NULL UNIQUE,
    requested_by INT NOT NULL,
    warehouse_id INT,
    status ENUM('draft', 'pending', 'approved', 'rejected', 'closed') NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_pr_number (pr_number),
    INDEX idx_status (status),
    INDEX idx_requested_by (requested_by)
);

-- Purchase Request Items table
CREATE TABLE IF NOT EXISTS purchase_request_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pr_id INT NOT NULL,
    item_id INT NOT NULL,
    qty INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_pr_item (pr_id, item_id)
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(30) NOT NULL UNIQUE,
    pr_id INT,
    supplier_id INT NOT NULL,
    status ENUM('draft', 'pending', 'approved', 'sent', 'partial_received', 'received', 'rejected', 'closed') NOT NULL DEFAULT 'draft',
    total DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    expected_delivery_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    INDEX idx_po_number (po_number),
    INDEX idx_status (status),
    INDEX idx_supplier (supplier_id)
);

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    item_id INT NOT NULL,
    qty INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_po_item (po_id, item_id)
);

-- ============================================================
-- RECEIVING
-- ============================================================

-- Goods Receipts table
CREATE TABLE IF NOT EXISTS goods_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gr_number VARCHAR(30) NOT NULL UNIQUE,
    po_id INT,
    received_by INT NOT NULL,
    qc_status ENUM('pending', 'passed', 'failed', 'partial') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (received_by) REFERENCES users(id),
    INDEX idx_gr_number (gr_number),
    INDEX idx_qc_status (qc_status)
);

-- Goods Receipt Items table
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gr_id INT NOT NULL,
    item_id INT NOT NULL,
    qty_received INT NOT NULL,
    qty_accepted INT NOT NULL,
    qty_rejected INT NOT NULL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (gr_id) REFERENCES goods_receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_gr_item (gr_id, item_id)
);

-- ============================================================
-- ISSUING
-- ============================================================

-- Issue Requests table
CREATE TABLE IF NOT EXISTS issue_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ir_number VARCHAR(30) NOT NULL UNIQUE,
    requested_by INT NOT NULL,
    warehouse_id INT NOT NULL,
    status ENUM('draft', 'pending', 'approved', 'rejected', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_ir_number (ir_number),
    INDEX idx_status (status)
);

-- Issue Request Items table
CREATE TABLE IF NOT EXISTS issue_request_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ir_id INT NOT NULL,
    item_id INT NOT NULL,
    qty INT NOT NULL,
    FOREIGN KEY (ir_id) REFERENCES issue_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_ir_item (ir_id, item_id)
);

-- Goods Issues table
CREATE TABLE IF NOT EXISTS goods_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gi_number VARCHAR(30) NOT NULL UNIQUE,
    ir_id INT,
    issued_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ir_id) REFERENCES issue_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (issued_by) REFERENCES users(id),
    INDEX idx_gi_number (gi_number)
);

-- Goods Issue Items table
CREATE TABLE IF NOT EXISTS goods_issue_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gi_id INT NOT NULL,
    item_id INT NOT NULL,
    qty INT NOT NULL,
    FOREIGN KEY (gi_id) REFERENCES goods_issues(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_gi_item (gi_id, item_id)
);

-- ============================================================
-- TRANSFER
-- ============================================================

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_number VARCHAR(30) NOT NULL UNIQUE,
    from_warehouse_id INT NOT NULL,
    to_warehouse_id INT NOT NULL,
    status ENUM('draft', 'pending', 'approved', 'shipped', 'received', 'rejected', 'cancelled') NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id),
    INDEX idx_transfer_number (transfer_number),
    INDEX idx_status (status)
);

-- Transfer Items table
CREATE TABLE IF NOT EXISTS transfer_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_id INT NOT NULL,
    item_id INT NOT NULL,
    qty INT NOT NULL,
    FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_transfer_item (transfer_id, item_id)
);

-- ============================================================
-- STOCK OPNAME
-- ============================================================

-- Stock Opnames table
CREATE TABLE IF NOT EXISTS stock_opnames (
    id INT AUTO_INCREMENT PRIMARY KEY,
    so_number VARCHAR(30) NOT NULL UNIQUE,
    warehouse_id INT NOT NULL,
    plan_date TIMESTAMP NOT NULL,
    status ENUM('planned', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_so_number (so_number),
    INDEX idx_status (status),
    INDEX idx_plan_date (plan_date)
);

-- Stock Opname Items table
CREATE TABLE IF NOT EXISTS stock_opname_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    so_id INT NOT NULL,
    item_id INT NOT NULL,
    qty_system INT NOT NULL,
    qty_actual INT,
    variance INT,
    notes TEXT,
    FOREIGN KEY (so_id) REFERENCES stock_opnames(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_so_item (so_id, item_id)
);

-- ============================================================
-- RETURNS
-- ============================================================

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_number VARCHAR(30) NOT NULL UNIQUE,
    type ENUM('supplier', 'customer') NOT NULL,
    reference_id INT,
    reference_type VARCHAR(50),
    status ENUM('draft', 'pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'draft',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_return_number (return_number),
    INDEX idx_type (type),
    INDEX idx_status (status)
);

-- Return Items table
CREATE TABLE IF NOT EXISTS return_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    item_id INT NOT NULL,
    qty INT NOT NULL,
    reason TEXT,
    FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_return_item (return_id, item_id)
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    reference_id INT,
    old_data TEXT,
    new_data TEXT,
    ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
);

-- ============================================================
-- Complete!
-- ============================================================

SELECT 'Database schema created successfully!' AS message;