import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchFilters } from '@/components/search/SearchFilters'
import { ListingCard } from '@/components/search/ListingCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SearchFilters as SearchFiltersType, Listing, SearchResult } from '@/types'
import { api } from '@/services/api' // Use the correct import from your API service
import { 
  Grid, 
  List, 
  SlidersHorizontal, 
  SortAsc, 
  MapPin,
  Filter,
  X
} from 'lucide-react'

// Define the Laravel API response structure
interface LaravelListing {
  id: number
  title: string
  description: string | null
  type: 'car' | 'home'
  price_per_day: number
  location: string
  status: 'active' | 'paused'
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

interface LaravelPaginatedResponse {
  data: LaravelListing[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<{
    currentPage: number
    totalPages: number
    total: number
  } | null>(null)

  // Initialize filters from URL params
  useEffect(() => {
    const type = searchParams.get('type') as 'car' | 'home' | undefined
    const location = searchParams.get('location') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search') || undefined

    const initialFilters: SearchFiltersType = {
      type,
      location,
      search, // Add search term support
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
      priceRange: minPrice || maxPrice ? {
        min: minPrice ? Number(minPrice) : undefined,
        max: maxPrice ? Number(maxPrice) : undefined
      } : undefined
    }

    setFilters(initialFilters)
  }, [searchParams])

  // Get API base URL for images
  const getImageUrl = (imagePath: string) => {
    const apiUrl = 'http://localhost:8000' // Your Laravel backend URL
    return `${apiUrl}/storage/${imagePath}`
  }

  // Convert Laravel listing to your Listing type
  const convertLaravelListing = (laravelListing: LaravelListing): Listing => {
    return {
      id: String(laravelListing.id),
      title: laravelListing.title,
      description: laravelListing.description || '',
      type: laravelListing.type,
      category: laravelListing.type, // Use type as category
      price: laravelListing.price_per_day,
      currency: 'USD',
      images: laravelListing.images.map(img => getImageUrl(img.image_path)),
      location: {
        address: laravelListing.location,
        city: laravelListing.location.split(',')[0] || laravelListing.location,
        state: laravelListing.location.split(',')[1]?.trim() || '',
        country: 'US', // Default
        zipCode: '',
        coordinates: { lat: 0, lng: 0 }, // You might want to add coordinates to your Laravel model
      },
      host: {
        id: String(laravelListing.host.id),
        name: laravelListing.host.name,
        email: laravelListing.host.email,
        isVerified: true,
        joinedAt: laravelListing.created_at,
        rating: 4.5, // Default rating - you can add this to your Laravel model
        reviewCount: 0, // Default - you can calculate this from reviews
        isHost: true,
        preferences: {
          notifications: { email: true, sms: false, push: true },
          privacy: { showProfile: true, showBookings: false },
          currency: 'USD',
          language: 'en'
        },
      },
      amenities: [], // You might want to add amenities to your Laravel model
      features: {}, // You might want to add features to your Laravel model
      availability: {
        startDate: '',
        endDate: '',
        blockedDates: [],
        minimumStay: 1,
        advanceNotice: 0
      },
      rating: 4.5, // Default - calculate from reviews
      reviewCount: 0, // Default - calculate from reviews
      isAvailable: laravelListing.status === 'active',
      isVerified: true,
      createdAt: laravelListing.created_at,
      updatedAt: laravelListing.updated_at,
    }
  }

  // Search function
  const performSearch = async (page = 1) => {
    setIsLoading(true)
    try {
      const params: any = {
        page,
        search: filters.search,
        type: filters.type,
        sort_by: sortBy === 'relevance' ? 'created_at' : sortBy,
        sort_order: sortBy === 'price-low' ? 'asc' : 'desc'
      }

      // Handle price range
      if (filters.priceRange?.min) {
        params.price_min = filters.priceRange.min
      }
      if (filters.priceRange?.max) {
        params.price_max = filters.priceRange.max
      }

      // Handle location search - you might want to implement location filtering in your Laravel API
      if (filters.location) {
        if (!params.search) {
          params.search = filters.location
        } else {
          params.search += ` ${filters.location}`
        }
      }

      console.log('Search params:', params)

      const response = await api.listings.getListings(params) as LaravelPaginatedResponse

      console.log('API response:', response)

      if (response && response.data) {
        const convertedListings = response.data.map(convertLaravelListing)
        setListings(convertedListings)
        
        setPagination({
          currentPage: response.current_page,
          totalPages: response.last_page,
          total: response.total
        })
      } else {
        setListings([])
        setPagination(null)
      }
    } catch (error) {
      console.error('Search error:', error)
      setListings([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Perform search when filters change
  useEffect(() => {
    performSearch(1)
  }, [filters, sortBy])

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    if (newFilters.type) params.set('type', newFilters.type)
    if (newFilters.location) params.set('location', newFilters.location)
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.dateRange?.start) params.set('startDate', newFilters.dateRange.start)
    if (newFilters.dateRange?.end) params.set('endDate', newFilters.dateRange.end)
    if (newFilters.priceRange?.min) params.set('minPrice', newFilters.priceRange.min.toString())
    if (newFilters.priceRange?.max) params.set('maxPrice', newFilters.priceRange.max.toString())
    
    setSearchParams(params)
  }

  const handleFavorite = (listingId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId)
      } else {
        newFavorites.add(listingId)
      }
      return newFavorites
    })
  }

  const handleShare = (listingId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this rental',
        url: `${window.location.origin}/listing/${listingId}`
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/listing/${listingId}`)
    }
  }

  const handleLoadMore = () => {
    if (pagination && pagination.currentPage < pagination.totalPages) {
      performSearch(pagination.currentPage + 1)
    }
  }

  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'title', label: 'Title A-Z' },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={() => performSearch(1)}
                resultCount={pagination?.total || 0}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-secondary-900">
                    {filters.type ? `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}s` : 'Rentals'}
                    {filters.location && ` in ${filters.location}`}
                  </h1>
                  <p className="text-secondary-600">
                    {pagination?.total || 0} results found
                  </p>
                </div>

                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex border border-secondary-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:bg-secondary-50'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:bg-secondary-50'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-secondary-600">
                  Showing {listings.length} of {pagination?.total || 0} results
                </div>
              </div>
            </div>

            {/* Mobile Filters Overlay */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
                <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                  <div className="p-4 border-b border-secondary-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Filters</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <SearchFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onSearch={() => {
                        performSearch(1)
                        setShowFilters(false)
                      }}
                      resultCount={pagination?.total || 0}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" text="Searching rentals..." />
              </div>
            ) : listings.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-secondary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-secondary-600 mb-6">
                    Try adjusting your search criteria or filters to find more rentals.
                  </p>
                  <Button onClick={() => setFilters({})}>
                    Clear all filters
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onFavorite={handleFavorite}
                    onShare={handleShare}
                    isFavorite={favorites.has(listing.id)}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {pagination && pagination.currentPage < pagination.totalPages && (
              <div className="text-center mt-12">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More Results'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}