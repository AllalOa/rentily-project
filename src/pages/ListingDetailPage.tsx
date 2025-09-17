import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  Star, 
  Heart, 
  Share2, 
  MessageCircle, 
  Calendar,
  Users,
  Car,
  Home,
  Shield,
  Wifi,
  Coffee,
  Car as CarIcon,
  Home as HomeIcon,
  Utensils,
  Dumbbell,
  Waves,
  TreePine
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { ImageGallery } from '@/components/listing/ImageGallery'
import { BookingCard } from '@/components/listing/BookingCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
// import { mockListings, mockReviews } from '@/data/mockData'
import { api } from '@/services/api'
import { Listing, Review } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'reviews' | 'location'>('overview')

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

  const handleBook = (dates: { start: string; end: string }, guests: number) => {
    navigate(`/booking/${id}?start=${dates.start}&end=${dates.end}&guests=${guests}`)
  }

  const handleMessage = () => {
    navigate('/messages')
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'WiFi': <Wifi className="h-4 w-4" />,
      'Kitchen': <Utensils className="h-4 w-4" />,
      'Pool': <Waves className="h-4 w-4" />,
      'Garden': <TreePine className="h-4 w-4" />,
      'Gym': <Dumbbell className="h-4 w-4" />,
      'Coffee': <Coffee className="h-4 w-4" />,
      'GPS Navigation': <CarIcon className="h-4 w-4" />,
      'Bluetooth': <CarIcon className="h-4 w-4" />,
      'Climate Control': <CarIcon className="h-4 w-4" />,
      'Leather Seats': <CarIcon className="h-4 w-4" />,
    }
    return iconMap[amenity] || <HomeIcon className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading listing details..." />
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
            The listing you're looking for doesn't exist or has been removed.
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant="success" 
                      className={`${listing.type === 'car' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {listing.type === 'car' ? <Car className="h-4 w-4 mr-1" /> : <Home className="h-4 w-4 mr-1" />}
                      {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
                    </Badge>
                    {listing.isVerified && (
                      <Badge variant="success" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                    {listing.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-secondary-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location.city}, {listing.location.state}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StarRating rating={listing.rating} size="sm" showValue />
                      <span>({listing.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavorite}
                    className={isFavorite ? 'text-red-500' : 'text-secondary-600'}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <ImageGallery images={listing.images} title={listing.title} />

            {/* Tabs */}
            <div className="border-b border-secondary-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'amenities', label: 'Amenities' },
                  { id: 'reviews', label: 'Reviews' },
                  { id: 'location', label: 'Location' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-4">About this {listing.type}</h3>
                    <p className="text-secondary-700 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-lg font-semibold text-secondary-900 mb-4">Features</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {listing.type === 'car' ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-secondary-600" />
                            <span className="text-sm text-secondary-700">{listing.features.make} {listing.features.model}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-secondary-600" />
                            <span className="text-sm text-secondary-700">{listing.features.year}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-secondary-600" />
                            <span className="text-sm text-secondary-700">{listing.features.seats} seats</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary-700 capitalize">{listing.features.transmission}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary-700 capitalize">{listing.features.fuelType}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary-700">{listing.features.color}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4 text-secondary-600" />
                            <span className="text-sm text-secondary-700 capitalize">{listing.features.propertyType}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-secondary-600" />
                            <span className="text-sm text-secondary-700">{listing.features.bedrooms} bedrooms</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary-700">{listing.features.bathrooms} bathrooms</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary-700">{listing.features.squareFeet?.toLocaleString()} sq ft</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary-700">
                              {listing.features.petFriendly ? 'Pet friendly' : 'No pets'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary-700">
                              {listing.features.wheelchairAccessible ? 'Wheelchair accessible' : 'Not accessible'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-6">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listing.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="text-primary-600">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="text-secondary-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-secondary-900">
                      Reviews ({reviews.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={listing.rating} size="md" showValue />
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <p className="text-secondary-600">No reviews yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <Card key={review.id} className="p-6">
                          <div className="flex items-start space-x-4">
                            <img
                              src={review.reviewer.avatar}
                              alt={review.reviewer.name}
                              className="h-10 w-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-secondary-900">{review.reviewer.name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <StarRating rating={review.rating} size="sm" />
                                    <span className="text-sm text-secondary-600">
                                      {formatDate(review.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-secondary-700">{review.comment}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-secondary-900">Location</h3>
                  <div className="h-64 bg-secondary-200 rounded-lg flex items-center justify-center">
                    <p className="text-secondary-600">Map would be displayed here</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-secondary-900">{listing.location.address}</p>
                    <p className="text-secondary-600">
                      {listing.location.city}, {listing.location.state} {listing.location.zipCode}
                    </p>
                    <p className="text-secondary-600">{listing.location.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <BookingCard
              listing={listing}
              onBook={handleBook}
              onMessage={handleMessage}
              onFavorite={handleFavorite}
              onShare={handleShare}
              isFavorite={isFavorite}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
