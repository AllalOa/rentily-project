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
    
    // Store both token AND user data in localStorage
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(userData))
    
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
    
    // Store both token AND user data in localStorage
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(newUser))
    
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
      localStorage.removeItem('user_data') // Also remove user data
      setUser(null)
      navigate('/') // Redirect to landing page after logout
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    const response = await api.user.updateProfile(data)
    const updatedUser = response as User
    
    // Update localStorage with new user data
    localStorage.setItem('user_data', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const refreshUser = async () => {
    try {
      const response = await api.user.getProfile()
      const userData = response as User
      
      // Update localStorage with fresh user data
      localStorage.setItem('user_data', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      if (error instanceof Error && error.message.includes('401')) {
        await logout()
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')
    
    if (token && storedUser) {
      try {
        // Load user from localStorage immediately
        const parsedUser = JSON.parse(storedUser) as User
        setUser(parsedUser)
        
        // Then refresh in the background to get latest data
        refreshUser().finally(() => setLoading(false))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user_data')
        setLoading(false)
      }
    } else if (token) {
      // If we have a token but no user data, fetch it
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