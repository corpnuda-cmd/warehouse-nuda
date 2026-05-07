import api from '../../../lib/axios'

export const uomsApi = {
  getAll: async () => {
    const res = await api.get('/uoms')
    return res.data.data
  },
  getById: async (id: number) => {
    const res = await api.get(`/uoms/${id}`)
    return res.data.data
  },
  create: async (data: { name: string; symbol: string }) => {
    const res = await api.post('/uoms', data)
    return res.data
  },
  update: async (id: number, data: { name?: string; symbol?: string }) => {
    const res = await api.patch(`/uoms/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    const res = await api.delete(`/uoms/${id}`)
    return res.data
  },
}