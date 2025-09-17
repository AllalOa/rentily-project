import React, { useState } from 'react'
import { Listing } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { formatPrice } from '@/lib/utils'
import { 
  Calendar, 
  Users, 
  Shield, 
  Heart, 
  Share2,
  MessageCircle,
  CheckCircle
} from 'lucide-react'

interface BookingCardProps {
  listing: Listing
  onBook: (dates: { start: string; end: string }, guests: number) => void
  onMessage: () => void
  onFavorite: () => void
  onShare: () => void
  isFavorite?: boolean
}

export const BookingCard: React.FC<BookingCardProps> = ({
  listing,
  onBook,
  onMessage,
  onFavorite,
  onShare,
  isFavorite = false
}) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guests, setGuests] = useState(1)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    return days * listing.price
  }

  const handleBook = () => {
    if (!startDate || !endDate) return
    
    onBook({ start: startDate, end: endDate }, guests)
  }

  const totalPrice = calculateTotal()
  const serviceFee = totalPrice * 0.1 // 10% service fee
  const cleaningFee = listing.type === 'home' ? 50 : 0
  const finalTotal = totalPrice + serviceFee + cleaningFee

  const isBookingDisabled = !startDate || !endDate || totalPrice <= 0

  return (
    <Card className="sticky top-24 p-6">
      {/* Price and Rating */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-bold text-secondary-900">
            {formatPrice(listing.price, listing.currency)}
            <span className="text-lg font-normal text-secondary-600">/day</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <StarRating rating={listing.rating} size="sm" showValue />
            <span className="text-sm text-secondary-600">
              ({listing.reviewCount} reviews)
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onFavorite}
            className={isFavorite ? 'text-red-500' : 'text-secondary-600'}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Booking Form */}
      <div className="space-y-4">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Check-in
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Check-out
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Guests Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: listing.features.seats || 8 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Book Button */}
        <Button
          onClick={handleBook}
          disabled={isBookingDisabled}
          className="w-full"
          size="lg"
        >
          {isBookingDisabled ? 'Select dates to book' : 'Book now'}
        </Button>

        {/* Message Host Button */}
        <Button
          variant="outline"
          onClick={onMessage}
          className="w-full"
          leftIcon={<MessageCircle className="h-4 w-4" />}
        >
          Message Host
        </Button>
      </div>

      {/* Price Breakdown */}
      {totalPrice > 0 && (
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>
                {formatPrice(listing.price, listing.currency)} × {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
              <span>{formatPrice(totalPrice, listing.currency)}</span>
            </div>
            
            {cleaningFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Cleaning fee</span>
                <span>{formatPrice(cleaningFee, listing.currency)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Service fee</span>
              <span>{formatPrice(serviceFee, listing.currency)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Taxes</span>
              <span>{formatPrice(finalTotal * 0.08, listing.currency)}</span>
            </div>
            
            <div className="flex justify-between font-semibold text-lg pt-3 border-t border-secondary-200">
              <span>Total</span>
              <span>{formatPrice(finalTotal + (finalTotal * 0.08), listing.currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-secondary-200">
        <div className="space-y-3 text-sm text-secondary-600">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-success-600" />
            <span>Secure payment with 256-bit SSL</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-success-600" />
            <span>Free cancellation up to 24 hours before</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-success-600" />
            <span>Host verified and insured</span>
          </div>
        </div>
      </div>

      {/* Availability Notice */}
      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
        <p className="text-sm text-primary-700">
          <strong>Good news!</strong> This listing is available for your selected dates.
        </p>
      </div>
    </Card>
  )
}
