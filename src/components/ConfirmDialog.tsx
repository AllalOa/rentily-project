import React from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getConfirmVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive' as const
      case 'warning':
        return 'destructive' as const
      case 'success':
        return 'default' as const
      default:
        return 'default' as const
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={isOpen ? (open) => !open && onClose() : undefined}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        <p className="mb-6 text-secondary-600">{description}</p>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={getConfirmVariant()}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}