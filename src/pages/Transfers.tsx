import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transfersApi } from '@/features/inventory/api/inventoryApi'
import { warehousesApi } from '@/features/master-data/api/masterDataApi'
import { itemsApi } from '@/features/items/api/itemsApi'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  received: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function TransfersPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ fromWarehouseId: '', toWarehouseId: '', notes: '', items: [] as { itemId: number; qty: number }[] })

  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses'], queryFn: () => warehousesApi.getAll() })
  const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: () => itemsApi.getAll() })
  const { data: transfers = [], isLoading } = useQuery({ queryKey: ['transfers'], queryFn: () => transfersApi.getAll() })

  const createMutation = useMutation({ mutationFn: (data: any) => transfersApi.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transfers'] }); setIsModalOpen(false) } })
  const updateStatusMutation = useMutation({ mutationFn: ({ id, status }: any) => transfersApi.updateStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }) })
  const deleteMutation = useMutation({ mutationFn: (id: number) => transfersApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }) })

  const openCreate = () => { setForm({ fromWarehouseId: '', toWarehouseId: '', notes: '', items: [] }); setIsModalOpen(true) }

  const handleCreate = () => {
    if (!form.fromWarehouseId || !form.toWarehouseId || form.items.length === 0) return
    createMutation.mutate({
      fromWarehouseId: parseInt(form.fromWarehouseId),
      toWarehouseId: parseInt(form.toWarehouseId),
      notes: form.notes,
      items: form.items,
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transfers</h1>
        <Button onClick={openCreate}>+ Create Transfer</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">Memuat...</div>
          ) : transfers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada data transfer</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Transfer Number</th>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer: any) => (
                    <tr key={transfer.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{transfer.transfer_number}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>{transfer.from_warehouse_code}</div>
                        <div className="text-xs text-gray-500">{transfer.from_warehouse_name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>{transfer.to_warehouse_code}</div>
                        <div className="text-xs text-gray-500">{transfer.to_warehouse_name}</div>
                      </td>
                      <td className="px-4 py-3"><Badge className={statusColors[transfer.status]}>{transfer.status}</Badge></td>
                      <td className="px-4 py-3 text-sm">{transfer.items?.length || 0} items</td>
                      <td className="px-4 py-3 text-sm">{new Date(transfer.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        {transfer.status === 'draft' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => updateStatusMutation.mutate({ id: transfer.id, status: 'approved' })}>Approve</Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Delete transfer?')) deleteMutation.mutate(transfer.id) }}>Delete</Button>
                          </>
                        )}
                        {transfer.status === 'approved' && (
                          <Button variant="ghost" size="sm" onClick={() => updateStatusMutation.mutate({ id: transfer.id, status: 'received' })}>Mark Received</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[80vh] overflow-y-auto">
            <CardHeader><CardTitle>Create Transfer</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>From Warehouse</Label>
                  <select className="w-full border rounded px-3 py-2" value={form.fromWarehouseId} onChange={e => setForm({ ...form, fromWarehouseId: e.target.value })}>
                    <option value="">Select Warehouse</option>
                    {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>To Warehouse</Label>
                  <select className="w-full border rounded px-3 py-2" value={form.toWarehouseId} onChange={e => setForm({ ...form, toWarehouseId: e.target.value })}>
                    <option value="">Select Warehouse</option>
                    {warehouses.filter((wh: any) => wh.id !== parseInt(form.fromWarehouseId)).map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Items</Label>
                  <div className="space-y-2">
                    {form.items.map((item, idx) => {
                      const itemData = items.find((i: any) => i.id === item.itemId)
                      return (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="flex-1 text-sm">{itemData?.name || `Item #${item.itemId}`}</span>
                          <Input type="number" value={item.qty} onChange={e => { const items = [...form.items]; items[idx] = { ...items[idx], qty: parseInt(e.target.value) }; setForm({ ...form, items }) }} className="w-24" />
                          <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}>X</Button>
                        </div>
                      )
                    })}
                    <select className="w-full border rounded px-3 py-2" onChange={e => { if (e.target.value) { setForm({ ...form, items: [...form.items, { itemId: parseInt(e.target.value), qty: 1 }] }); e.target.value = '' } }}>
                      <option value="">Add Item...</option>
                      {items.map((i: any) => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>Create Transfer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}