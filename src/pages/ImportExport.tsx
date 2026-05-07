import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import api from '@/lib/axios'

const exportTypes = [
  { value: 'items', label: 'Items', description: 'Export semua data barang' },
  { value: 'categories', label: 'Categories', description: 'Export semua kategori' },
  { value: 'suppliers', label: 'Suppliers', description: 'Export semua supplier' },
  { value: 'warehouses', label: 'Warehouses', description: 'Export semua gudang' },
  { value: 'uoms', label: 'UoM', description: 'Export semua satuan' },
]

const importTypes = [
  { value: 'items', label: 'Items', fields: ['code', 'name', 'category', 'uom', 'min_stock', 'reorder_point', 'price', 'barcode', 'is_active'] },
  { value: 'categories', label: 'Categories', fields: ['name', 'description'] },
  { value: 'suppliers', label: 'Suppliers', fields: ['code', 'name', 'contact_person', 'email', 'phone', 'address', 'is_active'] },
  { value: 'warehouses', label: 'Warehouses', fields: ['code', 'name', 'address', 'type', 'is_active'] },
  { value: 'uoms', label: 'UoM', fields: ['name', 'symbol'] },
]

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [selectedType, setSelectedType] = useState('')
  const [importData, setImportData] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExport = async () => {
    if (!selectedType) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.get(`/import-export/export/${selectedType}`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedType}_export.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      setResult({ success: true, message: 'Export berhasil! File telah terdownload.' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Export gagal')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    if (!selectedType) return
    setLoading(true)
    try {
      const res = await api.get(`/import-export/template/${selectedType}`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedType}_template.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Download template gagal')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!selectedType || !importData.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      // Parse CSV data
      const lines = importData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const obj: any = {}
        headers.forEach((h, idx) => { obj[h] = values[idx] || '' })
        rows.push(obj)
      }

      const res = await api.post(`/import-export/import/${selectedType}`, { data: rows })
      setResult(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import gagal')
    } finally {
      setLoading(false)
    }
  }

  const selectedImportType = importTypes.find(t => t.value === selectedType)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Import / Export Data</h1>

      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === 'export' ? 'default' : 'outline'} onClick={() => { setActiveTab('export'); setSelectedType(''); setResult(null); setError('') }}>Export CSV</Button>
        <Button variant={activeTab === 'import' ? 'default' : 'outline'} onClick={() => { setActiveTab('import'); setSelectedType(''); setResult(null); setError('') }}>Import CSV</Button>
      </div>

      {activeTab === 'export' && (
        <Card>
          <CardHeader>
            <CardTitle>Export Data ke CSV</CardTitle>
            <CardDescription>Pilih tipe data yang ingin diexport</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportTypes.map(type => (
                <div
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedType === type.value ? 'border-[#4b49ac] bg-[#4b49ac]/5' : 'hover:border-gray-400'}`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} disabled={!selectedType || loading}>
                {loading ? 'Exporting...' : 'Download CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle>Import Data dari CSV</CardTitle>
            <CardDescription>Upload data CSV untuk diimport ke sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importTypes.map(type => (
                <div
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedType === type.value ? 'border-[#4b49ac] bg-[#4b49ac]/5' : 'hover:border-gray-400'}`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-gray-500">Columns: {type.fields.join(', ')}</div>
                </div>
              ))}
            </div>

            {selectedType && selectedImportType && (
              <>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadTemplate}>Download Template</Button>
                </div>
                <div>
                  <Label>Paste CSV Data (header + rows)</Label>
                  <textarea
                    className="w-full border rounded px-3 py-2 font-mono text-sm mt-1"
                    rows={10}
                    placeholder={`Paste your CSV data here...\n\nExample:\n${selectedImportType.fields.join(',')}\n${selectedImportType.fields.map(f => 'value').join(',')}`}
                    value={importData}
                    onChange={e => setImportData(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleImport} disabled={!importData.trim() || loading}>
                    {loading ? 'Importing...' : 'Import Data'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          <div className="font-medium">{result.message}</div>
          {result.data && (
            <div className="mt-2 text-sm">
              <div>Imported: {result.data.imported} of {result.data.total}</div>
              {result.data.errors && result.data.errors.length > 0 && (
                <div className="mt-2 text-orange-600">
                  <div className="font-medium">Errors:</div>
                  <ul className="list-disc list-inside">{result.data.errors.slice(0, 5).map((e: string, i: number) => <li key={i}>{e}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}