import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseRequestsApi, purchaseOrdersApi } from '@/features/procurement/api/procurementApi'
import { itemsApi } from '@/features/items/api/itemsApi'
import { suppliersApi } from '@/features/suppliers/api/suppliersApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, FileText, Plus, Loader2 } from 'lucide-react'

type TabType = 'pr' | 'po'

export default function Procurement() {
  const [activeTab, setActiveTab] = useState<TabType>('pr')
  const [showCreatePR, setShowCreatePR] = useState(false)
  const [showCreatePO, setShowCreatePO] = useState(false)

  const [prItems, setPrItems] = useState<Array<{ itemId: number; qty: number; notes: string }>>([])
  const [prNotes, setPrNotes] = useState('')

  const [poSupplierId, setPoSupplierId] = useState<number>(0)
  const [poItems, setPoItems] = useState<Array<{ itemId: number; qty: number; price: number }>>([])
  const [poNotes, setPoNotes] = useState('')
  const [poExpectedDate, setPoExpectedDate] = useState('')

  const queryClient = useQueryClient()

  const { data: prs, isLoading: prsLoading } = useQuery({ queryKey: ['purchaseRequests'], queryFn: purchaseRequestsApi.getAll })
  const { data: pos, isLoading: posLoading } = useQuery({ queryKey: ['purchaseOrders'], queryFn: purchaseOrdersApi.getAll })
  const { data: items } = useQuery({ queryKey: ['items'], queryFn: itemsApi.getAll })
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: suppliersApi.getAll })

  const createPRMutation = useMutation({
    mutationFn: (data: any) => purchaseRequestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] })
      setShowCreatePR(false)
      setPrItems([])
      setPrNotes('')
    },
  })

  const updatePRMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => purchaseRequestsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] })
    },
  })

  const createPOMutation = useMutation({
    mutationFn: (data: any) => purchaseOrdersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      setShowCreatePO(false)
      setPoItems([])
      setPoNotes('')
      setPoSupplierId(0)
    },
  })

  const updatePOMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => purchaseOrdersApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  })

  const handleAddPRItem = () => setPrItems([...prItems, { itemId: 0, qty: 1, notes: '' }])
  const handleRemovePRItem = (index: number) => setPrItems(prItems.filter((_, i) => i !== index))
  const handlePRItemChange = (index: number, field: string, value: any) => {
    const newItems = [...prItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setPrItems(newItems)
  }

  const handleCreatePR = () => {
    const validItems = prItems.filter(i => i.itemId > 0 && i.qty > 0)
    if (validItems.length === 0) return
    createPRMutation.mutate({ notes: prNotes, items: validItems })
  }

  const handleAddPOItem = () => setPoItems([...poItems, { itemId: 0, qty: 1, price: 0 }])
  const handleRemovePOItem = (index: number) => setPoItems(poItems.filter((_, i) => i !== index))
  const handlePOItemChange = (index: number, field: string, value: any) => {
    const newItems = [...poItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setPoItems(newItems)
  }

  const handleCreatePO = () => {
    const validItems = poItems.filter(i => i.itemId > 0 && i.qty > 0 && i.price > 0)
    if (validItems.length === 0 || poSupplierId === 0) return
    createPOMutation.mutate({ supplierId: poSupplierId, notes: poNotes, expectedDeliveryDate: poExpectedDate || undefined, items: validItems })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'danger'
      case 'sent': return 'info'
      case 'received': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1f2937]">Procurement</h2>
        <p className="text-[#6b7280]">Manage purchase requests and orders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#f3f4f6] p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('pr')}
          className={activeTab === 'pr' ? 'px-4 py-2 rounded-md text-sm font-medium transition-all bg-white text-[#4b49ac] shadow-sm' : 'px-4 py-2 rounded-md text-sm font-medium transition-all text-[#6b7280] hover:text-[#1f2937]'}
        >
          Purchase Requests
        </button>
        <button
          onClick={() => setActiveTab('po')}
          className={activeTab === 'po' ? 'px-4 py-2 rounded-md text-sm font-medium transition-all bg-white text-[#4b49ac] shadow-sm' : 'px-4 py-2 rounded-md text-sm font-medium transition-all text-[#6b7280] hover:text-[#1f2937]'}
        >
          Purchase Orders
        </button>
      </div>

      {/* Purchase Request Tab */}
      {activeTab === 'pr' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreatePR(true)}><Plus className="w-4 h-4 mr-2" />New PR</Button>
          </div>

          {showCreatePR && (
            <Card className="mb-4"><CardHeader><CardTitle>Create Purchase Request</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Items</Label>
                  {prItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <select className="flex-1 h-10 rounded-lg border border-[#e5e7eb] px-3" value={item.itemId} onChange={(e) => handlePRItemChange(index, 'itemId', parseInt(e.target.value))}>
                        <option value={0}>Select Item</option>
                        {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                      <Input type="number" placeholder="Qty" className="w-24" value={item.qty} onChange={(e) => handlePRItemChange(index, 'qty', parseInt(e.target.value))} />
                      <Button variant="ghost" onClick={() => handleRemovePRItem(index)}>X</Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddPRItem}>Add Item</Button>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Input value={prNotes} onChange={(e) => setPrNotes(e.target.value)} placeholder="Additional notes..." /></div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePR} disabled={createPRMutation.isPending}>{createPRMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create PR'}</Button>
                  <Button variant="outline" onClick={() => setShowCreatePR(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              {prsLoading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#4b49ac] mx-auto" /></div> : (
                <div className="divide-y divide-[#e5e7eb]">
                  {prs?.length === 0 || !prs ? <div className="p-12 text-center text-[#6b7280]">Belum ada data yang ditampilkan.</div> : prs?.map((pr) => (
                    <div key={pr.id} className="p-4 hover:bg-[#f9fafb]/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#1f2937]">{pr.prNumber}</p>
                          <p className="text-sm text-[#6b7280]">By: {pr.requested_by_name} | {new Date(pr.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={getStatusColor(pr.status) as any}>{pr.status}</Badge>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {pr.status === 'draft' && <><Button size="sm" onClick={() => updatePRMutation.mutate({ id: pr.id, data: { status: 'pending' }})}>Submit</Button><Button size="sm" variant="ghost" onClick={() => purchaseRequestsApi.delete(pr.id).then(() => queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] }))}>Delete</Button></>}
                        {pr.status === 'pending' && <><Button size="sm" onClick={() => updatePRMutation.mutate({ id: pr.id, data: { status: 'approved' }})}>Approve</Button><Button size="sm" variant="destructive" onClick={() => updatePRMutation.mutate({ id: pr.id, data: { status: 'rejected' }})}>Reject</Button></>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchase Order Tab */}
      {activeTab === 'po' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreatePO(true)}><Plus className="w-4 h-4 mr-2" />New PO</Button>
          </div>

          {showCreatePO && (
            <Card className="mb-4"><CardHeader><CardTitle>Create Purchase Order</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Supplier</Label>
                  <select className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3" value={poSupplierId} onChange={(e) => setPoSupplierId(parseInt(e.target.value))}>
                    <option value={0}>Select Supplier</option>
                    {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>Items</Label>
                  {poItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <select className="flex-1 h-10 rounded-lg border border-[#e5e7eb] px-3" value={item.itemId} onChange={(e) => handlePOItemChange(index, 'itemId', parseInt(e.target.value))}>
                        <option value={0}>Select Item</option>
                        {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                      <Input type="number" placeholder="Qty" className="w-20" value={item.qty} onChange={(e) => handlePOItemChange(index, 'qty', parseInt(e.target.value))} />
                      <Input type="number" placeholder="Price" className="w-24" value={item.price} onChange={(e) => handlePOItemChange(index, 'price', parseFloat(e.target.value))} />
                      <Button variant="ghost" onClick={() => handleRemovePOItem(index)}>X</Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddPOItem}>Add Item</Button>
                </div>
                <div className="space-y-2"><Label>Expected Delivery</Label><Input type="date" value={poExpectedDate} onChange={(e) => setPoExpectedDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Notes</Label><Input value={poNotes} onChange={(e) => setPoNotes(e.target.value)} placeholder="Additional notes..." /></div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePO} disabled={createPOMutation.isPending}>{createPOMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create PO'}</Button>
                  <Button variant="outline" onClick={() => setShowCreatePO(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              {posLoading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#4b49ac] mx-auto" /></div> : (
                <div className="divide-y divide-[#e5e7eb]">
                  {pos?.length === 0 || !pos ? <div className="p-12 text-center text-[#6b7280]">Belum ada data yang ditampilkan.</div> : pos?.map((po) => (
                    <div key={po.id} className="p-4 hover:bg-[#f9fafb]/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#1f2937]">{po.poNumber}</p>
                          <p className="text-sm text-[#6b7280]">Supplier: {po.supplier_name} | {new Date(po.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-[#6b7280]">Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.total)}</p>
                        </div>
                        <Badge variant={getStatusColor(po.status) as any}>{po.status}</Badge>
                      </div>
                      {po.status === 'draft' && <div className="mt-2"><Button size="sm" onClick={() => updatePOMutation.mutate({ id: po.id, data: { status: 'sent' }})}>Send to Supplier</Button></div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}