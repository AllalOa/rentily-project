import { ApiResponse, PaginationParams } from '@/types'

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api'

class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('auth_token')

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = { message: await response.text() }
      }

      console.log('API Response:', { url, status: response.status, data })

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Error:', { url, error })
      throw error
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return this.request<T>(url.pathname + url.search)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // File upload
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed')
    }

    return data
  }
}

// Create API client instance
export const apiClient = new ApiClient()

// API Service Classes
export class AuthService {
  static async login(email: string, password: string) {
    console.log('AuthService.login called')
    return apiClient.post('/login', { email, password })
  }

  static async register(userData: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) {
    console.log('AuthService.register called with:', userData)
    try {
      const result = await apiClient.post('/register', userData)
      console.log('AuthService.register success:', result)
      return result
    } catch (error) {
      console.error('AuthService.register error:', error)
      throw error
    }
  }

  static async logout() {
    return apiClient.post('/logout')
  }

  static async refreshToken() {
    return apiClient.post('/refresh')
  }

  static async forgotPassword(email: string) {
    return apiClient.post('/forgot-password', { email })
  }

  static async resetPassword(token: string, email: string, password: string, password_confirmation: string) {
    return apiClient.post('/reset-password', {
      token,
      email,
      password,
      password_confirmation,
    })
  }

  static async verifyEmail(token: string) {
    return apiClient.post('/verify-email', { token })
  }

  static async resendVerification() {
    return apiClient.post('/verify-email/resend')
  }
}

export class UserService {
  static async getProfile() {
    return apiClient.get('/profile')
  }

  static async updateProfile(data: any) {
    return apiClient.put('/profile', data)
  }

  static async updatePassword(data: {
    current_password: string
    password: string
    password_confirmation: string
  }) {
    return apiClient.put('/password', data)
  }

  static async deleteAccount() {
    return apiClient.delete('/account')
  }

  static async getPreferences() {
    return apiClient.get('/preferences')
  }

  static async updatePreferences(data: any) {
    return apiClient.put('/preferences', data)
  }
}

export class ListingService {
  static async getListings(params?: {
    page?: number
    limit?: number
    type?: string
    category?: string
    location?: string
    price_min?: number
    price_max?: number
    date_start?: string
    date_end?: string
    amenities?: string[]
    rating?: number
    verified?: boolean
    instant_book?: boolean
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  }) {
    return apiClient.get('/listings', params)
  }

  static async getListing(id: string) {
    return apiClient.get(`/listings/${id}`)
  }

  static async createListing(data: any) {
    return apiClient.post('/listings', data)
  }

  static async updateListing(id: string, data: any) {
    return apiClient.put(`/listings/${id}`, data)
  }

  static async deleteListing(id: string) {
    return apiClient.delete(`/listings/${id}`)
  }

  static async getUserListings(userId?: string) {
    const endpoint = userId ? `/users/${userId}/listings` : '/user/listings'
    return apiClient.get(endpoint)
  }

  static async uploadListingImages(id: string, files: File[]) {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })
    return apiClient.uploadFile(`/listings/${id}/images`, files[0], { images: files })
  }

  static async deleteListingImage(id: string, imageId: string) {
    return apiClient.delete(`/listings/${id}/images/${imageId}`)
  }

  static async getListingAvailability(id: string, startDate?: string, endDate?: string) {
    return apiClient.get(`/listings/${id}/availability`, { start_date: startDate, end_date: endDate })
  }

  static async updateListingAvailability(id: string, data: any) {
    return apiClient.put(`/listings/${id}/availability`, data)
  }
}

export class BookingService {
  static async getBookings(params?: {
    page?: number
    limit?: number
    status?: string
    type?: 'guest' | 'host'
  }) {
    return apiClient.get('/bookings', params)
  }

  static async getBooking(id: string) {
    return apiClient.get(`/bookings/${id}`)
  }

  static async createBooking(data: {
    listing_id: string
    start_date: string
    end_date: string
    guests: number
    special_requests?: string
  }) {
    return apiClient.post('/bookings', data)
  }

  static async updateBooking(id: string, data: any) {
    return apiClient.put(`/bookings/${id}`, data)
  }

  static async cancelBooking(id: string, reason?: string) {
    return apiClient.post(`/bookings/${id}/cancel`, { reason })
  }

  static async confirmBooking(id: string) {
    return apiClient.post(`/bookings/${id}/confirm`)
  }

  static async declineBooking(id: string, reason?: string) {
    return apiClient.post(`/bookings/${id}/decline`, { reason })
  }

  static async getBookingCalendar(listingId: string, year: number, month: number) {
    return apiClient.get(`/listings/${listingId}/calendar`, { year, month })
  }
}

export class ReviewService {
  static async getReviews(params?: {
    page?: number
    limit?: number
    listing_id?: string
    user_id?: string
    rating?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  }) {
    return apiClient.get('/reviews', params)
  }

  static async getReview(id: string) {
    return apiClient.get(`/reviews/${id}`)
  }

  static async createReview(data: {
    booking_id: string
    listing_id: string
    rating: number
    comment: string
    categories: {
      cleanliness: number
      communication: number
      check_in: number
      accuracy: number
      location: number
      value: number
    }
  }) {
    return apiClient.post('/reviews', data)
  }

  static async updateReview(id: string, data: any) {
    return apiClient.put(`/reviews/${id}`, data)
  }

  static async deleteReview(id: string) {
    return apiClient.delete(`/reviews/${id}`)
  }

  static async reportReview(id: string, reason: string) {
    return apiClient.post(`/reviews/${id}/report`, { reason })
  }

  static async markReviewHelpful(id: string) {
    return apiClient.post(`/reviews/${id}/helpful`)
  }
}

export class MessageService {
  static async getConversations() {
    return apiClient.get('/conversations')
  }

  static async getConversation(id: string) {
    return apiClient.get(`/conversations/${id}`)
  }

  static async createConversation(data: {
    participant_id: string
    listing_id?: string
    initial_message?: string
  }) {
    return apiClient.post('/conversations', data)
  }

  static async getMessages(conversationId: string, params?: {
    page?: number
    limit?: number
  }) {
    return apiClient.get(`/conversations/${conversationId}/messages`, params)
  }

  static async sendMessage(conversationId: string, data: {
    content: string
    type?: 'text' | 'image' | 'file'
  }) {
    return apiClient.post(`/conversations/${conversationId}/messages`, data)
  }

  static async markMessagesAsRead(conversationId: string) {
    return apiClient.post(`/conversations/${conversationId}/read`)
  }

  static async uploadMessageFile(conversationId: string, file: File) {
    return apiClient.uploadFile(`/conversations/${conversationId}/messages/upload`, file)
  }
}

export class NotificationService {
  static async getNotifications(params?: {
    page?: number
    limit?: number
    unread_only?: boolean
  }) {
    return apiClient.get('/notifications', params)
  }

  static async markAsRead(id: string) {
    return apiClient.post(`/notifications/${id}/read`)
  }

  static async markAllAsRead() {
    return apiClient.post('/notifications/read-all')
  }

  static async deleteNotification(id: string) {
    return apiClient.delete(`/notifications/${id}`)
  }

  static async updateNotificationPreferences(data: any) {
    return apiClient.put('/notifications/preferences', data)
  }
}

export class SearchService {
  static async searchListings(query: string, filters?: any) {
    return apiClient.get('/search/listings', { q: query, ...filters })
  }

  static async getSearchSuggestions(query: string) {
    return apiClient.get('/search/suggestions', { q: query })
  }

  static async getPopularSearches() {
    return apiClient.get('/search/popular')
  }
}

export class AnalyticsService {
  static async getDashboardStats() {
    return apiClient.get('/analytics/dashboard')
  }

  static async getListingAnalytics(listingId: string, period?: string) {
    return apiClient.get(`/analytics/listings/${listingId}`, { period })
  }

  static async getRevenueAnalytics(period?: string) {
    return apiClient.get('/analytics/revenue', { period })
  }

  static async getBookingAnalytics(period?: string) {
    return apiClient.get('/analytics/bookings', { period })
  }
}

// Export all services
export const api = {
  auth: AuthService,
  user: UserService,
  listings: ListingService,
  bookings: BookingService,
  reviews: ReviewService,
  messages: MessageService,
  notifications: NotificationService,
  search: SearchService,
  analytics: AnalyticsService,
}