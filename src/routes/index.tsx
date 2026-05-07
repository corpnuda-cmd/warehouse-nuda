import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Items from '@/pages/Items'
import Categories from '@/pages/Categories'
import Suppliers from '@/pages/Suppliers'
import Uoms from '@/pages/Uoms'
import Warehouses from '@/pages/Warehouses'
import Locations from '@/pages/Locations'
import ImportExport from '@/pages/ImportExport'
import Procurement from '@/pages/Procurement'
import Receiving from '@/pages/Receiving'

// Simple wrapper that checks auth and renders Layout
function ProtectedLayout() {
  const isAuthenticated = useAuthStore.getState().isAuthenticated

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Layout />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'items', element: <Items /> },
      { path: 'categories', element: <Categories /> },
      { path: 'suppliers', element: <Suppliers /> },
      { path: 'uoms', element: <Uoms /> },
      { path: 'warehouses', element: <Warehouses /> },
      { path: 'locations', element: <Locations /> },
      { path: 'import-export', element: <ImportExport /> },
      { path: 'procurement', element: <Procurement /> },
      { path: 'receiving', element: <Receiving /> },
      { path: 'transactions', element: <div className="p-6"><h1 className="text-2xl font-bold text-[#3f4a59]">Transactions</h1><p className="text-[#898989]">Coming soon...</p></div> },
      { path: 'reports', element: <div className="p-6"><h1 className="text-2xl font-bold text-[#3f4a59]">Reports</h1><p className="text-[#898989]">Coming soon...</p></div> },
    ]
  },
  { path: '*', element: <NotFound /> },
])