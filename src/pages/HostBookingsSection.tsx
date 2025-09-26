import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users,
  MessageCircle, 
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react'

// Types
interface BookingRenter {
  id: number
  name: string
  email?: string
  phone?: string
}

interface BookingListing {
  id: number
  title: string
  images: Array<{
    id: number
    image_path: string
  }>
}

interface Booking {
  id: number
  listing_id: number
  user_id: number
  start_date: string
  end_date: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
  listing: BookingListing
  renter: BookingRenter
}

interface HostBookingsSectionProps {
  filterStatus?: 'all' | 'pending' | 'confirmed' | 'completed' | 'declined'
  isPreview?: boolean
  limit?: number | null
}

// Enhanced hook with better debugging
const useHostBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  const fetchHostBookings = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      setDebugInfo('Starting fetch...')
      
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      const fullUrl = `${apiUrl}/api/host/bookings`
      
      setDebugInfo(`Making request to: ${fullUrl}`)
      console.log('Making request to:', fullUrl)
      console.log('Auth token present:', !!token)

      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      setDebugInfo(`Response status: ${response.status}`)
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response body:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }

      const data = await response.json()
      console.log('Received data:', data)
      
      setDebugInfo(`Received ${Array.isArray(data) ? data.length : 'non-array'} bookings`)
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching host bookings:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setDebugInfo(`Error: ${errorMessage}`)
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: number, action: 'confirm' | 'decline'): Promise<any> => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/host/bookings/${bookingId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${action} booking`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Update the booking in the local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: action === 'confirm' ? 'confirmed' : 'declined' }
              : booking
          )
        )
        return data
      } else {
        throw new Error(data.message || `Failed to ${action} booking`)
      }
    } catch (err) {
      console.error(`Error ${action}ing booking:`, err)
      throw err
    }
  }

  useEffect(() => {
    fetchHostBookings()
  }, [])

  return {
    bookings,
    isLoading,
    error,
    debugInfo,
    refetch: fetchHostBookings,
    confirmBooking: (bookingId: number) => updateBookingStatus(bookingId, 'confirm'),
    declineBooking: (bookingId: number) => updateBookingStatus(bookingId, 'decline')
  }
}

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const Badge = ({ variant, size, children }: any) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    secondary: 'bg-gray-100 text-gray-800'
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.secondary}`}>
      {children}
    </span>
  )
}

const Card = ({ children, className = '', ...props }: any) => (
  <div className={`bg-white rounded-lg shadow-sm border ${className}`} {...props}>
    {children}
  </div>
)

const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }: any) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2'
  }
  
  return (
    <button 
      className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Host Bookings Component with Debug Info
export const HostBookingsSection: React.FC<HostBookingsSectionProps> = ({ 
  filterStatus = 'all', 
  isPreview = false, 
  limit = null 
}) => {
  const { bookings, isLoading, error, debugInfo, refetch, confirmBooking, declineBooking } = useHostBookings()
  const [actionLoading, setActionLoading] = useState<Record<number, string | null>>({})

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error' | 'secondary'; label: string }> = {
      confirmed: { variant: 'success', label: 'Confirmed' },
      pending: { variant: 'warning', label: 'Pending' },
      cancelled: { variant: 'error', label: 'Cancelled' },
      declined: { variant: 'error', label: 'Declined' },
      completed: { variant: 'secondary', label: 'Completed' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>
  }

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '/placeholder-image.png'
    const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
    return `${apiUrl}/storage/${imagePath}`
  }

  // Filter bookings based on status
  let filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus)

  // Apply limit for preview mode
  if (limit && limit > 0) {
    filteredBookings = filteredBookings.slice(0, limit)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div className="ml-4">
          <div className="text-gray-600">Loading bookings...</div>
          <div className="text-xs text-gray-500 mt-1">{debugInfo}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Bookings
        </h3>
        <p className="text-gray-600 mb-2">{error}</p>
        <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg mb-6 text-left">
          <strong>Debug Info:</strong><br />
          {debugInfo}
          <br /><br />
          <strong>Environment Check:</strong><br />
          API URL: {import.meta.env?.VITE_API_URL || 'http://localhost:8000'}<br />
          Full URL: {(import.meta.env?.VITE_API_URL || 'http://localhost:8000') + '/api/host/bookings'}<br />
          Token Present: {!!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'))}
        </div>
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {bookings.length === 0 ? 'No bookings yet' : 'No bookings found'}
        </h3>
        <p className="text-gray-600 mb-6">
          {bookings.length === 0 
            ? 'Bookings will appear here once guests start booking your listings.'
            : 'Try adjusting your filters to see more bookings.'
          }
        </p>
        <div className="text-xs text-gray-500">
          Debug: {debugInfo}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          Debug: {debugInfo} | Found {bookings.length} total bookings, showing {filteredBookings.length}
        </div>
      )}

      {filteredBookings.map((booking) => (
        <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex space-x-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {booking.listing && booking.listing.images && booking.listing.images.length > 0 ? (
                  <img
                    src={getImageUrl(booking.listing.images[0].image_path)}
                    alt={booking.listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.png'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.listing?.title || 'Unknown Listing'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{booking.renter?.name || 'Guest'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Guests: {booking.guests}</span>
                    <span>Booked: {formatDate(booking.created_at)}</span>
                  </div>
                </div>
                
                <div className="text-lg font-semibold text-blue-600">
                  {formatPrice(booking.total_price, 'USD')}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Guest
              </Button>
              
              {booking.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="success" className="whitespace-nowrap">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 whitespace-nowrap">
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default HostBookingsSection