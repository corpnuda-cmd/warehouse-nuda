import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { returnsApi } from '@/features/control/api/controlApi'
import { suppliersApi } from '@/features/suppliers/api/suppliersApi'
import { itemsApi } from '@/features/items/api/itemsApi'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  qc_inspection: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  processed: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function ReturnsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'supplier' | 'customer'>('supplier')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<any>(null)
  const [form, setForm] = useState({ type: 'supplier', supplierId: '', referenceId: '', referenceType: 'GR', reason: '', items: [] as { itemId: number; qty: number; reason: string }[] })
  const [qcResults, setQcResults] = useState<Record<number, { qtyAccepted: number; qtyRejected: number; notes: string }>>({})

  const { data: returns = [], isLoading } = useQuery({ queryKey: ['returns', activeTab], queryFn: () => returnsApi.getAll({ type: activeTab }) })
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: () => suppliersApi.getAll() })
  const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: () => itemsApi.getAll() })

  const createMutation = useMutation({ mutationFn: (data: any) => returnsApi.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['returns'] }); setIsModalOpen(false) } })
  const updateMutation = useMutation({ mutationFn: ({ id, data }: any) => returnsApi.updateStatus(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['returns'] }); setSelectedReturn(null) } })

  const openCreate = () => { setForm({ type: activeTab, supplierId: '', referenceId: '', referenceType: 'GR', reason: '', items: [] }); setIsModalOpen(true) }
  const openQC = (ret: any) => {
    setSelectedReturn(ret)
    const initial: Record<number, any> = {}
    ret.items?.forEach((item: any) => { initial[item.item_id] = { qtyAccepted: item.qty || 0, qtyRejected: 0, notes: '' } })
    setQcResults(initial)
  }

  const handleCreate = () => {
    if (form.items.length === 0) return
    createMutation.mutate({ ...form, supplierId: form.supplierId ? parseInt(form.supplierId) : undefined })
  }

  const handleQCSubmit = () => {
    if (!selectedReturn) return
    const qcArray = Object.entries(qcResults).map(([itemId, data]) => ({ itemId: parseInt(itemId), ...data }))
    updateMutation.mutate({ id: selectedReturn.id, data: { status: 'qc_inspection', qcResults: qcArray } })
  }

  const handleApprove = () => {
    if (!selectedReturn) return
    updateMutation.mutate({ id: selectedReturn.id, data: { status: 'approved' } })
  }

  const handleProcess = () => {
    if (!selectedReturn) return
    updateMutation.mutate({ id: selectedReturn.id, data: { status: 'processed' } })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Returns</h1>

      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === 'supplier' ? 'default' : 'outline'} onClick={() => setActiveTab('supplier')}>Supplier Returns</Button>
        <Button variant={activeTab === 'customer' ? 'default' : 'outline'} onClick={() => setActiveTab('customer')}>Customer Returns</Button>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>+ Create Return Request</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6 text-center">Memuat...</div> : returns.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada Return {activeTab === 'supplier' ? 'Supplier' : 'Customer'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Return Number</th>
                    <th className="px-4 py-3 text-left">Supplier</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((ret: any) => (
                    <tr key={ret.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{ret.return_number}</td>
                      <td className="px-4 py-3 text-sm">{ret.supplier_name || '-'}</td>
                      <td className="px-4 py-3"><Badge className={statusColors[ret.status]}>{ret.status}</Badge></td>
                      <td className="px-4 py-3 text-sm">{ret.items?.length || 0} items</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{ret.reason || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        {ret.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => openQC(ret)}>QC Inspection</Button>}
                        {ret.status === 'qc_inspection' && <Button variant="ghost" size="sm" onClick={() => handleApprove()}>Approve</Button>}
                        {ret.status === 'approved' && <Button variant="ghost" size="sm" onClick={() => handleProcess()}>Process</Button>}
                        {ret.status === 'pending' && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Cancel return?')) returnsApi.delete(ret.id).then(() => queryClient.invalidateQueries({ queryKey: ['returns'] })) }}>Cancel</Button>}
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
            <CardHeader><CardTitle>Create Return Request ({activeTab === 'supplier' ? 'Supplier' : 'Customer'})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeTab === 'supplier' && (
                  <div>
                    <Label>Supplier</Label>
                    <select className="w-full border rounded px-3 py-2" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                      <option value="">Select Supplier</option>
                      {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <Label>Reference (GR Number / IR Number)</Label>
                  <Input value={form.referenceId} onChange={e => setForm({ ...form, referenceId: e.target.value })} placeholder="Optional" />
                </div>
                <div>
                  <Label>Items</Label>
                  <div className="space-y-2">
                    {form.items.map((item, idx) => {
                      const itemData = items.find((i: any) => i.id === item.itemId)
                      return (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="flex-1 text-sm">{itemData?.name || `Item #${item.itemId}`}</span>
                          <Input type="number" value={item.qty} onChange={e => { const items = [...form.items]; items[idx] = { ...items[idx], qty: parseInt(e.target.value) }; setForm({ ...form, items }) }} className="w-20" placeholder="Qty" />
                          <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}>X</Button>
                        </div>
                      )
                    })}
                    <select className="w-full border rounded px-3 py-2" onChange={e => { if (e.target.value) { setForm({ ...form, items: [...form.items, { itemId: parseInt(e.target.value), qty: 1, reason: '' }] }); e.target.value = '' } }}>
                      <option value="">Add Item...</option>
                      {items.map((i: any) => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for return" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>Create</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QC Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[600px] max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>QC Inspection - {selectedReturn.return_number}</CardTitle>
              <p className="text-sm text-gray-500">Type: {selectedReturn.type}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm">Item</th>
                      <th className="px-3 py-2 text-right text-sm">Qty Returned</th>
                      <th className="px-3 py-2 text-right text-sm">Accepted</th>
                      <th className="px-3 py-2 text-right text-sm">Rejected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturn.items?.map((item: any) => (
                      <tr key={item.item_id} className="border-b">
                        <td className="px-3 py-2">
                          <div className="font-medium text-sm">{item.item_code}</div>
                          <div className="text-xs text-gray-500">{item.item_name}</div>
                        </td>
                        <td className="px-3 py-2 text-right">{item.qty}</td>
                        <td className="px-3 py-2 text-right">
                          <Input type="number" className="w-20 text-right" value={qcResults[item.item_id]?.qtyAccepted || 0} onChange={e => setQcResults({ ...qcResults, [item.item_id]: { ...qcResults[item.item_id], qtyAccepted: parseInt(e.target.value) || 0 } })} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Input type="number" className="w-20 text-right" value={qcResults[item.item_id]?.qtyRejected || 0} onChange={e => setQcResults({ ...qcResults, [item.item_id]: { ...qcResults[item.item_id], qtyRejected: parseInt(e.target.value) || 0 } })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSelectedReturn(null)}>Cancel</Button>
                  <Button onClick={handleQCSubmit}>Submit QC</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}