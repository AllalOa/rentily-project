import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  User,
  Shield,
  Calendar,
  Users,
  Car,
  Home,
  Wifi,
  Coffee,
  Tv,
  AirVent,
  ParkingCircle,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Award,
  Camera,
  ZoomIn
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'
import { api } from '@/services/api'

interface ListingDetail {
  id: number
  title: string
  description: string
  type: 'car' | 'home'
  price_per_day: number
  location: string
  status: string
  images: Array<{
    id: number
    image_path: string
    position: number
  }>
  host: {
    id: number
    name: string
    email: string
  }
  created_at: string
  updated_at: string
}

export const ListingDetailPage: React.FC = () => {
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'amenities' | 'location' | 'reviews'>('overview')

  // Get listing ID from URL
  const listingId = window.location.pathname.split('/').pop()

  // Mock data for demonstration
  const mockAmenities = [
    { icon: <Wifi className="h-5 w-5" />, name: 'WiFi', available: true },
    { icon: <Coffee className="h-5 w-5" />, name: 'Coffee Machine', available: true },
    { icon: <Tv className="h-5 w-5" />, name: 'TV', available: true },
    { icon: <AirVent className="h-5 w-5" />, name: 'Air Conditioning', available: true },
    { icon: <ParkingCircle className="h-5 w-5" />, name: 'Parking', available: false },
  ]

  const mockReviews = [
    {
      id: 1,
      user: { name: 'John Doe', avatar: 'JD' },
      rating: 5,
      comment: 'Amazing rental! Everything was exactly as described. The host was very responsive.',
      date: '2024-01-15'
    },
    {
      id: 2,
      user: { name: 'Sarah Smith', avatar: 'SS' },
      rating: 4,
      comment: 'Great experience overall. Clean and comfortable. Would book again.',
      date: '2024-01-10'
    }
  ]

  // Get image URL
  const getImageUrl = (imagePath: string) => {
    const apiUrl = 'http://localhost:8000'
    return `${apiUrl}/storage/${imagePath}`
  }

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return

      try {
        setLoading(true)
        const response = await api.listings.getListing(listingId)
        setListing(response as ListingDetail)
      } catch (err: any) {
        setError(err.message || 'Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [listingId])

  // Image navigation
  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      )
    }
  }

  // Calculate total price
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days * (listing?.price_per_day || 0) : 0
  }

  const getDaysBetween = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Listing not found
          </h3>
          <p className="text-secondary-600 mb-6">
            {error || 'The listing you are looking for does not exist.'}
          </p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Search</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="aspect-[16/10] bg-secondary-100">
                  {listing.images.length > 0 ? (
                    <img
                      src={getImageUrl(listing.images[currentImageIndex].image_path)}
                      alt={listing.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = listing.type === 'car' 
                          ? 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop'
                          : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {listing.type === 'car' ? (
                        <Car className="h-24 w-24 text-secondary-400" />
                      ) : (
                        <Home className="h-24 w-24 text-secondary-400" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Navigation Arrows */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {listing.images.length || 1}
                </div>
                
                {/* View All Photos Button */}
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute bottom-4 right-4 bg-white hover:bg-secondary-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>View all photos</span>
                </button>
              </div>
              
              {/* Thumbnail Strip */}
              {listing.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary-500 ring-2 ring-primary-200' 
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(image.image_path)}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Title and Basic Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant={listing.type === 'car' ? 'primary' : 'secondary'}>
                      {listing.type === 'car' ? 'Car Rental' : 'Home Rental'}
                    </Badge>
                    <Badge variant="success" className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Verified</span>
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                    {listing.title}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-secondary-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-amber-400 fill-current" />
                      <span>4.8 (24 reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">
                    ${listing.price_per_day}
                  </div>
                  <div className="text-sm text-secondary-500">per day</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-secondary-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'amenities', label: 'Features' },
                  { id: 'location', label: 'Location' },
                  { id: 'reviews', label: 'Reviews (24)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-4">Description</h3>
                    <p className="text-secondary-700 leading-relaxed">
                      {listing.description || 'No description available for this listing.'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-4">What makes this special</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-secondary-700">Verified by our team</span>
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                        <Award className="h-5 w-5 text-blue-600" />
                        <span className="text-secondary-700">Highly rated</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'amenities' && (
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-6">Available Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mockAmenities.map((amenity, index) => (
                      <div 
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-lg border ${
                          amenity.available 
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        {amenity.available ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                        {amenity.icon}
                        <span className="font-medium">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'location' && (
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-4">Location</h3>
                  <div className="aspect-[16/10] bg-secondary-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-secondary-400 mx-auto mb-2" />
                      <p className="text-secondary-600">Map integration would go here</p>
                      <p className="text-sm text-secondary-500 mt-1">{listing.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-6">Guest Reviews</h3>
                  <div className="space-y-6">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="border-b border-secondary-200 pb-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                            {review.user.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-secondary-900">{review.user.name}</span>
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-sm text-secondary-500">{review.date}</span>
                            </div>
                            <p className="text-secondary-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Host Information */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">Meet your host</h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {listing.host.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-secondary-900">{listing.host.name}</h4>
                    <Badge variant="success" size="sm">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified Host
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                    <span>★ 4.9 rating</span>
                    <span>•</span>
                    <span>12 reviews</span>
                    <span>•</span>
                    <span>Host since 2023</span>
                  </div>
                  <p className="text-secondary-700 mb-4">
                    Experienced host committed to providing excellent service and memorable experiences.
                  </p>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact Host</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-2xl font-bold text-primary-600">
                      ${listing.price_per_day}
                    </span>
                    <span className="text-secondary-500">per day</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <span className="font-medium">4.8</span>
                    <span className="text-secondary-500">(24 reviews)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Check-in
                      </label>
                      <Input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Check-out
                      </label>
                      <Input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} guest{num !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {checkIn && checkOut && getDaysBetween() > 0 && (
                  <div className="bg-secondary-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-secondary-700">
                        ${listing.price_per_day} × {getDaysBetween()} night{getDaysBetween() !== 1 ? 's' : ''}
                      </span>
                      <span className="font-medium">${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-secondary-700">Service fee</span>
                      <span className="font-medium">${Math.round(calculateTotal() * 0.1)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>${calculateTotal() + Math.round(calculateTotal() * 0.1)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full py-3 text-lg font-semibold"
                  disabled={!checkIn || !checkOut || getDaysBetween() <= 0}
                >
                  {!checkIn || !checkOut ? 'Select dates' : 'Reserve now'}
                </Button>

                <p className="text-xs text-secondary-500 text-center mt-3">
                  You won't be charged yet
                </p>
              </Card>

              {/* Quick Contact */}
              <Card className="p-4 mt-4">
                <div className="text-center">
                  <MessageCircle className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <h4 className="font-medium text-secondary-900 mb-2">Have questions?</h4>
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Host
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}