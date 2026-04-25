import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type User } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

interface UseAuthReturn {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, isLoading, login, logout: storeLogout } = useAuthStore()

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
    } catch {
      // Ignore API errors
    }

    storeLogout()
    navigate('/login')
  }, [token, storeLogout, navigate])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!token) return false

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success && result.data) {
        // Update store with new user and token
        login(result.data, result.data.token)
        return true
      }

      // Token refresh failed
      if (response.status === 401) {
        logout()
      }
      return false
    } catch {
      return false
    }
  }, [token, login, logout])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  }
}