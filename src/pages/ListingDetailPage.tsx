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
  Car as CarIcon,
  ParkingCircle,
  AirVent,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react'

// Mock components (replace with your actual UI components)
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

const Alert = ({ children, variant = "error", className = "" }) => {
  const variants = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  }
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}

// Modal Component for Contact Host
const ContactHostModal = ({ isOpen, onClose, listing, onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      setMessage(`Hi! I'm interested in your ${listing?.type}: ${listing?.title}. Could you provide more information?`)
    }
  }, [isOpen, listing])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contact {listing?.host?.name || 'Host'}
          </h3>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{listing?.title}</h4>
                <p className="text-sm text-gray-600">{listing?.location}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your message here..."
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/1000 characters
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
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

const formatPrice = (price, currency = 'USD') => {
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

const getAuthToken = () => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
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
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [availability, setAvailability] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  
  // Contact Host Modal states
  const [showContactModal, setShowContactModal] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [messageSuccess, setMessageSuccess] = useState('')

  useEffect(() => {
    fetchListing()
  }, [id])

  // Check availability when dates change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedDates.checkIn && selectedDates.checkOut) {
        checkAvailability()
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [selectedDates.checkIn, selectedDates.checkOut])

  const fetchListing = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/listings/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listing: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setListing(data)
    } catch (err) {
      console.error('Error fetching listing:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const checkAvailability = async () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut || !listing) {
      return
    }

    // Validate dates
    const checkIn = new Date(selectedDates.checkIn)
    const checkOut = new Date(selectedDates.checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      setBookingError('Check-in date cannot be in the past')
      setAvailability(null)
      return
    }

    if (checkOut <= checkIn) {
      setBookingError('Check-out date must be after check-in date')
      setAvailability(null)
      return
    }

    try {
      setCheckingAvailability(true)
      setBookingError('')
      setAvailability(null)
      
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      
      // Build the URL with query parameters
      const url = new URL(`${apiUrl}/api/listings/${id}/availability`)
      url.searchParams.append('start_date', selectedDates.checkIn)
      url.searchParams.append('end_date', selectedDates.checkOut)
      
      console.log('Checking availability:', url.toString())
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })
      
      console.log('Availability response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Availability check failed:', response.status, errorText)
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Availability data:', data)
      
      if (data.available) {
        setAvailability(data)
        setBookingError('')
      } else {
        setAvailability(null)
        setBookingError(data.message || 'Selected dates are not available')
      }
    } catch (err) {
      console.error('Error checking availability:', err)
      setBookingError('Unable to check availability. Please try again.')
      setAvailability(null)
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleBooking = async () => {
    const token = getAuthToken()
    if (!token) {
      setBookingError('Please log in to make a booking')
      navigate('/login')
      return
    }

    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      setBookingError('Please select check-in and check-out dates')
      return
    }

    if (!availability || !availability.available) {
      setBookingError('Please check availability first')
      await checkAvailability()
      return
    }

    try {
      setIsBooking(true)
      setBookingError('')
      setBookingSuccess('')
      
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      
      const bookingData = {
        listing_id: parseInt(id),
        start_date: selectedDates.checkIn,
        end_date: selectedDates.checkOut,
        guests: guests
      }

      console.log('Sending booking data:', bookingData)

      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()
      console.log('Booking response:', data)

      if (response.ok && data.success) {
        setBookingSuccess('Booking created successfully! Redirecting to your bookings...')
        setTimeout(() => {
          navigate('/bookings')
        }, 2000)
      } else {
        setBookingError(data.message || 'Failed to create booking')
      }
    } catch (err) {
      console.error('Booking error:', err)
      setBookingError('Network error. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  // New function to handle contact host
  const handleContactHost = () => {
    const token = getAuthToken()
    if (!token) {
      setMessageError('Please log in to contact the host')
      navigate('/login')
      return
    }

    // Check if user is trying to contact themselves
    if (listing?.user_id && parseInt(listing.user_id) === getCurrentUserId()) {
      setMessageError('You cannot contact yourself')
      return
    }

    setShowContactModal(true)
    setMessageError('')
    setMessageSuccess('')
  }

  const handleSendMessage = async (messageContent) => {
    const token = getAuthToken()
    if (!token) {
      setMessageError('Please log in to send a message')
      return
    }

    try {
      setIsSendingMessage(true)
      setMessageError('')
      setMessageSuccess('')
      
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      
      const messageData = {
        listing_id: parseInt(id),
        message: messageContent
      }

      console.log('Sending message:', messageData)

      const response = await fetch(`${apiUrl}/api/contact-host`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(messageData)
      })

      const data = await response.json()
      console.log('Message response:', data)

      if (response.ok && data.success) {
        setMessageSuccess('Message sent successfully!')
        setShowContactModal(false)
        
        // Redirect to messages page after a short delay
        setTimeout(() => {
          navigate('/messages')
        }, 1500)
      } else {
        setMessageError(data.message || 'Failed to send message')
      }
    } catch (err) {
      console.error('Message error:', err)
      setMessageError('Network error. Please try again.')
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Helper function to get current user ID (you'll need to implement this based on your auth system)
  const getCurrentUserId = () => {
    // This is a placeholder - you'll need to implement getting the current user's ID
    // from your auth context or JWT token
    const token = getAuthToken()
    if (!token) return null
    
    try {
      // If you store user data in localStorage or have it available elsewhere
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
      return userData.id
    } catch {
      return null
    }
  }

  const getImageUrl = (imagePath) => {
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this ${listing?.type}: ${listing?.title}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Calculate days difference
  const calculateDays = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return 0
    const startDate = new Date(selectedDates.checkIn)
    const endDate = new Date(selectedDates.checkOut)
    const timeDiff = endDate.getTime() - startDate.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const days = calculateDays()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
          <p className="text-gray-600 mb-4">{error || 'This listing may have been removed or is no longer available.'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    )
  }

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
        {/* Success/Error Messages for Contact Host */}
        {messageSuccess && (
          <Alert variant="success" className="mb-4">
            {messageSuccess}
          </Alert>
        )}
        
        {messageError && (
          <Alert variant="error" className="mb-4">
            {messageError}
          </Alert>
        )}

        {/* Title and Basic Info */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <StarRating rating={4.8} size="sm" />
                  <span>(24 reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
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
                          key={image.id}
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
                    Hosted by {listing.host?.name || 'Host'}
                  </h3>
                  <p className="text-sm text-gray-600">Joined in 2023</p>
                </div>
                <div className="ml-auto">
                  <Button variant="outline" size="sm" onClick={handleContactHost}>
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
                {listing.description || 'No description available.'}
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
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={selectedDates.checkOut}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkOut: e.target.value }))}
                        min={selectedDates.checkIn || new Date().toISOString().split('T')[0]}
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

                  {/* Loading State for Availability Check */}
                  {checkingAvailability && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-600">Checking availability...</span>
                    </div>
                  )}

                  {/* Booking Summary */}
                  {availability && availability.pricing && days > 0 && (
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{formatPrice(listing.price_per_day)} × {days} day{days > 1 ? 's' : ''}</span>
                        <span>{formatPrice(availability.pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>{formatPrice(availability.pricing.service_fee)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>{formatPrice(availability.pricing.total)}</span>
                      </div>
                    </div>
                  )}

                  {/* Error Messages */}
                  {bookingError && (
                    <Alert variant="error" className="mt-4">
                      {bookingError}
                    </Alert>
                  )}

                  {/* Success Messages */}
                  {bookingSuccess && (
                    <Alert variant="success" className="mt-4">
                      {bookingSuccess}
                    </Alert>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleBooking}
                    disabled={
                      listing.status === 'paused' || 
                      isBooking || 
                      !selectedDates.checkIn || 
                      !selectedDates.checkOut || 
                      checkingAvailability ||
                      !!bookingError
                    }
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating Booking...
                      </>
                    ) : listing.status === 'paused' ? (
                      'Unavailable'
                    ) : !selectedDates.checkIn || !selectedDates.checkOut ? (
                      'Select Dates'
                    ) : checkingAvailability ? (
                      'Checking...'
                    ) : availability ? (
                      'Reserve Now'
                    ) : (
                      'Check Availability'
                    )}
                  </Button>

                  {!isBooking && availability && (
                    <p className="text-xs text-gray-500 text-center">
                      You won't be charged yet
                    </p>
                  )}
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

      {/* Contact Host Modal */}
      <ContactHostModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        listing={listing}
        onSendMessage={handleSendMessage}
        isLoading={isSendingMessage}
      />
    </div>
  )
}