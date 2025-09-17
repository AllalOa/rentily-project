import React from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

export interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onRatingChange,
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, starRating: number) => {
    if (interactive && onRatingChange && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onRatingChange(starRating)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1
          const isFilled = starRating <= Math.round(rating)
          const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0

          return (
            <button
              key={index}
              type="button"
              className={cn(
                'text-secondary-300 transition-colors duration-150',
                interactive && 'cursor-pointer hover:text-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 rounded',
                !interactive && 'cursor-default'
              )}
              onClick={() => handleStarClick(starRating)}
              onKeyDown={(e) => handleKeyDown(e, starRating)}
              disabled={!interactive}
              aria-label={`Rate ${starRating} out of ${maxRating} stars`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled && 'text-accent-500 fill-accent-500',
                  isHalfFilled && 'text-accent-500 fill-accent-500/50',
                  !isFilled && !isHalfFilled && 'text-secondary-300'
                )}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="ml-2 text-sm font-medium text-secondary-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export { StarRating }
