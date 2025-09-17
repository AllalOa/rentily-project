import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, title?: string, duration?: number) => {
    addToast({ type: 'success', message, title, duration })
  }, [addToast])

  const error = useCallback((message: string, title?: string, duration?: number) => {
    addToast({ type: 'error', message, title, duration })
  }, [addToast])

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    addToast({ type: 'warning', message, title, duration })
  }, [addToast])

  const info = useCallback((message: string, title?: string, duration?: number) => {
    addToast({ type: 'info', message, title, duration })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
