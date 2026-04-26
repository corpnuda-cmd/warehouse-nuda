import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/categories/hooks/useCategories'
import { Package, Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react'

export default function Categories() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string; description: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const filteredCategories = categories?.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (category?: { id: number; name: string; description: string }) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, description: category.description || '' })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data: { name: formData.name, description: formData.description || undefined },
        })
      } else {
        await createCategory.mutateAsync({ name: formData.name, description: formData.description || undefined })
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#3f4a59]">Categories</h2>
          <p className="text-[#898989]">Manage product categories</p>
        </div>

        {/* Actions Bar */}
        <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#898989]" />
                <Input
                  placeholder="Search categories..."
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
                Add Category
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card className="bg-white border border-[#e8e8e8] rounded-xl shadow-sm">
          <CardHeader className="border-b border-[#e8e8e8]">
            <CardTitle className="text-lg font-semibold text-[#3f4a59]">Categories List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#4b49ac]" />
              </div>
            ) : !filteredCategories || filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-[#e8e8e8] mx-auto mb-3" />
                <p className="text-[#898989]">Belum ada data yang ditampilkan.</p>
                <Button
                  variant="link"
                  onClick={() => handleOpenModal()}
                  className="text-[#4b49ac]"
                >
                  Tambah kategori pertama
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
                        Description
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#898989] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e8e8]">
                    {filteredCategories?.map((category) => (
                      <tr key={category.id} className="hover:bg-[#f5f6fa]/50">
                        <td className="px-6 py-4 text-sm text-[#898989]">#{category.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#3f4a59]">{category.name}</td>
                        <td className="px-6 py-4 text-sm text-[#898989]">
                          {category.description || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleOpenModal({
                                  id: category.id,
                                  name: category.name,
                                  description: category.description || '',
                                })
                              }
                              className="text-[#898989] hover:text-[#4b49ac]"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
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
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Category name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Category description (optional)"
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
                      disabled={createCategory.isPending || updateCategory.isPending}
                      className="flex-1"
                    >
                      {createCategory.isPending || updateCategory.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : editingCategory ? 'Update' : 'Create'}
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