export interface User {
  id: number
  name: string
  email: string
  role: 'guest' | 'host' | 'admin'
  email_verified_at?: string | null
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data?: T
  user?: User
  token?: string
  message?: string
  errors?: Record<string, string[]>
  meta?: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterResponse {
  user: User
  token: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  per_page?: number
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  type: string
  category: string
  price: number
  currency: string
  location: {
    address: string
    city: string
    state: string
    country: string
    latitude?: number
    longitude?: number
  }
  amenities: string[]
  images: string[]
  availability: {
    start_date: string
    end_date: string
    available: boolean
  }[]
  rating: number
  reviews_count: number
  verified: boolean
  instant_book: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  listing_id: string
  user_id: string
  start_date: string
  end_date: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
  listing?: Listing
  user?: User
}

export interface Review {
  id: string
  booking_id: string
  listing_id: string
  user_id: string
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
  helpful_count: number
  reported: boolean
  created_at: string
  updated_at: string
  user?: User
  listing?: Listing
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file'
  file_url?: string
  read_at?: string
  created_at: string
  sender?: User
}

export interface Conversation {
  id: string
  participants: User[]
  listing_id?: string
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
  listing?: Listing
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  content: string
  data?: Record<string, any>
  read_at?: string
  created_at: string
}