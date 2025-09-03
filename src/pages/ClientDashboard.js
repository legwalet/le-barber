import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import database from '../services/database';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  DollarSign, 
  Plus, 
  ArrowRight,
  CheckCircle,
  XCircle,
  Bell,
  Search,
  Filter,
  Phone,
  Mail,
  Scissors
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { barbers } = useApp();
  const [bookings, setBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('barbers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadDashboardData();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log('Location access denied, using Cape Town center');
          setUserLocation({ lat: -33.9249, lng: 18.4241 });
        }
      );
    } else {
      setUserLocation({ lat: -33.9249, lng: 18.4241 });
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user bookings
      const userBookings = await database.getBookingsByClient(user.id);
      setBookings(userBookings);
      
      // Load user booking requests
      const userRequests = await database.getBookingRequestsByClient(user.id);
      setBookingRequests(userRequests);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBarbers = barbers.filter(barber => {
    const matchesSearch = barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         barber.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === 'all' || 
                          barber.services.includes(selectedService);
    return matchesSearch && matchesService;
  });

  const sortedBarbers = filteredBarbers.sort((a, b) => {
    if (userLocation) {
      const distanceA = calculateDistance(
        userLocation.lat, userLocation.lng,
        a.location.lat, a.location.lng
      );
      const distanceB = calculateDistance(
        userLocation.lat, userLocation.lng,
        b.location.lat, b.location.lng
      );
      return distanceA - distanceB;
    }
    return b.rating - a.rating;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/request-barber"
                className="bg-blue-600 text-white px-4 py-2 rounded-trip hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Request Barber</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-trip p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Scissors className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Barbers</p>
                <p className="text-2xl font-bold text-gray-900">{barbers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-trip p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-trip p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-trip p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Requests</p>
                <p className="text-2xl font-bold text-gray-900">{bookingRequests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-trip shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'barbers', label: 'Find Barbers', icon: Scissors },
                { id: 'bookings', label: 'My Bookings', icon: Calendar },
                { id: 'requests', label: 'My Requests', icon: Bell }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'barbers' && (
              <div>
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search barbers by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Services</option>
                      <option value="haircut">Haircut</option>
                      <option value="beard-trim">Beard Trim</option>
                      <option value="shave">Shave</option>
                      <option value="styling">Styling</option>
                    </select>
                  </div>
                </div>

                {/* Barbers Grid */}
                {sortedBarbers.length === 0 ? (
                  <div className="text-center py-12">
                    <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No barbers found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedBarbers.map((barber) => {
                      const distance = userLocation ? calculateDistance(
                        userLocation.lat, userLocation.lng,
                        barber.location.lat, barber.location.lng
                      ) : null;

                      return (
                        <div key={barber.id} className="bg-white border border-gray-200 rounded-trip p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{barber.name}</h3>
                              <p className="text-sm text-gray-600">{barber.address}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{barber.rating}</span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{distance ? `${distance.toFixed(1)}km away` : 'Location available'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>From R{barber.pricing?.haircut || 'Contact for pricing'}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              to={`/barber/${barber.id}`}
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-trip hover:bg-blue-700 transition-colors text-center text-sm"
                            >
                              View Profile
                            </Link>
                            <Link
                              to={`/book/${barber.id}`}
                              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-trip hover:bg-primary-700 transition-colors text-center text-sm"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Bookings</h3>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-trip p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{booking.service}</h4>
                            <p className="text-sm text-gray-600">{booking.barberName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.date).toLocaleDateString()} at {booking.time}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Requests</h3>
                {bookingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingRequests.map((request) => (
                      <div key={request.id} className="bg-gray-50 rounded-trip p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{request.service}</h4>
                            <p className="text-sm text-gray-600">
                              Max Budget: R{request.maxPrice}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard; 