# AGENTS.md - Web Aplikasi Inventory Management System

> **Last Updated:** 2026-04-25
> **TODO Detail:** Lihat [TODO.md](./TODO.md) untuk task list lengkap dan progress tracking
> **Current Phase:** Phase 1 — Foundation (60% setup, belum ada DB & Auth)

---

## 📌 Project Overview

**Nama Proyek:** Inventory Warehouse Management System (WMS)
**Target:** Perusahaan Skala Besar (seperti Djarum, Indomaret, Alfamart)
**Tujuan:** Mengelola alur inventory gudang dari procurement hingga pengeluaran barang dengan audit trail lengkap.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18+ dengan TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS + shadcn/ui
- **State Management:** Zustand / Redux Toolkit
- **Data Fetching:** TanStack Query (React Query)
- **Form Handling:** React Hook Form + Zod
- **Routing:** React Router v6
- **HTTP Client:** Axios / Fetch API
- **Charts:** Recharts / Chart.js (untuk laporan & analitik)

### **Backend**
- **Runtime:** Node.js / Bun
- **Framework:** Hono (TypeScript)
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Authentication:** JWT + bcrypt
- **Middleware:** CORS, Rate Limiter, Logger

### **Database**
- **DBMS:** MySQL (via XAMPP / phpMyAdmin)
- **Migration Tool:** Drizzle Kit

### **Tools Pendukung**
- **API Testing:** Postman
- **Version Control:** Git + GitHub
- **Package Manager:** pnpm / npm

---

## 📂 Struktur Folder

### **Frontend (fe-inventory/)**
```
fe-inventory/
    ├── public/
    ├── src/ 
    │ ├── assets/ 
    │ ├── components/ 
    │ │ ├── ui/ # shadcn components 
    │ │ ├── layout/ # Sidebar, Header, Footer 
    │ │ └── shared/ # Reusable components 
    │ ├── features/ 
    │ │ ├── auth/ 
    │ │ ├── master-data/ 
    │ │ ├── procurement/ 
    │ │ ├── receiving/ 
    │ │ ├── inventory/ 
    │ │ ├── issuing/ 
    │ │ ├── transfer/ 
    │ │ ├── stock-opname/ 
    │ │ ├── return/ 
    │ │ └── reports/ 
    │ ├── hooks/ 
    │ ├── lib/ # axios config, utils 
    │ ├── pages/ 
    │ ├── routes/ 
    │ ├── store/ # Zustand stores 
    │ ├── types/ 
    │ └── main.tsx 
    ├── .env 
    ├── tsconfig.json 
    └── vite.config.ts
```

### **Backend (be-inventory/)**
```
be-inventory/ 
    ├── src/ 
    │ ├── config/ # DB config, env 
    │ ├── middleware/ # Auth, logger, error handler 
    │ ├── modules/ 
    │ │ ├── auth/ 
    │ │ ├── users/ 
    │ │ ├── master-data/ 
    │ │ ├── procurement/ 
    │ │ ├── receiving/ 
    │ │ ├── inventory/ 
    │ │ ├── issuing/ 
    │ │ ├── transfer/ 
    │ │ ├── stock-opname/ 
    │ │ ├── return/ 
    │ │ └── reports/ 
    │ ├── utils/ 
    │ ├── validators/ # Zod schemas 
    │ ├── prisma/ 
    │ │ └── schema.prisma 
    │ └── index.ts # Entry Hono app 
    ├── .env 
    ├── tsconfig.json 
    └── package.json
```


---

## 🔐 Peran Pengguna (Role-Based Access Control)

- **Super Admin:** Full akses semua modul + pengaturan sistem
- **Admin:** Manajemen user, master data, approval
- **Purchasing:** PR, PO, Vendor management
- **Gudang:** Penerimaan, pengeluaran, transfer, stock opname
- **Store User:** Request barang, terima transfer
- **Finance:** Laporan keuangan, pembelian
- **Auditor:** Read-only untuk audit trail & laporan

---

## 🔄 Alur Sistem (Workflow)

### **1. Authentication Flow**
- User Login → Autentikasi (JWT) → Dashboard
- Jika gagal → kembali ke Login

### **2. Master Data Module**
- Data Item/Produk
- Kategori
- Satuan (UoM)
- Supplier
- Lokasi / Warehouse / Store
- Rak / Bin
- BOM (Bill of Materials) - opsional
- Vendor & Price List

### **3. Pembelian (Procurement)**
- Buat **Permintaan Pembelian (PR)**
- **Persetujuan PR** (oleh Manager/Admin)
- Generate **Purchase Order (PO)** ke Supplier
- **Penerimaan Konfirmasi PO**

### **4. Penerimaan Barang (Goods Receipt)**
- Barang datang dari Supplier
- **Pemeriksaan Barang (QC)**
- Jika **Sesuai** → Penerimaan Barang (GR) → Update Stok Masuk
- Jika **Tidak Sesuai** → Retur ke Supplier

### **5. Inventory Management**
- Monitoring **Stok Tersedia**
- **Stok Minimum & Reorder Point** (trigger notifikasi)
- **Reservasi Stok**
- **Monitoring Stok Real-time**
- **Mutasi Stok** (Auto/Manual)

### **6. Pengeluaran Barang (Goods Issue)**
- **Permintaan Barang (Issue Request)**
- **Persetujuan**
- **Pick / Pengambilan Barang**
- **Pengeluaran Barang (GI)**
- **Update Stok Keluar**

### **7. Transfer Antar Lokasi**
- Request Transfer → Persetujuan → Pengiriman → Penerimaan di Lokasi Tujuan → Update Stok (Asal & Tujuan)

### **8. Stock Opname**
- Perencanaan → Pelaksanaan → Input Hasil Hitung → Rekonsiliasi
- Jika **Selisih** → Adjust/Koreksi Stok
- Jika **Tidak** → Selesai

### **9. Return / Retur**
- Retur ke Supplier (barang tidak sesuai)
- Retur dari Customer (barang rusak/reject)
- Pemeriksaan → Jika sesuai → Update Stok Retur; Jika tidak → Tolak Retur

### **10. Laporan & Analitik**
- Stok On Hand
- Stok Movement
- Pembelian
- Pengeluaran
- Aging Inventory
- Stock Opname
- Mutasi Stok
- Laporan Kustom

---

## 🗄️ Database Schema (MySQL)

### **Tabel Utama**
```sql
-- USERS & AUTH
users (id, username, email, password, role_id, is_active, created_at, updated_at)
roles (id, name, description)
permissions (id, role_id, module, action)

-- MASTER DATA
items (id, code, name, category_id, uom_id, min_stock, reorder_point, price)
categories (id, name, parent_id)
uoms (id, name, symbol)
suppliers (id, code, name, contact, address, email, phone)
warehouses (id, code, name, address, type)
racks (id, warehouse_id, code, name)
bins (id, rack_id, code, capacity)
vendor_price_list (id, supplier_id, item_id, price, valid_from, valid_to)

-- PROCUREMENT
purchase_requests (id, pr_number, requested_by, status, notes, created_at)
purchase_request_items (id, pr_id, item_id, qty, notes)
purchase_orders (id, po_number, pr_id, supplier_id, status, total, created_at)
purchase_order_items (id, po_id, item_id, qty, price, subtotal)

-- RECEIVING
goods_receipts (id, gr_number, po_id, received_by, qc_status, notes, created_at)
goods_receipt_items (id, gr_id, item_id, qty_received, qty_accepted, qty_rejected)

-- INVENTORY
stocks (id, item_id, warehouse_id, bin_id, qty_available, qty_reserved)
stock_movements (id, item_id, warehouse_id, type, qty, reference_id, reference_type, created_at)

-- ISSUING
issue_requests (id, ir_number, requested_by, status, notes, created_at)
issue_request_items (id, ir_id, item_id, qty)
goods_issues (id, gi_number, ir_id, issued_by, created_at)
goods_issue_items (id, gi_id, item_id, qty)

-- TRANSFER
transfers (id, transfer_number, from_warehouse, to_warehouse, status, created_at)
transfer_items (id, transfer_id, item_id, qty)

-- STOCK OPNAME
stock_opnames (id, so_number, warehouse_id, plan_date, status, created_at)
stock_opname_items (id, so_id, item_id, qty_system, qty_actual, variance)

-- RETURNS
returns (id, return_number, type, reference_id, status, created_at)
return_items (id, return_id, item_id, qty, reason)

-- AUDIT LOG
audit_logs (id, user_id, action, module, reference_id, old_data, new_data, ip, created_at)
```

---

## 🌐 API Endpoints (Hono Routes)
### Base URL: http://localhost:3000/api/v1
- POST /auth/login
- POST /auth/logout
- GET /auth/me

### Master Data
- GET|POST|PUT|DELETE /items
- GET|POST|PUT|DELETE /categories
- GET|POST|PUT|DELETE /suppliers
- GET|POST|PUT|DELETE /warehouses

### Procurement
- GET|POST /purchase-requests
- PATCH /purchase-requests/:id/approve
- GET|POST /purchase-orders

### Receiving
- GET|POST /goods-receipts
- POST /goods-receipts/:id/qc

### Inventory
- GET /stocks
- GET /stocks/movements
- GET /stocks/low-stock-alert

### Issuing
- GET|POST /issue-requests
- POST /goods-issues

### Transfer, Stock Opname, Returns, Reports (pola serupa)

---

## 🔔 Sistem Notifikasi
- Stok Minimum tercapai
- PO Disetujui
- Barang Datang
- Jadwal Stock Opname
- Retur diproses
- Email / In-app notification

---

## 🔗 Integrasi Sistem (Future Scope)
- ERP / SAP
- Akuntansi
- POS / Retail System
- WMS (Warehouse Management)
- TMS (Transport Management)
- Barcode / RFID Scanner
- Email / SMS Gateway

---

## 📏 Coding Standards
### Frontend
- Gunakan functional components + hooks
- TypeScript strict mode aktif
- Gunakan PascalCase untuk component, camelCase untuk variable
- Pisahkan business logic ke custom hooks
- Gunakan React Query untuk API state
- Validasi form dengan Zod + React Hook Form

### Backend
- Modular architecture per fitur (controller, service, repository)
- Validasi request pakai Zod
- Response format konsisten: `{ success: boolean, data: any, message: string }`
- Error handling terpusat via middleware
- JWT untuk autentikasi, RBAC untuk otorisasi
- Logging setiap aktivitas ke tabel audit_logs

### Konvensi Penamaan File
| Tipe | Konvensi | Contoh |
|------|----------|--------|
| React Component | PascalCase.tsx | `ItemsPage.tsx`, `DataTable.tsx` |
| Hook | camelCase.ts (prefix `use`) | `useItems.ts`, `useDebounce.ts` |
| API function file | camelCase (suffix `Api`) | `itemsApi.ts`, `authApi.ts` |
| BE Service | camelCase.service.ts | `items.service.ts` |
| BE Controller | camelCase.controller.ts | `items.controller.ts` |
| BE Routes | camelCase.routes.ts | `items.routes.ts` |
| BE Zod Schema | camelCase.schema.ts | `items.schema.ts` |
| DB Schema | snake_case.ts | `purchase_orders.ts` |

### Konvensi Document Number
| Dokumen | Format | Contoh |
|---------|--------|--------|
| Purchase Request | PR-YYYYMMDD-XXXX | PR-20260425-0001 |
| Purchase Order | PO-YYYYMMDD-XXXX | PO-20260425-0001 |
| Goods Receipt | GR-YYYYMMDD-XXXX | GR-20260425-0001 |
| Goods Issue | GI-YYYYMMDD-XXXX | GI-20260425-0001 |
| Transfer | TRF-YYYYMMDD-XXXX | TRF-20260425-0001 |
| Stock Opname | SO-YYYYMMDD-XXXX | SO-20260425-0001 |
| Return | RTN-YYYYMMDD-XXXX | RTN-20260425-0001 |

---

## 🔁 Aturan Update Dokumentasi

> **WAJIB:** Setiap kali ada perubahan pada proyek, update kedua file ini:

### Kapan Update AGENTS.md
- Perubahan tech stack atau dependencies
- Perubahan struktur folder
- Perubahan API endpoints
- Perubahan database schema
- Bug baru ditemukan → tambahkan ke Known Issues
- Bug teratasi → hapus dari Known Issues
- Status file berubah → update tabel Status File

### Kapan Update TODO.md
- Task selesai → ubah `[ ]` menjadi `[x]`
- Task baru ditemukan → tambahkan ke section yang sesuai
- Bug ditemukan → tambahkan ke section 🐛 BUG / ISSUES
- Progress phase berubah → update tabel Progress Overview
- Setiap update → catat di Update Log dengan tanggal

---

## ✅ Development Roadmap

> Status: ✅ Done | 🚧 In Progress | ⬜ Not Started | 🟡 Partial
> Detail task per item → lihat [TODO.md](./TODO.md)

### Phase 1 - Foundation 🟡 (60%)
- 🟡 Setup project FE & BE *(struktur dasar ada, belum lengkap)*
- ⬜ Database schema & migration *(Drizzle schema belum dibuat)*
- 🟡 Authentication & RBAC *(authStore FE ada, BE auth belum diimplementasi)*

### Phase 2 - Core Modules ⬜ (0%)
- ⬜ Master Data *(endpoint belum ada)*
- ⬜ Procurement (PR, PO) *(endpoint belum ada)*
- ⬜ Receiving (GR, QC) *(endpoint belum ada)*

### Phase 3 - Operations ⬜ (0%)
- ⬜ Inventory Management *(endpoint belum ada)*
- ⬜ Issuing (Issue Request, GI) *(endpoint belum ada)*
- ⬜ Transfer Antar Lokasi *(endpoint belum ada)*

### Phase 4 - Control ⬜ (0%)
- ⬜ Stock Opname *(belum ada)*
- ⬜ Return Management *(belum ada)*
- ⬜ Audit Trail *(belum ada)*

### Phase 5 - Analytics ⬜ (0%)
- ⬜ Dashboard real-time *(belum ada)*
- ⬜ Laporan & Analitik *(belum ada)*
- ⬜ Notifikasi system *(belum ada)*

### Phase 6 - Integration ⬜ (0%)
- ⬜ Barcode/RFID *(future scope)*
- ⬜ Email notification *(future scope)*
- ⬜ Export PDF/Excel *(future scope)*

---

## 🐛 Known Issues (Harus Diperbaiki Segera)

1. **CRITICAL:** `src/lib/auth.tsx` tidak ada tapi diimport di `App.tsx` → app crash
2. **CRITICAL:** shadcn/ui components belum ada (button, input, card, dsb.) tapi sudah diexport
3. **WARNING:** CORS backend hardcode port `3000` padahal Vite jalan di `5173`
4. **WARNING:** `App.tsx` belum ada React Router setup
5. **WARNING:** TanStack Query `QueryClientProvider` belum ada di `main.tsx`

---

## 📁 Status File Saat Ini

### Backend (be-inventory/)
| File | Status | Keterangan |
|------|--------|------------|
| `src/index.ts` | 🟡 Partial | Hanya boilerplate, belum ada routes nyata |
| `src/config/` | ⬜ Missing | Belum dibuat |
| `src/middleware/` | ⬜ Missing | Belum dibuat |
| `src/modules/` | ⬜ Missing | Belum dibuat |
| `src/db/schema/` | ⬜ Missing | Belum dibuat |

### Frontend (fe-inventory/)
| File | Status | Keterangan |
|------|--------|------------|
| `src/App.tsx` | 🟡 Partial | AuthProvider diimport tapi file belum ada |
| `src/main.tsx` | 🟡 Partial | QueryClient belum setup |
| `src/lib/axios.ts` | ✅ Done | Interceptor auth sudah ada |
| `src/lib/auth.tsx` | ⬜ Missing | **CRITICAL** — diimport tapi belum ada |
| `src/store/authStore.ts` | ✅ Done | Zustand + persist |
| `src/types/index.ts` | ✅ Done | Types dasar sudah ada |
| `src/components/ui/` | 🟡 Partial | index.ts ada, file komponen belum ada |
| `src/features/` | ⬜ Missing | Belum ada satu pun feature module |
| `src/pages/` | ⬜ Missing | Belum ada |
| `src/routes/` | ⬜ Missing | Belum ada |