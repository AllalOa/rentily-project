import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface CalendarProps {
  selectedDates: { start: string | null; end: string | null }
  onDateSelect: (date: string) => void
  blockedDates?: string[]
  minDate?: string
  maxDate?: string
  className?: string
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDates,
  onDateSelect,
  blockedDates = [],
  minDate,
  maxDate,
  className
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  const currentYear = currentMonth.getFullYear()
  const currentMonthIndex = currentMonth.getMonth()

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isDateBlocked = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return blockedDates.includes(dateString)
  }

  const isDateInRange = (date: Date) => {
    if (!selectedDates.start || !selectedDates.end) return false
    
    const dateString = date.toISOString().split('T')[0]
    return dateString >= selectedDates.start && dateString <= selectedDates.end
  }

  const isDateSelected = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return dateString === selectedDates.start || dateString === selectedDates.end
  }

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    
    if (minDate && dateString < minDate) return true
    if (maxDate && dateString > maxDate) return true
    if (date < today) return true
    if (isDateBlocked(date)) return true
    
    return false
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return
    
    const dateString = date.toISOString().split('T')[0]
    
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      // Start new selection
      onDateSelect(dateString)
    } else if (selectedDates.start && !selectedDates.end) {
      // Complete selection
      if (dateString > selectedDates.start) {
        onDateSelect(dateString)
      } else {
        // If clicked date is before start date, make it the new start
        onDateSelect(dateString)
      }
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonthIndex)

  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className={cn('bg-white rounded-lg border border-secondary-200 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">
          {monthNames[currentMonthIndex]} {currentYear}
        </h3>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-secondary-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10" />
          }

          const date = new Date(currentYear, currentMonthIndex, day)
          const dateString = date.toISOString().split('T')[0]
          const isDisabled = isDateDisabled(date)
          const isBlocked = isDateBlocked(date)
          const isSelected = isDateSelected(date)
          const isInRange = isDateInRange(date)
          const isToday = dateString === today.toISOString().split('T')[0]

          return (
            <button
              key={day}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={cn(
                'h-10 w-10 text-sm rounded-lg transition-colors duration-200',
                'hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500',
                isDisabled && 'cursor-not-allowed opacity-50',
                isBlocked && 'bg-error-100 text-error-600 cursor-not-allowed',
                isToday && !isSelected && 'bg-primary-100 text-primary-700 font-semibold',
                isSelected && 'bg-primary-600 text-white font-semibold',
                isInRange && !isSelected && 'bg-primary-50 text-primary-700',
                !isDisabled && !isBlocked && !isSelected && !isInRange && 'hover:bg-secondary-100'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <div className="flex items-center justify-center space-x-6 text-xs text-secondary-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary-50 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-error-100 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}
