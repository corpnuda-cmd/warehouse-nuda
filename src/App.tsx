import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <Outlet />
    </div>
  )
}

export { ProtectedRoute, PublicRoute }