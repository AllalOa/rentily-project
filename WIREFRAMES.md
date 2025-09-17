# Rentily Marketplace - UI/UX Wireframes

## Overview
This document outlines the wireframes and user flow for the Rentily rental marketplace frontend. The design follows a mobile-first approach with responsive layouts and accessibility compliance.

## Design Principles

### 1. Mobile-First Design
- All interfaces designed for mobile screens first
- Progressive enhancement for larger screens
- Touch-friendly interactions (44px minimum touch targets)
- Thumb-friendly navigation

### 2. Accessibility (WCAG 2.2 AA)
- High contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Semantic HTML structure

### 3. Modern UI/UX
- Clean, minimalist design
- Consistent spacing and typography
- Intuitive navigation patterns
- Clear visual hierarchy
- Micro-interactions for feedback

## Screen Wireframes

### 1. Landing Page

#### Mobile Layout
```
┌─────────────────────────┐
│ [Logo] Rentily    [☰]  │ ← Header
├─────────────────────────┤
│                         │
│    Hero Section         │
│  ┌─────────────────┐    │
│  │  Find Your      │    │
│  │  Perfect Rental │    │
│  │  Experience     │    │
│  │                 │    │
│  │ [Search Bar]    │    │
│  │ [Check-in] [Check-out]│
│  │ [Search Button] │    │
│  └─────────────────┘    │
│                         │
│  Quick Stats:           │
│  10M+ Customers         │
│  1M+ Listings           │
│  190+ Countries         │
│  4.9 Rating             │
└─────────────────────────┘
```

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Rentily  [Cars] [Homes] [Exp] [Search] [User]   │ ← Header
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Hero Section (Split Layout)                            │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │  Find Your Perfect  │  │                         │  │
│  │  Rental Experience  │  │    Hero Image           │  │
│  │                     │  │                         │  │
│  │  Search Form:       │  │    [Overlay Stats]      │  │
│  │  [What] [When] [Where]│  │                         │  │
│  │  [Search Button]    │  │                         │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  Categories: [Cars] [Homes] [Experiences]               │
│  Featured Listings Grid                                 │
│  Features: [Secure] [Support] [Easy Booking]           │
│  Testimonials                                           │
│  CTA Section                                            │
└─────────────────────────────────────────────────────────┘
```

### 2. Search Page

#### Mobile Layout
```
┌─────────────────────────┐
│ [←] Search Rentals [☰]  │ ← Header
├─────────────────────────┤
│ [Filters] [Sort] [View] │ ← Controls
├─────────────────────────┤
│                         │
│  Search Results         │
│  ┌─────────────────┐    │
│  │ [Image]         │    │
│  │ Tesla Model S   │    │
│  │ ★ 4.9 (12)     │    │
│  │ $150/day        │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ [Image]         │    │
│  │ Downtown Apt    │    │
│  │ ★ 4.8 (28)     │    │
│  │ $200/day        │    │
│  └─────────────────┘    │
│                         │
│  [Load More]            │
└─────────────────────────┘
```

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Rentily  [Cars] [Homes] [Exp] [Search] [User]   │ ← Header
├─────────────────────────────────────────────────────────┤
│ Filters │ Search Results                               │
│ ┌─────┐ │ ┌─────────────────────────────────────────┐  │
│ │Type │ │ │ 45 results found                        │  │
│ │[Car]│ │ │ [Grid] [List] [Sort ▼]                 │  │
│ │[Home]│ │ │                                       │  │
│ │     │ │ │ ┌─────────────────┐ ┌─────────────────┐ │  │
│ │Location│ │ │ [Image]        │ │ [Image]        │ │  │
│ │[Where]│ │ │ Tesla Model S  │ │ Downtown Apt   │ │  │
│ │     │ │ │ ★ 4.9 (12)      │ │ ★ 4.8 (28)     │ │  │
│ │Dates │ │ │ $150/day        │ │ $200/day        │ │  │
│ │[Start]│ │ └─────────────────┘ └─────────────────┘ │  │
│ │[End] │ │                                       │  │
│ │     │ │ │ [Load More Results]                  │  │
│ │Price │ │ │                                     │  │
│ │[Min] │ │ │                                     │  │
│ │[Max] │ │ │                                     │  │
│ │     │ │ │                                     │  │
│ │Rating│ │ │                                     │  │
│ │[5★] │ │ │                                     │  │
│ │[4★] │ │ │                                     │  │
│ │     │ │ │                                     │  │
│ │[Search]│ │                                     │  │
│ └─────┘ │ └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3. Listing Detail Page

#### Mobile Layout
```
┌─────────────────────────┐
│ [←] [♥] [Share] [☰]    │ ← Header
├─────────────────────────┤
│                         │
│  Image Gallery          │
│  ┌─────────────────┐    │
│  │ [Main Image]    │    │
│  │ [◀] [▶] [1/5]   │    │
│  └─────────────────┘    │
│  [Thumbnails]           │
│                         │
│  Tesla Model S          │
│  ★ 4.9 (12 reviews)     │
│  San Francisco, CA      │
│  $150/day               │
│                         │
│  [Overview] [Amenities] │ ← Tabs
│  [Reviews] [Location]   │
│                         │
│  About this car:        │
│  Experience the future...│
│                         │
│  Features:              │
│  • 2023 Tesla Model S   │
│  • 5 seats              │
│  • Automatic            │
│  • Electric             │
│                         │
│  ┌─────────────────┐    │
│  │ Booking Card    │    │
│  │ $150/day        │    │
│  │ [Check-in]      │    │
│  │ [Check-out]     │    │
│  │ [Guests]        │    │
│  │ [Book Now]      │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Rentily  [Cars] [Homes] [Exp] [Search] [User]   │ ← Header
├─────────────────────────────────────────────────────────┤
│ Main Content │ Booking Sidebar                         │
│ ┌───────────┐ │ ┌─────────────────────────────────────┐ │
│ │Image      │ │ │ Tesla Model S                      │ │
│ │Gallery    │ │ │ ★ 4.9 (12 reviews)                │ │
│ │[◀][▶][1/5]│ │ │ $150/day                          │ │
│ │           │ │ │                                   │ │
│ │[Thumbs]   │ │ │ [Check-in] [Check-out]            │ │
│ │           │ │ │ [Guests ▼]                        │ │
│ │           │ │ │                                   │ │
│ │Tesla Model S│ │ │ [Book Now]                       │ │
│ │★ 4.9 (12) │ │ │ [Message Host]                    │ │
│ │San Fran, CA│ │ │                                   │ │
│ │           │ │ │ Price Breakdown:                  │ │
│ │[Overview] │ │ │ $150 × 2 days = $300              │ │
│ │[Amenities]│ │ │ Service fee = $30                 │ │
│ │[Reviews]  │ │ │ Tax = $26.40                      │ │
│ │[Location] │ │ │ Total = $356.40                   │ │
│ │           │ │ │                                   │ │
│ │About this car:│ │ │ [Security badges]              │ │
│ │Experience... │ │ │                                 │ │
│ │           │ │ │                                   │ │
│ │Features:  │ │ │                                   │ │
│ │• 2023 Tesla│ │ │                                   │ │
│ │• 5 seats  │ │ │                                   │ │
│ │• Automatic│ │ │                                   │ │
│ │• Electric │ │ │                                   │ │
│ └───────────┘ │ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4. Booking Flow

#### Step 1: Dates Selection
```
┌─────────────────────────┐
│ [←] Complete Booking    │ ← Header
├─────────────────────────┤
│ ● Dates ○ Guests ○ Pay  │ ← Progress
├─────────────────────────┤
│                         │
│  Select your dates      │
│  ┌─────────────────┐    │
│  │   January 2024  │    │
│  │ S M T W T F S   │    │
│  │ 1 2 3 4 5 6 7   │    │
│  │ 8 9 10[11][12]13│    │ ← Selected
│  │ 14 15 16 17 18 19│    │
│  │ 20 21 22 23 24 25│    │
│  └─────────────────┘    │
│                         │
│  Selected: Jan 11-12    │
│  [Continue]             │
└─────────────────────────┘
```

#### Step 2: Guest Selection
```
┌─────────────────────────┐
│ [←] Complete Booking    │ ← Header
├─────────────────────────┤
│ ● Dates ● Guests ○ Pay  │ ← Progress
├─────────────────────────┤
│                         │
│  Number of guests       │
│  ┌─────────────────┐    │
│  │ [Guests ▼]      │    │
│  │ 2 guests        │    │
│  └─────────────────┘    │
│                         │
│  Special requests       │
│  ┌─────────────────┐    │
│  │ [Text area]     │    │
│  │ Any special...  │    │
│  └─────────────────┘    │
│                         │
│  [Continue]             │
└─────────────────────────┘
```

#### Step 3: Payment
```
┌─────────────────────────┐
│ [←] Complete Booking    │ ← Header
├─────────────────────────┤
│ ● Dates ● Guests ● Pay  │ ← Progress
├─────────────────────────┤
│                         │
│  Payment Information    │
│  ┌─────────────────┐    │
│  │ Card Number     │    │
│  │ [1234 5678...]  │    │
│  │                 │    │
│  │ Expiry  CVV     │    │
│  │ [MM/YY] [123]   │    │
│  │                 │    │
│  │ Name on Card    │    │
│  │ [John Doe]      │    │
│  │                 │    │
│  │ Email           │    │
│  │ [john@...]      │    │
│  └─────────────────┘    │
│                         │
│  [Complete Booking]     │
└─────────────────────────┘
```

### 5. User Dashboard

#### Mobile Layout
```
┌─────────────────────────┐
│ [☰] My Dashboard        │ ← Header
├─────────────────────────┤
│                         │
│  Quick Stats            │
│  ┌─────┐ ┌─────┐        │
│  │  3  │ │ 12  │        │
│  │Upcom│ │Past │        │
│  └─────┘ └─────┘        │
│  ┌─────┐ ┌─────┐        │
│  │  5  │ │ 4.8 │        │
│  │Favs │ │Rate │        │
│  └─────┘ └─────┘        │
│                         │
│  [Upcoming] [Past]      │ ← Tabs
│  [Favorites] [Reviews]  │
│                         │
│  Upcoming Bookings      │
│  ┌─────────────────┐    │
│  │ [Image]         │    │
│  │ Tesla Model S   │    │
│  │ Jan 15-17       │    │
│  │ $300            │    │
│  │ [Message] [View]│    │
│  └─────────────────┘    │
└─────────────────────────┘
```

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Rentily  [Cars] [Homes] [Exp] [Search] [User]   │ ← Header
├─────────────────────────────────────────────────────────┤
│                                                         │
│  My Dashboard                                           │
│                                                         │
│  Stats: [3 Upcoming] [12 Past] [5 Favorites] [4.8 Rate]│
│                                                         │
│  [Upcoming] [Past] [Favorites] [Reviews]               │ ← Tabs
│                                                         │
│  Upcoming Bookings                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Image] Tesla Model S        ★ 4.9 (12) $300   │   │
│  │        San Francisco, CA     Jan 15-17         │   │
│  │        [Message Host] [View Details]           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Image] Downtown Apt         ★ 4.8 (28) $400   │   │
│  │        New York, NY          Jan 20-22         │   │
│  │        [Message Host] [View Details]           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 6. Host Dashboard

#### Mobile Layout
```
┌─────────────────────────┐
│ [☰] Host Dashboard      │ ← Header
├─────────────────────────┤
│                         │
│  Revenue Stats          │
│  ┌─────────────────┐    │
│  │ $12,500         │    │
│  │ This Month      │    │
│  └─────────────────┘    │
│                         │
│  Quick Stats            │
│  ┌─────┐ ┌─────┐        │
│  │ 45  │ │ 4.8 │        │
│  │Book │ │Rate │        │
│  └─────┘ └─────┘        │
│  ┌─────┐ ┌─────┐        │
│  │ 3   │ │ 78% │        │
│  │Pend │ │Occu │        │
│  └─────┘ └─────┘        │
│                         │
│  [Overview] [Listings]  │ ← Tabs
│  [Bookings] [Analytics] │
│                         │
│  My Listings            │
│  ┌─────────────────┐    │
│  │ [Image]         │    │
│  │ Tesla Model S   │    │
│  │ $150/day        │    │
│  │ [View] [Edit]   │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

### 7. Messages Page

#### Mobile Layout
```
┌─────────────────────────┐
│ [☰] Messages            │ ← Header
├─────────────────────────┤
│                         │
│  Conversations          │
│  ┌─────────────────┐    │
│  │ [Avatar] John   │    │
│  │ Tesla Model S   │    │
│  │ Thanks for...   │    │
│  │ 2m ago          │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ [Avatar] Sarah  │    │
│  │ Downtown Apt    │    │
│  │ Perfect! See... │    │
│  │ 1h ago          │    │
│  └─────────────────┘    │
│                         │
│  Chat Area (when selected)│
│  ┌─────────────────┐    │
│  │ John Smith      │    │
│  │ Tesla Model S   │    │
│  ├─────────────────┤    │
│  │ [You] Hi!       │    │
│  │ [John] Hello!   │    │
│  │ [You] Thanks    │    │
│  ├─────────────────┤    │
│  │ [Type message]  │    │
│  │ [Send]          │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Rentily  [Cars] [Homes] [Exp] [Search] [User]   │ ← Header
├─────────────────────────────────────────────────────────┤
│ Conversations │ Chat Area                              │
│ ┌───────────┐ │ ┌─────────────────────────────────────┐ │
│ │[Search]   │ │ │ John Smith - Tesla Model S         │ │
│ │           │ │ │ [Phone] [Video] [Info] [More]      │ │
│ │[Avatar]John│ │ ├─────────────────────────────────────┤ │
│ │Tesla Model│ │ │ [You] Hi! I'm interested in...     │ │
│ │Thanks for...│ │ │ [John] Hello! Great choice!      │ │
│ │2m ago     │ │ │ [You] What's the pickup time?     │ │
│ │           │ │ │ [John] Anytime after 2pm          │ │
│ │[Avatar]Sarah│ │ │ [You] Perfect, thanks!           │ │
│ │Downtown Apt│ │ ├─────────────────────────────────────┤ │
│ │Perfect! See...│ │ │ [Type message...] [Send]        │ │
│ │1h ago     │ │ │                                     │ │
│ └───────────┘ │ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 8. Reviews Page

#### Mobile Layout
```
┌─────────────────────────┐
│ [☰] Reviews & Ratings   │ ← Header
├─────────────────────────┤
│                         │
│  Overall Rating         │
│  ┌─────────────────┐    │
│  │      4.8        │    │
│  │ ★★★★★          │    │
│  │ Based on 24 reviews│ │
│  └─────────────────┘    │
│                         │
│  [Search] [Filter]      │
│                         │
│  Reviews                │
│  ┌─────────────────┐    │
│  │ [Avatar] John   │    │
│  │ ★★★★★ 2 days ago│    │
│  │ Amazing car!... │    │
│  │ [Helpful] [Report]│  │
│  └─────────────────┘    │
│                         │
│  [Write Review]         │
└─────────────────────────┘
```

## Component States

### Loading States
- Skeleton loaders for content
- Spinner for actions
- Progressive loading for images
- Shimmer effects for cards

### Empty States
- No results found
- No favorites yet
- No messages
- No bookings
- No reviews

### Error States
- Network errors
- Validation errors
- 404 pages
- Server errors
- Timeout errors

### Success States
- Booking confirmed
- Message sent
- Review submitted
- Profile updated
- Settings saved

## Responsive Breakpoints

### Mobile (320px - 767px)
- Single column layout
- Stacked navigation
- Touch-optimized controls
- Swipe gestures
- Bottom navigation (optional)

### Tablet (768px - 1023px)
- Two-column layout
- Sidebar navigation
- Larger touch targets
- Grid layouts

### Desktop (1024px+)
- Multi-column layout
- Full navigation
- Hover states
- Keyboard shortcuts
- Advanced interactions

## Accessibility Features

### Visual
- High contrast mode
- Large text options
- Color-blind friendly palette
- Clear focus indicators

### Navigation
- Skip links
- Tab order
- Keyboard shortcuts
- Breadcrumbs

### Content
- Alt text for images
- ARIA labels
- Screen reader support
- Semantic HTML

## Animation Guidelines

### Micro-interactions
- Button hover states (200ms)
- Card hover effects (300ms)
- Loading spinners (continuous)
- Toast notifications (300ms slide)

### Page Transitions
- Route changes (300ms fade)
- Modal open/close (200ms scale)
- Tab switching (150ms slide)
- Accordion expand/collapse (200ms)

### Performance
- 60fps animations
- GPU acceleration
- Reduced motion support
- Optimized assets

---

This wireframe document serves as a comprehensive guide for implementing the Rentily marketplace frontend with consistent, accessible, and user-friendly interfaces across all devices and screen sizes.
