// Master Data - Items Page
import { useState } from 'react'

export default function ItemsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
          Add Item
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm p-2 border rounded"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">UoM</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">Min Stock</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                No items found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}