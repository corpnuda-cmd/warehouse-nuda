import api from '../../../lib/axios'

export const inventoryApi = {
  getStocks: async (params?: { warehouseId?: number; itemId?: number; lowStock?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.warehouseId) searchParams.set('warehouseId', String(params.warehouseId))
    if (params?.itemId) searchParams.set('itemId', String(params.itemId))
    if (params?.lowStock) searchParams.set('lowStock', 'true')
    const url = searchParams.toString() ? `/inventory/stocks?${searchParams.toString()}` : '/inventory/stocks'
    const res = await api.get(url)
    return res.data.data
  },
  getStockById: async (id: number) => {
    const res = await api.get(`/inventory/stocks/${id}`)
    return res.data.data
  },
  adjustStock: async (id: number, data: { qty_available: number; notes?: string }) => {
    const res = await api.patch(`/inventory/stocks/${id}`, data)
    return res.data
  },
  getMovements: async (params?: { warehouseId?: number; itemId?: number; type?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.warehouseId) searchParams.set('warehouseId', String(params.warehouseId))
    if (params?.itemId) searchParams.set('itemId', String(params.itemId))
    if (params?.type) searchParams.set('type', params.type)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const url = searchParams.toString() ? `/inventory/movements?${searchParams.toString()}` : '/inventory/movements'
    const res = await api.get(url)
    return res.data.data
  },
  getAlerts: async () => {
    const res = await api.get('/inventory/alerts')
    return res.data.data
  },
  createStock: async (data: { itemId: number; warehouseId: number; binId?: number; qtyAvailable: number }) => {
    const res = await api.post('/inventory/stocks', data)
    return res.data
  },
  // Reservations
  getReservations: async (status?: string) => {
    const url = status ? `/inventory/reservations?status=${status}` : '/inventory/reservations'
    const res = await api.get(url)
    return res.data.data
  },
  reserveStock: async (data: { irId: number; items?: { item_id: number; qty: number }[] }) => {
    const res = await api.post('/inventory/reservations', data)
    return res.data
  },
  releaseReservation: async (id: number, status: 'released' | 'fulfilled') => {
    const res = await api.patch(`/inventory/reservations/${id}`, { status })
    return res.data
  },
  cancelReservation: async (id: number) => {
    const res = await api.delete(`/inventory/reservations/${id}`)
    return res.data
  },
  // Pick Lists
  getPickLists: async () => {
    const res = await api.get('/issuing/pick-lists')
    return res.data.data
  },
  getPickListByIR: async (irId: number) => {
    const res = await api.get(`/issuing/pick-lists/${irId}`)
    return res.data.data
  },
}

export const issuingApi = {
  // Issue Requests
  getIssueRequests: async (status?: string) => {
    const url = status ? `/issuing/issue-requests?status=${status}` : '/issuing/issue-requests'
    const res = await api.get(url)
    return res.data.data
  },
  getIssueRequestById: async (id: number) => {
    const res = await api.get(`/issuing/issue-requests/${id}`)
    return res.data.data
  },
  createIssueRequest: async (data: { warehouseId: number; notes?: string; items: { itemId: number; qty: number }[] }) => {
    const res = await api.post('/issuing/issue-requests', data)
    return res.data
  },
  updateIssueRequest: async (id: number, data: { status?: string; notes?: string }) => {
    const res = await api.patch(`/issuing/issue-requests/${id}`, data)
    return res.data
  },
  deleteIssueRequest: async (id: number) => {
    const res = await api.delete(`/issuing/issue-requests/${id}`)
    return res.data
  },
  // Goods Issues
  getGoodsIssues: async () => {
    const res = await api.get('/issuing/goods-issues')
    return res.data.data
  },
  createGoodsIssue: async (data: { irId?: number; warehouseId?: number; notes?: string; items?: { itemId: number; qty: number }[] }) => {
    const res = await api.post('/issuing/goods-issues', data)
    return res.data
  },
}

export const transfersApi = {
  getAll: async (status?: string) => {
    const url = status ? `/transfers?status=${status}` : '/transfers'
    const res = await api.get(url)
    return res.data.data
  },
  getById: async (id: number) => {
    const res = await api.get(`/transfers/${id}`)
    return res.data.data
  },
  create: async (data: { fromWarehouseId: number; toWarehouseId: number; notes?: string; items: { itemId: number; qty: number }[] }) => {
    const res = await api.post('/transfers', data)
    return res.data
  },
  updateStatus: async (id: number, status: string) => {
    const res = await api.patch(`/transfers/${id}`, { status })
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/transfers/${id}`)
    return res.data
  },
}