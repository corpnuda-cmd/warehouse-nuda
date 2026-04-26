// Receiving API
import { axiosClient } from '@/lib/axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Types
export interface GRItem {
  id: number
  grId: number
  itemId: number
  item_code: string
  item_name: string
  uom_symbol: string
  qtyReceived: number
  qtyAccepted: number
  qtyRejected: number
  notes: string | null
}

export interface GoodsReceipt {
  id: number
  grNumber: string
  poId: number | null
  po_number: string | null
  receivedBy: number
  received_by_username: string
  received_by_name: string
  supplier_name: string | null
  qcStatus: 'pending' | 'qc_passed' | 'qc_failed' | 'qc_partial'
  notes: string | null
  items: GRItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateGRRequest {
  poId?: number
  notes?: string
  items: Array<{
    itemId: number
    qtyReceived: number
  }>
}

export interface UpdateGRRequest {
  qcStatus?: 'pending' | 'qc_passed' | 'qc_failed' | 'qc_partial'
  notes?: string
}

export interface QCItem {
  itemId: number
  qtyAccepted: number
  qtyRejected: number
  notes?: string
}

export interface QCRequest {
  items: QCItem[]
}

// Goods Receipts API
export const goodsReceiptsApi = {
  getAll: async (): Promise<GoodsReceipt[]> => {
    const response = await axiosClient.get(`${API_URL}/receiving/goods-receipts`)
    return response.data.data
  },

  getById: async (id: number): Promise<GoodsReceipt> => {
    const response = await axiosClient.get(`${API_URL}/receiving/goods-receipts/${id}`)
    return response.data.data
  },

  create: async (data: CreateGRRequest): Promise<GoodsReceipt> => {
    const response = await axiosClient.post(`${API_URL}/receiving/goods-receipts`, data)
    return response.data.data
  },

  update: async (id: number, data: UpdateGRRequest): Promise<GoodsReceipt> => {
    const response = await axiosClient.patch(`${API_URL}/receiving/goods-receipts/${id}`, data)
    return response.data.data
  },

  qc: async (id: number, data: QCRequest): Promise<GoodsReceipt> => {
    const response = await axiosClient.post(`${API_URL}/receiving/goods-receipts/${id}/qc`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${API_URL}/receiving/goods-receipts/${id}`)
  },
}