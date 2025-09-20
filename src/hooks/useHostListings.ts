// @/hooks/useHostListings.ts
import { useState, useEffect } from 'react'
import { api } from '@/services/api'

export interface HostListing {
  id: number
  title: string
  description?: string
  type: 'car' | 'home'
  price_per_day: number
  location: string
  status: 'active' | 'paused'
  created_at: string
  updated_at: string
  images: Array<{
    id: number
    image_path: string
    position: number
  }>
}

interface UseHostListingsReturn {
  listings: HostListing[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createListing: (formData: FormData) => Promise<void>
  updateListing: (id: string, formData: FormData) => Promise<void>
  deleteListing: (id: string) => Promise<void>
}

export const useHostListings = (filterStatus?: 'active' | 'paused'): UseHostListingsReturn => {
  const [listings, setListings] = useState<HostListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchListings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = filterStatus ? { status: filterStatus } : undefined
      const response = await api.listings.getHostListings(params)
      
      console.log('Fetched listings:', response)
      setListings(response.data || response || [])
    } catch (err: any) {
      console.error('Error fetching listings:', err)
      setError(err.message || 'Failed to fetch listings')
    } finally {
      setIsLoading(false)
    }
  }

  const createListing = async (formData: FormData) => {
    try {
      await api.listings.createListingWithFiles(formData)
      await fetchListings() // Refresh the list
    } catch (err: any) {
      console.error('Error creating listing:', err)
      throw err // Re-throw so the component can handle it
    }
  }

  const updateListing = async (id: string, formData: FormData) => {
    try {
      await api.listings.updateListingWithFiles(id, formData)
      await fetchListings() // Refresh the list
    } catch (err: any) {
      console.error('Error updating listing:', err)
      throw err
    }
  }

  const deleteListing = async (id: string) => {
    try {
      await api.listings.deleteListing(id)
      await fetchListings() // Refresh the list
    } catch (err: any) {
      console.error('Error deleting listing:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchListings()
  }, [filterStatus])

  return {
    listings,
    isLoading,
    error,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing
  }
}