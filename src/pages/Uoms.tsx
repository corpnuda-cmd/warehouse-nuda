import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useUoms } from '@/features/uoms/hooks/useUoms'

export default function UomsPage() {
  const { uoms, isLoading, create, update, delete: deleteUoM, isCreating, isUpdating } = useUoms()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', symbol: '' })

  const openCreate = () => { setEditingId(null); setFormData({ name: '', symbol: '' }); setIsModalOpen(true) }
  const openEdit = (uom: any) => { setEditingId(uom.id); setFormData({ name: uom.name, symbol: uom.symbol }); setIsModalOpen(true) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      update({ id: editingId, data: formData })
    } else {
      create(formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Yakin hapus UoM ini?')) deleteUoM(id)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Unit of Measure (UoM)</h1>
        <Button onClick={openCreate}>+ Tambah UoM</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Memuat...</div>
          ) : uoms.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada data UoM</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Simbol</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {uoms.map((uom: any) => (
                    <tr key={uom.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{uom.name}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{uom.symbol}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(uom)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(uom.id)}>Hapus</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader><CardTitle>{editingId ? 'Edit UoM' : 'Tambah UoM'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nama</Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Kilogram" required />
                </div>
                <div>
                  <Label>Simbol</Label>
                  <Input value={formData.symbol} onChange={e => setFormData({ ...formData, symbol: e.target.value })} placeholder="Contoh: kg" required />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={isCreating || isUpdating}>{editingId ? 'Simpan' : 'Buat'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}