import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Car, 
  Home, 
  Star, 
  Shield, 
  Users, 
  CheckCircle,
  ArrowRight,
  Play,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { mockListings } from '@/data/mockData'

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Trusted',
      description: 'All hosts and guests are verified. Your safety is our priority.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: '24/7 Support',
      description: 'Our support team is always here to help you with any questions.'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Easy Booking',
      description: 'Book in just a few clicks with our streamlined process.'
    }
  ]

  const stats = [
    { number: '10M+', label: 'Happy Customers' },
    { number: '1M+', label: 'Listings Worldwide' },
    { number: '190+', label: 'Countries' },
    { number: '4.9', label: 'Average Rating' }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, NY',
      rating: 5,
      text: 'Rentily made finding the perfect car for my vacation so easy. The booking process was smooth and the car was exactly as described.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Mike Chen',
      location: 'San Francisco, CA',
      rating: 5,
      text: 'I\'ve been hosting my apartment on Rentily for 2 years now. The platform is user-friendly and the support team is amazing.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Emily Davis',
      location: 'Miami, FL',
      rating: 5,
      text: 'The home I rented through Rentily was perfect for our family vacation. Clean, comfortable, and great location.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ]
const RotatingImages = () => {
  const images = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&h=800&fit=crop", // villa
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&h=800&fit=crop", // pool villa
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1000&h=800&fit=crop", // BMW
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&h=800&fit=crop", // Mercedes
    
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-[550px] sm:h-[650px] lg:h-[750px] flex items-center justify-center">
      {images.map((img, i) => {
        const rotation = -10 + i * 5;
        const offset = i * 20; // distance between stacked images
        const isActive = i === activeIndex;

        return (
          <img
            key={i}
            src={img}
            alt={`stacked-${i}`}
            className={`absolute rounded-2xl shadow-2xl object-cover transition-all duration-700 ease-in-out
              ${isActive ? "scale-105 z-30 opacity-100" : "scale-95 z-10 opacity-90"}`}
            style={{
              width: "80%",
              height: "80%",
              transform: `rotate(${rotation}deg) translateY(-${offset / 3}px) translateX(${offset / 2}px)`,
              filter: isActive ? "brightness(1)" : "brightness(0.9)",
            }}
          />
        );
      })}
    </div>
  );
};


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Find Your Perfect
                  <span className="block text-accent-400">Rental Experience</span>
                </h1>
                <p className="text-xl text-primary-100 max-w-lg">
                  Discover and book unique cars, homes, and experiences from hosts around the world. 
                  Your next adventure starts here.
                </p>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      What are you looking for?
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <Input
                        placeholder="Search destinations, cars, homes..."
                        className="pl-10 bg-secondary-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Check-in
                    </label>
                    <Input
                      type="date"
                      className="bg-secondary-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Check-out
                    </label>
                    <Input
                      type="date"
                      className="bg-secondary-50"
                    />
                  </div>
                </div>
                <Button size="lg" className="w-full mt-4">
                  Search Rentals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-accent-400">
                      {stat.number}
                    </div>
                    <div className="text-sm text-primary-200">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
           <div className="relative z-10">
  <RotatingImages />
</div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/70" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Whether you need a car for a road trip or a home for your vacation, 
              we have everything you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link to="/search?type=car" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="relative h-64">
                  <img
                    src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop"
                    alt="Cars"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <Car className="h-8 w-8 mb-2" />
                    <h3 className="text-2xl font-bold">Cars</h3>
                    <p className="text-white/90">From economy to luxury</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/search?type=home" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="relative h-64">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
                    alt="Homes"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <Home className="h-8 w-8 mb-2" />
                    <h3 className="text-2xl font-bold">Homes</h3>
                    <p className="text-white/90">Apartments, houses & more</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/search?type=experience" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="relative h-64">
                  <img
                    src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop"
                    alt="Experiences"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <Star className="h-8 w-8 mb-2" />
                    <h3 className="text-2xl font-bold">Experiences</h3>
                    <p className="text-white/90">Unique local activities</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Featured Listings
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Discover some of our most popular and highly-rated rentals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockListings.slice(0, 3).map((listing) => (
              <Link key={listing.id} to={`/listing/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900 truncate">
                        {listing.title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <StarRating rating={listing.rating} size="sm" showValue />
                      </div>
                    </div>
                    <p className="text-secondary-600 text-sm mb-3 line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary-600">
                        ${listing.price}
                        <span className="text-sm font-normal text-secondary-500">/day</span>
                      </div>
                      <div className="text-sm text-secondary-500">
                        {listing.location.city}, {listing.location.state}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Listings
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Why Choose Rentily?
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              We make renting simple, safe, and enjoyable for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-secondary-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Rentily
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  <StarRating rating={testimonial.rating} size="sm" />
                </div>
                <p className="text-secondary-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-secondary-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join millions of travelers and hosts who are already using Rentily 
            to create amazing experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Exploring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
              Become a Host
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
