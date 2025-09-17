import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { Calendar as CalendarComponent } from '@/components/booking/Calendar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
// import { mockListings } from '@/data/mockData'
import { api } from '@/services/api'
import { Listing } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'

export const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<'dates' | 'guests' | 'payment' | 'confirmation'>('dates')
  const [selectedDates, setSelectedDates] = useState<{ start: string | null; end: string | null }>({
    start: searchParams.get('start') || null,
    end: searchParams.get('end') || null
  })
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
    phone: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true)
      try {
        const res = await api.listings.getListing(String(id))
        const it: any = (res as any).data
        const mapped: Listing = {
          id: String(it.id),
          title: it.title,
          description: it.description || '',
          type: it.type,
          category: '',
          price: it.price_per_day,
          currency: 'USD',
          images: (it.images || []).map((img: any) => img.image_path),
          location: {
            address: it.location,
            city: it.location,
            state: '',
            country: '',
            zipCode: '',
            coordinates: { lat: 0, lng: 0 },
          },
          host: {
            id: String(it.host?.id || ''),
            name: it.host?.name || 'Host',
            email: it.host?.email || '',
            isVerified: true,
            joinedAt: '',
            rating: 0,
            reviewCount: 0,
            isHost: true,
            preferences: { notifications: { email: true, sms: false, push: true }, privacy: { showProfile: true, showBookings: false }, currency: 'USD', language: 'en' },
          },
          amenities: [],
          features: {},
          availability: { startDate: '', endDate: '', blockedDates: [], minimumStay: 1, advanceNotice: 0 },
          rating: 0,
          reviewCount: 0,
          isAvailable: it.status === 'active',
          isVerified: true,
          createdAt: it.created_at,
          updatedAt: it.created_at,
        }
        setListing(mapped)
      } catch (e) {
        setListing(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchListing()
  }, [id])

  const handleDateSelect = (date: string) => {
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      setSelectedDates({ start: date, end: null })
    } else if (selectedDates.start && !selectedDates.end) {
      if (date > selectedDates.start) {
        setSelectedDates({ start: selectedDates.start, end: date })
      } else {
        setSelectedDates({ start: date, end: null })
      }
    }
  }

  const calculateTotal = () => {
    if (!selectedDates.start || !selectedDates.end) return 0
    
    const start = new Date(selectedDates.start)
    const end = new Date(selectedDates.end)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    return days * (listing?.price || 0)
  }

  const handleNext = () => {
    switch (currentStep) {
      case 'dates':
        if (selectedDates.start && selectedDates.end) {
          setCurrentStep('guests')
        }
        break
      case 'guests':
        setCurrentStep('payment')
        break
      case 'payment':
        handlePayment()
        break
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      if (!listing || !selectedDates.start || !selectedDates.end) return
      // Create booking
      const res = await api.bookings.createBooking({
        listing_id: listing.id,
        start_date: selectedDates.start,
        end_date: selectedDates.end,
        guests,
      })
      if ((res as any).data) {
        setCurrentStep('confirmation')
      }
    } catch (e) {
      // keep simple for now
    } finally {
      setIsProcessing(false)
    }
  }

  const totalPrice = calculateTotal()
  const serviceFee = totalPrice * 0.1
  const cleaningFee = listing?.type === 'home' ? 50 : 0
  const taxes = (totalPrice + serviceFee + cleaningFee) * 0.08
  const finalTotal = totalPrice + serviceFee + cleaningFee + taxes

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading booking details..." />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Listing Not Found
          </h1>
          <p className="text-secondary-600 mb-6">
            The listing you're trying to book doesn't exist.
          </p>
          <Button onClick={() => navigate('/search')}>
            Back to Search
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/listing/${id}`)}
            className="mb-4"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to listing
          </Button>
          
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Complete your booking
          </h1>
          <p className="text-secondary-600">
            Book {listing.title} for your upcoming trip
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 'dates', label: 'Dates', icon: Calendar },
              { id: 'guests', label: 'Guests', icon: Users },
              { id: 'payment', label: 'Payment', icon: CreditCard },
              { id: 'confirmation', label: 'Confirmation', icon: CheckCircle }
            ].map((step, index) => {
              const isActive = currentStep === step.id
              const isCompleted = ['dates', 'guests', 'payment', 'confirmation'].indexOf(currentStep) > index
              const StepIcon = step.icon

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200
                    ${isActive ? 'border-primary-500 bg-primary-500 text-white' : ''}
                    ${isCompleted ? 'border-primary-500 bg-primary-500 text-white' : 'border-secondary-300 text-secondary-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-primary-600' : isCompleted ? 'text-primary-600' : 'text-secondary-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-primary-500' : 'bg-secondary-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'dates' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                  Select your dates
                </h2>
                <CalendarComponent
                  selectedDates={selectedDates}
                  onDateSelect={handleDateSelect}
                  blockedDates={listing.availability.blockedDates}
                  minDate={new Date().toISOString().split('T')[0]}
                />
                {selectedDates.start && selectedDates.end && (
                  <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-medium text-primary-900 mb-2">Selected dates</h3>
                    <p className="text-primary-700">
                      {formatDate(selectedDates.start)} - {formatDate(selectedDates.end)}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {currentStep === 'guests' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                  Number of guests
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      How many guests?
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Array.from({ length: listing.features.seats || 8 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Special requests (optional)
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requirements or requests..."
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                    />
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 'payment' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                  Payment information
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Card number"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                    />
                    <Input
                      label="Expiry date"
                      placeholder="MM/YY"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="CVV"
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                    />
                    <Input
                      label="Cardholder name"
                      placeholder="John Doe"
                      value={paymentInfo.name}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="john@example.com"
                      value={paymentInfo.email}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, email: e.target.value })}
                    />
                    <Input
                      label="Phone"
                      placeholder="+1 (555) 123-4567"
                      value={paymentInfo.phone}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, phone: e.target.value })}
                    />
                  </div>
                  
                  <div className="p-4 bg-success-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-success-600" />
                      <span className="text-sm text-success-700">
                        Your payment information is encrypted and secure
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 'confirmation' && (
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-success-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                  Booking Confirmed!
                </h2>
                <p className="text-secondary-600 mb-6">
                  Your booking has been successfully confirmed. You'll receive a confirmation email shortly.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => navigate('/dashboard')} className="mr-4">
                    View Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/search')}>
                    Book Another
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Booking Summary
              </h3>
              
              {/* Listing Info */}
              <div className="flex space-x-3 mb-4">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-secondary-900 line-clamp-2">
                    {listing.title}
                  </h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <StarRating rating={listing.rating} size="sm" showValue />
                    <span className="text-sm text-secondary-600">
                      ({listing.reviewCount})
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              {selectedDates.start && selectedDates.end && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-secondary-500" />
                    <span className="text-secondary-700">
                      {formatDate(selectedDates.start)} - {formatDate(selectedDates.end)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-secondary-500" />
                    <span className="text-secondary-700">
                      {guests} {guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {totalPrice > 0 && (
                <div className="space-y-3 pt-4 border-t border-secondary-200">
                  <div className="flex justify-between text-sm">
                    <span>
                      {formatPrice(listing.price, listing.currency)} × {Math.ceil((new Date(selectedDates.end!).getTime() - new Date(selectedDates.start!).getTime()) / (1000 * 60 * 60 * 24))} days
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
                    <span>{formatPrice(taxes, listing.currency)}</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t border-secondary-200">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal, listing.currency)}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6">
                {currentStep === 'confirmation' ? (
                  <div className="text-center">
                    <Badge variant="success" size="lg">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmed
                    </Badge>
                  </div>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (currentStep === 'dates' && (!selectedDates.start || !selectedDates.end)) ||
                      (currentStep === 'payment' && isProcessing)
                    }
                    className="w-full"
                    size="lg"
                    isLoading={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 
                     currentStep === 'payment' ? 'Complete Booking' : 'Continue'}
                  </Button>
                )}
              </div>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <Shield className="h-4 w-4" />
                  <span>Secure booking with 256-bit SSL encryption</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
