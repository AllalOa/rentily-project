import React, { createContext, useContext, useState, ReactNode } from 'react'

type Toast = {
  id: number
  title: string
  variant?: 'success' | 'error' | 'info' | 'warning'
}

type ToastContextType = {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, ...toast }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col space-y-3 z-50">
        {toasts.map(({ id, title, variant }) => (
          <div
            key={id}
            className={`max-w-xs min-w-[300px] px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm bg-white bg-opacity-90 border border-gray-200 text-gray-900
                        animate-fade-in-down
                        ${variant === 'success' ? 'border-green-400' : ''}
                        ${variant === 'error' ? 'border-red-400' : ''}
                        ${variant === 'info' ? 'border-blue-400' : ''}
                        ${variant === 'warning' ? 'border-yellow-400' : ''}
                        `}
            role="alert"
          >
            {title}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease forwards;
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
