import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
    ...props 
  }, ref) => {
    const baseClasses = 'bg-secondary-200'
    const variantClasses = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded'
    }
    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse',
      none: ''
    }

    const style = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={style}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Common skeleton components
const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height={16}
        width={i === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
)

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <Skeleton variant="rectangular" height={200} className="rounded-lg" />
    <div className="space-y-2">
      <Skeleton variant="text" height={20} width="80%" />
      <Skeleton variant="text" height={16} width="60%" />
      <Skeleton variant="text" height={16} width="40%" />
    </div>
  </div>
)

const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }
  
  return (
    <Skeleton 
      variant="circular" 
      className={cn(sizeClasses[size])} 
    />
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar }
