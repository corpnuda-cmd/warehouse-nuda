import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

// Pages (will be created later)
const LoginPage = () => import('./pages/LoginPage').then(m => m.default || (() => <div>Login Page</div>))
const DashboardPage = () => import('./features/dashboard/DashboardPage').then(m => m.default || (() => <div>Dashboard</div>))
const ItemsPage = () => import('./features/master-data/ItemsPage').then(m => m.default || (() => <div>Items</div>))
const NotFoundPage = () => <div>404 - Not Found</div>
const UnauthorizedPage = () => <div>403 - Unauthorized</div>

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<DashboardPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="purchase-requests" element={<div>Purchase Requests</div>} />
        <Route path="purchase-orders" element={<div>Purchase Orders</div>} />
        <Route path="goods-receipts" element={<div>Goods Receipts</div>} />
        <Route path="stocks" element={<div>Stocks</div>} />
        <Route path="issue-requests" element={<div>Issue Requests</div>} />
        <Route path="goods-issues" element={<div>Goods Issues</div>} />
        <Route path="transfers" element={<div>Transfers</div>} />
        <Route path="stock-opnames" element={<div>Stock Opname</div>} />
        <Route path="returns" element={<div>Returns</div>} />
        <Route path="reports" element={<div>Reports</div>} />
        <Route path="users" element={<div>Users</div>} />
        <Route path="settings" element={<div>Settings</div>} />
      </Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <AppRoutes />
        <Toaster />
      </div>
    </AuthProvider>
  )
}

export default App
