// Items API
import { axiosClient } from '@/lib/axios'

export interface Item {
  id: number
  sku: string
  name: string
  description: string | null
  categoryId: number
  category?: {
    id: number
    name: string
  }
  supplierId: number | null
  supplier?: {
    id: number
    name: string
  } | null
  quantity: number
  minQuantity: number
  maxQuantity: number
  unit: string
  price: number
  createdAt: string
  updatedAt: string
}

export interface CreateItemRequest {
  sku: string
  name: string
  description?: string
  categoryId: number
  supplierId?: number
  quantity: number
  minQuantity: number
  maxQuantity: number
  unit: string
  price: number
}

export interface UpdateItemRequest {
  sku?: string
  name?: string
  description?: string
  categoryId?: number
  supplierId?: number | null
  quantity?: number
  minQuantity?: number
  maxQuantity?: number
  unit?: string
  price?: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const itemsApi = {
  getAll: async (): Promise<Item[]> => {
    const response = await axiosClient.get(`${API_URL}/items`)
    return response.data.data
  },

  getById: async (id: number): Promise<Item> => {
    const response = await axiosClient.get(`${API_URL}/items/${id}`)
    return response.data.data
  },

  create: async (data: CreateItemRequest): Promise<Item> => {
    const response = await axiosClient.post(`${API_URL}/items`, data)
    return response.data.data
  },

  update: async (id: number, data: UpdateItemRequest): Promise<Item> => {
    const response = await axiosClient.put(`${API_URL}/items/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${API_URL}/items/${id}`)
  },
}