import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/features/inventory/api/inventoryApi'
import { warehousesApi } from '@/features/master-data/api/masterDataApi'

const statusColors: Record<string, string> = {
  IN: 'bg-green-100 text-green-800',
  OUT: 'bg-red-100 text-red-800',
  ADJUSTMENT: 'bg-blue-100 text-blue-800',
  TRANSFER_IN: 'bg-purple-100 text-purple-800',
  TRANSFER_OUT: 'bg-orange-100 text-orange-800',
  RESERVATION: 'bg-yellow-100 text-yellow-800',
  RELEASE: 'bg-gray-100 text-gray-800',
}

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'stocks' | 'movements' | 'alerts'>('stocks')
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustNotes, setAdjustNotes] = useState('')
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)

  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses'], queryFn: () => warehousesApi.getAll() })

  const { data: stocks = [], isLoading: loadingStocks } = useQuery({
    queryKey: ['stocks', selectedWarehouse],
    queryFn: () => inventoryApi.getStocks(selectedWarehouse ? { warehouseId: selectedWarehouse } : undefined),
  })

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['movements'],
    queryFn: () => inventoryApi.getMovements({ limit: 100 }),
  })

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => inventoryApi.getAlerts(),
  })

  const adjustMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => inventoryApi.adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      setIsAdjustModalOpen(false)
    },
  })

  const openAdjust = (stock: any) => {
    setSelectedStock(stock)
    setAdjustQty(stock.qty_available)
    setAdjustNotes('')
    setIsAdjustModalOpen(true)
  }

  const handleAdjust = () => {
    if (!selectedStock) return
    adjustMutation.mutate({
      id: selectedStock.id,
      data: { qty_available: parseInt(adjustQty), notes: adjustNotes },
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory</h1>

      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === 'stocks' ? 'default' : 'outline'} onClick={() => setActiveTab('stocks')}>Stocks</Button>
        <Button variant={activeTab === 'movements' ? 'default' : 'outline'} onClick={() => setActiveTab('movements')}>Movements</Button>
        <Button variant={activeTab === 'alerts' ? 'default' : 'outline'} onClick={() => setActiveTab('alerts')}>
          Alerts {alerts.length > 0 && <Badge className="ml-2 bg-red-500 text-white">{alerts.length}</Badge>}
        </Button>
      </div>

      {activeTab === 'stocks' && (
        <div>
          <div className="mb-4">
            <select
              className="border rounded px-3 py-2"
              value={selectedWarehouse || ''}
              onChange={e => setSelectedWarehouse(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Warehouses</option>
              {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
            </select>
          </div>
          <Card>
            <CardContent className="p-0">
              {loadingStocks ? <div className="p-6 text-center">Memuat...</div> : stocks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Belum ada data stock</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Warehouse</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Bin</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Qty Available</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Min Stock</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((stock: any) => (
                        <tr key={stock.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{stock.item_code}</div>
                            <div className="text-sm text-gray-500">{stock.item_name}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">{stock.warehouse_name}</td>
                          <td className="px-4 py-3 text-sm">{stock.bin_code || '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${stock.qty_available <= stock.min_stock ? 'text-red-600' : ''}`}>
                              {stock.qty_available}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{stock.min_stock}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => openAdjust(stock)}>Adjust</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'movements' && (
        <Card>
          <CardContent className="p-0">
            {loadingMovements ? <div className="p-6 text-center">Memuat...</div> : movements.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Belum ada data movements</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Warehouse</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Qty</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Reference</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m: any) => (
                      <tr key={m.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(m.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{m.item_code}</div>
                          <div className="text-xs text-gray-500">{m.item_name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{m.warehouse_name}</td>
                        <td className="px-4 py-3"><Badge className={statusColors[m.type] || ''}>{m.type}</Badge></td>
                        <td className="px-4 py-3 text-right font-bold">{m.qty}</td>
                        <td className="px-4 py-3 text-sm">{m.reference_type || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{m.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items yang stock-nya di bawah minimum</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingAlerts ? <div className="p-6 text-center">Memuat...</div> : alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Tidak ada alerts</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Warehouse</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Current Stock</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Min Stock</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Reorder Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert: any) => (
                      <tr key={alert.id} className="border-b hover:bg-gray-50 bg-red-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{alert.item_code}</div>
                          <div className="text-sm text-gray-500">{alert.item_name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{alert.warehouse_name}</td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">{alert.qty_available}</td>
                        <td className="px-4 py-3 text-right text-sm">{alert.min_stock}</td>
                        <td className="px-4 py-3 text-right text-sm text-orange-600">{alert.reorder_point}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adjust Modal */}
      {isAdjustModalOpen && selectedStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader><CardTitle>Adjust Stock</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Item</Label>
                  <div className="font-medium">{selectedStock.item_name}</div>
                  <div className="text-sm text-gray-500">{selectedStock.item_code}</div>
                </div>
                <div>
                  <Label>Current Qty</Label>
                  <div className="text-lg font-bold">{selectedStock.qty_available}</div>
                </div>
                <div>
                  <Label>New Qty</Label>
                  <Input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} required />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} placeholder="Reason for adjustment" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)}>Batal</Button>
                  <Button onClick={handleAdjust} disabled={adjustMutation.isPending}>
                    {adjustMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}