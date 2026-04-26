# AGENTS.md - Web Aplikasi Inventory Management System

> **Last Updated:** 2026-04-26
> **TODO Detail:** Lihat [TODO.md](./TODO.md) untuk task list lengkap dan progress tracking
> **Current Phase:** Phase 2 — Core Modules (66% - Procurement & Receiving Complete)

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

## 📂 Struktur Folder (Enhanced)

```
warehouse-nuda/
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .gitignore
├── eslint.config.js            # ESLint configuration
├── package.json                # Dependencies & scripts
├── pnpm-lock.yaml              # Lock file
├── tsconfig.json               # TypeScript base config
├── tsconfig.app.json           # Frontend TS config
├── tsconfig.node.json          # Node/Backend TS config
├── vite.config.ts              # Vite configuration
├── README.md                   # Project documentation
├── AGENTS.md                   # Project instructions
├── TODO.md                     # Task tracking
│
├── public/                     # Static assets
│   ├── favicon.svg
│   ├── icons.svg
│   └── robots.txt
│
├── src/                        # Frontend Application
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Main App component
│   ├── App.css                 # Global styles
│   ├── index.css               # Tailwind imports
│   │
│   ├── assets/                 # Static assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Layout.tsx        # Main layout with sidebar (NEW)
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   └── shared/             # Shared/common components
│   │       ├── DataTable.tsx
│   │       ├── PageTitle.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── SearchFilter.tsx
│   │
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── master-data/        # Master data feature
│   │   │   ├── items/
│   │   │   │   ├── ItemsPage.tsx
│   │   │   │   ├── ItemsTable.tsx
│   │   │   │   ├── ItemForm.tsx
│   │   │   │   └── index.ts
│   │   │   ├── categories/
│   │   │   ├── suppliers/
│   │   │   ├── warehouses/
│   │   │   ├── uoms/
│   │   │   └── ...
│   │   │
│   │   ├── procurement/        # Procurement feature
│   │   │   ├── purchase-requests/
│   │   │   └── purchase-orders/
│   │   │
│   │   ├── receiving/          # Receiving/GR feature
│   │   │   ├── goods-receipts/
│   │   │   └── quality-control/
│   │   │
│   │   ├── inventory/          # Inventory feature
│   │   │   ├── stocks/
│   │   │   ├── movements/
│   │   │   └── alerts/
│   │   │
│   │   ├── issuing/            # Issuing feature
│   │   │   ├── issue-requests/
│   │   │   └── goods-issues/
│   │   │
│   │   ├── transfer/           # Transfer feature
│   │   │   └── ...
│   │   │
│   │   ├── stock-opname/       # Stock opname feature
│   │   │   └── ...
│   │   │
│   │   ├── return/             # Return feature
│   │   │   └── ...
│   │   │
│   │   └── reports/            # Reports feature
│   │       ├── dashboard/
│   │       └── analytics/
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── lib/                    # Utilities & configurations
│   │   ├── axios.ts            # Axios instance
│   │   ├── utils.ts            # Helper functions
│   │   ├── constants.ts        # App constants
│   │   └── formatters.ts       # Date, currency formatters
│   │
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   └── Unauthorized.tsx
│   │
│   ├── routes/                 # Routing configuration
│   │   ├── index.tsx           # Main router
│   │   ├── AppRoutes.tsx       # App routes
│   │   └── PrivateRoute.tsx    # Protected routes
│   │
│   ├── store/                  # State management (Zustand)
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── notificationStore.ts
│   │
│   └── types/                  # TypeScript type definitions
│       ├── index.ts
│       ├── api.ts
│       └── models.ts
│
├── server/                     # Backend Application (Hono)
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── app.ts              # Hono app setup
│   │   └── routes/             # API routes
│   │
│   │   ├── lib/                # Backend utilities
│   │   │   ├── db.ts           # Database connection
│   │   │   ├── logger.ts       # Logger utility
│   │   │   └── cache.ts        # Cache utility
│   │
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth.ts         # JWT auth middleware
│   │   │   ├── error.ts        # Error handling
│   │   │   ├── logger.ts       # Request logging
│   │   │   ├── cors.ts         # CORS config
│   │   │   └── rateLimit.ts    # Rate limiting
│   │
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── controller.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── repository.ts
│   │   │   │   ├── routes.ts
│   │   │   │   └── schema.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── controller.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── repository.ts
│   │   │   │   ├── routes.ts
│   │   │   │   └── schema.ts
│   │   │   │
│   │   │   ├── master-data/
│   │   │   │   ├── items/
│   │   │   │   ├── categories/
│   │   │   │   ├── suppliers/
│   │   │   │   ├── warehouses/
│   │   │   │   └── uoms/
│   │   │   │
│   │   │   ├── procurement/
│   │   │   │   ├── purchase-requests/
│   │   │   │   └── purchase-orders/
│   │   │   │
│   │   │   ├── receiving/
│   │   │   │   ├── goods-receipts/
│   │   │   │   └── quality-control/
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── stocks/
│   │   │   │   ├── movements/
│   │   │   │   └── alerts/
│   │   │   │
│   │   │   ├── issuing/
│   │   │   │   ├── issue-requests/
│   │   │   │   └── goods-issues/
│   │   │   │
│   │   │   ├── transfer/
│   │   │   ├── stock-opname/
│   │   │   ├── return/
│   │   │   └── reports/
│   │   │
│   │   └── validators/         # Zod validation schemas
│   │       ├── auth.schema.ts
│   │       ├── user.schema.ts
│   │       └── common.schema.ts
│   │
│   └── package.json            # Server dependencies
│
├── database/                   # Database files
│   ├── migrations/             # Drizzle migrations
│   │   └── ...
│   │
│   ├── seeds/                  # Seed data
│   │   └── ...
│   │
│   └── schema/                 # Drizzle schema definitions
│       ├── index.ts
│       ├── users.ts
│       ├── items.ts
│       ├── categories.ts
│       ├── stocks.ts
│       └── ...
│
└── docs/                       # Documentation
    ├── API.md                  # API documentation
    ├── DATABASE.md             # Database schema docs
    └── CHANGELOG.md            # Version history
```

### 📌 Current Project State

| Category | Status | Notes |
|----------|--------|-------|
| Frontend Setup | ✅ Complete | Vite + React + TS |
| TailwindCSS + Skydash Theme | ✅ Complete | Theme colors applied |
| Folder Structure | ✅ Complete | Full feature structure |
| Authentication | ✅ Complete | Login with JWT |
| **Master Data UI** | ✅ Complete | Items, Categories, Suppliers |
| Layout + Sidebar | ✅ Complete | Responsive with navigation |
| Login Credentials | ✅ Complete | Uses seeded users (admin/admin123) |
| Backend | ⬜ Need Setup | API endpoints not yet created |
| Database | ⬜ Need Setup | MySQL with XAMPP |

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

## 🔄 Alur Sistem (Workflow - Enhanced)

### **Workflow Utama End-to-End**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WAREHOUSE MANAGEMENT SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ 1. AUTH      │───▶│ 2. DASHBOARD │───▶│ 3. MASTER    │                  │
│  │ Login        │    │ Role-based   │    │ DATA         │                  │
│  │ Logout       │    │ Overview     │    │ Items, Cat,  │                  │
│  │ Session      │    │ Quick Stats  │    │ Suppliers    │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                     │                       │
│                                                     ▼                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ 10. REPORTS  │◀───│ 9. RETURNS   │◀───│ 4. PROCUREMENT│                 │
│  │ Analytics    │    │ Customer     │    │ PR → PO      │                  │
│  │ Export       │    │ Supplier     │    │ Approval     │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│          │                   │                   │                         │
│          ▼                   ▼                   ▼                         │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                     5. INVENTORY (CENTRAL HUB)                   │       │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │       │
│  │  │ Stocks  │  │Move-ment│  │Reserve │  │ Alerts  │             │       │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘             │       │
│  └───────┼────────────┼────────────┼────────────┼───────────────────┘       │
│          │            │            │            │                           │
│          ▼            ▼            ▼            ▼                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │6.RECEIVING   │ │7. ISSUING    │ │8.TRANSFER    │ │9.STOCK OPNAME│       │
│  │ GR + QC      │ │ IR + GI      │ │ WH→WH/Store  │ │ Reconciliation│       │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **Detail Workflow per Modul**

#### **1. Authentication Flow**
```
User Login → JWT Token生成 → Store Token → Redirect to Dashboard
     ↓
Role Check → Load Permission → Show Menu Based on Role
     ↓
Session Check → Token Refresh (if needed) → Auto Logout (if expired)
```

#### **2. Master Data Management**
```
Items → Categories → UoM → Suppliers → Warehouses → Racks → Bins
     ↓
Vendor Price List (Optional link to Items + Suppliers)
     ↓
Data Validation → Audit Log every create/update/delete
```

#### **3. Procurement Workflow (Full Cycle)**
```
┌────────────────────────────────────────────────────────────────┐
│  PR Creation        │ Approval          │ PO Generation       │
│  ─────────────      │ ────────          │ ────────────        │
│  1. User Request    │ Manager Review    │ Auto-generate from  │
│  2. Item Selection  │ Check Budget      │ approved PR         │
│  3. Quantity        │ Approve/Reject    │ Send to Supplier    │
│  4. Notes           │ Update Status     │ Track Delivery      │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  Goods Receipt (GR)              │ Quality Control (QC)       │
│  ─────────────────               │ ────────────────           │
│  1. Receive PO Delivery          │ 1. Inspect Items           │
│  2. Verify PO vs Delivery        │ 2. Accept/Reject           │
│  3. Create GR Document           │ 3. Record Variance         │
│  4. Update Stock                 │ 4. Update GR Status        │
└────────────────────────────────────────────────────────────────┘
```

#### **4. Inventory Management (Central Hub)**
```
┌────────────────────────────────────────────────────────────────┐
│  Real-time Monitoring    │ Stock Alerts        │ Movement     │
│  ───────────────────     │ ───────────         │ ────────     │
│  • Qty Available         │ • Min Stock         │ • Inbound    │
│  • Qty Reserved          │ • Reorder Point     │ • Outbound   │
│  • Qty On Hand           │ • Overstock         │ • Transfer   │
│  • Warehouse Location    │ • Expiry Warning    │ • Adjustment │
└────────────────────────────────────────────────────────────────┘
        ↓                    ↓                     ↓
  Stock Reservation ←── Real-time Updates ──→ Audit Trail
```

#### **5. Issuing Workflow**
```
Request (IR) → Approval → Pick List → Goods Issue (GI) → Stock Out
     ↓              ↓           ↓            ↓              ↓
  User Create   Manager     Warehouse    Generate GI    Update
                Approve     Staff Pick   Number         Stock
```

#### **6. Transfer Workflow**
```
Transfer Request → Approval → Pick from Source → Ship → Receive at Dest → Update Stock
       ↓              ↓              ↓             ↓          ↓              ↓
    User          Manager       Warehouse     Transport   Receiver      System
    Create       Approve       Staff         Delivery    Confirm       Auto-update
```

#### **7. Stock Opname Workflow**
```
Plan (Select Items/WH) → Schedule → Count → Input Results → Reconcile → Adjust (if needed)
       ↓                    ↓           ↓          ↓            ↓            ↓
  Admin Create   Set Date    Staff     Manual     System       Auto or
                 & Scope     Count     Entry      Compare      Manual Entry
```

#### **8. Return Management**
```
Return Request → QC Inspection → Approve/Reject → Process → Update Stock
      ↓               ↓               ↓              ↓           ↓
   Customer     Inspector        Manager       Warehouse   Inventory
   Submit       Check Item       Decision      Process     Update
```

#### **9. Reports & Analytics**
```
Data Aggregation → Filtering → Visualization → Export
      ↓              ↓            ↓              ↓
  Daily/Monthly   By Date/Item   Charts/Tables  PDF/Excel
  Summary         Warehouse      Trends         Download
                  User           Analysis
```

### **Critical Business Rules**
1. **Stock Reservation:** Stock must be available before GI can be processed
2. **Approval Hierarchy:** PR must be approved before PO can be created
3. **QC Required:** All GR must pass QC before stock is updated
4. **Transfer Validation:** Source warehouse must have sufficient stock
5. **Audit Trail:** Every transaction must be logged for accountability
6. **Document Numbering:** Auto-generated with format: [TYPE]-YYYYMMDD-XXXX

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

## 🎨 UI/UX Design System

### Color Palette (Skydash Theme)
```css
/* Primary Colors */
--primary: #4b49ac          /* Main brand color - indigo */
--primary-hover: #3a3a8a     /* Darker shade for hover */
--primary-light: #98bdff    /* Light blue for accents */
--primary-foreground: #ffffff

/* Secondary Colors */
--secondary: #f5f6fa      /* Light gray background */
--secondary-foreground: #3f4a59

/* Accent Colors */
--accent: #7978e9          /* Purple accent */
--accent-pink: #f3797e      /* Pink for destructive/warning */

/* Status Colors */
--success: #10b981         /* Green - approved, passed */
--warning: #f59e0b         /* Yellow - pending, draft */
--danger: #ef4444           /* Red - rejected, error */
--info: #3b82f6            /* Blue - information */

/* Neutral Colors */
--background: #f0f2f5       /* Main background */
--surface: #ffffff          /* Card background */
--border: #e5e7eb         /* Border color */
--text-primary: #1f2937    /* Primary text */
--text-secondary: #6b7280  /* Secondary text */
--text-muted: #9ca3af      /* Muted text */
```

### Typography
```css
/* Font Family */
--font-family: 'Inter', system-ui, -apple-system, sans-serif

/* Font Sizes */
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem    /* 18px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-3xl: 1.875rem  /* 30px */

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System
```css
/* Spacing Scale */
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem   /* 8px */
--space-3: 0.75rem  /* 12px */
--space-4: 1rem     /* 16px */
--space-5: 1.25rem  /* 20px */
--space-6: 1.5rem   /* 24px */
--space-8: 2rem     /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
```

### Border Radius
```css
--radius-sm: 0.375rem   /* 6px */
--radius-md: 0.5rem     /* 8px */
--radius-lg: 0.75rem    /* 12px */
--radius-xl: 1rem       /* 16px */
--radius-full: 9999px    /* pill */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

### Component Standards

#### Buttons
| Variant | Background | Text | Border | Use Case |
|---------|-----------|------|--------|---------|
| Primary | `#4b49ac` | White | None | Main actions |
| Secondary | `#f5f6fa` | `#3f4a59` | None | Secondary actions |
| Outline | White | `#4b49ac` | `#e5e7eb` | Tertiary actions |
| Danger | `#ef4444` | White | None | Delete actions |
| Ghost | Transparent | `#6b7280` | None | Subtle actions |

#### Cards
- Background: White
- Border: 1px solid `#e5e7eb`
- Border-radius: 12px (lg)
- Padding: 24px
- Shadow: sm

#### Form Inputs
- Height: 40px
- Border: 1px solid `#e5e7eb`
- Border-radius: 8px
- Focus: ring 2px `#4b49ac`/30

#### Tables
- Header: `#f9fafb` background
- Border: 1px solid `#e5e7eb`
- Row hover: `#f9fafb`
- Padding: 12px 16px

#### Badges/Status
| Status | Background | Text |
|--------|-----------|-------|
| Draft | `#f3f4f6` | `#6b7280` |
| Pending | `#fef3c7` | `#d97706` |
| Approved | `#d1fae5` | `#059669` |
| Rejected | `#fee2e2` | `#dc2626` |
| Active | `#dbeafe` | `#2563eb` |
| Inactive | `#f3f4f6` | `#9ca3af` |

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

### Phase 1 - Foundation ✅ (100%)
- ✅ Setup project FE & BE *(struktur dasar ada)*
- ✅ Database schema & migration *(Drizzle schema sudah dibuat)*
- ✅ Authentication & RBAC *(authStore FE + Login)*

### Phase 2 - Core Modules 🔵 (33%)
- 🚧 Master Data *(Items, Categories, Suppliers - Frontend done, need Backend API)*
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
