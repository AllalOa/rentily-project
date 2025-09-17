import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { api } from '@/services/api'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  register: (userData: {
    name: string
    email: string
    password: string
    password_confirmation: string
    role: string
  }) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const isAuthenticated = !!user

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.auth.login(email, password)
    const { user: userData, token } = response as { user: User; token: string }

    localStorage.setItem('auth_token', token)
    setUser(userData)
    return userData
  }

  const register = async (
    userData: {
      name: string
      email: string
      password: string
      password_confirmation: string
      role: string
    }
  ): Promise<User> => {
    const response = await api.auth.register(userData)
    const { user: newUser, token } = response as { user: User; token: string }

    localStorage.setItem('auth_token', token)
    setUser(newUser)
    return newUser
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
      navigate('/') // Redirect to landing page after logout
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    const response = await api.user.updateProfile(data)
    setUser(response as User)
  }

  const refreshUser = async () => {
    try {
      const response = await api.user.getProfile()
      setUser(response as User)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      if (error instanceof Error && error.message.includes('401')) {
        await logout()
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      refreshUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
