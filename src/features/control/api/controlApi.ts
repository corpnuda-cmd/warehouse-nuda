import api from '../../../lib/axios'

// Stock Opnames
export const stockOpnameApi = {
  getAll: async (status?: string) => {
    const url = status ? `/control/stock-opnames?status=${status}` : '/control/stock-opnames'
    const res = await api.get(url)
    return res.data.data
  },
  getById: async (id: number) => {
    const res = await api.get(`/control/stock-opnames/${id}`)
    return res.data.data
  },
  create: async (data: { warehouseId: number; planDate?: string; notes?: string; itemIds: number[] }) => {
    const res = await api.post('/control/stock-opnames', data)
    return res.data
  },
  updateStatus: async (id: number, data: { status: string; counts?: { itemId: number; qtyActual: number }[] }) => {
    const res = await api.patch(`/control/stock-opnames/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/control/stock-opnames/${id}`)
    return res.data
  },
}

// Returns
export const returnsApi = {
  getAll: async (params?: { type?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.status) searchParams.set('status', params.status)
    const url = searchParams.toString() ? `/control/returns?${searchParams.toString()}` : '/control/returns'
    const res = await api.get(url)
    return res.data.data
  },
  getById: async (id: number) => {
    const res = await api.get(`/control/returns/${id}`)
    return res.data.data
  },
  create: async (data: { type: string; supplierId?: number; referenceId?: number; referenceType?: string; reason?: string; items: { itemId: number; qty: number; reason?: string }[] }) => {
    const res = await api.post('/control/returns', data)
    return res.data
  },
  updateStatus: async (id: number, data: { status: string; qcResults?: { itemId: number; qtyAccepted: number; qtyRejected?: number; notes?: string }[] }) => {
    const res = await api.patch(`/control/returns/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/control/returns/${id}`)
    return res.data
  },
}

// Audit Logs
export const auditApi = {
  getAll: async (params?: { module?: string; userId?: number; action?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.module) searchParams.set('module', params.module)
    if (params?.userId) searchParams.set('userId', String(params.userId))
    if (params?.action) searchParams.set('action', params.action)
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    const url = searchParams.toString() ? `/control/audit-logs?${searchParams.toString()}` : '/control/audit-logs'
    const res = await api.get(url)
    return res.data
  },
  getById: async (id: number) => {
    const res = await api.get(`/control/audit-logs/${id}`)
    return res.data.data
  },
  getModules: async () => {
    const res = await api.get('/control/audit-logs/modules')
    return res.data.data
  },
  export: async (params?: { module?: string; userId?: number; action?: string; startDate?: string; endDate?: string }) => {
    const res = await api.post('/control/audit-logs/export', params || {}, { responseType: 'blob' })
    return res
  },
}