import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { warehousesApi } from '@/features/master-data/api/masterDataApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const typeColors: Record<string, string> = {
  main: 'bg-purple-100 text-purple-800',
  distribution: 'bg-blue-100 text-blue-800',
  store: 'bg-green-100 text-green-800',
}

export default function WarehousesPage() {
  const queryClient = useQueryClient()
  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehousesApi.getAll(),
  })

  const createMutation = useMutation({ mutationFn: (data: any) => warehousesApi.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }) })
  const updateMutation = useMutation({ mutationFn: ({ id, data }: any) => warehousesApi.update(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }) })
  const deleteMutation = useMutation({ mutationFn: (id: number) => warehousesApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }) })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ code: '', name: '', address: '', type: 'distribution' as string })

  const openCreate = () => { setEditingId(null); setFormData({ code: '', name: '', address: '', type: 'distribution' }); setIsModalOpen(true) }
  const openEdit = (wh: any) => { setEditingId(wh.id); setFormData({ code: wh.code, name: wh.name, address: wh.address || '', type: wh.type }); setIsModalOpen(true) }
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); editingId ? updateMutation.mutate({ id: editingId, data: formData }) : createMutation.mutate(formData); setIsModalOpen(false) }
  const handleDelete = (id: number) => { if (confirm('Yakin hapus gudang ini?')) deleteMutation.mutate(id) }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gudang</h1>
        <Button onClick={openCreate}>+ Tambah Gudang</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Memuat...</div>
          ) : warehouses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada data gudang</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Kode</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Alamat</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tipe</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((wh: any) => (
                    <tr key={wh.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{wh.code}</td>
                      <td className="px-4 py-3">{wh.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">{wh.address || '-'}</td>
                      <td className="px-4 py-3"><Badge className={typeColors[wh.type] || ''}>{wh.type}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={wh.is_active ? 'default' : 'secondary'}>{wh.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(wh)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(wh.id)}>Hapus</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader><CardTitle>{editingId ? 'Edit Gudang' : 'Tambah Gudang'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Kode</Label><Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="WH-001" required disabled={!!editingId} /></div>
                <div><Label>Nama</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Gudang Utama" required /></div>
                <div><Label>Alamat</Label><Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Jl. Raya..." /></div>
                <div><Label>Tipe</Label>
                  <select className="w-full border rounded px-3 py-2" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="main">Main</option>
                    <option value="distribution">Distribution</option>
                    <option value="store">Store</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editingId ? 'Simpan' : 'Buat'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}