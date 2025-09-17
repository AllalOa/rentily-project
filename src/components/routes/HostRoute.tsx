import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface HostRouteProps {
  children: JSX.Element
}

export const HostRoute: React.FC<HostRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <div>Loading...</div> // or your app's loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'host') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
