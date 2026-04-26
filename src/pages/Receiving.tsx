import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goodsReceiptsApi } from '@/features/receiving/api/receivingApi'
import { purchaseOrdersApi } from '@/features/procurement/api/procurementApi'
import { itemsApi } from '@/features/items/api/itemsApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PackageCheck, Plus, Loader2 } from 'lucide-react'

export default function Receiving() {
  const [showCreateGR, setShowCreateGR] = useState(false)
  const [showQC, setShowQC] = useState<number | null>(null)
  const [grItems, setGrItems] = useState<Array<{ itemId: number; qtyReceived: number }>>([])
  const [grNotes, setGrNotes] = useState('')
  const [grPOId, setGrPOId] = useState<number>(0)
  const [qcItems, setQcItems] = useState<Array<{ itemId: number; qtyAccepted: number; qtyRejected: number; notes: string }>>([])

  const queryClient = useQueryClient()

  const { data: grs, isLoading: grsLoading } = useQuery({ queryKey: ['goodsReceipts'], queryFn: goodsReceiptsApi.getAll })
  const { data: pos } = useQuery({
    queryKey: ['approvedPOs'],
    queryFn: async () => (await purchaseOrdersApi.getAll())?.filter(po => po.status === 'sent' || po.status === 'received'),
  })
  const { data: items } = useQuery({ queryKey: ['items'], queryFn: itemsApi.getAll })
  const { data: grDetails } = useQuery({
    queryKey: ['goodsReceipt', showQC],
    queryFn: () => showQC ? goodsReceiptsApi.getById(showQC) : null,
    enabled: !!showQC,
  })

  useEffect(() => {
    if (grDetails?.items) {
      setQcItems(grDetails.items.map((item: any) => ({
        itemId: item.itemId,
        qtyAccepted: item.qtyReceived,
        qtyRejected: 0,
        notes: '',
      })))
    }
  }, [grDetails])

  const createGRMutation = useMutation({
    mutationFn: (data: any) => goodsReceiptsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] })
      setShowCreateGR(false)
      setGrItems([])
      setGrNotes('')
      setGrPOId(0)
    },
  })

  const qcMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => goodsReceiptsApi.qc(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] })
      setShowQC(null)
    },
  })

  const handleAddGRItem = () => setGrItems([...grItems, { itemId: 0, qtyReceived: 1 }])
  const handleRemoveGRItem = (index: number) => setGrItems(grItems.filter((_, i) => i !== index))
  const handleGRItemChange = (index: number, field: string, value: any) => {
    const newItems = [...grItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setGrItems(newItems)
  }

  const handleCreateGR = () => {
    const validItems = grItems.filter(i => i.itemId > 0 && i.qtyReceived > 0)
    if (validItems.length === 0) return
    createGRMutation.mutate({ poId: grPOId || undefined, notes: grNotes, items: validItems })
  }

  const handleQCItemChange = (index: number, field: string, value: any) => {
    const newItems = [...qcItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setQcItems(newItems)
  }

  const handleQC = () => {
    if (!showQC) return
    qcMutation.mutate({ id: showQC, data: { items: qcItems } })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'qc_passed': return 'success'
      case 'qc_failed': return 'danger'
      case 'qc_partial': return 'info'
      default: return 'secondary'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1f2937]">Receiving</h2>
        <p className="text-[#6b7280]">Goods receipt and quality control</p>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowCreateGR(true)}><Plus className="w-4 h-4 mr-2" />New GR</Button>
      </div>

      {showCreateGR && (
        <Card className="mb-4"><CardHeader><CardTitle>Create Goods Receipt</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Purchase Order (Optional)</Label>
              <select className="w-full h-10 rounded-lg border border-[#e5e7eb] px-3" value={grPOId} onChange={(e) => setGrPOId(parseInt(e.target.value))}>
                <option value={0}>No PO - Manual Entry</option>
                {pos?.map((po) => <option key={po.id} value={po.id}>{po.poNumber} - {po.supplier_name}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Items Received</Label>
              {grItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <select className="flex-1 h-10 rounded-lg border border-[#e5e7eb] px-3" value={item.itemId} onChange={(e) => handleGRItemChange(index, 'itemId', parseInt(e.target.value))}>
                    <option value={0}>Select Item</option>
                    {items?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <Input type="number" placeholder="Qty" className="w-32" value={item.qtyReceived} onChange={(e) => handleGRItemChange(index, 'qtyReceived', parseInt(e.target.value))} />
                  <Button variant="ghost" onClick={() => handleRemoveGRItem(index)}>X</Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddGRItem}>Add Item</Button>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Input value={grNotes} onChange={(e) => setGrNotes(e.target.value)} placeholder="Additional notes..." /></div>
            <div className="flex gap-2">
              <Button onClick={handleCreateGR} disabled={createGRMutation.isPending}>{createGRMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create GR'}</Button>
              <Button variant="outline" onClick={() => setShowCreateGR(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showQC && (
        <Card className="mb-4 border-2 border-[#f59e0b]"><CardHeader><CardTitle>Quality Control - GR #{showQC}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#6b7280]">Enter accepted and rejected quantities:</p>
            {qcItems?.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1"><p className="font-medium text-sm">Item {item.itemId}</p><p className="text-xs text-[#6b7280]">Received: {grDetails?.items?.[index]?.qtyReceived}</p></div>
                <Input type="number" placeholder="Accepted" className="w-24" value={item.qtyAccepted} onChange={(e) => handleQCItemChange(index, 'qtyAccepted', parseInt(e.target.value))} />
                <Input type="number" placeholder="Rejected" className="w-24" value={item.qtyRejected} onChange={(e) => handleQCItemChange(index, 'qtyRejected', parseInt(e.target.value))} />
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={handleQC} disabled={qcMutation.isPending}>{qcMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete QC'}</Button>
              <Button variant="outline" onClick={() => setShowQC(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {grsLoading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#4b49ac] mx-auto" /></div> : (
            <div className="divide-y divide-[#e5e7eb]">
              {grs?.length === 0 ? <div className="p-12 text-center text-[#6b7280]">No goods receipts yet</div> : (
                grs?.map((gr) => (
                  <div key={gr.id} className="p-4 hover:bg-[#f9fafb]/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-[#1f2937]">{gr.grNumber}</p>
                        <p className="text-sm text-[#6b7280]">PO: {gr.po_number || 'Manual'} | By: {gr.received_by_name}</p>
                        <p className="text-sm text-[#6b7280]">{new Date(gr.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={getStatusColor(gr.qcStatus) as any}>{gr.qcStatus}</Badge>
                    </div>
                    {gr.qcStatus === 'pending' && <div className="mt-2"><Button size="sm" onClick={() => setShowQC(gr.id)}>Perform QC</Button></div>}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}