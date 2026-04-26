// Procurement API
import { axiosClient } from '@/lib/axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Types
export interface PRItem {
  id: number
  prId: number
  itemId: number
  item_code: string
  item_name: string
  uom_symbol: string
  qty: number
  notes: string | null
}

export interface PurchaseRequest {
  id: number
  prNumber: string
  requestedBy: number
  requested_by_username: string
  requested_by_name: string
  warehouseId: number | null
  warehouse_name: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'closed'
  notes: string | null
  items: PRItem[]
  createdAt: string
  updatedAt: string
}

export interface CreatePRRequest {
  warehouseId?: number
  notes?: string
  items: Array<{
    itemId: number
    qty: number
    notes?: string
  }>
}

export interface UpdatePRRequest {
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'closed'
  notes?: string
}

// Purchase Orders Types
export interface POItem {
  id: number
  poId: number
  itemId: number
  item_code: string
  item_name: string
  uom_symbol: string
  qty: number
  price: number
  subtotal: number
}

export interface PurchaseOrder {
  id: number
  poNumber: string
  prId: number | null
  pr_number: string | null
  supplierId: number
  supplier_code: string
  supplier_name: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sent' | 'received' | 'closed'
  total: number
  notes: string | null
  expectedDeliveryDate: string | null
  items: POItem[]
  createdAt: string
  updatedAt: string
}

export interface CreatePORequest {
  prId?: number
  supplierId: number
  expectedDeliveryDate?: string
  notes?: string
  items: Array<{
    itemId: number
    qty: number
    price: number
  }>
}

export interface UpdatePORequest {
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'sent' | 'received' | 'closed'
  notes?: string
}

// Purchase Requests API
export const purchaseRequestsApi = {
  getAll: async (): Promise<PurchaseRequest[]> => {
    const response = await axiosClient.get(`${API_URL}/procurement/purchase-requests`)
    return response.data.data
  },

  getById: async (id: number): Promise<PurchaseRequest> => {
    const response = await axiosClient.get(`${API_URL}/procurement/purchase-requests/${id}`)
    return response.data.data
  },

  create: async (data: CreatePRRequest): Promise<PurchaseRequest> => {
    const response = await axiosClient.post(`${API_URL}/procurement/purchase-requests`, data)
    return response.data.data
  },

  update: async (id: number, data: UpdatePRRequest): Promise<PurchaseRequest> => {
    const response = await axiosClient.patch(`${API_URL}/procurement/purchase-requests/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${API_URL}/procurement/purchase-requests/${id}`)
  },
}

// Purchase Orders API
export const purchaseOrdersApi = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    const response = await axiosClient.get(`${API_URL}/purchase-orders`)
    return response.data.data
  },

  getById: async (id: number): Promise<PurchaseOrder> => {
    const response = await axiosClient.get(`${API_URL}/purchase-orders/${id}`)
    return response.data.data
  },

  create: async (data: CreatePORequest): Promise<PurchaseOrder> => {
    const response = await axiosClient.post(`${API_URL}/purchase-orders`, data)
    return response.data.data
  },

  update: async (id: number, data: UpdatePORequest): Promise<PurchaseOrder> => {
    const response = await axiosClient.patch(`${API_URL}/purchase-orders/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${API_URL}/purchase-orders/${id}`)
  },
}