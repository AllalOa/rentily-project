import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface GuestRouteProps {
  children: JSX.Element
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === 'host') {
    return <Navigate to="/host/dashboard" replace />
  }

  return children
}
