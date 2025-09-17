import React, { useState } from 'react'
import { SearchFilters as SearchFiltersType } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  Filter, 
  X,
  Car,
  Home,
  Sparkles
} from 'lucide-react'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  onSearch: () => void
  resultCount: number
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  resultCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFiltersType]
    return value !== undefined && value !== null && value !== ''
  }).length

  const carFeatures = [
    'GPS Navigation', 'Bluetooth', 'Climate Control', 'Leather Seats',
    'Sunroof', 'Backup Camera', 'USB Charging', 'WiFi'
  ]

  const homeFeatures = [
    'WiFi', 'Kitchen', 'Washer/Dryer', 'Air Conditioning', 'Pool',
    'Garden', 'BBQ', 'Parking', 'Pet Friendly', 'Wheelchair Accessible'
  ]

  const transmissionTypes = [
    { value: 'automatic', label: 'Automatic' },
    { value: 'manual', label: 'Manual' }
  ]

  const fuelTypes = [
    { value: 'gasoline', label: 'Gasoline' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' }
  ]

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' }
  ]

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="default" size="sm">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <span>{isExpanded ? 'Hide' : 'Show'}</span>
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Search Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900">
            {resultCount.toLocaleString()} results found
          </h2>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-error-600 hover:text-error-700"
            >
              Clear all
              <X className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Type Filter */}
        <Card className="p-4">
          <h3 className="font-medium text-secondary-900 mb-3">Type</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={filters.type === 'car'}
                onChange={() => updateFilter('type', 'car')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <Car className="h-4 w-4 text-secondary-600" />
              <span className="text-sm text-secondary-700">Cars</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={filters.type === 'home'}
                onChange={() => updateFilter('type', 'home')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <Home className="h-4 w-4 text-secondary-600" />
              <span className="text-sm text-secondary-700">Homes</span>
            </label>
          </div>
        </Card>

        {/* Location Filter */}
        <Card className="p-4">
          <h3 className="font-medium text-secondary-900 mb-3">Location</h3>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <Input
              placeholder="Where are you going?"
              value={filters.location || ''}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Date Range Filter */}
        <Card className="p-4">
          <h3 className="font-medium text-secondary-900 mb-3">Dates</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-secondary-600 mb-1">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <Input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value
                  })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-secondary-600 mb-1">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <Input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value
                  })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Price Range Filter */}
        <Card className="p-4">
          <h3 className="font-medium text-secondary-900 mb-3">Price Range</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-secondary-600 mb-1">Min</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => updateFilter('priceRange', {
                      ...filters.priceRange,
                      min: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-secondary-600 mb-1">Max</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <Input
                    type="number"
                    placeholder="1000"
                    value={filters.priceRange?.max || ''}
                    onChange={(e) => updateFilter('priceRange', {
                      ...filters.priceRange,
                      max: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Rating Filter */}
        <Card className="p-4">
          <h3 className="font-medium text-secondary-900 mb-3">Rating</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => updateFilter('rating', rating)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-accent-400 fill-current" />
                  <span className="text-sm text-secondary-700">{rating}+ stars</span>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Car-specific Filters */}
        {filters.type === 'car' && (
          <>
            <Card className="p-4">
              <h3 className="font-medium text-secondary-900 mb-3">Transmission</h3>
              <div className="space-y-2">
                {transmissionTypes.map((type) => (
                  <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="transmission"
                      checked={filters.features?.transmission === type.value}
                      onChange={() => updateFilter('features', {
                        ...filters.features,
                        transmission: type.value
                      })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium text-secondary-900 mb-3">Fuel Type</h3>
              <div className="space-y-2">
                {fuelTypes.map((type) => (
                  <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="fuelType"
                      checked={filters.features?.fuelType === type.value}
                      onChange={() => updateFilter('features', {
                        ...filters.features,
                        fuelType: type.value
                      })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Home-specific Filters */}
        {filters.type === 'home' && (
          <>
            <Card className="p-4">
              <h3 className="font-medium text-secondary-900 mb-3">Property Type</h3>
              <div className="space-y-2">
                {propertyTypes.map((type) => (
                  <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="propertyType"
                      checked={filters.features?.propertyType === type.value}
                      onChange={() => updateFilter('features', {
                        ...filters.features,
                        propertyType: type.value
                      })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium text-secondary-900 mb-3">Bedrooms</h3>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, '6+'].map((beds) => (
                  <label key={beds} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bedrooms"
                      checked={filters.features?.bedrooms === (typeof beds === 'number' ? beds : 6)}
                      onChange={() => updateFilter('features', {
                        ...filters.features,
                        bedrooms: typeof beds === 'number' ? beds : 6
                      })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700">{beds}</span>
                  </label>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Amenities Filter */}
        <Card className="p-4">
          <h3 className="font-medium text-secondary-900 mb-3">Amenities</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(filters.type === 'car' ? carFeatures : homeFeatures).map((amenity) => (
              <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.amenities?.includes(amenity) || false}
                  onChange={(e) => {
                    const currentAmenities = filters.amenities || []
                    if (e.target.checked) {
                      updateFilter('amenities', [...currentAmenities, amenity])
                    } else {
                      updateFilter('amenities', currentAmenities.filter(a => a !== amenity))
                    }
                  }}
                  className="text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-sm text-secondary-700">{amenity}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Additional Filters */}
        <Card className="p-4">
          <h3 className="font-medium text-secondary-900 mb-3">More Filters</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.instantBook || false}
                onChange={(e) => updateFilter('instantBook', e.target.checked)}
                className="text-primary-600 focus:ring-primary-500 rounded"
              />
              <Sparkles className="h-4 w-4 text-secondary-600" />
              <span className="text-sm text-secondary-700">Instant Book</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified || false}
                onChange={(e) => updateFilter('verified', e.target.checked)}
                className="text-primary-600 focus:ring-primary-500 rounded"
              />
              <Star className="h-4 w-4 text-secondary-600" />
              <span className="text-sm text-secondary-700">Verified Only</span>
            </label>
          </div>
        </Card>

        {/* Search Button */}
        <Button onClick={onSearch} className="w-full" size="lg">
          Search Rentals
        </Button>
      </div>
    </div>
  )
}
