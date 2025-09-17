import { User, Listing, Booking, Review, Message, Conversation, Notification, DashboardStats } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1-555-0123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    joinedAt: '2023-01-15',
    rating: 4.8,
    reviewCount: 24,
    isHost: true,
    preferences: {
      notifications: { email: true, sms: false, push: true },
      privacy: { showProfile: true, showBookings: false },
      currency: 'USD',
      language: 'en'
    }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1-555-0124',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    joinedAt: '2023-03-20',
    rating: 4.9,
    reviewCount: 18,
    isHost: true,
    preferences: {
      notifications: { email: true, sms: true, push: true },
      privacy: { showProfile: true, showBookings: true },
      currency: 'USD',
      language: 'en'
    }
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    phone: '+1-555-0125',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isVerified: false,
    joinedAt: '2023-06-10',
    rating: 4.6,
    reviewCount: 8,
    isHost: false,
    preferences: {
      notifications: { email: true, sms: false, push: false },
      privacy: { showProfile: false, showBookings: false },
      currency: 'USD',
      language: 'en'
    }
  }
]

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Luxury Tesla Model S - Premium Experience',
    description: 'Experience the future of driving with our pristine Tesla Model S. Perfect for business trips, special occasions, or simply enjoying the luxury of electric driving.',
    type: 'car',
    category: 'Luxury',
    price: 150,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop'
    ],
    location: {
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94102',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    host: mockUsers[0],
    amenities: ['GPS Navigation', 'Bluetooth', 'Climate Control', 'Leather Seats'],
    features: {
      make: 'Tesla',
      model: 'Model S',
      year: 2023,
      transmission: 'automatic',
      fuelType: 'electric',
      seats: 5,
      doors: 4,
      mileage: 15000,
      color: 'Pearl White'
    },
    availability: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      blockedDates: ['2024-02-14', '2024-02-15'],
      minimumStay: 1,
      maximumStay: 30,
      advanceNotice: 2
    },
    rating: 4.9,
    reviewCount: 12,
    isAvailable: true,
    isVerified: true,
    createdAt: '2023-12-01',
    updatedAt: '2023-12-15'
  },
  {
    id: '2',
    title: 'Modern Downtown Apartment with City Views',
    description: 'Stunning 2-bedroom apartment in the heart of downtown with panoramic city views. Fully furnished with modern amenities and walking distance to restaurants and attractions.',
    type: 'home',
    category: 'Apartment',
    price: 200,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
    ],
    location: {
      address: '456 Downtown Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001',
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    host: mockUsers[1],
    amenities: ['WiFi', 'Kitchen', 'Washer/Dryer', 'Air Conditioning', 'Balcony', 'Gym'],
    features: {
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      propertyType: 'apartment',
      parking: true,
      petFriendly: false,
      smokingAllowed: false,
      wheelchairAccessible: true
    },
    availability: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      blockedDates: ['2024-03-15', '2024-03-16', '2024-03-17'],
      minimumStay: 2,
      maximumStay: 90,
      advanceNotice: 24
    },
    rating: 4.8,
    reviewCount: 28,
    isAvailable: true,
    isVerified: true,
    createdAt: '2023-11-15',
    updatedAt: '2023-12-10'
  },
  {
    id: '3',
    title: 'Cozy Family Home Near Beach',
    description: 'Perfect family getaway! This charming 3-bedroom home is just 2 blocks from the beach with a private backyard and all the comforts of home.',
    type: 'home',
    category: 'House',
    price: 180,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
    ],
    location: {
      address: '789 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      zipCode: '33139',
      coordinates: { lat: 25.7907, lng: -80.1300 }
    },
    host: mockUsers[1],
    amenities: ['WiFi', 'Kitchen', 'Pool', 'Garden', 'BBQ', 'Parking'],
    features: {
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      propertyType: 'house',
      parking: true,
      petFriendly: true,
      smokingAllowed: false,
      wheelchairAccessible: false
    },
    availability: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      blockedDates: [],
      minimumStay: 3,
      maximumStay: 60,
      advanceNotice: 48
    },
    rating: 4.7,
    reviewCount: 15,
    isAvailable: true,
    isVerified: true,
    createdAt: '2023-10-20',
    updatedAt: '2023-12-05'
  }
]

export const mockBookings: Booking[] = [
  {
    id: '1',
    listingId: '1',
    listing: mockListings[0],
    guestId: '3',
    guest: mockUsers[2],
    hostId: '1',
    host: mockUsers[0],
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    totalDays: 2,
    totalPrice: 300,
    currency: 'USD',
    status: 'confirmed',
    paymentStatus: 'paid',
    specialRequests: 'Please ensure the car is fully charged',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    checkInInstructions: 'Car will be parked in the designated spot. Key will be in the lockbox.',
    cancellationPolicy: {
      type: 'moderate',
      description: 'Free cancellation up to 24 hours before check-in',
      refundPercentage: 100,
      deadlineHours: 24
    }
  }
]

export const mockReviews: Review[] = [
  {
    id: '1',
    bookingId: '1',
    listingId: '1',
    reviewerId: '3',
    reviewer: mockUsers[2],
    revieweeId: '1',
    reviewee: mockUsers[0],
    rating: 5,
    comment: 'Amazing experience! The Tesla was in perfect condition and John was very responsive. Highly recommend!',
    categories: {
      cleanliness: 5,
      communication: 5,
      checkIn: 5,
      accuracy: 5,
      location: 4,
      value: 5
    },
    isVerified: true,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18'
  }
]

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [mockUsers[0], mockUsers[2]],
    listingId: '1',
    listing: mockListings[0],
    lastMessage: {
      id: '1',
      conversationId: '1',
      senderId: '3',
      sender: mockUsers[2],
      content: 'Thanks for the great experience!',
      type: 'text',
      isRead: true,
      createdAt: '2024-01-18T10:30:00Z'
    },
    unreadCount: 0,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T10:30:00Z'
  }
]

export const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    senderId: '3',
    sender: mockUsers[2],
    content: 'Hi! I\'m interested in renting your Tesla for this weekend.',
    type: 'text',
    isRead: true,
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '2',
    conversationId: '1',
    senderId: '1',
    sender: mockUsers[0],
    content: 'Hello! Yes, it\'s available. When would you like to pick it up?',
    type: 'text',
    isRead: true,
    createdAt: '2024-01-10T09:15:00Z'
  },
  {
    id: '3',
    conversationId: '1',
    senderId: '3',
    sender: mockUsers[2],
    content: 'Thanks for the great experience!',
    type: 'text',
    isRead: true,
    createdAt: '2024-01-18T10:30:00Z'
  }
]

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'booking_request',
    title: 'New Booking Request',
    message: 'Mike Chen wants to book your Tesla Model S',
    data: { bookingId: '1' },
    isRead: false,
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'review_received',
    title: 'New Review',
    message: 'Mike Chen left a 5-star review for your Tesla Model S',
    data: { reviewId: '1' },
    isRead: true,
    createdAt: '2024-01-18T10:30:00Z'
  }
]

export const mockDashboardStats: DashboardStats = {
  totalBookings: 45,
  totalRevenue: 12500,
  averageRating: 4.8,
  responseRate: 95,
  occupancyRate: 78,
  upcomingBookings: 3,
  pendingRequests: 1,
  monthlyRevenue: [
    { month: 'Jan', revenue: 2500, bookings: 8 },
    { month: 'Feb', revenue: 3200, bookings: 12 },
    { month: 'Mar', revenue: 2800, bookings: 10 },
    { month: 'Apr', revenue: 4000, bookings: 15 }
  ]
}
