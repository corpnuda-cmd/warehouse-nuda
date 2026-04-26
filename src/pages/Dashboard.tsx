import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, AlertTriangle, Truck, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1f2937]">Dashboard</h2>
        <p className="text-[#6b7280]">Warehouse Management System Overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-white border-[#e5e7eb] rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b7280]">Total Items</CardTitle>
            <div className="w-9 h-9 bg-[#4b49ac]/10 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-[#4b49ac]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">0</div>
            <p className="text-xs text-[#6b7280]">Active products</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e7eb] rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b7280]">Stock In Today</CardTitle>
            <div className="w-9 h-9 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#10b981]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">0</div>
            <p className="text-xs text-[#6b7280]">Items received</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e7eb] rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b7280]">Stock Out Today</CardTitle>
            <div className="w-9 h-9 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center">
              <Truck className="h-4 w-4 text-[#3b82f6]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">0</div>
            <p className="text-xs text-[#6b7280]">Items issued</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e7eb] rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b7280]">Low Stock Alerts</CardTitle>
            <div className="w-9 h-9 bg-[#ef4444]/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1f2937]">0</div>
            <p className="text-xs text-[#6b7280]">Items below reorder point</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Link to="/procurement">
          <Card className="bg-gradient-to-br from-[#4b49ac] to-[#6366f1] text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Procurement</p>
                  <p className="text-2xl font-bold mt-1">Purchase Requests</p>
                  <p className="text-white/70 text-sm mt-2">Create PR & PO</p>
                </div>
                <ArrowRight className="w-6 h-6 text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/receiving">
          <Card className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Receiving</p>
                  <p className="text-2xl font-bold mt-1">Goods Receipt</p>
                  <p className="text-white/70 text-sm mt-2">GR & Quality Control</p>
                </div>
                <ArrowRight className="w-6 h-6 text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/items">
          <Card className="bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Master Data</p>
                  <p className="text-2xl font-bold mt-1">Items</p>
                  <p className="text-white/70 text-sm mt-2">Manage inventory items</p>
                </div>
                <ArrowRight className="w-6 h-6 text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border-[#e5e7eb] rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1f2937]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#f3f4f6] rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-[#9ca3af]" />
            </div>
            <p className="text-[#6b7280]">No recent activity yet.</p>
            <p className="text-sm text-[#9ca3af]">Start by adding items or processing transactions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}