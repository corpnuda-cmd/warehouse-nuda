# TODO.md - Inventory Warehouse Management System

> **Last Updated:** 2026-04-25
> **Status Legend:** ✅ Done | 🚧 In Progress | ⬜ Not Started | 🔴 Blocked | 🟡 Partial

---

## 📊 Progress Overview

| Phase | Module | Status | Progress |
|-------|--------|--------|----------|
| Phase 1 | Project Setup | 🟡 Partial | 60% |
| Phase 1 | Database Schema & Migration | ⬜ Not Started | 0% |
| Phase 1 | Authentication & RBAC | 🟡 Partial | 10% |
| Phase 2 | Master Data | ⬜ Not Started | 0% |
| Phase 2 | Procurement (PR, PO) | ⬜ Not Started | 0% |
| Phase 2 | Receiving (GR, QC) | ⬜ Not Started | 0% |
| Phase 3 | Inventory Management | ⬜ Not Started | 0% |
| Phase 3 | Goods Issue | ⬜ Not Started | 0% |
| Phase 3 | Transfer Antar Lokasi | ⬜ Not Started | 0% |
| Phase 4 | Stock Opname | ⬜ Not Started | 0% |
| Phase 4 | Return Management | ⬜ Not Started | 0% |
| Phase 4 | Audit Trail | ⬜ Not Started | 0% |
| Phase 5 | Dashboard & Analytics | ⬜ Not Started | 0% |
| Phase 5 | Laporan | ⬜ Not Started | 0% |
| Phase 5 | Notifikasi | ⬜ Not Started | 0% |
| Phase 6 | Barcode/RFID | ⬜ Not Started | 0% |
| Phase 6 | Export PDF/Excel | ⬜ Not Started | 0% |

---

## 🏗️ PHASE 1 — Foundation

### 1.1 Project Setup
#### Backend (be-inventory/)
- [x] Init project Hono + TypeScript
- [x] Install dependencies (hono, drizzle-orm, mysql2, zod, bcryptjs, jsonwebtoken)
- [x] Setup tsconfig.json
- [x] Entry point `src/index.ts` dengan middleware CORS + Logger
- [x] Health check endpoint `/health`
- [ ] Setup `.env` file dengan variabel: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `PORT`
- [ ] Setup `src/config/db.ts` — koneksi Drizzle ORM ke MySQL
- [ ] Setup `src/config/env.ts` — load & validasi env variables dengan Zod
- [ ] Buat folder struktur modular:
  - [ ] `src/config/`
  - [ ] `src/middleware/`
  - [ ] `src/modules/auth/`
  - [ ] `src/modules/users/`
  - [ ] `src/modules/master-data/`
  - [ ] `src/modules/procurement/`
  - [ ] `src/modules/receiving/`
  - [ ] `src/modules/inventory/`
  - [ ] `src/modules/issuing/`
  - [ ] `src/modules/transfer/`
  - [ ] `src/modules/stock-opname/`
  - [ ] `src/modules/return/`
  - [ ] `src/modules/reports/`
  - [ ] `src/utils/`
  - [ ] `src/validators/`
- [ ] Setup Rate Limiter middleware
- [ ] Setup Error Handler middleware terpusat
- [ ] Fix CORS origin (saat ini hardcoded `localhost:3000`, harusnya `localhost:5173` untuk Vite)

#### Frontend (fe-inventory/)
- [x] Init project React 18 + TypeScript + Vite
- [x] Install dependencies (react-router-dom, tanstack-query, zustand, react-hook-form, zod, axios, recharts)
- [x] Setup TailwindCSS + PostCSS
- [x] Setup `src/lib/utils.ts` (cn utility)
- [x] Setup `src/lib/axios.ts` dengan interceptor auth + 401 handler
- [x] Setup `src/store/authStore.ts` (Zustand + persist)
- [x] Setup `src/types/index.ts` (User, ApiResponse, Item, dsb.)
- [x] shadcn/ui component index (`src/components/ui/index.ts`)
- [ ] Install & setup shadcn/ui CLI (button, input, card, table, badge, select, dialog, toast, dropdown, form, label, separator, skeleton, avatar, popover, calendar, checkbox, radio-group, textarea)
- [ ] Setup `src/lib/auth.tsx` — AuthProvider & AuthContext (file ini diimport di App.tsx tapi belum ada)
- [ ] Setup `src/lib/queryClient.ts` — TanStack Query client
- [ ] Setup React Router di `App.tsx` dengan route definitions
- [ ] Setup `src/routes/index.tsx` — route config (public & protected)
- [ ] Setup `src/routes/ProtectedRoute.tsx` — guard berbasis auth & role
- [ ] Setup `.env` file: `VITE_API_URL=http://localhost:8787/api/v1`
- [ ] Buat folder struktur lengkap:
  - [ ] `src/assets/`
  - [ ] `src/components/layout/` (Sidebar, Header, Footer)
  - [ ] `src/components/shared/` (DataTable, PageHeader, LoadingSpinner, EmptyState, ConfirmDialog)
  - [ ] `src/features/`
  - [ ] `src/hooks/`
  - [ ] `src/pages/`

---

### 1.2 Database Schema & Migration
- [ ] Setup `drizzle.config.ts` di root be-inventory/
- [ ] Buat `src/db/schema/` folder
- [ ] **Schema: Users & Auth**
  - [ ] `schema/users.ts` — tabel `users` (id, username, email, password, role_id, is_active, created_at, updated_at)
  - [ ] `schema/roles.ts` — tabel `roles` (id, name, description)
  - [ ] `schema/permissions.ts` — tabel `permissions` (id, role_id, module, action)
- [ ] **Schema: Master Data**
  - [ ] `schema/items.ts` — tabel `items`
  - [ ] `schema/categories.ts` — tabel `categories` (dengan parent_id untuk hierarki)
  - [ ] `schema/uoms.ts` — tabel `uoms`
  - [ ] `schema/suppliers.ts` — tabel `suppliers`
  - [ ] `schema/warehouses.ts` — tabel `warehouses`
  - [ ] `schema/racks.ts` — tabel `racks`
  - [ ] `schema/bins.ts` — tabel `bins`
  - [ ] `schema/vendor_price_list.ts` — tabel `vendor_price_list`
- [ ] **Schema: Procurement**
  - [ ] `schema/purchase_requests.ts` — tabel `purchase_requests` + `purchase_request_items`
  - [ ] `schema/purchase_orders.ts` — tabel `purchase_orders` + `purchase_order_items`
- [ ] **Schema: Receiving**
  - [ ] `schema/goods_receipts.ts` — tabel `goods_receipts` + `goods_receipt_items`
- [ ] **Schema: Inventory**
  - [ ] `schema/stocks.ts` — tabel `stocks`
  - [ ] `schema/stock_movements.ts` — tabel `stock_movements`
- [ ] **Schema: Issuing**
  - [ ] `schema/issue_requests.ts` — tabel `issue_requests` + `issue_request_items`
  - [ ] `schema/goods_issues.ts` — tabel `goods_issues` + `goods_issue_items`
- [ ] **Schema: Transfer**
  - [ ] `schema/transfers.ts` — tabel `transfers` + `transfer_items`
- [ ] **Schema: Stock Opname**
  - [ ] `schema/stock_opnames.ts` — tabel `stock_opnames` + `stock_opname_items`
- [ ] **Schema: Returns**
  - [ ] `schema/returns.ts` — tabel `returns` + `return_items`
- [ ] **Schema: Audit**
  - [ ] `schema/audit_logs.ts` — tabel `audit_logs`
- [ ] Buat `src/db/index.ts` — export db connection
- [ ] Jalankan `drizzle-kit generate` untuk generate migration files
- [ ] Jalankan `drizzle-kit push` untuk apply schema ke MySQL
- [ ] Buat seed data: roles default (Super Admin, Admin, Purchasing, Gudang, Store User, Finance, Auditor)

---

### 1.3 Authentication & RBAC
#### Backend
- [ ] **Auth Module** (`src/modules/auth/`)
  - [ ] `auth.schema.ts` — Zod schema validasi login/register
  - [ ] `auth.service.ts` — logic login, generate JWT, verify password (bcrypt)
  - [ ] `auth.controller.ts` — handler POST /auth/login, POST /auth/logout, GET /auth/me
  - [ ] `auth.routes.ts` — Hono route definitions
- [ ] **Middleware Auth** (`src/middleware/`)
  - [ ] `auth.middleware.ts` — verifikasi JWT dari header Authorization
  - [ ] `rbac.middleware.ts` — check role/permission per route
  - [ ] `logger.middleware.ts` — request logging
  - [ ] `errorHandler.middleware.ts` — centralized error response `{ success: false, message: string }`
- [ ] **Users Module** (`src/modules/users/`)
  - [ ] `users.schema.ts`
  - [ ] `users.service.ts`
  - [ ] `users.controller.ts`
  - [ ] `users.routes.ts`
  - [ ] CRUD endpoints: GET /users, POST /users, PUT /users/:id, DELETE /users/:id
  - [ ] Change password endpoint

#### Frontend
- [ ] **Feature: Auth** (`src/features/auth/`)
  - [ ] `LoginPage.tsx` — form login dengan React Hook Form + Zod
  - [ ] `useLogin.ts` — custom hook (useMutation TanStack Query)
  - [ ] `authApi.ts` — API calls ke /auth/login, /auth/logout, /auth/me
- [ ] **Pages**
  - [ ] `src/pages/LoginPage.tsx`
  - [ ] `src/pages/NotFoundPage.tsx`
  - [ ] `src/pages/UnauthorizedPage.tsx`

---

## 🗃️ PHASE 2 — Core Modules

### 2.1 Master Data
#### Backend (`src/modules/master-data/`)
- [ ] **Items**
  - [ ] `items.schema.ts` (Zod)
  - [ ] `items.service.ts` (CRUD + search + pagination)
  - [ ] `items.controller.ts`
  - [ ] `items.routes.ts`
  - [ ] Endpoints: GET /items (with pagination & search), POST /items, GET /items/:id, PUT /items/:id, DELETE /items/:id
  - [ ] Filter by category, low stock alert
- [ ] **Categories**
  - [ ] CRUD endpoints + hierarki parent_id
- [ ] **Units of Measure (UoM)**
  - [ ] CRUD endpoints
- [ ] **Suppliers**
  - [ ] CRUD endpoints + vendor price list management
- [ ] **Warehouses**
  - [ ] CRUD endpoints
- [ ] **Racks & Bins**
  - [ ] CRUD endpoints dengan relasi warehouse → rack → bin

#### Frontend (`src/features/master-data/`)
- [ ] **Items**
  - [ ] `ItemsPage.tsx` — list dengan DataTable, search, filter, pagination
  - [ ] `ItemForm.tsx` — form create/edit (React Hook Form + Zod)
  - [ ] `useItems.ts` — hooks (useQuery, useMutation)
  - [ ] `itemsApi.ts`
- [ ] **Categories**
  - [ ] `CategoriesPage.tsx`
  - [ ] `CategoryForm.tsx`
  - [ ] `useCategories.ts`
- [ ] **UoM**
  - [ ] `UomPage.tsx`
  - [ ] `UomForm.tsx`
- [ ] **Suppliers**
  - [ ] `SuppliersPage.tsx`
  - [ ] `SupplierForm.tsx`
  - [ ] `SupplierDetail.tsx` (dengan price list)
  - [ ] `useSuppliers.ts`
- [ ] **Warehouses**
  - [ ] `WarehousesPage.tsx`
  - [ ] `WarehouseForm.tsx`
- [ ] **Racks & Bins**
  - [ ] `RacksPage.tsx`
  - [ ] `BinsPage.tsx`

---

### 2.2 Procurement (PR & PO)
#### Backend (`src/modules/procurement/`)
- [ ] **Purchase Requests (PR)**
  - [ ] `pr.schema.ts`
  - [ ] `pr.service.ts`
    - [ ] Create PR dengan items
    - [ ] Approve / Reject PR
    - [ ] Generate PR Number (auto: PR-YYYYMMDD-XXXX)
  - [ ] `pr.controller.ts`
  - [ ] `pr.routes.ts`
  - [ ] Endpoints:
    - [ ] GET /purchase-requests (with filter status, date range)
    - [ ] POST /purchase-requests
    - [ ] GET /purchase-requests/:id
    - [ ] PATCH /purchase-requests/:id/approve
    - [ ] PATCH /purchase-requests/:id/reject
    - [ ] DELETE /purchase-requests/:id (hanya DRAFT)
- [ ] **Purchase Orders (PO)**
  - [ ] `po.schema.ts`
  - [ ] `po.service.ts`
    - [ ] Create PO dari PR yang approved
    - [ ] Generate PO Number (auto: PO-YYYYMMDD-XXXX)
    - [ ] Confirm / Cancel PO
  - [ ] `po.controller.ts`
  - [ ] `po.routes.ts`
  - [ ] Endpoints:
    - [ ] GET /purchase-orders
    - [ ] POST /purchase-orders
    - [ ] GET /purchase-orders/:id
    - [ ] PATCH /purchase-orders/:id/confirm
    - [ ] PATCH /purchase-orders/:id/cancel

#### Frontend (`src/features/procurement/`)
- [ ] **Purchase Requests**
  - [ ] `PRListPage.tsx` — list PR dengan status badge & filter
  - [ ] `PRCreatePage.tsx` — form buat PR + tambah items dinamis
  - [ ] `PRDetailPage.tsx` — detail PR + tombol approve/reject (role-based)
  - [ ] `usePurchaseRequests.ts`
  - [ ] `prApi.ts`
- [ ] **Purchase Orders**
  - [ ] `POListPage.tsx`
  - [ ] `POCreatePage.tsx` — generate dari PR
  - [ ] `PODetailPage.tsx` — detail PO + status timeline
  - [ ] `usePurchaseOrders.ts`
  - [ ] `poApi.ts`

---

### 2.3 Receiving (Goods Receipt & QC)
#### Backend (`src/modules/receiving/`)
- [ ] `gr.schema.ts`
- [ ] `gr.service.ts`
  - [ ] Create GR dari PO
  - [ ] Process QC (set qty_accepted, qty_rejected per item)
  - [ ] Auto-update stok saat GR diterima (trigger stock_movements INSERT)
  - [ ] Auto-trigger return jika ada qty_rejected
  - [ ] Generate GR Number (auto: GR-YYYYMMDD-XXXX)
- [ ] `gr.controller.ts`
- [ ] `gr.routes.ts`
- [ ] Endpoints:
  - [ ] GET /goods-receipts
  - [ ] POST /goods-receipts
  - [ ] GET /goods-receipts/:id
  - [ ] POST /goods-receipts/:id/qc
  - [ ] PATCH /goods-receipts/:id/complete

#### Frontend (`src/features/receiving/`)
- [ ] `GRListPage.tsx`
- [ ] `GRCreatePage.tsx` — pilih PO, input barang diterima
- [ ] `GRDetailPage.tsx`
- [ ] `QCFormPage.tsx` — form QC per item (qty accepted/rejected + notes)
- [ ] `useGoodsReceipts.ts`
- [ ] `grApi.ts`

---

## ⚙️ PHASE 3 — Operations

### 3.1 Inventory Management
#### Backend (`src/modules/inventory/`)
- [ ] `inventory.service.ts`
  - [ ] Get stok by item, warehouse, bin
  - [ ] Low stock alert (qty_available <= reorder_point)
  - [ ] Stock movements history dengan filter
  - [ ] Reserve stok (qty_reserved)
  - [ ] Manual stock adjustment
- [ ] `inventory.controller.ts`
- [ ] `inventory.routes.ts`
- [ ] Endpoints:
  - [ ] GET /stocks — list semua stok
  - [ ] GET /stocks/:itemId — stok per item
  - [ ] GET /stocks/movements — history mutasi stok
  - [ ] GET /stocks/low-stock-alert — item dengan stok di bawah reorder point
  - [ ] POST /stocks/adjust — manual adjustment (dengan audit log)
  - [ ] GET /stocks/valuation — nilai stok (qty × harga)

#### Frontend (`src/features/inventory/`)
- [ ] `StockListPage.tsx` — tabel stok per item/warehouse dengan search & filter
- [ ] `StockDetailPage.tsx` — detail stok item + movement history
- [ ] `StockMovementsPage.tsx` — histori mutasi stok
- [ ] `LowStockAlertPage.tsx` — daftar item dengan stok kritis
- [ ] `StockAdjustPage.tsx` — form manual adjustment
- [ ] `useInventory.ts`
- [ ] `inventoryApi.ts`

---

### 3.2 Goods Issue (Pengeluaran Barang)
#### Backend (`src/modules/issuing/`)
- [ ] **Issue Requests (IR)**
  - [ ] `ir.schema.ts`
  - [ ] `ir.service.ts`
    - [ ] Create IR + items
    - [ ] Cek ketersediaan stok saat submit
    - [ ] Approve / Reject IR
    - [ ] Generate IR Number
  - [ ] `ir.controller.ts`
  - [ ] `ir.routes.ts`
- [ ] **Goods Issue (GI)**
  - [ ] `gi.schema.ts`
  - [ ] `gi.service.ts`
    - [ ] Create GI dari IR approved
    - [ ] Kurangi stok (update stocks + insert stock_movements OUT)
    - [ ] Generate GI Number
  - [ ] `gi.controller.ts`
  - [ ] `gi.routes.ts`
- [ ] Endpoints:
  - [ ] GET|POST /issue-requests
  - [ ] PATCH /issue-requests/:id/approve
  - [ ] PATCH /issue-requests/:id/reject
  - [ ] GET|POST /goods-issues
  - [ ] GET /goods-issues/:id

#### Frontend (`src/features/issuing/`)
- [ ] `IssueRequestListPage.tsx`
- [ ] `IssueRequestCreatePage.tsx` — form + cek stok real-time
- [ ] `IssueRequestDetailPage.tsx`
- [ ] `GoodsIssueListPage.tsx`
- [ ] `GoodsIssueCreatePage.tsx`
- [ ] `GoodsIssueDetailPage.tsx`
- [ ] `useIssueRequests.ts`
- [ ] `useGoodsIssues.ts`
- [ ] `issuingApi.ts`

---

### 3.3 Transfer Antar Lokasi
#### Backend (`src/modules/transfer/`)
- [ ] `transfer.schema.ts`
- [ ] `transfer.service.ts`
  - [ ] Create Transfer Request
  - [ ] Approve Transfer
  - [ ] Process Transfer (kurangi stok asal, tambah stok tujuan, insert 2 stock_movements)
  - [ ] Generate Transfer Number (TRF-YYYYMMDD-XXXX)
- [ ] `transfer.controller.ts`
- [ ] `transfer.routes.ts`
- [ ] Endpoints:
  - [ ] GET|POST /transfers
  - [ ] GET /transfers/:id
  - [ ] PATCH /transfers/:id/approve
  - [ ] PATCH /transfers/:id/process
  - [ ] PATCH /transfers/:id/complete
  - [ ] PATCH /transfers/:id/cancel

#### Frontend (`src/features/transfer/`)
- [ ] `TransferListPage.tsx`
- [ ] `TransferCreatePage.tsx` — pilih from/to warehouse + items
- [ ] `TransferDetailPage.tsx` — status timeline + items
- [ ] `useTransfers.ts`
- [ ] `transferApi.ts`

---

## 🔍 PHASE 4 — Control

### 4.1 Stock Opname
#### Backend (`src/modules/stock-opname/`)
- [ ] `opname.schema.ts`
- [ ] `opname.service.ts`
  - [ ] Buat jadwal opname per warehouse
  - [ ] Generate item list untuk dihitung (snapshot qty_system saat ini)
  - [ ] Input hasil hitung (qty_actual)
  - [ ] Hitung variance (qty_system - qty_actual)
  - [ ] Approval & adjustment stok jika ada selisih
  - [ ] Generate SO Number
- [ ] `opname.controller.ts`
- [ ] `opname.routes.ts`
- [ ] Endpoints:
  - [ ] GET|POST /stock-opnames
  - [ ] GET /stock-opnames/:id
  - [ ] PATCH /stock-opnames/:id/start
  - [ ] POST /stock-opnames/:id/items — input hasil hitung
  - [ ] PATCH /stock-opnames/:id/reconcile
  - [ ] PATCH /stock-opnames/:id/complete

#### Frontend (`src/features/stock-opname/`)
- [ ] `OpnameListPage.tsx`
- [ ] `OpnameCreatePage.tsx` — jadwal opname + pilih warehouse
- [ ] `OpnameDetailPage.tsx`
- [ ] `OpnameCountPage.tsx` — input qty_actual per item (mobile-friendly)
- [ ] `OpnameReconcilePage.tsx` — tabel variance + approve/adjust
- [ ] `useStockOpname.ts`
- [ ] `opnameApi.ts`

---

### 4.2 Return Management
#### Backend (`src/modules/return/`)
- [ ] `return.schema.ts`
- [ ] `return.service.ts`
  - [ ] Return to Supplier (dari GR yang ada qty_rejected)
  - [ ] Return from Customer (barang rusak/reject)
  - [ ] QC hasil return
  - [ ] Update stok sesuai keputusan QC
  - [ ] Generate Return Number (RTN-YYYYMMDD-XXXX)
- [ ] `return.controller.ts`
- [ ] `return.routes.ts`
- [ ] Endpoints:
  - [ ] GET|POST /returns
  - [ ] GET /returns/:id
  - [ ] PATCH /returns/:id/approve
  - [ ] PATCH /returns/:id/reject
  - [ ] POST /returns/:id/qc

#### Frontend (`src/features/return/`)
- [ ] `ReturnListPage.tsx`
- [ ] `ReturnCreatePage.tsx`
- [ ] `ReturnDetailPage.tsx`
- [ ] `useReturns.ts`
- [ ] `returnApi.ts`

---

### 4.3 Audit Trail
#### Backend
- [ ] `src/utils/auditLog.ts` — helper fungsi `logAudit(userId, action, module, referenceId, oldData, newData, ip)`
- [ ] Integrasikan audit log ke semua service yang melakukan perubahan data:
  - [ ] Auth (login, logout)
  - [ ] Master Data CRUD
  - [ ] Procurement (create, approve, reject)
  - [ ] Receiving (create, QC, complete)
  - [ ] Inventory (adjust)
  - [ ] Issuing (create, approve, issue)
  - [ ] Transfer (create, approve, process, complete)
  - [ ] Stock Opname (semua tahapan)
  - [ ] Return (semua tahapan)
- [ ] GET /audit-logs — list dengan filter (user, module, date range)
- [ ] GET /audit-logs/:id — detail log

#### Frontend (`src/features/audit/`)
- [ ] `AuditLogPage.tsx` — tabel dengan filter lengkap
- [ ] `AuditLogDetailModal.tsx` — diff old vs new data
- [ ] `useAuditLogs.ts`
- [ ] `auditApi.ts`

---

## 📈 PHASE 5 — Analytics & Reporting

### 5.1 Dashboard
#### Backend
- [ ] `src/modules/reports/dashboard.service.ts`
  - [ ] Total stok on-hand (nilai + qty)
  - [ ] Item low stock count
  - [ ] PR/PO pending count
  - [ ] GR hari ini
  - [ ] GI hari ini
  - [ ] Stock movement 7 hari terakhir (chart data)
- [ ] GET /dashboard/summary
- [ ] GET /dashboard/stock-chart
- [ ] GET /dashboard/activity-feed

#### Frontend (`src/features/dashboard/`)
- [ ] `DashboardPage.tsx`
  - [ ] Summary cards (Stok On Hand, Low Stock, Pending PR, Pending PO)
  - [ ] Stock Movement Chart (Recharts LineChart/BarChart)
  - [ ] Recent Activity Feed
  - [ ] Low Stock Alert widget
- [ ] `useDashboard.ts`
- [ ] `dashboardApi.ts`

---

### 5.2 Laporan (Reports)
#### Backend (`src/modules/reports/`)
- [ ] `reports.service.ts`
  - [ ] Laporan Stok On Hand (per item/warehouse/kategori)
  - [ ] Laporan Stock Movement (in/out per periode)
  - [ ] Laporan Pembelian (PR/PO per periode)
  - [ ] Laporan Pengeluaran (GI per periode)
  - [ ] Laporan Aging Inventory
  - [ ] Laporan Stock Opname
  - [ ] Laporan Mutasi Stok
- [ ] Endpoint export: GET /reports/:type?format=json|excel|pdf

#### Frontend (`src/features/reports/`)
- [ ] `StockOnHandReport.tsx`
- [ ] `StockMovementReport.tsx`
- [ ] `ProcurementReport.tsx`
- [ ] `IssuingReport.tsx`
- [ ] `AgingInventoryReport.tsx`
- [ ] `OpnameReport.tsx`
- [ ] Filter komponen: DateRangePicker, WarehouseSelect, CategorySelect
- [ ] Export tombol: Download Excel, Download PDF
- [ ] `useReports.ts`
- [ ] `reportsApi.ts`

---

### 5.3 Notifikasi
#### Backend
- [ ] `src/utils/notification.ts` — notifikasi in-app
- [ ] Trigger notifikasi pada event:
  - [ ] Stok minimum tercapai (saat GI / Transfer)
  - [ ] PO disetujui
  - [ ] Barang datang (GR dibuat)
  - [ ] Jadwal Stock Opname mendekat (H-1)
  - [ ] Return diproses
- [ ] GET /notifications — list notifikasi user
- [ ] PATCH /notifications/:id/read
- [ ] PATCH /notifications/read-all

#### Frontend
- [ ] `NotificationBell.tsx` — icon di header dengan badge count
- [ ] `NotificationDropdown.tsx` — list notifikasi terbaru
- [ ] `NotificationsPage.tsx` — semua notifikasi
- [ ] `useNotifications.ts`
- [ ] `notificationApi.ts`
- [ ] Real-time polling setiap 30 detik (atau SSE/WebSocket)

---

## 🔗 PHASE 6 — Integration (Future Scope)

### 6.1 Export PDF/Excel
- [ ] Install `exceljs` atau `xlsx` di backend untuk export Excel
- [ ] Install `@react-pdf/renderer` atau gunakan puppeteer untuk export PDF
- [ ] Implementasi export di semua modul laporan
- [ ] Template PDF yang branded (logo, header, footer)

### 6.2 Barcode/RFID
- [ ] Install `jsbarcode` atau `react-barcode` di frontend
- [ ] Generate barcode untuk setiap item
- [ ] Print label barcode
- [ ] Scanner input support (keyboard wedge mode) untuk GR, GI, Opname

### 6.3 Email Notification
- [ ] Setup email service (nodemailer / Resend / SendGrid)
- [ ] Email template untuk: PO Confirmed, GR Completed, Stock Opname reminder
- [ ] Konfigurasi SMTP di .env

---

## 🧱 PHASE 0 — Komponen Shared (Lintas Modul)

> Harus dibuat sebelum/selama Phase 2-3 agar konsisten di semua fitur

### Layout Components
- [ ] `src/components/layout/Sidebar.tsx`
  - [ ] Navigation menu per role (hide menu tidak relevan)
  - [ ] Collapsible sidebar
  - [ ] Active route highlight
- [ ] `src/components/layout/Header.tsx`
  - [ ] Notification bell
  - [ ] User avatar + dropdown (profile, logout)
  - [ ] Breadcrumb
- [ ] `src/components/layout/AppLayout.tsx` — wrapper Sidebar + Header + main content

### Shared/Reusable Components
- [ ] `src/components/shared/DataTable.tsx` — tabel generik dengan sorting, pagination, search
- [ ] `src/components/shared/PageHeader.tsx` — judul halaman + action buttons
- [ ] `src/components/shared/StatusBadge.tsx` — badge status dokumen (DRAFT/PENDING/APPROVED/dsb)
- [ ] `src/components/shared/ConfirmDialog.tsx` — dialog konfirmasi hapus/approve/reject
- [ ] `src/components/shared/LoadingSpinner.tsx`
- [ ] `src/components/shared/EmptyState.tsx`
- [ ] `src/components/shared/FormField.tsx` — wrapper React Hook Form field
- [ ] `src/components/shared/DateRangePicker.tsx` — date range selector untuk filter laporan
- [ ] `src/components/shared/SearchInput.tsx` — search dengan debounce
- [ ] `src/components/shared/Pagination.tsx` — komponen pagination

### Custom Hooks
- [ ] `src/hooks/useDebounce.ts`
- [ ] `src/hooks/usePagination.ts`
- [ ] `src/hooks/usePermission.ts` — cek role/permission user saat ini
- [ ] `src/hooks/useToast.ts` — wrapper notifikasi toast

### Utilities
- [ ] `src/lib/auth.tsx` — **URGENT**: AuthProvider yang diimport App.tsx belum ada!
- [ ] `src/lib/queryClient.ts` — TanStack Query client setup
- [ ] `src/lib/constants.ts` — konstanta global (ROLES, STATUS, dsb.)
- [ ] `src/lib/formatters.ts` — format angka, tanggal, currency (IDR)

---

## 🐛 BUG / ISSUES Saat Ini

- [ ] 🔴 **CRITICAL:** `src/lib/auth.tsx` tidak ada tapi diimport di `App.tsx` → app akan crash
- [ ] 🔴 **CRITICAL:** shadcn/ui components diexport di `components/ui/index.ts` tapi file komponen belum ada (button.tsx, input.tsx, card.tsx, dsb.)
- [ ] ⚠️ **CORS:** Backend hardcode `origin: 'http://localhost:3000'` tapi Vite dev server jalan di port `5173`
- [ ] ⚠️ **App.tsx:** Belum ada React Router `<Routes>` / `<BrowserRouter>` — hanya render `<AuthProvider>` kosong
- [ ] ⚠️ **TanStack Query:** QueryClientProvider belum di-setup di `main.tsx`

---

## 📋 Urutan Prioritas Pengerjaan

```
1. Fix bugs kritis (auth.tsx, shadcn components) → App bisa jalan
2. Setup DB schema + koneksi Drizzle
3. Auth backend (login, JWT, middleware)
4. Auth frontend (login page, protected routes)
5. Layout + komponen shared
6. Master Data (backend + frontend)
7. Procurement (PR → PO)
8. Receiving (GR + QC)
9. Inventory Management
10. Goods Issue
11. Transfer
12. Dashboard + Charts
13. Stock Opname
14. Return Management
15. Audit Trail
16. Laporan & Export
17. Notifikasi
18. Barcode/RFID + Email (future)
```

---

## 🔄 Update Log

| Tanggal | Perubahan |
|---------|-----------|
| 2026-04-25 | Inisialisasi TODO.md berdasarkan analisis kondisi proyek vs AGENTS.md |

