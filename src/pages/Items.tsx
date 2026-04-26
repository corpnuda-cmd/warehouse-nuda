import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from '@/features/items/hooks/useItems'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers'
import { type Item } from '@/features/items/api/itemsApi'
import { Package, Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react'

export default function Items() {
  const { data: items, isLoading: itemsLoading } = useItems()
  const { data: categories } = useCategories()
  const { data: suppliers } = useSuppliers()
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: 0,
    supplierId: null as number | null,
    quantity: 0,
    minQuantity: 0,
    maxQuantity: 0,
    unit: 'pcs',
    price: 0,
  })

  const filteredItems = useMemo(() => {
    if (!items) return []
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [items, searchTerm])

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        sku: item.sku,
        name: item.name,
        description: item.description || '',
        categoryId: item.categoryId,
        supplierId: item.supplierId,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        maxQuantity: item.maxQuantity,
        unit: item.unit,
        price: item.price,
      })
    } else {
      setEditingItem(null)
      setFormData({
        sku: '',
        name: '',
        description: '',
        categoryId: categories?.[0]?.id || 0,
        supplierId: null,
        quantity: 0,
        minQuantity: 0,
        maxQuantity: 0,
        unit: 'pcs',
        price: 0,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      sku: '',
      name: '',
      description: '',
      categoryId: 0,
      supplierId: null,
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      unit: 'pcs',
      price: 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId || undefined,
        quantity: formData.quantity,
        minQuantity: formData.minQuantity,
        maxQuantity: formData.maxQuantity,
        unit: formData.unit,
        price: formData.price,
      }

      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, data })
      } else {
        await createItem.mutateAsync(data)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const getStockStatus = (item: Item) => {
    if (item.quantity <= item.minQuantity) {
      return <Badge variant="danger">Low Stock</Badge>
    } else if (item.quantity >= item.maxQuantity) {
      return <Badge variant="info">Overstock</Badge>
    } else {
      return <Badge variant="success">In Stock</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1f2937]">Items</h2>
        <p className="text-[#6b7280]">Manage product inventory</p>
      </div>

      {/* Actions Bar */}
      <Card className="bg-white border-[#e5e7eb] rounded-xl shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenModal()} className="ml-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="bg-white border-[#e5e7eb] rounded-xl shadow-sm">
        <CardHeader className="border-b border-[#e5e7eb]">
          <CardTitle className="text-lg font-semibold text-[#1f2937]">Items List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#4b49ac]" />
            </div>
          ) : !filteredItems || filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-[#d1d5db] mx-auto mb-3" />
              <p className="text-[#6b7280]">Belum ada data yang ditampilkan.</p>
              <Button variant="link" onClick={() => handleOpenModal()} className="text-[#4b49ac]">
                Tambah item pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">SKU</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Qty</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filteredItems?.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f9fafb]/50">
                      <td className="px-6 py-4 text-sm font-medium text-[#4b49ac]">{item.sku}</td>
                      <td className="px-6 py-4 text-sm font-medium text-[#1f2937]">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{item.category?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={item.quantity <= item.minQuantity ? 'text-[#ef4444] font-medium' : 'text-[#6b7280]'}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStockStatus(item)}</td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{formatCurrency(item.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)} className="text-[#6b7280] hover:text-[#4b49ac]">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-[#6b7280] hover:text-[#ef4444]">
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
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#e5e7eb]">
              <CardTitle className="text-lg font-semibold text-[#1f2937]">
                {editingItem ? 'Edit Item' : 'Add Item'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="SKU-001" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Product name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                      className="flex h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4b49ac]/30"
                      required
                    >
                      <option value={0}>Select category</option>
                      {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <select
                      value={formData.supplierId || ''}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value ? Number(e.target.value) : null })}
                      className="flex h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4b49ac]/30"
                    >
                      <option value="">Select supplier</option>
                      {suppliers?.map((sup) => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Qty</Label>
                    <Input type="number" min="0" value={formData.minQuantity} onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Qty</Label>
                    <Input type="number" min="0" value={formData.maxQuantity} onChange={(e) => setFormData({ ...formData, maxQuantity: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="pcs, kg, box" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={createItem.isPending || updateItem.isPending} className="flex-1">
                    {createItem.isPending || updateItem.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}