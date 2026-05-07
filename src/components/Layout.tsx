import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  Package,
  Truck,
  Folder,
  Home,
  LogOut,
  User,
  Menu,
  X,
  Boxes,
  ArrowLeftRight,
  BarChart3,
  ShoppingCart,
  PackageCheck,
  Building2,
  Ruler,
  MapPin,
  FileUp,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/items', label: 'Items', icon: Package },
  { path: '/categories', label: 'Categories', icon: Folder },
  { path: '/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/uoms', label: 'UoM', icon: Ruler },
  { path: '/warehouses', label: 'Warehouses', icon: Building2 },
  { path: '/locations', label: 'Locations', icon: MapPin },
  { path: '/procurement', label: 'Procurement', icon: ShoppingCart },
  { path: '/receiving', label: 'Receiving', icon: PackageCheck },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/import-export', label: 'Import/Export', icon: FileUp },
]

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-[#e5e7eb]
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4b49ac] to-[#6366f1] rounded-xl flex items-center justify-center shadow-lg">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-[#1f2937] truncate">Warehouse Nuda</h1>
                <p className="text-xs text-[#6b7280] truncate">Inventory System</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${
                      isActive
                        ? 'bg-[#4b49ac] text-white shadow-md'
                        : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1f2937]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[#e5e7eb]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#4b49ac] to-[#6366f1] rounded-full flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1f2937] truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-[#6b7280] capitalize truncate">
                  {user?.role?.replace('_', ' ') || 'admin'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 text-[#6b7280] hover:text-[#ef4444] hover:border-[#ef4444]"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-[#1f2937]" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#4b49ac] to-[#6366f1] rounded-lg flex items-center justify-center">
              <Boxes className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1f2937]">Warehouse Nuda</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}