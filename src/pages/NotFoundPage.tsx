import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Search, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-error-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-secondary-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-secondary-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full"
            leftIcon={<Home className="h-4 w-4" />}
          >
            Go Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/search')}
            className="w-full"
            leftIcon={<Search className="h-4 w-4" />}
          >
            Search Rentals
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-secondary-200">
          <p className="text-sm text-secondary-500">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </Card>
    </div>
  )
}
