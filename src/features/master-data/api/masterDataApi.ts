import api from '../../../lib/axios'

export const warehousesApi = {
  getAll: async () => {
    const res = await api.get('/warehouses')
    return res.data.data
  },
  getById: async (id: number) => {
    const res = await api.get(`/warehouses/${id}`)
    return res.data.data
  },
  create: async (data: { code: string; name: string; address?: string; type?: string }) => {
    const res = await api.post('/warehouses', data)
    return res.data
  },
  update: async (id: number, data: any) => {
    const res = await api.patch(`/warehouses/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/warehouses/${id}`)
    return res.data
  },
}

export const racksApi = {
  getAll: async (warehouseId?: number) => {
    const url = warehouseId ? `/racks?warehouseId=${warehouseId}` : '/racks'
    const res = await api.get(url)
    return res.data.data
  },
  create: async (data: { warehouseId: number; code: string; name: string }) => {
    const res = await api.post('/racks', data)
    return res.data
  },
  update: async (id: number, data: any) => {
    const res = await api.patch(`/racks/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/racks/${id}`)
    return res.data
  },
}

export const binsApi = {
  getAll: async (rackId?: number) => {
    const url = rackId ? `/bins?rackId=${rackId}` : '/bins'
    const res = await api.get(url)
    return res.data.data
  },
  create: async (data: { rackId: number; code: string; capacity?: number }) => {
    const res = await api.post('/bins', data)
    return res.data
  },
  update: async (id: number, data: any) => {
    const res = await api.patch(`/bins/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/bins/${id}`)
    return res.data
  },
}

export const vendorPricesApi = {
  getAll: async (params?: { supplierId?: number; itemId?: number }) => {
    const url = params?.supplierId ? `/vendor-prices?supplierId=${params.supplierId}` :
               params?.itemId ? `/vendor-prices?itemId=${params.itemId}` : '/vendor-prices'
    const res = await api.get(url)
    return res.data.data
  },
  create: async (data: { supplierId: number; itemId: number; price: number; validFrom?: string; validTo?: string }) => {
    const res = await api.post('/vendor-prices', data)
    return res.data
  },
  update: async (id: number, data: any) => {
    const res = await api.patch(`/vendor-prices/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/vendor-prices/${id}`)
    return res.data
  },
}