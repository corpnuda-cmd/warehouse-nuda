// Shared TypeScript types for the application

export interface User {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export type StockMovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'OPNAME'

export type DocumentStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'

export interface Item {
  id: string
  code: string
  name: string
  categoryId: string
  uomId: string
  minStock: number
  reorderPoint: number
  price: number
}
