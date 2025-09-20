import React, { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Car, 
  Home,
  DollarSign,
  Star,
  MessageCircle,
  User,
  Heart,
  Share2,
  Shield,
  Clock,
  Verified,
  Eye,
  ThumbsUp
} from 'lucide-react'
import { HostListing } from '@/hooks/useHostListings'
import { formatPrice, formatDate } from '@/lib/utils'

interface ListingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  listing: HostListing | null
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  isOpen,
  onClose,
  listing
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  const getImageUrl = (imagePath: string) => {
    const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
    return `${apiUrl}/storage/${imagePath}`
  }

  const nextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { 
        variant: 'default' as const, 
        label: 'Available',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      paused: { 
        variant: 'secondary' as const, 
        label: 'Unavailable',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      }
    }
    
    const statusConfig = config[status as keyof typeof config] || config.active
    return (
      <Badge 
        variant={statusConfig.variant} 
        className={`${statusConfig.className} font-medium px-3 py-1`}
      >
        {statusConfig.label}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    return type === 'car' ? <Car className="h-5 w-5" /> : <Home className="h-5 w-5" />
  }

  // Reset image index when modal opens with new listing
  React.useEffect(() => {
    if (isOpen && listing) {
      setCurrentImageIndex(0)
    }
  }, [isOpen, listing?.id])

  // Don't render the modal content if there's no listing
  if (!listing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="p-6 text-center">
            <p>No listing data available</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[98vw] h-[95vh] max-w-none max-h-none rounded-xl overflow-hidden p-0 bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ transform: 'translate(-50%, -50%)', position: 'fixed' }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{listing.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{listing.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Side - Images */}
          <div className="lg:w-3/5 bg-gray-50 relative">
            {listing.images && listing.images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative h-64 lg:h-full flex items-center justify-center p-4">
                  <img
                    src={getImageUrl(listing.images[currentImageIndex]?.image_path)}
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.png'
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all border border-gray-200"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all border border-gray-200"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-6 left-6 bg-white/95 text-gray-800 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 shadow-lg">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {listing.images.length > 1 && (
                  <div className="absolute bottom-6 right-6 flex space-x-2">
                    {listing.images.slice(0, 5).map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => goToImage(index)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shadow-md ${
                          index === currentImageIndex 
                            ? 'border-blue-500 ring-2 ring-blue-200 scale-105' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={getImageUrl(image.image_path)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {listing.images.length > 5 && (
                      <div className="w-14 h-14 rounded-lg bg-gray-200 border-2 border-gray-300 flex items-center justify-center shadow-md">
                        <span className="text-gray-600 text-xs font-medium">+{listing.images.length - 5}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  {getTypeIcon(listing.type)}
                  <p className="mt-2">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Details */}
          <div className="lg:w-2/5 bg-white overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Price and Type */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(listing.type)}
                    <span className="font-medium text-gray-700 capitalize">{listing.type}</span>
                  </div>
                  {getStatusBadge(listing.status)}
                </div>
                
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(listing.price_per_day, 'USD')}
                    <span className="text-lg font-normal text-gray-500">/day</span>
                  </div>
                  <p className="text-sm text-gray-500">Total price varies by rental period</p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-4 py-4 border-y border-gray-100">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Verified className="h-4 w-4 text-blue-500" />
                  <span>Verified Host</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Protected Booking</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <ThumbsUp className="h-4 w-4 text-purple-500" />
                  <span>100% Rating</span>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">About this {listing.type}</h3>
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                </div>
              )}

              {/* Listing Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Listing Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium capitalize">{listing.type}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium capitalize">{listing.status}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Photos</span>
                      <span className="font-medium">{listing.images?.length || 0}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Listed</span>
                      <span className="font-medium">{formatDate(listing.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Reviews & Ratings</h3>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={5} size="sm" />
                    <span className="font-semibold text-gray-900">5.0</span>
                    <span className="text-sm text-gray-500">(24 reviews)</span>
                  </div>
                </div>
                
                {/* Rating Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Cleanliness', rating: 4.9 },
                    { label: 'Communication', rating: 5.0 },
                    { label: 'Check-in', rating: 4.8 },
                    { label: 'Accuracy', rating: 5.0 },
                    { label: 'Location', rating: 4.7 },
                    { label: 'Value', rating: 4.8 }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-900 rounded-full"
                            style={{ width: `${(item.rating / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-6">{item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Review Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sarah M.</p>
                      <div className="flex items-center space-x-1">
                        <StarRating rating={5} size="xs" />
                        <span className="text-xs text-gray-500">2 days ago</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">"Amazing experience! The {listing.type} was exactly as described and the host was very responsive."</p>
                </div>
              </div>

              {/* Host Information */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Your Host</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Host Name</p>
                    <p className="text-sm text-gray-500">Joined in 2022 • Superhost</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">⭐ 4.95 (127 reviews)</span>
                      <span className="text-xs text-gray-500">✅ Identity verified</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center py-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-lg font-bold text-gray-900">127</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">4.95</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">2</p>
                    <p className="text-xs text-gray-500">Years hosting</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100 space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 text-base rounded-xl"
                >
                  Book Now
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1 rounded-xl">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Host
                  </Button>
                  <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                    Close
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}