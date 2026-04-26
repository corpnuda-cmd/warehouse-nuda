import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/features/suppliers/hooks/useSuppliers'
import { Truck, Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react'

export default function Suppliers() {
  const { data: suppliers, isLoading } = useSuppliers()
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const deleteSupplier = useDeleteSupplier()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<{
    id: number
    name: string
    contactPerson: string
    email: string
    phone: string
    address: string
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  })

  const filteredSuppliers = suppliers?.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (supplier?: {
    id: number
    name: string
    contactPerson: string
    email: string
    phone: string
    address: string
  }) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
      })
    } else {
      setEditingSupplier(null)
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSupplier(null)
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSupplier) {
        await updateSupplier.mutateAsync({
          id: editingSupplier.id,
          data: {
            name: formData.name,
            contactPerson: formData.contactPerson || undefined,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            address: formData.address || undefined,
          },
        })
      } else {
        await createSupplier.mutateAsync({
          name: formData.name,
          contactPerson: formData.contactPerson || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        })
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting supplier:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#3f4a59]">Suppliers</h2>
          <p className="text-[#898989]">Manage supplier data</p>
        </div>

        {/* Actions Bar */}
        <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#898989]" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 ml-4"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm">
          <CardHeader className="border-b border-[#e8e8e8]">
            <CardTitle className="text-lg font-semibold text-[#3f4a59]">Suppliers List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#4b49ac]" />
              </div>
            ) : filteredSuppliers?.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-[#e8e8e8] mx-auto mb-3" />
                <p className="text-[#898989]">No suppliers found.</p>
                <Button
                  variant="link"
                  onClick={() => handleOpenModal()}
                  className="text-[#4b49ac]"
                >
                  Add your first supplier
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f5f6fa] border-b border-[#e8e8e8]">
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#898989] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#898989] uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#898989] uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#898989] uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#898989] uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#898989] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e8e8]">
                    {filteredSuppliers?.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-[#f5f6fa]/50">
                        <td className="px-6 py-4 text-sm text-[#898989]">#{supplier.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#3f4a59]">{supplier.name}</td>
                        <td className="px-6 py-4 text-sm text-[#898989]">
                          {supplier.contactPerson || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#898989]">
                          {supplier.email || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#898989]">
                          {supplier.phone || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleOpenModal({
                                  id: supplier.id,
                                  name: supplier.name,
                                  contactPerson: supplier.contactPerson || '',
                                  email: supplier.email || '',
                                  phone: supplier.phone || '',
                                  address: supplier.address || '',
                                })
                              }
                              className="text-[#898989] hover:text-[#4b49ac]"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(supplier.id)}
                              className="text-[#898989] hover:text-[#f3797e]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#e8e8e8]">
                <CardTitle className="text-lg font-semibold text-[#3f4a59]">
                  {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Supplier company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Contact person name (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Address (optional)"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createSupplier.isPending || updateSupplier.isPending}
                      className="flex-1"
                    >
                      {createSupplier.isPending || updateSupplier.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : editingSupplier ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}