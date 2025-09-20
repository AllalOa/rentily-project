import React, { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  className?: string
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, className = '' }) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`bg-white rounded-lg shadow-lg p-6 max-w-lg w-full ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Sub-components for dialog structure:

interface DialogContentProps {
  children: ReactNode
  className?: string
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

export const DialogHeader: React.FC<DialogContentProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
)

export const DialogTitle: React.FC<DialogContentProps> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
)

export const DialogFooter: React.FC<DialogContentProps> = ({ children, className = '' }) => (
  <div className={`mt-6 flex justify-end space-x-4 ${className}`}>{children}</div>
)
