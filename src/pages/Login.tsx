import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore, type User } from '@/store/authStore'
import { Package, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginResponse {
  success: boolean
  data?: {
    user: User
    token: string
  }
  message?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('')

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: LoginResponse = await response.json()

      if (result.success && result.data) {
        login(result.data.user, result.data.token)
        navigate('/')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Cannot connect to server. Please try again.')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4b49ac] via-[#5a58b8] to-[#4b49ac]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(125,160,250,0.15)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(152,189,255,0.1)_0%,_transparent_50%)]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-[#4b49ac]/20 border border-white/20">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#4b49ac] to-[#6366f1] rounded-xl mb-4 shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#1f2937] mb-1">Warehouse Nuda</h1>
              <p className="text-sm text-[#6b7280]">Inventory Management System</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-white bg-[#ef4444] rounded-lg text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#1f2937] text-sm font-medium">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="h-10 pl-10 bg-[#f9fafb] border-[#e5e7eb] text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#4b49ac] focus:ring-2 focus:ring-[#4b49ac]/20 rounded-lg"
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-[#ef4444]">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1f2937] text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-10 pl-10 pr-10 bg-[#f9fafb] border-[#e5e7eb] text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#4b49ac] focus:ring-2 focus:ring-[#4b49ac]/20 rounded-lg"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4b49ac] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-[#ef4444]">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-[#4b49ac] to-[#6366f1] hover:from-[#3a3a8a] hover:to-[#4b49ac] text-white font-medium rounded-lg shadow-lg shadow-[#4b49ac]/20 hover:shadow-xl hover:shadow-[#4b49ac]/30 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}