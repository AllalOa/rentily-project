# Rentily - Rental Marketplace Frontend

A comprehensive React-based frontend for a rental marketplace platform supporting cars and homes. Built with modern UI/UX principles, accessibility compliance, and Laravel 12 API integration readiness.

## 🚀 Features

### Core Functionality
- **Multi-category Rentals**: Cars, homes, and experiences
- **Advanced Search & Filtering**: Location, price, dates, amenities, ratings
- **Detailed Listings**: Image galleries, amenities, host profiles, reviews
- **Booking System**: Calendar integration, pricing, payment flow
- **User Dashboards**: Separate views for guests and hosts
- **Messaging System**: Real-time communication between users
- **Review System**: Comprehensive rating and review functionality
- **Responsive Design**: Mobile-first approach with desktop optimization

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system
- **Component Library**: Reusable, accessible UI components
- **State Management**: Context API for authentication and global state
- **API Integration**: Structured for Laravel 12 backend integration
- **Accessibility**: WCAG 2.2 AA compliance
- **Error Handling**: Comprehensive error boundaries and states
- **Loading States**: Skeleton loaders and progress indicators

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Date-fns** for date manipulation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   ├── layout/         # Layout components (Header, Footer, Layout)
│   ├── search/         # Search-specific components
│   ├── listing/        # Listing-specific components
│   └── booking/        # Booking-specific components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
├── data/               # Mock data and constants
├── lib/                # Utility functions
└── assets/             # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions and branding
- **Secondary**: Gray tones for text and backgrounds
- **Accent**: Yellow/amber for highlights and ratings
- **Success**: Green for positive states
- **Warning**: Orange for caution states
- **Error**: Red for error states

### Typography
- **Display Font**: Poppins for headings
- **Body Font**: Inter for body text
- **Responsive**: Scales appropriately across devices

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Flexible container components
- **Forms**: Accessible input components with validation
- **Modals**: Overlay components with proper focus management
- **Loading States**: Skeleton loaders and spinners
- **Empty States**: Helpful messaging for empty data

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rentily-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

## 🌐 API Integration

The application is structured for easy integration with Laravel 12 backend:

### API Service Structure
- **Base API Client**: Handles authentication, error handling, and requests
- **Service Classes**: Organized by feature (Auth, Listings, Bookings, etc.)
- **Type Safety**: Full TypeScript integration with API responses
- **Error Handling**: Comprehensive error management

### Environment Configuration
Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME=Rentily
REACT_APP_APP_ENV=local
```

### Backend Requirements
The frontend expects a Laravel 12 API with the following endpoints:

#### Authentication
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/logout`
- `GET /api/v1/user/profile`

#### Listings
- `GET /api/v1/listings` (with search/filter parameters)
- `GET /api/v1/listings/{id}`
- `POST /api/v1/listings`
- `PUT /api/v1/listings/{id}`
- `DELETE /api/v1/listings/{id}`

#### Bookings
- `GET /api/v1/bookings`
- `POST /api/v1/bookings`
- `PUT /api/v1/bookings/{id}`
- `POST /api/v1/bookings/{id}/confirm`
- `POST /api/v1/bookings/{id}/cancel`

#### Reviews
- `GET /api/v1/reviews`
- `POST /api/v1/reviews`
- `PUT /api/v1/reviews/{id}`

#### Messages
- `GET /api/v1/conversations`
- `POST /api/v1/conversations`
- `GET /api/v1/conversations/{id}/messages`
- `POST /api/v1/conversations/{id}/messages`

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- All components designed for mobile first
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized performance

## ♿ Accessibility

### WCAG 2.2 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: Meets contrast ratio requirements
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper heading structure and landmarks

### Accessibility Features
- Skip links for navigation
- Alt text for all images
- Form labels and error messages
- ARIA live regions for dynamic content
- High contrast mode support

## 🧪 Testing

### Component Testing
```bash
npm run test
# or
yarn test
```

### E2E Testing
```bash
npm run test:e2e
# or
yarn test:e2e
```

## 📦 Deployment

### Build Optimization
- Code splitting for better performance
- Image optimization
- Bundle size analysis
- Tree shaking for unused code

### Environment Variables
Configure production environment variables:
```env
REACT_APP_API_URL=https://api.rentily.com/api
REACT_APP_APP_ENV=production
```

## 🔄 State Management

### Context API
- **AuthContext**: User authentication and profile
- **ThemeContext**: Dark/light mode (future enhancement)
- **NotificationContext**: Global notifications

### Local State
- React hooks for component state
- Custom hooks for API calls
- Form state management with React Hook Form

## 🎯 Performance

### Optimization Strategies
- Lazy loading for routes and components
- Image lazy loading and optimization
- Memoization for expensive calculations
- Virtual scrolling for large lists
- Bundle splitting and code splitting

### Performance Metrics
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

## 🚀 Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket integration
- **Advanced Search**: AI-powered recommendations
- **Mobile App**: React Native version
- **PWA Support**: Offline functionality
- **Internationalization**: Multi-language support
- **Dark Mode**: Theme switching
- **Advanced Analytics**: User behavior tracking

### Technical Improvements
- **Micro-frontends**: Modular architecture
- **GraphQL**: More efficient data fetching
- **Service Workers**: Offline capabilities
- **WebAssembly**: Performance-critical operations

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use Prettier for code formatting
3. Write meaningful commit messages
4. Add tests for new features
5. Update documentation

### Code Style
- ESLint configuration included
- Prettier for consistent formatting
- Husky for pre-commit hooks
- Conventional commits

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for the rental marketplace community**