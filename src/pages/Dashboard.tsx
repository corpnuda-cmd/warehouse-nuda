import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Package, TrendingUp, AlertTriangle, Truck, LogOut, User } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      {/* Header - Clean White */}
      <header className="bg-white border-b border-[#e8e8e8] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4b49ac] to-[#7978e9] rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#3f4a59]">Warehouse Nuda</h1>
              <p className="text-sm text-[#898989]">Inventory Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#f5f6fa] rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7da0fa] to-[#98bdff] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-[#3f4a59]">{user?.name || 'Admin'}</p>
                <p className="text-[#898989] capitalize">{user?.role?.replace('_', ' ') || 'admin'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2 border-[#e8e8e8] text-[#3f4a59] hover:bg-[#f5f6fa] hover:text-[#4b49ac]"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#3f4a59]">Dashboard</h2>
          <p className="text-[#898989]">Warehouse Management System Overview</p>
        </div>

        {/* Quick Stats - Minimal Blue Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#898989]">Total Items</CardTitle>
              <div className="w-8 h-8 bg-[#98bdff]/20 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-[#4b49ac]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3f4a59]">0</div>
              <p className="text-xs text-[#898989]">Active products</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#898989]">Stock In Today</CardTitle>
              <div className="w-8 h-8 bg-[#7da0fa]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#7da0fa]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3f4a59]">0</div>
              <p className="text-xs text-[#898989]">Items received</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#898989]">Stock Out Today</CardTitle>
              <div className="w-8 h-8 bg-[#7978e9]/20 rounded-lg flex items-center justify-center">
                <Truck className="h-4 w-4 text-[#7978e9]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3f4a59]">0</div>
              <p className="text-xs text-[#898989]">Items issued</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#898989]">Low Stock Alerts</CardTitle>
              <div className="w-8 h-8 bg-[#f3797e]/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-[#f3797e]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3f4a59]">0</div>
              <p className="text-xs text-[#898989]">Items below reorder point</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#3f4a59]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#f5f6fa] rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-[#898989]" />
              </div>
              <p className="text-[#898989]">No recent activity yet.</p>
              <p className="text-sm text-[#a0a0a0]">Start by adding items or processing transactions</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}