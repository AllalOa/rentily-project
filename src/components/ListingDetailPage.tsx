import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Star,
  Shield,
  Car,
  Home,
  User,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Wifi,
  Coffee,
  Tv,
  ParkingCircle,
  AirVent,
  Loader2
} from 'lucide-react'

// UI Components (keeping your existing components)
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, variant = "primary", size = "md", disabled = false, onClick, className = "" }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200"
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  }
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const Badge = ({ children, variant = "primary", size = "md" }) => {
  const variants = {
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    secondary: "bg-gray-100 text-gray-800"
  }
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-0.5 text-sm"
  }
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

const StarRating = ({ rating, size = "md", showValue = false }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      {showValue && <span className="text-sm text-gray-600">({rating.toFixed(1)})</span>}
    </div>
  )
}

// Utility functions
const formatPrice = (price, currency = 'USD') => {
  if (!price) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Fixed API function with better error handling and logging
const fetchListingById = async (id) => {
  const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
  
  try {
    console.log(`🔍 Fetching listing ${id} from: ${apiUrl}/api/listings/${id}`)
    
    const response = await fetch(`${apiUrl}/api/listings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include'
    })

    console.log(`📊 Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Received listing data:', data)
    
    // Validate that we have the required data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format')
    }
    
    if (!data.id) {
      throw new Error('Listing ID missing from response')
    }
    
    return {
      status: response.status,
      data: data // Your API returns the listing directly
    }
  } catch (error) {
    console.error('❌ Fetch error:', error)
    throw error
  }
}

export const ListingDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' })
  const [guests, setGuests] = useState(1)

  useEffect(() => {
    console.log('🎯 ListingDetailPage mounted with ID:', id)
    
    if (id) {
      fetchListing()
    } else {
      console.error('❌ No listing ID provided')
      setError('No listing ID provided')
      setIsLoading(false)
    }
  }, [id])

  const fetchListing = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🚀 Starting to fetch listing with ID:', id)
      
      const response = await fetchListingById(id)
      
      console.log('📦 Full API Response:', response)
      console.log('📋 Listing data:', response.data)
      console.log('🆔 Listing ID:', response.data?.id)
      console.log('📝 Listing title:', response.data?.title)
      
      // More detailed validation
      if (!response) {
        throw new Error('No response received')
      }
      
      if (!response.data) {
        throw new Error('No data in response')
      }
      
      if (!response.data.id) {
        console.error('❌ Missing ID in data:', response.data)
        throw new Error('Invalid listing data: missing ID')
      }
      
      console.log('✅ Setting listing data:', response.data)
      setListing(response.data)
      
    } catch (err) {
      console.error('❌ Error in fetchListing:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      })
      
      if (err.message.includes('404')) {
        setError('Listing not found')
      } else {
        setError(err.message || 'Failed to fetch listing')
      }
    } finally {
      console.log('🏁 Fetch complete, setting loading to false')
      setIsLoading(false)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png'
    const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
    return `${apiUrl}/storage/${imagePath}`
  }

  const nextImage = () => {
    if (listing?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleBooking = () => {
    console.log('Booking:', { listingId: id, dates: selectedDates, guests })
    // Navigate to booking page or open booking modal
    // navigate(`/booking/${id}`)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `Check out this ${listing?.type}: ${listing?.title}`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        console.log('Link copied to clipboard')
      } catch (err) {
        console.log('Failed to copy to clipboard')
      }
    }
  }

  // Debug logging for render state
  console.log('🎨 Rendering with state:', {
    isLoading,
    error,
    hasListing: !!listing,
    listingId: listing?.id,
    listingTitle: listing?.title
  })

  // Loading state
  if (isLoading) {
    console.log('⏳ Rendering loading state')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !listing) {
    console.log('❌ Rendering error state:', { error, hasListing: !!listing })
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-red-100 bg-red-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'Listing not found' ? 'Listing Not Found' : 'Something Went Wrong'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Listing not found' 
                ? 'The listing you\'re looking for doesn\'t exist or has been removed.'
                : `Error: ${error}`
              }
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate(-1)} variant="primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('✅ Rendering successful listing page for:', listing.title)

  const amenities = [
    { icon: Wifi, label: 'WiFi' },
    { icon: Coffee, label: 'Coffee' },
    { icon: Tv, label: 'TV' },
    { icon: ParkingCircle, label: 'Parking' },
    { icon: AirVent, label: 'Air Conditioning' },
  ]

  const mockReviews = [
    {
      id: 1,
      user: 'John D.',
      rating: 5,
      date: '2024-01-15',
      comment: 'Amazing experience! The car was clean and well-maintained. Highly recommended!'
    },
    {
      id: 2,
      user: 'Sarah M.',
      rating: 4,
      date: '2024-01-10',
      comment: 'Great location and easy pickup process. Will definitely book again.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" onClick={toggleFavorite}>
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Basic Info */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {listing.title || 'Untitled Listing'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <StarRating rating={4.8} size="sm" />
                  <span>(24 reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location || 'Location not specified'}</span>
                </div>
                <Badge variant={listing.type === 'car' ? 'primary' : 'secondary'}>
                  {listing.type === 'car' ? (
                    <><Car className="h-3 w-3 mr-1" />Car</>
                  ) : (
                    <><Home className="h-3 w-3 mr-1" />Home</>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              {listing.images && listing.images.length > 0 ? (
                <>
                  <div className="relative h-96 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(listing.images[currentImageIndex]?.image_path)}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png'
                      }}
                    />
                    
                    {listing.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}

                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  {listing.images.length > 1 && (
                    <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                      {listing.images.map((image, index) => (
                        <button
                          key={image.id || index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={getImageUrl(image.image_path)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  {listing.type === 'car' ? (
                    <Car className="h-16 w-16 text-gray-400" />
                  ) : (
                    <Home className="h-16 w-16 text-gray-400" />
                  )}
                  <div className="ml-4 text-gray-500">
                    <p className="text-lg font-medium">No images available</p>
                    <p className="text-sm">Images will appear here when uploaded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Host Information */}
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Hosted by {listing.user?.name || 'Host'}
                  </h3>
                  <p className="text-sm text-gray-600">Joined in 2023</p>
                </div>
                <div className="ml-auto">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Host
                  </Button>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {listing.description || 'No description available for this listing.'}
              </p>
            </Card>

            {/* Amenities */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                <div className="flex items-center space-x-2">
                  <StarRating rating={4.8} size="sm" />
                  <span className="text-sm text-gray-600">(24 reviews)</span>
                </div>
              </div>

              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{review.user}</span>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{formatDate(review.date)}</p>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-6">
                Show all 24 reviews
              </Button>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(listing.price_per_day)}/day
                  </div>
                  <p className="text-sm text-gray-600">Free cancellation</p>
                </div>

                <div className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in / Check-out
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={selectedDates.checkIn}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkIn: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={selectedDates.checkOut}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkOut: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Booking Summary */}
                  {selectedDates.checkIn && selectedDates.checkOut && (
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Daily rate</span>
                        <span>{formatPrice(listing.price_per_day)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>{formatPrice(listing.price_per_day * 0.1)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>{formatPrice(listing.price_per_day * 1.1)}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleBooking}
                    disabled={listing.status === 'paused'}
                  >
                    {listing.status === 'paused' ? 'Unavailable' : 'Reserve Now'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    You won't be charged yet
                  </p>
                </div>
              </Card>

              {/* Safety Features */}
              <Card className="p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Safety features</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">Verified listing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">Identity verified host</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">24/7 support</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}