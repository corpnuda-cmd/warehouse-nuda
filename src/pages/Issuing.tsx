import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/features/inventory/api/inventoryApi'
import { warehousesApi } from '@/features/master-data/api/masterDataApi'
import { itemsApi } from '@/features/items/api/itemsApi'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  fulfilled: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function IssuingPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'issue-requests' | 'goods-issues' | 'pick-lists'>('issue-requests')
  const [isIRModalOpen, setIsIRModalOpen] = useState(false)
  const [isGIModalOpen, setIsGIModalOpen] = useState(false)
  const [selectedIR, setSelectedIR] = useState<any>(null)
  const [selectedPickList, setSelectedPickList] = useState<any>(null)
  const [irForm, setIrForm] = useState({ warehouseId: '', notes: '', items: [] as { itemId: number; qty: number }[] })
  const [giForm, setGiForm] = useState({ irId: '', warehouseId: '', notes: '', items: [] as { itemId: number; qty: number }[] })

  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses'], queryFn: () => warehousesApi.getAll() })
  const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: () => itemsApi.getAll() })
  const { data: issueRequests = [], isLoading: loadingIR } = useQuery({ queryKey: ['issueRequests'], queryFn: () => inventoryApi.getIssueRequests() })
  const { data: goodsIssues = [], isLoading: loadingGI } = useQuery({ queryKey: ['goodsIssues'], queryFn: () => inventoryApi.getGoodsIssues() })
  const { data: pickLists = [], isLoading: loadingPL } = useQuery({ queryKey: ['pickLists'], queryFn: () => inventoryApi.getPickLists() })
  const { data: reservations = [] } = useQuery({ queryKey: ['reservations'], queryFn: () => inventoryApi.getReservations() })

  const createIRMutation = useMutation({ mutationFn: (data: any) => inventoryApi.createIssueRequest(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['issueRequests'] }); setIsIRModalOpen(false) } })
  const updateIRMutation = useMutation({ mutationFn: ({ id, data }: any) => inventoryApi.updateIssueRequest(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['issueRequests'] }); queryClient.invalidateQueries({ queryKey: ['pickLists'] }) } })
  const deleteIRMutation = useMutation({ mutationFn: (id: number) => inventoryApi.deleteIssueRequest(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issueRequests'] }) })
  const reserveMutation = useMutation({ mutationFn: (data: any) => inventoryApi.reserveStock(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['issueRequests'] }); queryClient.invalidateQueries({ queryKey: ['pickLists'] }); queryClient.invalidateQueries({ queryKey: ['reservations'] }) } })
  const createGIMutation = useMutation({ mutationFn: (data: any) => inventoryApi.createGoodsIssue(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goodsIssues'] }); queryClient.invalidateQueries({ queryKey: ['issueRequests'] }); queryClient.invalidateQueries({ queryKey: ['pickLists'] }); setIsGIModalOpen(false) } })

  const openCreateIR = () => { setIrForm({ warehouseId: '', notes: '', items: [] }); setIsIRModalOpen(true) }
  const openCreateGI = (ir?: any) => {
    if (ir) { setSelectedIR(ir); setGiForm({ irId: String(ir.id), warehouseId: String(ir.warehouse_id), notes: '', items: ir.items.map((i: any) => ({ itemId: i.item_id, qty: i.qty })) }) }
    else { setSelectedIR(null); setGiForm({ irId: '', warehouseId: '', notes: '', items: [] }) }
    setIsGIModalOpen(true)
  }
  const handleCreateIR = () => {
    if (!irForm.warehouseId || irForm.items.length === 0) return
    createIRMutation.mutate({ warehouseId: parseInt(irForm.warehouseId), notes: irForm.notes, items: irForm.items })
  }
  const handleCreateGI = () => {
    if (!giForm.warehouseId) return
    createGIMutation.mutate({ irId: giForm.irId ? parseInt(giForm.irId) : undefined, warehouseId: parseInt(giForm.warehouseId), notes: giForm.notes, items: giForm.items })
  }
  const handleReserve = (irId: number) => {
    if (confirm('Reserve stock for this IR?')) {
      reserveMutation.mutate({ irId })
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Issuing</h1>

      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === 'issue-requests' ? 'default' : 'outline'} onClick={() => setActiveTab('issue-requests')}>Issue Requests</Button>
        <Button variant={activeTab === 'goods-issues' ? 'default' : 'outline'} onClick={() => setActiveTab('goods-issues')}>Goods Issues</Button>
        <Button variant={activeTab === 'pick-lists' ? 'default' : 'outline'} onClick={() => setActiveTab('pick-lists')}>Pick Lists</Button>
      </div>

      {activeTab === 'issue-requests' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateIR}>+ Create Issue Request</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {loadingIR ? <div className="p-6 text-center">Memuat...</div> : issueRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Belum ada Issue Request</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">IR Number</th>
                      <th className="px-4 py-3 text-left">Requested By</th>
                      <th className="px-4 py-3 text-left">Warehouse</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Items</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issueRequests.map((ir: any) => (
                      <tr key={ir.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{ir.ir_number}</td>
                        <td className="px-4 py-3 text-sm">{ir.requested_by_name}</td>
                        <td className="px-4 py-3 text-sm">{ir.warehouse_name}</td>
                        <td className="px-4 py-3"><Badge className={statusColors[ir.status]}>{ir.status}</Badge></td>
                        <td className="px-4 py-3 text-sm">{ir.items?.length || 0} items</td>
                        <td className="px-4 py-3 text-right">
                          {ir.status === 'draft' && <Button variant="ghost" size="sm" onClick={() => updateIRMutation.mutate({ id: ir.id, data: { status: 'pending' } })}>Submit</Button>}
                          {ir.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => handleReserve(ir.id)}>Reserve Stock</Button>}
                          {ir.status === 'approved' && <Button variant="ghost" size="sm" onClick={() => openCreateGI(ir)}>Create GI</Button>}
                          {ir.status === 'draft' && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Delete IR?')) deleteIRMutation.mutate(ir.id) }}>Delete</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'goods-issues' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => openCreateGI()}>+ Create Goods Issue</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {loadingGI ? <div className="p-6 text-center">Memuat...</div> : goodsIssues.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Belum ada Goods Issue</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">GI Number</th>
                      <th className="px-4 py-3 text-left">IR Reference</th>
                      <th className="px-4 py-3 text-left">Issued By</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goodsIssues.map((gi: any) => (
                      <tr key={gi.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{gi.gi_number}</td>
                        <td className="px-4 py-3 text-sm">{gi.ir_number || '-'}</td>
                        <td className="px-4 py-3 text-sm">{gi.issued_by_name}</td>
                        <td className="px-4 py-3 text-sm">{new Date(gi.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">{gi.items?.length || 0} items</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'pick-lists' && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pick Lists</CardTitle>
              <p className="text-sm text-gray-500">Stock yang sudah di-reserve untuk IR yang pending/approved</p>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPL ? <div className="p-6 text-center">Memuat...</div> : pickLists.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Belum ada pick list. Submit IR terlebih dahulu, lalu reserve stock.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">IR Number</th>
                      <th className="px-4 py-3 text-left">Warehouse</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Items Reserved</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickLists.map((ir: any) => (
                      <tr key={ir.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{ir.ir_number}</td>
                        <td className="px-4 py-3 text-sm">{ir.warehouse_name}</td>
                        <td className="px-4 py-3"><Badge className={statusColors[ir.status]}>{ir.status}</Badge></td>
                        <td className="px-4 py-3 text-sm">
                          {ir.reservations?.length || 0} items reserved
                          {ir.reservations?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {ir.reservations.slice(0, 2).map((r: any) => `${r.item_code} (${r.bin_code || 'no bin'})`).join(', ')}
                              {ir.reservations.length > 2 && ` +${ir.reservations.length - 2} more`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPickList(ir)}>View Pick List</Button>
                          {ir.status === 'approved' && <Button variant="ghost" size="sm" onClick={() => openCreateGI(ir)}>Create GI</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Pick List Detail Modal */}
          {selectedPickList && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-[600px] max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Pick List - {selectedPickList.ir_number}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPickList(null)}>X</Button>
                  </div>
                  <p className="text-sm text-gray-500">Warehouse: {selectedPickList.warehouse_name} | Status: {selectedPickList.status}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPickList.reservations?.length > 0 ? (
                      selectedPickList.reservations.map((r: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border">
                          <div className="w-8 h-8 bg-[#4b49ac] text-white rounded-full flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                          <div className="flex-1">
                            <div className="font-medium">{r.item_code} - {r.item_name}</div>
                            <div className="text-sm text-gray-500">
                              Location: <span className="font-mono bg-gray-200 px-1 rounded">{r.rack_code || '-'}{r.bin_code ? ` > ${r.bin_code}` : ''}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{r.qty_reserved}</div>
                            <div className="text-xs text-gray-500">units</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>Belum ada stock yang di-reserve.</p>
                        <p className="text-sm">Klik "Reserve Stock" pada IR untuk mengalokasikan stock.</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    {selectedPickList.status === 'approved' && (
                      <Button onClick={() => { openCreateGI(selectedPickList); setSelectedPickList(null) }}>Create Goods Issue</Button>
                    )}
                    <Button variant="outline" onClick={() => setSelectedPickList(null)}>Close</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* IR Modal */}
      {isIRModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[80vh] overflow-y-auto">
            <CardHeader><CardTitle>Create Issue Request</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Warehouse</Label>
                  <select className="w-full border rounded px-3 py-2" value={irForm.warehouseId} onChange={e => setIrForm({ ...irForm, warehouseId: e.target.value })}>
                    <option value="">Select Warehouse</option>
                    {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Items</Label>
                  <div className="space-y-2">
                    {irForm.items.map((item, idx) => {
                      const itemData = items.find((i: any) => i.id === item.itemId)
                      return (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="flex-1 text-sm">{itemData?.name || `Item #${item.itemId}`}</span>
                          <Input type="number" value={item.qty} onChange={e => { const items = [...irForm.items]; items[idx] = { ...items[idx], qty: parseInt(e.target.value) }; setIrForm({ ...irForm, items }) }} className="w-24" />
                          <Button variant="ghost" size="sm" onClick={() => setIrForm({ ...irForm, items: irForm.items.filter((_, i) => i !== idx) })}>X</Button>
                        </div>
                      )
                    })}
                    <select className="w-full border rounded px-3 py-2" onChange={e => { if (e.target.value) { setIrForm({ ...irForm, items: [...irForm.items, { itemId: parseInt(e.target.value), qty: 1 }] }); e.target.value = '' } }}>
                      <option value="">Add Item...</option>
                      {items.map((i: any) => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={irForm.notes} onChange={e => setIrForm({ ...irForm, notes: e.target.value })} placeholder="Optional notes" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsIRModalOpen(false)}>Batal</Button>
                  <Button onClick={handleCreateIR} disabled={createIRMutation.isPending}>Create</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* GI Modal */}
      {isGIModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[80vh] overflow-y-auto">
            <CardHeader><CardTitle>{selectedIR ? 'Create GI from IR' : 'Create Goods Issue'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedIR && <div className="p-3 bg-gray-50 rounded text-sm">From IR: {selectedIR.ir_number}</div>}
                {!selectedIR && (
                  <div>
                    <Label>Warehouse</Label>
                    <select className="w-full border rounded px-3 py-2" value={giForm.warehouseId} onChange={e => setGiForm({ ...giForm, warehouseId: e.target.value })}>
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <Label>Items</Label>
                  <div className="space-y-2">
                    {giForm.items.map((item, idx) => {
                      const itemData = items.find((i: any) => i.id === item.itemId)
                      return (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="flex-1 text-sm">{itemData?.name || `Item #${item.itemId}`}</span>
                          <span className="text-sm text-gray-500">x{item.qty}</span>
                        </div>
                      )
                    })}
                    {!selectedIR && (
                      <>
                        {giForm.items.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="flex-1 text-sm">{(items.find((i: any) => i.id === item.itemId) as any)?.name || `Item #${item.itemId}`}</span>
                            <Input type="number" value={item.qty} onChange={e => { const items = [...giForm.items]; items[idx] = { ...items[idx], qty: parseInt(e.target.value) }; setGiForm({ ...giForm, items }) }} className="w-24" />
                            <Button variant="ghost" size="sm" onClick={() => setGiForm({ ...giForm, items: giForm.items.filter((_, i) => i !== idx) })}>X</Button>
                          </div>
                        ))}
                        <select className="w-full border rounded px-3 py-2" onChange={e => { if (e.target.value) { setGiForm({ ...giForm, items: [...giForm.items, { itemId: parseInt(e.target.value), qty: 1 }] }); e.target.value = '' } }}>
                          <option value="">Add Item...</option>
                          {items.map((i: any) => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
                        </select>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={giForm.notes} onChange={e => setGiForm({ ...giForm, notes: e.target.value })} placeholder="Optional notes" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsGIModalOpen(false)}>Batal</Button>
                  <Button onClick={handleCreateGI} disabled={createGIMutation.isPending}>Create GI & Deduct Stock</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}