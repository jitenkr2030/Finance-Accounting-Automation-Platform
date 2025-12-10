'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  companyId: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  email: string
  password: string
  companyName: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await api.get('/auth/profile')
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      toast.success('Login successful!')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      toast.success('Registration successful!')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}