import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LandingPage } from '@/pages/LandingPage'
import { SearchPage } from '@/pages/SearchPage'
import { ListingDetailPage } from '@/pages/ListingDetailPage'
import { BookingPage } from '@/pages/BookingPage'
import { UserDashboard } from '@/pages/UserDashboard'
import { HostDashboard } from '@/pages/HostDashboard'
import { MessagesPage } from '@/pages/MessagesPage'
import { ReviewsPage } from '@/pages/ReviewsPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { GuestRoute } from '@/components/routes/GuestRoute'
import { HostRoute } from '@/components/routes/HostRoute'
import { ToastProvider } from '@/components/ui/use-toast'  


function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <GuestRoute>
                  <UserDashboard />
                </GuestRoute>
              }
            />
            <Route
              path="/host/dashboard"
              element={
                <HostRoute>
                  <HostDashboard />
                </HostRoute>
              }
            />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
