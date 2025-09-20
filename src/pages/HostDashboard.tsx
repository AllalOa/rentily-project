import React, { useState, useEffect } from 'react'
import { ListingForm } from './ListingForm'
import { ConfirmDialog } from '@/components/ConfirmDialog' 
import { useHostListings, HostListing } from '@/hooks/useHostListings'
import { ListingDetailModal } from '@/components/ListingDetailModal'
import { 
  Calendar, 
  MapPin, 
  Star, 
  MessageCircle, 
  Settings,
  Plus,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'
import { mockBookings, mockDashboardStats } from '@/data/mockData'
import { Booking, DashboardStats } from '@/types'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import Swal from 'sweetalert2'

export const HostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings' | 'analytics'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all')

  // Listing modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingListing, setEditingListing] = useState<HostListing | null>(null)
  const [viewingListing, setViewingListing] = useState<HostListing | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null)

  // Use the custom hook for listings
  const { 
    listings, 
    isLoading, 
    error, 
    refetch, 
    createListing, 
    updateListing, 
    deleteListing 
  } = useHostListings(filterStatus === 'all' ? undefined : filterStatus)

  const stats: DashboardStats = mockDashboardStats
  const myBookings = mockBookings.filter(booking => booking.hostId === '1')

  // Filter listings based on search query
  const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateModal = () => setShowCreateModal(true)
  const closeCreateModal = () => setShowCreateModal(false)

  const openEditModal = (listing: HostListing) => {
    setEditingListing({
      ...listing,
      existing_images: listing.images
    } as HostListing & { existing_images: any[] })
    setShowEditModal(true)
  }
  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingListing(null)
  }

  const openDetailModal = (listing: HostListing) => {
    setViewingListing(listing)
    setShowDetailModal(true)
  }
  const closeDetailModal = () => {
    setShowDetailModal(false)
    setViewingListing(null)
  }

  const openDeleteConfirm = (listingId: string) => {
    setDeletingListingId(listingId)
    setShowDeleteConfirm(true)
  }
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    setDeletingListingId(null)
  }

  const handleCreateSuccess = async () => {
    closeCreateModal()
    await refetch() // Refresh listings
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Listing created successfully!',
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const handleEditSuccess = async () => {
    closeEditModal()
    await refetch() // Refresh listings
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Listing updated successfully!',
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const handleDelete = async () => {
    if (!deletingListingId) return

    try {
      await deleteListing(deletingListingId)
      closeDeleteConfirm()
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Listing has been deleted successfully.',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error: any) {
      console.error('Delete error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to delete listing',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: 'success' as const, label: 'Confirmed' },
      pending: { variant: 'warning' as const, label: 'Pending' },
      cancelled: { variant: 'error' as const, label: 'Cancelled' },
      completed: { variant: 'secondary' as const, label: 'Completed' },
      active: { variant: 'success' as const, label: 'Active' },
      paused: { variant: 'warning' as const, label: 'Paused' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>
  }

  const getImageUrl = (imagePath: string) => {
    // Use import.meta.env for Vite or hardcode the API URL
    const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
    return `${apiUrl}/storage/${imagePath}`
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Revenue</p>
              <p className="text-2xl font-bold text-secondary-900">
                {formatPrice(stats.totalRevenue, 'USD')}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <Calendar className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Listings</p>
              <p className="text-2xl font-bold text-secondary-900">{listings.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Star className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Average Rating</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.averageRating}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Active Listings</p>
              <p className="text-2xl font-bold text-secondary-900">
                {listings.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Recent Bookings</h3>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('bookings')}>
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {myBookings.slice(0, 3).map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={booking.listing.images[0]}
                  alt={booking.listing.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-secondary-900">{booking.listing.title}</h4>
                  <p className="text-sm text-secondary-600">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-secondary-900">
                    {formatPrice(booking.totalPrice, booking.currency)}
                  </p>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderListings = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-secondary-600">Loading listings...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-error-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Error Loading Listings
          </h3>
          <p className="text-secondary-600 mb-6">{error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      )
    }

    if (filteredListings.length === 0) {
      return (
        <div className="text-center py-12">
          <Plus className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {listings.length === 0 ? 'No listings yet' : 'No listings found'}
          </h3>
          <p className="text-secondary-600 mb-6">
            {listings.length === 0 
              ? 'Create your first listing to start earning money.'
              : 'Try adjusting your search or filters.'
            }
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>
      )
    }

    return (
      <div>
        <div className="mb-4">
          <Button onClick={openCreateModal} variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <Card 
              key={listing.id} 
              className="p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => openDetailModal(listing)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex space-x-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary-100">
                    {listing.images.length > 0 ? (
                      <img
                        src={getImageUrl(listing.images[0].image_path)}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-image.png' // Fallback image
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-secondary-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {listing.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(listing.status)}
                        <Badge variant="secondary" size="sm">
                          {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatDate(listing.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="text-lg font-semibold text-primary-600">
                      {formatPrice(listing.price_per_day, 'USD')}/day
                    </div>
                    
                    {listing.description && (
                      <p className="text-sm text-secondary-600 mt-2 line-clamp-2">
                        {listing.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDetailModal(listing)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(listing)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-error-600 hover:text-error-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDeleteConfirm(listing.id.toString())
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderBookings = () => {
    if (myBookings.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No bookings yet
          </h3>
          <p className="text-secondary-600 mb-6">
            Bookings will appear here once guests start booking your listings.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {myBookings.map((booking) => (
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
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{booking.guest.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-lg font-semibold text-primary-600">
                    {formatPrice(booking.totalPrice, booking.currency)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Guest
                </Button>
                {booking.status === 'pending' && (
                  <>
                    <Button size="sm" className="bg-success-600 hover:bg-success-700">
                      Accept
                    </Button>
                    <Button variant="outline" size="sm" className="text-error-600 hover:text-error-700">
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const renderAnalytics = () => (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Response Rate</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.responseRate}%</p>
            </div>
            <div className="p-2 bg-success-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.occupancyRate}%</p>
            </div>
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Upcoming Bookings</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.upcomingBookings}</p>
            </div>
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Monthly Revenue</h3>
        <div className="h-64 bg-secondary-100 rounded-lg flex items-center justify-center">
          <p className="text-secondary-600">Revenue chart would be displayed here</p>
        </div>
      </Card>

      {/* Reviews Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Reviews Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-600">Overall Rating</span>
            <div className="flex items-center space-x-2">
              <StarRating rating={stats.averageRating} size="sm" showValue />
              <span className="text-sm text-secondary-600">({stats.totalBookings} reviews)</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {[
              { label: 'Cleanliness', rating: 4.8 },
              { label: 'Communication', rating: 4.9 },
              { label: 'Check-in', rating: 4.7 },
              { label: 'Accuracy', rating: 4.8 },
              { label: 'Location', rating: 4.6 },
              { label: 'Value', rating: 4.7 }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <StarRating rating={item.rating} size="sm" showValue />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Host Dashboard
          </h1>
          <p className="text-secondary-600">
            Manage your listings, bookings, and earnings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">This Month</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {formatPrice(stats.monthlyRevenue[stats.monthlyRevenue.length - 1]?.revenue || 0, 'USD')}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <Calendar className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Listings</p>
                <p className="text-2xl font-bold text-secondary-900">{listings.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-accent-100 rounded-lg">
                <Star className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Rating</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.averageRating}</p>
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
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'paused')}
              className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
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
              { id: 'overview', label: 'Overview' },
              { id: 'listings', label: 'Listings', count: listings.length },
              { id: 'bookings', label: 'Bookings', count: myBookings.length },
              { id: 'analytics', label: 'Analytics' }
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
                {tab.count !== undefined && tab.count > 0 && (
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
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'listings' && renderListings()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
      
      {/* Create Listing Modal */}
      <ListingForm
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        onSave={handleCreateSuccess}
        initialData={null}
      />

      {/* Edit Listing Modal */}
      <ListingForm
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleEditSuccess}
        initialData={editingListing}
      />

      {/* Listing Detail Modal */}
      <ListingDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        listing={viewingListing}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}