import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { racksApi, binsApi, warehousesApi } from '@/features/master-data/api/masterDataApi'

export default function LocationsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'racks' | 'bins'>('racks')

  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses'], queryFn: () => warehousesApi.getAll() })

  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null)
  const [selectedRack, setSelectedRack] = useState<number | null>(null)

  const { data: racks = [], isLoading: loadingRacks } = useQuery({
    queryKey: ['racks', selectedWarehouse],
    queryFn: () => racksApi.getAll(selectedWarehouse || undefined),
    enabled: activeTab === 'racks',
  })

  const { data: bins = [], isLoading: loadingBins } = useQuery({
    queryKey: ['bins', selectedRack],
    queryFn: () => binsApi.getAll(selectedRack || undefined),
    enabled: activeTab === 'bins',
  })

  const [isRackModalOpen, setIsRackModalOpen] = useState(false)
  const [editingRack, setEditingRack] = useState<any>(null)
  const [rackForm, setRackForm] = useState({ warehouseId: '', code: '', name: '' })

  const createRack = useMutation({ mutationFn: (d: any) => racksApi.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['racks'] }); setIsRackModalOpen(false) } })
  const updateRack = useMutation({ mutationFn: ({ id, data }: any) => racksApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['racks'] }); setIsRackModalOpen(false) } })
  const deleteRack = useMutation({ mutationFn: (id: number) => racksApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['racks'] }) })

  const [isBinModalOpen, setIsBinModalOpen] = useState(false)
  const [editingBin, setEditingBin] = useState<any>(null)
  const [binForm, setBinForm] = useState({ rackId: '', code: '', capacity: '100' })

  const createBin = useMutation({ mutationFn: (d: any) => binsApi.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bins'] }); setIsBinModalOpen(false) } })
  const updateBin = useMutation({ mutationFn: ({ id, data }: any) => binsApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bins'] }); setIsBinModalOpen(false) } })
  const deleteBin = useMutation({ mutationFn: (id: number) => binsApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bins'] }) })

  const openRackModal = (rack?: any) => {
    setEditingRack(rack || null)
    setRackForm(rack ? { warehouseId: String(rack.warehouse_id), code: rack.code, name: rack.name } : { warehouseId: selectedWarehouse ? String(selectedWarehouse) : '', code: '', name: '' })
    setIsRackModalOpen(true)
  }
  const openBinModal = (bin?: any) => {
    setEditingBin(bin || null)
    setBinForm(bin ? { rackId: String(bin.rack_id), code: bin.code, capacity: String(bin.capacity) } : { rackId: selectedRack ? String(selectedRack) : '', code: '', capacity: '100' })
    setIsBinModalOpen(true)
  }
  const handleRackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { warehouseId: parseInt(rackForm.warehouseId), code: rackForm.code, name: rackForm.name }
    editingRack ? updateRack.mutate({ id: editingRack.id, data }) : createRack.mutate(data)
  }
  const handleBinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { rackId: parseInt(binForm.rackId), code: binForm.code, capacity: parseInt(binForm.capacity) }
    editingBin ? updateBin.mutate({ id: editingBin.id, data }) : createBin.mutate(data)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lokasi Penyimpanan</h1>

      <div className="flex gap-4 mb-4">
        <Button variant={activeTab === 'racks' ? 'default' : 'outline'} onClick={() => setActiveTab('racks')}>Rak</Button>
        <Button variant={activeTab === 'bins' ? 'default' : 'outline'} onClick={() => setActiveTab('bins')}>Bin</Button>
      </div>

      {activeTab === 'racks' && (
        <div>
          <div className="flex gap-4 mb-4">
            <select className="border rounded px-3 py-2" value={selectedWarehouse || ''} onChange={e => setSelectedWarehouse(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Semua Gudang</option>
              {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
            </select>
            <Button onClick={() => openRackModal()}>+ Tambah Rak</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {loadingRacks ? <div className="p-6 text-center">Memuat...</div> : racks.length === 0 ? <div className="p-6 text-center text-gray-500">Belum ada data rak</div> : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Kode</th>
                      <th className="px-4 py-3 text-left">Nama</th>
                      <th className="px-4 py-3 text-left">Gudang</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {racks.map((rack: any) => (
                      <tr key={rack.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{rack.code}</td>
                        <td className="px-4 py-3">{rack.name}</td>
                        <td className="px-4 py-3 text-gray-500">{rack.warehouse_name || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openRackModal(rack)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Hapus rak?')) deleteRack.mutate(rack.id) }}>Hapus</Button>
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

      {activeTab === 'bins' && (
        <div>
          <div className="flex gap-4 mb-4">
            <select className="border rounded px-3 py-2" value={selectedWarehouse || ''} onChange={e => setSelectedWarehouse(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Pilih Gudang</option>
              {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
            </select>
            <select className="border rounded px-3 py-2" value={selectedRack || ''} onChange={e => setSelectedRack(e.target.value ? Number(e.target.value) : null)} disabled={!selectedWarehouse}>
              <option value="">Pilih Rak</option>
              {racks.filter((r: any) => r.warehouse_id === selectedWarehouse).map((rack: any) => <option key={rack.id} value={rack.id}>{rack.code} - {rack.name}</option>)}
            </select>
            <Button onClick={() => openBinModal()} disabled={!selectedRack}>+ Tambah Bin</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {loadingBins ? <div className="p-6 text-center">Memuat...</div> : bins.length === 0 ? <div className="p-6 text-center text-gray-500">Belum ada data bin</div> : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Kode</th>
                      <th className="px-4 py-3 text-left">Rak</th>
                      <th className="px-4 py-3 text-left">Gudang</th>
                      <th className="px-4 py-3 text-left">Kapasitas</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bins.map((bin: any) => (
                      <tr key={bin.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{bin.code}</td>
                        <td className="px-4 py-3">{bin.rack_name || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{bin.warehouse_name || '-'}</td>
                        <td className="px-4 py-3">{bin.capacity}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openBinModal(bin)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if (confirm('Hapus bin?')) deleteBin.mutate(bin.id) }}>Hapus</Button>
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

      {/* Rack Modal */}
      {isRackModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader><CardTitle>{editingRack ? 'Edit Rak' : 'Tambah Rak'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleRackSubmit} className="space-y-4">
                <div><Label>Gudang</Label>
                  <select className="w-full border rounded px-3 py-2" value={rackForm.warehouseId} onChange={e => setRackForm({ ...rackForm, warehouseId: e.target.value })} required>
                    <option value="">Pilih Gudang</option>
                    {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.code} - {wh.name}</option>)}
                  </select>
                </div>
                <div><Label>Kode</Label><Input value={rackForm.code} onChange={e => setRackForm({ ...rackForm, code: e.target.value })} placeholder="A-01" required /></div>
                <div><Label>Nama</Label><Input value={rackForm.name} onChange={e => setRackForm({ ...rackForm, name: e.target.value })} placeholder="Rak A-01" required /></div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsRackModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={createRack.isPending || updateRack.isPending}>{editingRack ? 'Simpan' : 'Buat'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bin Modal */}
      {isBinModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader><CardTitle>{editingBin ? 'Edit Bin' : 'Tambah Bin'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleBinSubmit} className="space-y-4">
                <div><Label>Rak</Label>
                  <select className="w-full border rounded px-3 py-2" value={binForm.rackId} onChange={e => setBinForm({ ...binForm, rackId: e.target.value })} required>
                    <option value="">Pilih Rak</option>
                    {racks.map((rack: any) => <option key={rack.id} value={rack.id}>{rack.code} - {rack.name}</option>)}
                  </select>
                </div>
                <div><Label>Kode</Label><Input value={binForm.code} onChange={e => setBinForm({ ...binForm, code: e.target.value })} placeholder="01" required /></div>
                <div><Label>Kapasitas</Label><Input type="number" value={binForm.capacity} onChange={e => setBinForm({ ...binForm, capacity: e.target.value })} required /></div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsBinModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={createBin.isPending || updateBin.isPending}>{editingBin ? 'Simpan' : 'Buat'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}