import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import database from '../services/database';
import emailService from '../services/emailService';
import { 
  Scissors, 
  Users, 
  Calendar, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  UserPlus,
  Home,
  Settings,
  Bell,
  User,
  ArrowRight
} from 'lucide-react';

const BarberDashboard = () => {
  const { user, getBarberProfile, getUserBookings } = useAuth();
  const [barberProfile, setBarberProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState('live');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [liveClients, setLiveClients] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Rental form state
  const [rentalForm, setRentalForm] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    priceType: 'per_day',
    amenities: [],
    contactInfo: ''
  });

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time refresh for live dashboard
    const interval = setInterval(() => {
      if (activeTab === 'live') {
        loadLiveClients();
      }
    }, 10000); // Refresh every 10 seconds
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load barber profile
      const profile = await getBarberProfile();
      setBarberProfile(profile);
      
      // Load bookings
      const userBookings = await getUserBookings();
      setBookings(userBookings);
      
      // Load rental spaces
      if (profile) {
        const userRentals = await database.getRentalsByBarber(profile.id);
        setRentals(userRentals);
      }
      
      // Load booking requests (including quick bookings)
      const requests = await database.getPendingBookingRequests();
      setBookingRequests(requests);
      
      // Load invitations sent by this barber
      const userInvitations = await database.getInvitationsByInviter(user.id);
      setInvitations(userInvitations);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveClients = async () => {
    try {
      const onlineClients = await database.getOnlineClients();
      setLiveClients(onlineClients);
    } catch (error) {
      console.error('Error loading live clients:', error);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      const invitationCode = emailService.generateInvitationCode(user.id, inviteEmail);
      const invitationLink = emailService.generateInvitationLink(user.id, inviteEmail);

      // Create invitation in database
      await database.createInvitation({
        inviterId: user.id,
        inviterName: user.name,
        inviterEmail: user.email,
        inviteeEmail: inviteEmail,
        code: invitationCode
      });

      // Send email invitation
      const emailResult = await emailService.sendBarberInvitation(
        user.name,
        user.email,
        inviteEmail,
        invitationLink
      );

      if (emailResult.success) {
        alert('Invitation sent successfully!');
        setInviteEmail('');
        setShowInviteModal(false);
        loadDashboardData(); // Reload invitations
      } else {
        alert('Failed to send invitation. Please try again.');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await database.updateBooking(bookingId, { status: 'confirmed' });
      loadDashboardData();
    } catch (error) {
      console.error('Error accepting booking:', error);
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    try {
      await database.updateBooking(bookingId, { status: 'declined' });
      loadDashboardData();
    } catch (error) {
      console.error('Error declining booking:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await database.updateBookingRequest(requestId, {
        status: 'accepted',
        acceptedBy: barberProfile.id,
        acceptedAt: new Date().toISOString()
      });
      
      // Update client's request status
      const request = bookingRequests.find(r => r.id === requestId);
      if (request && request.clientId) {
        await database.setUserRequestStatus(request.clientId, false);
      }
      
      loadDashboardData();
      loadLiveClients();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await database.updateBookingRequest(requestId, {
        status: 'declined',
        declinedBy: barberProfile.id,
        declinedAt: new Date().toISOString()
      });
      
      // Update client's request status
      const request = bookingRequests.find(r => r.id === requestId);
      if (request && request.clientId) {
        await database.setUserRequestStatus(request.clientId, false);
      }
      
      loadDashboardData();
      loadLiveClients();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleCreateRental = async (e) => {
    e.preventDefault();
    try {
      await database.createRental({
        barberId: barberProfile.id,
        ...rentalForm
      });

      setRentalForm({
        title: '',
        description: '',
        address: '',
        price: '',
        priceType: 'per_day',
        amenities: [],
        contactInfo: ''
      });
      setShowRentalModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error creating rental:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Barber Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-trip hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Barber</span>
              </button>
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
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rentals</p>
                <p className="text-2xl font-bold text-gray-900">{rentals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-trip shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'live', label: 'Live Dashboard', icon: Users },
                { id: 'bookings', label: 'Client Requests', icon: Bell },
                { id: 'rentals', label: 'Rental Spaces', icon: Building },
                { id: 'invitations', label: 'Invitations', icon: UserPlus }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
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
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-trip p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Clients</p>
                        <p className="text-2xl font-bold text-gray-900">{liveClients.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-trip p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {bookingRequests.filter(r => r.status === 'pending').length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Bell className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-trip p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Requests</p>
                        <p className="text-2xl font-bold text-gray-900">{bookingRequests.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-trip p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('live')}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-trip border border-blue-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Live Dashboard</p>
                          <p className="text-sm text-gray-600">See who's online right now</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="flex items-center justify-between p-4 bg-yellow-50 rounded-trip border border-yellow-200 hover:border-yellow-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">Client Requests</p>
                          <p className="text-sm text-gray-600">Review and respond to requests</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'live' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Live Client Activity</h3>
                  <div className="text-sm text-gray-500">
                    {liveClients.length} online client{liveClients.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {liveClients.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No clients online at the moment</p>
                    <p className="text-sm text-gray-400 mt-2">Clients will appear here when they're active on the platform</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveClients.map((client) => (
                      <div key={client.userId} className="bg-white border border-gray-200 rounded-trip p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <h4 className="font-semibold text-gray-900">
                              {client.clientName || 'Client'}
                            </h4>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Online
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {client.clientPhone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{client.clientPhone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Last seen: {new Date(client.lastSeen).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-gray-50 rounded-trip">
                  <h4 className="font-medium text-gray-900 mb-2">Live Dashboard Info</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Shows clients who are currently online and active on the platform</p>
                    <p>• Updates automatically every 10 seconds</p>
                    <p>• Use this to see potential clients who might be looking for services</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Client Requests</h3>
                  <div className="text-sm text-gray-500">
                    {bookingRequests.filter(r => r.status === 'pending').length} pending requests
                  </div>
                </div>

                {bookingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No client requests yet</p>
                    <p className="text-sm text-gray-400 mt-2">Clients will appear here when they use Quick Book Now</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingRequests
                      .filter(request => request.status === 'pending')
                      .map((request) => (
                        <div key={request.id} className="bg-white border border-gray-200 rounded-trip p-6 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{request.service}</h4>
                              <p className="text-sm text-gray-600">
                                Requested by: {request.clientName || 'Anonymous Client'}
                              </p>
                              {request.clientPhone && (
                                <p className="text-sm text-gray-600">
                                  Phone: {request.clientPhone}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary-600">
                                R{request.maxPrice || 'Contact for pricing'}
                              </div>
                              <div className="text-sm text-gray-500">Max Budget</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Preferred Date</p>
                              <p className="text-sm text-gray-600">
                                {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Flexible'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Location</p>
                              <p className="text-sm text-gray-600">
                                {request.location ? `${request.location.lat?.toFixed(4)}, ${request.location.lng?.toFixed(4)}` : 'Client location'}
                              </p>
                            </div>
                          </div>

                          {request.notes && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700">Notes</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-trip">
                                {request.notes}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Requested {new Date(request.createdAt).toLocaleString()}
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleDeclineRequest(request.id)}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-trip hover:bg-red-50 transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-trip hover:bg-primary-700 transition-colors"
                              >
                                Accept Request
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Completed/Accepted Requests */}
                    {bookingRequests.filter(r => r.status !== 'pending').length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Completed Requests</h4>
                        <div className="space-y-4">
                          {bookingRequests
                            .filter(request => request.status !== 'pending')
                            .map((request) => (
                              <div key={request.id} className="bg-gray-50 border border-gray-200 rounded-trip p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium text-gray-900">{request.service}</h5>
                                    <p className="text-sm text-gray-600">
                                      {request.clientName || 'Anonymous Client'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      request.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {request.status === 'accepted' ? 'Accepted' : 'Declined'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Client Requests</h3>
                  <div className="text-sm text-gray-500">
                    {bookingRequests.length} pending request{bookingRequests.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {bookingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No pending client requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingRequests.map((request) => (
                      <div key={request.id} className="bg-white border border-gray-200 rounded-trip p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {request.isQuickBooking ? request.clientName : 'Client Request'}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {request.isQuickBooking ? `Phone: ${request.clientPhone}` : `Client ID: ${request.clientId}`}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Service</p>
                            <p className="font-medium text-gray-900">{request.service}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Preferred Date</p>
                            <p className="font-medium text-gray-900">
                              {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Flexible'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Maximum Budget</p>
                            <p className="font-medium text-gray-900">
                              {request.maxPrice ? `R${request.maxPrice}` : 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Request Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {request.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-gray-900">{request.notes}</p>
                          </div>
                        )}
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-trip hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Accept Request</span>
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(request.id)}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-trip hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rentals' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Rental Spaces</h3>
                  <button
                    onClick={() => setShowRentalModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-trip hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Rental</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rentals.map((rental) => (
                    <div key={rental.id} className="bg-white rounded-trip shadow-sm p-6">
                      <h4 className="font-medium text-gray-900 mb-2">{rental.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{rental.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {rental.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          ${rental.price} per {rental.priceType}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                          {rental.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'invitations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Sent Invitations</h3>
                </div>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="bg-gray-50 rounded-trip p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{invitation.inviteeEmail}</p>
                          <p className="text-sm text-gray-600">Sent on {new Date(invitation.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invitation.status)}`}>
                          {invitation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-trip p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Barber</h3>
            <form onSubmit={handleSendInvitation}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter barber's email"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-trip hover:bg-primary-700 disabled:opacity-50"
                >
                  {inviteLoading ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-trip hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rental Modal */}
      {showRentalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-trip p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Rental Space</h3>
            <form onSubmit={handleCreateRental}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={rentalForm.title}
                    onChange={(e) => setRentalForm({...rentalForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Rental space title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={rentalForm.description}
                    onChange={(e) => setRentalForm({...rentalForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe the rental space"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={rentalForm.address}
                    onChange={(e) => setRentalForm({...rentalForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Full address"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={rentalForm.price}
                      onChange={(e) => setRentalForm({...rentalForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Type</label>
                    <select
                      value={rentalForm.priceType}
                      onChange={(e) => setRentalForm({...rentalForm, priceType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="per_day">Per Day</option>
                      <option value="per_week">Per Week</option>
                      <option value="per_month">Per Month</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label>
                  <input
                    type="text"
                    value={rentalForm.contactInfo}
                    onChange={(e) => setRentalForm({...rentalForm, contactInfo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Phone or email for inquiries"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-trip hover:bg-primary-700"
                >
                  Create Rental
                </button>
                <button
                  type="button"
                  onClick={() => setShowRentalModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-trip hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberDashboard; 