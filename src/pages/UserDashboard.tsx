import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  MapPin, 
  Star, 
  MessageCircle, 
  Heart, 
  Settings,
  Plus,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
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

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
)

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

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.png'
  const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
  return `${apiUrl}/storage/${imagePath}`
}

export const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) {
        setError('Please log in to view your bookings')
        return
      }

      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`)
      }

      const data = await response.json()
      console.log('Fetched bookings:', data)
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.start_date) > new Date() && 
    (booking.status === 'confirmed' || booking.status === 'pending')
  )



  const pastBookings = bookings.filter(booking => 
  new Date(booking.end_date) < new Date() || 
  booking.status === 'completed' ||
  booking.status === 'cancelled' ||
  booking.status === 'declined'
)

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { variant: 'success', label: 'Confirmed' },
      pending: { variant: 'warning', label: 'Pending' },
      cancelled: { variant: 'error', label: 'Cancelled' },
      declined: { variant: 'error', label: 'Declined' },
      completed: { variant: 'secondary', label: 'Completed' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = getAuthToken()
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      
      const response = await fetch(`${apiUrl}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Refresh bookings
        fetchBookings()
      } else {
        alert('Failed to cancel booking')
      }
    } catch (err) {
      console.error('Error cancelling booking:', err)
      alert('Error cancelling booking')
    }
  }

  const renderBookings = (bookingsToRender) => {
    if (bookingsToRender.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming bookings yet."
              : "You don't have any past bookings yet."
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start Exploring
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {bookingsToRender.map((booking) => (
          <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex space-x-4">
                <img
                  src={booking.listing?.images?.[0] ? getImageUrl(booking.listing.images[0].image_path) : '/placeholder-image.png'}
                  alt={booking.listing?.title || 'Listing'}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png'
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.listing?.title || 'Listing'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(booking.status)}
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.listing?.location || 'Location not available'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">Guests: {booking.guests}</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatPrice(booking.total_price)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Host
                </Button>
                {booking.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                )}
                {booking.status === 'confirmed' && (
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                )}
                {booking.status === 'completed' && (
                  <Button size="sm">
                    Leave Review
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchBookings}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">
            Manage your bookings and reservations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Past</p>
                <p className="text-2xl font-bold text-gray-900">{pastBookings.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
              { id: 'past', label: 'Past', count: pastBookings.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" size="sm" className="ml-2">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'upcoming' && renderBookings(upcomingBookings)}
          {activeTab === 'past' && renderBookings(pastBookings)}
        </div>
      </div>
    </div>
  )
}