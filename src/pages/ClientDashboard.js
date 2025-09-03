import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const { user, getUserBookings } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load bookings
      const userBookings = await getUserBookings();
      setBookings(userBookings);

      // Load booking requests
      const userRequests = await database.getBookingRequestsByClient(user.id);
      setBookingRequests(userRequests);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
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
                { id: 'overview', label: 'Overview', icon: User },
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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-trip">
                        <div>
                          <p className="font-medium text-gray-900">{booking.service}</p>
                          <p className="text-sm text-gray-600">{booking.date} at {booking.time}</p>
                          <p className="text-sm text-gray-600">${booking.price}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No bookings yet</p>
                        <p className="text-sm">Start by requesting a barber!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Requests</h3>
                  <div className="space-y-3">
                    {bookingRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-trip">
                        <div>
                          <p className="font-medium text-gray-900">{request.service}</p>
                          <p className="text-sm text-gray-600">Max: ${request.maxPrice}</p>
                          <p className="text-sm text-gray-600">{request.preferredDate}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                    {bookingRequests.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No requests yet</p>
                        <p className="text-sm">Submit your first request!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-blue-50 border border-blue-200 rounded-trip p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      to="/request-barber"
                      className="flex items-center justify-between p-4 bg-white rounded-trip border border-blue-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Plus className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Request a Barber</p>
                          <p className="text-sm text-gray-600">Submit a new booking request</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                    <Link
                      to="/barbers"
                      className="flex items-center justify-between p-4 bg-white rounded-trip border border-blue-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Find Barbers</p>
                          <p className="text-sm text-gray-600">Browse available barbers</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
                </div>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-trip p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.service}</h4>
                          <p className="text-sm text-gray-600">{booking.date} at {booking.time}</p>
                          <p className="text-sm text-gray-600">${booking.price}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-trip">
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
                      <p className="text-gray-600 mb-4">Start by requesting a barber or browsing available barbers.</p>
                      <div className="flex justify-center space-x-4">
                        <Link
                          to="/request-barber"
                          className="bg-blue-600 text-white px-4 py-2 rounded-trip hover:bg-blue-700"
                        >
                          Request Barber
                        </Link>
                        <Link
                          to="/barbers"
                          className="bg-gray-600 text-white px-4 py-2 rounded-trip hover:bg-gray-700"
                        >
                          Find Barbers
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">My Requests</h3>
                  <Link
                    to="/request-barber"
                    className="bg-blue-600 text-white px-4 py-2 rounded-trip hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Request</span>
                  </Link>
                </div>
                <div className="space-y-4">
                  {bookingRequests.map((request) => (
                    <div key={request.id} className="bg-gray-50 rounded-trip p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{request.service}</h4>
                          <p className="text-sm text-gray-600">Max Budget: ${request.maxPrice}</p>
                          <p className="text-sm text-gray-600">Preferred: {request.preferredDate} at {request.preferredTime}</p>
                          {request.acceptedBy && (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ Accepted by a barber!
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-trip">
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  {bookingRequests.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Yet</h3>
                      <p className="text-gray-600 mb-4">Submit your first booking request to get started.</p>
                      <Link
                        to="/request-barber"
                        className="bg-blue-600 text-white px-4 py-2 rounded-trip hover:bg-blue-700"
                      >
                        Submit Request
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard; 