// Categories API
import { axiosClient } from '@/lib/axios'

export interface Category {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await axiosClient.get(`${API_URL}/categories`)
    return response.data.data
  },

  getById: async (id: number): Promise<Category> => {
    const response = await axiosClient.get(`${API_URL}/categories/${id}`)
    return response.data.data
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await axiosClient.post(`${API_URL}/categories`, data)
    return response.data.data
  },

  update: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await axiosClient.put(`${API_URL}/categories/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`${API_URL}/categories/${id}`)
  },
}