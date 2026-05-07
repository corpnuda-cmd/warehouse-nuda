import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stockOpnameApi } from '@/features/control/api/controlApi'
import { warehousesApi } from '@/features/master-data/api/masterDataApi'
import { itemsApi } from '@/features/items/api/itemsApi'

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function StockOpnamePage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSO, setSelectedSO] = useState<any>(null)
  const [form, setForm] = useState({ warehouseId: '', planDate: '', notes: '', itemIds: [] as number[] })
  const [counts, setCounts] = useState<Record<number, number>>({})

  const { data: stockOpnames = [], isLoading } = useQuery({ queryKey: ['stockOpnames'], queryFn: () => stockOpnameApi.getAll() })
  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses'], queryFn: () => warehousesApi.getAll() })
  const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: () => itemsApi.getAll() })

  const createMutation = useMutation({ mutationFn: (data: any) => stockOpnameApi.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['stockOpnames'] }); setIsModalOpen(false) } })
  const updateMutation = useMutation({ mutationFn: ({ id, data }: any) => stockOpnameApi.updateStatus(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['stockOpnames'] }); setSelectedSO(null) } })

  const openCreate = () => { setForm({ warehouseId: '', planDate: '', notes: '', itemIds: [] }); setIsModalOpen(true) }
  const openCount = (so: any) => {
    setSelectedSO(so)
    const initialCounts: Record<number, number> = {}
    so.items?.forEach((item: any) => { initialCounts[item.item_id] = item.qty_actual || item.qty_system })
    setCounts(initialCounts)
  }

  const handleCreate = () => {
    if (!form.warehouseId || form.itemIds.length === 0) return
    createMutation.mutate({ warehouseId: parseInt(form.warehouseId), planDate: form.planDate, notes: form.notes, itemIds: form.itemIds })
  }

  const handleSubmitCount = () => {
    if (!selectedSO) return
    const countsArray = Object.entries(counts).map(([itemId, qtyActual]) => ({ itemId: parseInt(itemId), qtyActual }))
    updateMutation.mutate({ id: selectedSO.id, data: { status: 'in_progress', counts: countsArray } })
  }

  const handleComplete = () => {
    if (!selectedSO) return
    updateMutation.mutate({ id: selectedSO.id, data: { status: 'completed' } })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Opname</h1>
        <Button onClick={openCreate}>+ Create Stock Opname Plan</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6 text-center">Memuat...</div> : stockOpnames.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada Stock Opname</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">SO Number</th>
                    <th className="px-4 py-3 text-left">Warehouse</th>
                    <th className="px-4 py-3 text-left">Plan Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {stockOpnames.map((so: any) => (
                    <tr key={so.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{so.so_number}</td>
                      <td className="px-4 py-3 text-sm">{so.warehouse_name}</td>
                      <td className="px-4 py-3 text-sm">{so.plan_date}</td>
                      <td className="px-4 py-3"><Badge className={statusColors[so.status]}>{so.status}</Badge></td>
                      <td className="px-4 py-3 text-sm">{so.items?.length || 0} items</td>
                      <td className="px-4 py-3 text-right">
                        {so.status === 'planned' && <Button variant="ghost" size="sm" onClick={() => openCount(so)}>Input Count</Button>}
                        {so.status === 'in_progress' && <Button variant="ghost" size="sm" onClick={() => openCount(so)}>View/Edit Count</Button>}
                        {so.status === 'in_progress' && <Button variant="ghost" size="sm" onClick={() => handleComplete()}>Complete</Button>}
                        {so.status === 'planned' && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Delete?')) stockOpnameApi.delete(so.id).then(() => queryClient.invalidateQueries({ queryKey: ['stockOpnames'] })) }}>Delete</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[80vh] overflow-y-auto">
            <CardHeader><CardTitle>Create Stock Opname Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Warehouse</Label>
                  <select className="w-full border rounded px-3 py-2" value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })}>
                    <option value="">Select Warehouse</option>
                    {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Plan Date</Label>
                  <Input type="date" value={form.planDate} onChange={e => setForm({ ...form, planDate: e.target.value })} />
                </div>
                <div>
                  <Label>Select Items to Count</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                    {items.map((item: any) => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1">
                        <input type="checkbox" checked={form.itemIds.includes(item.id)} onChange={e => {
                          if (e.target.checked) setForm({ ...form, itemIds: [...form.itemIds, item.id] })
                          else setForm({ ...form, itemIds: form.itemIds.filter(id => id !== item.id) })
                        }} />
                        <span className="text-sm">{item.code} - {item.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{form.itemIds.length} items selected</p>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>Create Plan</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Count Modal */}
      {selectedSO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[600px] max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Stock Opname - {selectedSO.so_number}</CardTitle>
              <p className="text-sm text-gray-500">Warehouse: {selectedSO.warehouse_name} | Status: {selectedSO.status}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <p className="font-medium">Instructions:</p>
                  <p>1. Physically count items in the warehouse</p>
                  <p>2. Enter actual count in the input field</p>
                  <p>3. System will calculate variance automatically</p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm">Item</th>
                      <th className="px-3 py-2 text-right text-sm">System Qty</th>
                      <th className="px-3 py-2 text-right text-sm">Actual Count</th>
                      <th className="px-3 py-2 text-right text-sm">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSO.items?.map((item: any) => {
                      const actual = counts[item.item_id] ?? item.qty_actual ?? item.qty_system
                      const variance = actual - item.qty_system
                      return (
                        <tr key={item.item_id} className="border-b">
                          <td className="px-3 py-2">
                            <div className="font-medium text-sm">{item.item_code}</div>
                            <div className="text-xs text-gray-500">{item.item_name}</div>
                          </td>
                          <td className="px-3 py-2 text-right">{item.qty_system}</td>
                          <td className="px-3 py-2 text-right">
                            <Input type="number" className="w-20 text-right" value={actual} onChange={e => setCounts({ ...counts, [item.item_id]: parseInt(e.target.value) || 0 })} />
                          </td>
                          <td className={`px-3 py-2 text-right font-bold ${variance === 0 ? 'text-green-600' : variance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {variance > 0 ? '+' : ''}{variance}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSelectedSO(null)}>Cancel</Button>
                  <Button onClick={handleSubmitCount} disabled={updateMutation.isPending}>Save Counts</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}