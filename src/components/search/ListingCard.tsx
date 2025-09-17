import React from 'react'
import { Link } from 'react-router-dom'
import { Listing } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { formatPrice } from '@/lib/utils'
import { 
  MapPin, 
  Heart, 
  Share2, 
  Car, 
  Home,
  Users,
  Calendar
} from 'lucide-react'

interface ListingCardProps {
  listing: Listing
  onFavorite?: (listingId: string) => void
  onShare?: (listingId: string) => void
  isFavorite?: boolean
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onFavorite,
  onShare,
  isFavorite = false
}) => {
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite?.(listing.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onShare?.(listing.id)
  }

  const getTypeIcon = () => {
    return listing.type === 'car' ? (
      <Car className="h-4 w-4" />
    ) : (
      <Home className="h-4 w-4" />
    )
  }

  const getTypeColor = () => {
    return listing.type === 'car' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  }

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Image Section */}
        <div className="relative h-48">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            <Badge 
              variant="success" 
              size="sm"
              className={`${getTypeColor()} border-0`}
            >
              {getTypeIcon()}
              <span className="ml-1 capitalize">{listing.type}</span>
            </Badge>
            {listing.isVerified && (
              <Badge variant="success" size="sm">
                Verified
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleFavorite}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors duration-200"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`h-4 w-4 ${
                  isFavorite ? 'text-red-500 fill-current' : 'text-secondary-600'
                }`} 
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors duration-200"
              aria-label="Share listing"
            >
              <Share2 className="h-4 w-4 text-secondary-600" />
            </button>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1">
              <div className="text-lg font-bold text-primary-600">
                {formatPrice(listing.price, listing.currency)}
              </div>
              <div className="text-xs text-secondary-500">per day</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title and Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-secondary-900 line-clamp-1 flex-1">
              {listing.title}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <StarRating rating={listing.rating} size="sm" showValue />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 text-secondary-600 mb-3">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">
              {listing.location.city}, {listing.location.state}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
            {listing.description}
          </p>

          {/* Features */}
          <div className="flex items-center justify-between text-sm text-secondary-500 mb-4">
            {listing.type === 'car' ? (
              <>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{listing.features.seats} seats</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{listing.features.year}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="capitalize">{listing.features.transmission}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{listing.features.bedrooms} bed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{listing.features.bathrooms} bath</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{listing.features.squareFeet?.toLocaleString()} sq ft</span>
                </div>
              </>
            )}
          </div>

          {/* Host Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={listing.host.avatar}
                alt={listing.host.name}
                className="h-6 w-6 rounded-full"
              />
              <span className="text-sm text-secondary-600">
                {listing.host.name}
              </span>
            </div>
            <div className="text-sm text-secondary-500">
              {listing.reviewCount} reviews
            </div>
          </div>

          {/* Amenities Preview */}
          {listing.amenities.length > 0 && (
            <div className="mt-3 pt-3 border-t border-secondary-100">
              <div className="flex flex-wrap gap-1">
                {listing.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {amenity}
                  </Badge>
                ))}
                {listing.amenities.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{listing.amenities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
