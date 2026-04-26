// Suppliers API
import { axiosClient } from '@/lib/axios'

export interface Supplier {
  id: number
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  address: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierRequest {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateSupplierRequest {
  name?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await axiosClient.get(`${API_URL}/suppliers`)
    return response.data.data
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await axiosClient.get(`${API_URL}/suppliers/${id}`)
    return response.data.data
  },

  create: async (data: CreateSupplierRequest): Promise<Supplier> => {
    const response = await axiosClient.post(`${API_URL}/suppliers`, data)
    return response.data.data
  },

  update: async (id: number, data: UpdateSupplierRequest): Promise<Supplier> => {
    const response = await axiosClient.put(`${API_URL}/suppliers/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${API_URL}/suppliers/${id}`)
  },
}