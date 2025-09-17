import React, { useState } from 'react'
import { 
  Star, 
  Filter, 
  Search, 
  ThumbsUp, 
  ThumbsDown,
  Flag,
  MoreVertical,
  Calendar,
  User,
  MessageCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
// import { mockReviews, mockListings } from '@/data/mockData'
import { api } from '@/services/api'
import { Review, Listing } from '@/types'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    let filtered = reviews

    if (query) {
      filtered = filtered.filter(review =>
        review.comment.toLowerCase().includes(query.toLowerCase()) ||
        review.listing.title.toLowerCase().includes(query.toLowerCase()) ||
        review.reviewer.name.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === Number(ratingFilter))
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating)
        break
    }

    setFilteredReviews(filtered)
  }

  // Fetch reviews on component mount
  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await api.get('/v1/reviews')
        const apiReviews = (response.data.data || []).map((review: any) => ({
          id: String(review.id),
          listingId: String(review.listing_id),
          listing: {
            id: String(review.listing?.id || ''),
            title: review.listing?.title || 'Unknown Listing',
            location: {
              address: review.listing?.location || '',
              city: review.listing?.location || '',
              state: '',
              country: '',
              zipCode: '',
              coordinates: { lat: 0, lng: 0 },
            }
          },
          reviewer: {
            id: String(review.user?.id || ''),
            name: review.user?.name || 'Anonymous',
            email: review.user?.email || '',
            avatar: review.user?.avatar || '',
            isVerified: true,
            joinedAt: review.user?.created_at || '',
            rating: 0,
            reviewCount: 0,
            isHost: false,
            preferences: {
              notifications: { email: true, sms: false, push: true },
              privacy: { showProfile: true, showBookings: false },
              currency: 'USD',
              language: 'en'
            }
          },
          rating: review.rating,
          comment: review.comment || '',
          categories: {
            cleanliness: review.rating,
            communication: review.rating,
            checkIn: review.rating,
            accuracy: review.rating,
            location: review.rating,
            value: review.rating,
          },
          isVerified: true,
          createdAt: review.created_at,
          updatedAt: review.updated_at || review.created_at,
        }))
        setReviews(apiReviews)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  React.useEffect(() => {
    handleSearch(searchQuery)
  }, [searchQuery, ratingFilter, sortBy, reviews])

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }

  const getCategoryAverage = (category: keyof Review['categories']) => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.categories[category], 0)
    return sum / reviews.length
  }

  const handleHelpful = (reviewId: string) => {
    // In a real app, this would update the database
    console.log('Marked as helpful:', reviewId)
  }

  const handleReport = (reviewId: string) => {
    // In a real app, this would open a report modal
    console.log('Report review:', reviewId)
  }

  const renderReviewCard = (review: Review) => (
    <Card key={review.id} className="p-6">
      <div className="flex items-start space-x-4">
        <Avatar
          src={review.reviewer.avatar}
          name={review.reviewer.name}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-secondary-900">{review.reviewer.name}</h3>
              <div className="flex items-center space-x-2">
                <StarRating rating={review.rating} size="sm" showValue />
                <span className="text-sm text-secondary-600">
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-3">
            <h4 className="font-medium text-secondary-900 mb-1">
              {review.listing.title}
            </h4>
            <p className="text-sm text-secondary-600">
              {review.listing.location.city}, {review.listing.location.state}
            </p>
          </div>

          <p className="text-secondary-700 mb-4">{review.comment}</p>

          {/* Category Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {Object.entries(review.categories).map(([category, rating]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <StarRating rating={rating} size="sm" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpful(review.id)}
                className="text-secondary-600 hover:text-success-600"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReport(review.id)}
                className="text-secondary-600 hover:text-error-600"
              >
                <Flag className="h-4 w-4 mr-1" />
                Report
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {review.isVerified && (
                <Badge variant="success" size="sm">Verified</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  const renderWriteReviewModal = () => (
    <Modal
      isOpen={showWriteReview}
      onClose={() => setShowWriteReview(false)}
      title="Write a Review"
      size="lg"
    >
      <div className="space-y-6">
        {selectedListing && (
          <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
            <img
              src={selectedListing.images[0]}
              alt={selectedListing.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-secondary-900">{selectedListing.title}</h3>
              <p className="text-sm text-secondary-600">
                {selectedListing.location.city}, {selectedListing.location.state}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Overall Rating
          </label>
          <StarRating
            rating={0}
            interactive={true}
            onRatingChange={(rating) => console.log('Rating:', rating)}
            size="lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Category Ratings
          </label>
          <div className="space-y-3">
            {['cleanliness', 'communication', 'checkIn', 'accuracy', 'location', 'value'].map((category) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <StarRating
                  rating={0}
                  interactive={true}
                  onRatingChange={(rating) => console.log(`${category}:`, rating)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Your Review
          </label>
          <textarea
            placeholder="Share your experience..."
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowWriteReview(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!selectedListing) return
              try {
                await api.post('/v1/reviews', {
                  listing_id: selectedListing.id,
                  rating: 5, // This should come from the form state
                  comment: 'Great experience!', // This should come from the form state
                })
                setShowWriteReview(false)
                // Refresh reviews
                window.location.reload()
              } catch (error) {
                console.error('Error submitting review:', error)
              }
            }}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  )

  const ratingDistribution = getRatingDistribution()
  const averageRating = getAverageRating()

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                Reviews & Ratings
              </h1>
              <p className="text-secondary-600">
                Read and write reviews for your rental experiences
              </p>
            </div>
            <Button onClick={() => setShowWriteReview(true)}>
              Write Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Overall Rating
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-secondary-900 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={averageRating} size="lg" />
                <p className="text-sm text-secondary-600 mt-2">
                  Based on {reviews.length} reviews
                </p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-600 w-8">{rating}</span>
                    <Star className="h-4 w-4 text-accent-400 fill-current" />
                    <div className="flex-1 bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-accent-400 h-2 rounded-full"
                        style={{
                          width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-secondary-600 w-8">
                      {ratingDistribution[rating as keyof typeof ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Category Averages
              </h3>
              <div className="space-y-3">
                {['cleanliness', 'communication', 'checkIn', 'accuracy', 'location', 'value'].map((category) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <StarRating rating={getCategoryAverage(category as keyof Review['categories'])} size="sm" />
                      <span className="text-sm text-secondary-600">
                        {getCategoryAverage(category as keyof Review['categories']).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-secondary-400" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    No reviews found
                  </h3>
                  <p className="text-secondary-600 mb-6">
                    Try adjusting your search criteria or filters.
                  </p>
                  <Button onClick={() => setShowWriteReview(true)}>
                    Write First Review
                  </Button>
                </Card>
              ) : (
                filteredReviews.map(renderReviewCard)
              )}
            </div>

            {/* Load More */}
            {filteredReviews.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Reviews
                </Button>
              </div>
            )}
          </div>
        </div>

        {renderWriteReviewModal()}
      </div>
    </div>
  )
}
