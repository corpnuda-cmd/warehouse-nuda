import { createBrowserRouter, redirect } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Placeholder pages - akan dibuat kemudian
const LoginPage = () => import('@/pages/LoginPage').then(m => m.default || m)
const DashboardPage = () => import('@/features/dashboard/DashboardPage').then(m => m.default || m)
const ItemsPage = () => import('@/features/master-data/ItemsPage').then(m => m.default || m)

// Public routes (tanpa login)
const publicRoutes = [
  { path: '/login', name: 'Login', exact: true },
]

// Protected routes (harus login)
const protectedRoutes = [
  { path: '/', name: 'Dashboard', component: DashboardPage, roles: ['super_admin', 'admin', 'purchasing', 'gudang', 'store_user', 'finance', 'auditor'] },
  { path: '/items', name: 'Items', component: ItemsPage, roles: ['super_admin', 'admin', 'purchasing', 'gudang'] },
  { path: '/purchase-requests', name: 'Purchase Requests', roles: ['super_admin', 'admin', 'purchasing'] },
  { path: '/purchase-orders', name: 'Purchase Orders', roles: ['super_admin', 'admin', 'purchasing'] },
  { path: '/goods-receipts', name: 'Goods Receipts', roles: ['super_admin', 'admin', 'gudang'] },
  { path: '/stocks', name: 'Stocks', roles: ['super_admin', 'admin', 'gudang', 'store_user'] },
  { path: '/issue-requests', name: 'Issue Requests', roles: ['super_admin', 'admin', 'gudang', 'store_user'] },
  { path: '/goods-issues', name: 'Goods Issues', roles: ['super_admin', 'admin', 'gudang'] },
  { path: '/transfers', name: 'Transfers', roles: ['super_admin', 'admin', 'gudang', 'store_user'] },
  { path: '/stock-opnames', name: 'Stock Opname', roles: ['super_admin', 'admin', 'gudang'] },
  { path: '/returns', name: 'Returns', roles: ['super_admin', 'admin', 'gudang'] },
  { path: '/reports', name: 'Reports', roles: ['super_admin', 'admin', 'finance', 'auditor'] },
  { path: '/users', name: 'Users', roles: ['super_admin', 'admin'] },
  { path: '/settings', name: 'Settings', roles: ['super_admin', 'admin'] },
]

// Error routes
const errorRoutes = [
  { path: '/unauthorized', name: 'Unauthorized' },
  { path: '/not-found', name: 'Not Found' },
]

export const routes = [
  ...publicRoutes,
  ...protectedRoutes,
  ...errorRoutes,
]

export const router = createBrowserRouter([
  {
    path: '/',
    loader: () => {
      const token = useAuthStore.getState().token
      if (!token) {
        throw redirect('/login')
      }
      return null
    },
    children: [
      { index: true, element: <DashboardPage /> },
      ...protectedRoutes.map(route => ({
        path: route.path,
        element: route.component ? <route.component /> : <div>{route.name}</div>,
      })),
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/unauthorized', element: <div>Unauthorized</div> },
  { path: '*', element: <div>Not Found</div> },
])

export default router