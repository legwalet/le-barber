import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Scissors, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Calendar, 
  Clock, 
  ArrowLeft,
  User,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BarberProfile = () => {
  const { barberId } = useParams();
  const navigate = useNavigate();
  const { barbers } = useApp();
  const { isAuthenticated, user } = useAuth();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Wait for barbers to be loaded
    if (barbers.length === 0) {
      setLoading(true);
      return;
    }

    // Find the barber by ID - handle both string and number IDs
    const foundBarber = barbers.find(b => b.id === parseInt(barberId) || b.id === barberId);
    if (foundBarber) {
      setBarber(foundBarber);
    } else {
      console.log('Barber not found:', { barberId, barbers: barbers.map(b => ({ id: b.id, name: b.name })) });
    }
    setLoading(false);

    // Get user location for distance calculation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  }, [barberId, barbers]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleBookAppointment = () => {
    if (!isAuthenticated()) {
      // Redirect to sign-in page for clients
      navigate('/auth?redirect=barber&id=' + barberId);
      return;
    }

    // If authenticated, proceed to booking
    if (user && user.userType === 'client') {
      navigate(`/book/${barberId}`);
    } else {
      // If user is a barber, show message
      alert('Only clients can book appointments. Please switch to client account.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading barber profile...</p>
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Barber Not Found</h2>
          <p className="text-gray-600 mb-4">The barber you're looking for doesn't exist.</p>
          <Link to="/barbers" className="bg-primary-600 text-white px-4 py-2 rounded-trip hover:bg-primary-700">
            Browse All Barbers
          </Link>
        </div>
      </div>
    );
  }

  const distance = userLocation ? calculateDistance(
    userLocation.lat, userLocation.lng,
    barber.location.lat, barber.location.lng
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link to="/barbers" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-6">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Barbers</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barber Profile Card */}
        <div className="bg-white rounded-trip shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {barber.profileImage ? (
                  <img
                    src={barber.profileImage}
                    alt={barber.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Scissors className="w-10 h-10" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{barber.name}</h1>
                <p className="text-primary-100 text-lg">{barber.description || 'Professional barber with years of experience'}</p>
                {barber.experience && (
                  <p className="text-primary-100 text-sm mt-1">Experience: {barber.experience}</p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-300 fill-current" />
                    <span className="font-semibold">{barber.rating}</span>
                    <span className="text-primary-100">({barber.reviews?.length || 0} reviews)</span>
                  </div>
                  {distance && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{distance.toFixed(1)}km away</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{barber.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{barber.phone || '+27 21 123 4567'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{barber.email || 'barber@example.com'}</span>
                  </div>
                </div>

                {/* Services */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {barber.services?.map((service) => (
                      <div key={service.name} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{service.name}</span>
                      </div>
                    )) || (
                      <>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Haircut</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Beard Trim</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Shave</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Styling</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Availability */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Availability</h2>
                
                {/* Pricing */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Services & Pricing</h3>
                  <div className="space-y-3">
                    {barber.services ? (
                      barber.services.map((service) => (
                        <div key={service.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-trip">
                          <span className="font-medium text-gray-900">{service.name}</span>
                          <span className="text-primary-600 font-semibold">R{service.price}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-trip">
                          <span className="font-medium text-gray-900">Haircut</span>
                          <span className="text-primary-600 font-semibold">R120</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-trip">
                          <span className="font-medium text-gray-900">Beard Trim</span>
                          <span className="text-primary-600 font-semibold">R80</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-trip">
                          <span className="font-medium text-gray-900">Haircut + Beard</span>
                          <span className="text-primary-600 font-semibold">R180</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-trip">
                          <span className="font-medium text-gray-900">Shave</span>
                          <span className="text-primary-600 font-semibold">R100</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Business Hours</h3>
                  <div className="space-y-2">
                    {barber.businessHours ? (
                      Object.entries(barber.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{day}</span>
                          <span className="font-medium">
                            {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monday - Friday</span>
                          <span className="font-medium">8:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saturday</span>
                          <span className="font-medium">9:00 AM - 5:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sunday</span>
                          <span className="font-medium">10:00 AM - 4:00 PM</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {barber.reviews && barber.reviews.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {barber.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="bg-gray-50 rounded-trip p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">- {review.clientName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Book?</h2>
                <p className="text-gray-600 mb-6">
                  {!isAuthenticated() 
                    ? "Sign in to book an appointment with this barber"
                    : user?.userType === 'client'
                    ? "Book your appointment now"
                    : "Only clients can book appointments"
                  }
                </p>
                
                {!isAuthenticated() ? (
                  <div className="space-y-4">
                    <button
                      onClick={handleBookAppointment}
                      className="bg-primary-600 text-white px-8 py-4 rounded-trip font-semibold hover:bg-primary-700 transition-colors text-lg"
                    >
                      Sign In to Book Appointment
                    </button>
                    <p className="text-sm text-gray-500">
                      Don't have an account? You can also use our{" "}
                      <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                        Quick Book feature
                      </Link>
                    </p>
                  </div>
                ) : user?.userType === 'client' ? (
                  <button
                    onClick={handleBookAppointment}
                    className="bg-primary-600 text-white px-8 py-4 rounded-trip font-semibold hover:bg-primary-700 transition-colors text-lg"
                  >
                    Book Appointment
                  </button>
                ) : (
                  <div className="text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2" />
                    <p>Switch to client account to book appointments</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberProfile; 