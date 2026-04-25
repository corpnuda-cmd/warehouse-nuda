import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

// Protected Route wrapper
function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

// Public Route (redirect to dashboard if already logged in)
function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  {
    // Public routes
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
  {
    // Protected routes
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      // Add more protected routes here as features are built
      // {
      //   path: '/items',
      //   element: <ItemsPage />,
      // },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])