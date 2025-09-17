import React from 'react'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: React.ReactNode
  showOnlineStatus?: boolean
  isOnline?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    src, 
    alt, 
    name,
    size = 'md',
    fallback,
    showOnlineStatus = false,
    isOnline = false,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg'
    }

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <div className="relative inline-block">
        <div
          ref={ref}
          className={cn(
            'relative inline-flex items-center justify-center rounded-full bg-secondary-100 text-secondary-600 overflow-hidden',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {src ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              {fallback || (name ? getInitials(name) : <User className="h-1/2 w-1/2" />)}
            </div>
          )}
        </div>
        {showOnlineStatus && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              isOnline ? 'bg-success-500' : 'bg-secondary-400',
              size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar }
