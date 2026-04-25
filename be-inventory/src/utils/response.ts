// Standar response format: { success, data, message }

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  message: string
}

export function successResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
  return { success: true, data, message }
}

export function errorResponse(message: string, data: unknown = null): ApiResponse<null> {
  return { success: false, data: null, message }
}
