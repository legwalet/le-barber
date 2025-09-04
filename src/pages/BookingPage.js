import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import database from '../services/database';
import { 
  Scissors, 
  Calendar, 
  Clock, 
  DollarSign,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingPage = () => {
  const { barberId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { barbers } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [bookingForm, setBookingForm] = useState({
    service: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/auth?redirect=barber&id=' + barberId);
      return;
    }

    // Check if user is a client
    if (user && user.userType !== 'client') {
      setError('Only clients can book appointments');
      return;
    }

    // Find the barber
    if (barbers.length > 0) {
      const foundBarber = barbers.find(b => b.id === parseInt(barberId) || b.id === barberId);
      if (foundBarber) {
        setBarber(foundBarber);
        // Set default service
        if (foundBarber.services && foundBarber.services.length > 0) {
          setBookingForm(prev => ({ ...prev, service: foundBarber.services[0].name }));
        }
      } else {
        setError('Barber not found');
      }
      setLoading(false);
    }
  }, [barberId, barbers, user, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setError('');

    try {
      // Create booking
      const booking = {
        id: `booking_${Date.now()}`,
        clientId: user.id,
        clientName: user.name,
        clientEmail: user.email,
        clientPhone: user.phone,
        barberId: barber.id,
        barberName: barber.name,
        service: bookingForm.service,
        date: bookingForm.date,
        time: bookingForm.time,
        notes: bookingForm.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        price: barber.services?.find(s => s.name === bookingForm.service)?.price || 0
      };

      await database.createBooking(booking);
      setBookingSuccess(true);

      // Redirect to client dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard/client');
      }, 3000);

    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const getServicePrice = (serviceName) => {
    return barber?.services?.find(s => s.name === serviceName)?.price || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (error && !barber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/barbers" className="bg-primary-600 text-white px-4 py-2 rounded-trip hover:bg-primary-700">
            Browse All Barbers
          </Link>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your appointment with {barber?.name} has been booked successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link to={`/barber/${barberId}`} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-6">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Barber</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Barber Info */}
          <div className="bg-white rounded-trip shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book with {barber?.name}</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{barber?.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{barber?.rating}</span>
                  <span>({barber?.reviews?.length || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{barber?.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{barber?.phone || '+27 21 123 4567'}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Services & Pricing</h4>
              <div className="space-y-2">
                {barber?.services?.map((service) => (
                  <div key={service.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-trip">
                    <span className="font-medium text-gray-900">{service.name}</span>
                    <span className="text-primary-600 font-semibold">R{service.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-trip shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service
                </label>
                <select
                  name="service"
                  value={bookingForm.service}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a service</option>
                  {barber?.services?.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name} - R{service.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={bookingForm.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  name="time"
                  value={bookingForm.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={bookingForm.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any specific requirements or preferences..."
                />
              </div>

              {/* Price Display */}
              {bookingForm.service && (
                <div className="bg-gray-50 rounded-trip p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Price:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      R{getServicePrice(bookingForm.service)}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-trip text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={bookingLoading || !bookingForm.service || !bookingForm.date || !bookingForm.time}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-trip font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            </form>

            {/* Client Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Your Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{user?.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{user?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 