import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'super_admin' | 'admin' | 'purchasing' | 'gudang' | 'store_user' | 'finance' | 'auditor'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true, isLoading: false })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Role-based permissions
export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['*'],
  admin: ['users', 'master_data', 'approval', 'reports'],
  purchasing: ['procurement', 'vendors'],
  gudang: ['receiving', 'issuing', 'transfer', 'stock_opname'],
  store_user: ['issue_request', 'transfer_receive'],
  finance: ['reports', 'procurement'],
  auditor: ['reports', 'audit_trail'],
}

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false
  const permissions = rolePermissions[user.role]
  return permissions.includes('*') || permissions.includes(permission)
}