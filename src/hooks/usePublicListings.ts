// hooks/usePublicListings.ts
import { useState, useEffect } from 'react'

export interface PublicListing {
  id: number
  title: string
  description?: string
  type: 'car' | 'home'
  price_per_day: number
  location: string
  status: 'active' | 'paused'
  created_at: string
  updated_at: string
  user_id: number
  images?: Array<{
    id: number
    listing_id: number
    image_path: string
    created_at: string
    updated_at: string
  }>
  host?: {
    id: number
    name: string
    email: string
  }
}

interface UsePublicListingsOptions {
  type?: 'car' | 'home'
  search?: string
  location?: string
  price_min?: number
  price_max?: number
}

interface UsePublicListingsReturn {
  listings: PublicListing[]
  isLoading: boolean
  error: string | null
  refetch: (options?: UsePublicListingsOptions) => Promise<void>
}

export const usePublicListings = (initialOptions: UsePublicListingsOptions = {}): UsePublicListingsReturn => {
  const [state, setState] = useState<{
    listings: PublicListing[]
    isLoading: boolean
    error: string | null
  }>({
    listings: [],
    isLoading: true,
    error: null
  })

  const fetchListings = async (options: UsePublicListingsOptions = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      const searchParams = new URLSearchParams()
      
      // Add filters to search params
      if (options.type) searchParams.append('type', options.type)
      if (options.search) searchParams.append('search', options.search)
      if (options.location) searchParams.append('location', options.location)
      if (options.price_min) searchParams.append('price_min', options.price_min.toString())
      if (options.price_max) searchParams.append('price_max', options.price_max.toString())
      
      const url = `${apiUrl}/api/listings${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      console.log('🔍 Fetching listings from:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Don't include auth headers for public listings
        },
        // Remove credentials: 'include' for public endpoints
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Received data:', data)
      console.log('📊 Listings count:', Array.isArray(data) ? data.length : 'Not an array')
      
      setState({
        listings: Array.isArray(data) ? data : [],
        isLoading: false,
        error: null
      })
    } catch (err) {
      console.error('💥 Error fetching listings:', err)
      setState({
        listings: [],
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      })
    }
  }

  useEffect(() => {
    fetchListings(initialOptions)
  }, []) // Only run on mount

  return {
    ...state,
    refetch: fetchListings
  }
}