import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '@/features/control/api/controlApi'

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-700',
  APPROVE: 'bg-green-100 text-green-700',
  REJECT: 'bg-red-100 text-red-700',
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({ module: '', userId: '', action: '', startDate: '', endDate: '', limit: 100, offset: 0 })
  const [exporting, setExporting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => auditApi.getAll(filters),
  })

  const { data: modules = [] } = useQuery({ queryKey: ['auditModules'], queryFn: () => auditApi.getModules() })

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await auditApi.export(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
    setExporting(false)
  }

  const logs = data?.data || []
  const pagination = data?.pagination || {}

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
        <Button onClick={handleExport} disabled={exporting}>{exporting ? 'Exporting...' : 'Export CSV'}</Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label className="text-xs">Module</Label>
              <select className="border rounded px-2 py-1 text-sm" value={filters.module} onChange={e => setFilters({ ...filters, module: e.target.value })}>
                <option value="">All Modules</option>
                {modules.map((m: string) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Action</Label>
              <select className="border rounded px-2 py-1 text-sm" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })}>
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="APPROVE">APPROVE</option>
                <option value="REJECT">REJECT</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input type="date" className="text-sm" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input type="date" className="text-sm" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setFilters({ module: '', userId: '', action: '', startDate: '', endDate: '', limit: 100, offset: 0 })}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6 text-center">Memuat...</div> : logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada audit log</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm">Timestamp</th>
                    <th className="px-4 py-3 text-left text-sm">User</th>
                    <th className="px-4 py-3 text-left text-sm">Action</th>
                    <th className="px-4 py-3 text-left text-sm">Module</th>
                    <th className="px-4 py-3 text-left text-sm">Reference</th>
                    <th className="px-4 py-3 text-left text-sm">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{log.user_name || 'System'}</div>
                        <div className="text-xs text-gray-500">{log.username}</div>
                      </td>
                      <td className="px-4 py-3"><Badge className={actionColors[log.action] || ''}>{log.action}</Badge></td>
                      <td className="px-4 py-3 text-sm">{log.module}</td>
                      <td className="px-4 py-3 text-sm">
                        {log.reference_type && log.reference_id ? (
                          <span className="text-blue-600">{log.reference_type} #{log.reference_id}</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {log.old_data || log.new_data ? `${log.old_data || ''}${log.old_data && log.new_data ? ' → ' : ''}${log.new_data || ''}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination info */}
      {pagination.total > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {logs.length} of {pagination.total} records
        </div>
      )}
    </div>
  )
}