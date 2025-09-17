import React, { useState } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'
import { mockBookings, mockListings } from '@/data/mockData'
import { Booking, Listing } from '@/types'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'

export const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'favorites' | 'reviews'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const upcomingBookings = mockBookings.filter(booking => 
    new Date(booking.startDate) > new Date() && booking.status === 'confirmed'
  )

  const pastBookings = mockBookings.filter(booking => 
    new Date(booking.endDate) < new Date() || booking.status === 'completed'
  )

  const favoriteListings = mockListings.slice(0, 3) // Mock favorites

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: 'success' as const, label: 'Confirmed' },
      pending: { variant: 'warning' as const, label: 'Pending' },
      cancelled: { variant: 'error' as const, label: 'Cancelled' },
      completed: { variant: 'secondary' as const, label: 'Completed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-success-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-warning-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-error-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-secondary-600" />
    }
  }

  const renderBookings = (bookings: Booking[]) => {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No bookings found
          </h3>
          <p className="text-secondary-600 mb-6">
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
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex space-x-4">
                <img
                  src={booking.listing.images[0]}
                  alt={booking.listing.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {booking.listing.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(booking.status)}
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.listing.location.city}, {booking.listing.location.state}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-accent-400" />
                      <span>{booking.listing.rating}</span>
                      <span className="text-secondary-500">({booking.listing.reviewCount} reviews)</span>
                    </div>
                    <div className="text-lg font-semibold text-primary-600">
                      {formatPrice(booking.totalPrice, booking.currency)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Host
                </Button>
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

  const renderFavorites = () => {
    if (favoriteListings.length === 0) {
      return (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No favorites yet
          </h3>
          <p className="text-secondary-600 mb-6">
            Save listings you love to easily find them later.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start Exploring
          </Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-secondary-900 line-clamp-1">
                  {listing.title}
                </h3>
                <Button variant="ghost" size="sm" className="text-red-500">
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-1 mb-2">
                <StarRating rating={listing.rating} size="sm" showValue />
                <span className="text-sm text-secondary-600">
                  ({listing.reviewCount})
                </span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-secondary-600 mb-3">
                <MapPin className="h-4 w-4" />
                <span>{listing.location.city}, {listing.location.state}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-primary-600">
                  {formatPrice(listing.price, listing.currency)}/day
                </div>
                <Button size="sm">
                  Book Now
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const renderReviews = () => {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          No reviews yet
        </h3>
        <p className="text-secondary-600 mb-6">
          Complete a booking to leave your first review.
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Start Exploring
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-secondary-600">
            Manage your bookings, favorites, and reviews
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Upcoming</p>
                <p className="text-2xl font-bold text-secondary-900">{upcomingBookings.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Completed</p>
                <p className="text-2xl font-bold text-secondary-900">{pastBookings.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-accent-100 rounded-lg">
                <Heart className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Favorites</p>
                <p className="text-2xl font-bold text-secondary-900">{favoriteListings.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Star className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Reviews</p>
                <p className="text-2xl font-bold text-secondary-900">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
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
              className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        <div className="border-b border-secondary-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
              { id: 'past', label: 'Past', count: pastBookings.length },
              { id: 'favorites', label: 'Favorites', count: favoriteListings.length },
              { id: 'reviews', label: 'Reviews', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
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
          {activeTab === 'favorites' && renderFavorites()}
          {activeTab === 'reviews' && renderReviews()}
        </div>
      </div>
    </div>
  )
}
