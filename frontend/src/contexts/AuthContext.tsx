'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, login as loginApi, register as registerApi, getProfile, logout as logoutApi, logoutAll as logoutAllApi } from '@/lib/api/auth'
import { getAccessToken, getRefreshToken, clearTokens, isAuthenticated } from '@/lib/api/tokenStorage'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (emailOrPhone: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user on mount if authenticated
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getProfile()
          setUser(userData)
        } catch (error) {
          console.error('Failed to load user:', error)
          clearTokens()
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = async (emailOrPhone: string, password: string) => {
    try {
      const response = await loginApi({
        email_or_phone: emailOrPhone,
        password,
      })
      setUser(response.user)
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Đăng nhập thất bại'
      throw new Error(message)
    }
  }

  const register = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    try {
      const response = await registerApi({
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
      })
      setUser(response.user)
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Đăng ký thất bại'
      throw new Error(message)
    }
  }

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await logoutApi(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  const logoutAll = async () => {
    try {
      await logoutAllApi()
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      if (isAuthenticated()) {
        const userData = await getProfile()
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      clearTokens()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        logoutAll,
        refreshUser,
      }}
    >
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
