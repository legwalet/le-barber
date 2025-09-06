import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import database from '../services/database';
import AddUserModal from '../components/AddUserModal';
import { 
  Users, 
  Scissors, 
  UserPlus, 
  UserMinus, 
  TrendingUp, 
  Calendar,
  MapPin,
  Star,
  Settings,
  Shield,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { barbers } = useApp();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalBarbers: 0,
    totalClients: 0,
    newUsersThisMonth: 0,
    activeBarbers: 0,
    totalBookings: 0,
    averageRating: 0
  });

  // Check if current user is admin
  const isAdmin = user?.email === 'legwalet11@gmail.com' || user?.name === 'Tshego';

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load all users
      const allUsers = await database.getAllUsers();
      const allBarbers = await database.getAllBarbers();
      
      // Separate clients and barbers
      const clientUsers = allUsers.filter(u => u.userType === 'client');
      const barberUsers = allUsers.filter(u => u.userType === 'barber');
      
      setUsers(allUsers);
      setClients(clientUsers);
      
      // Calculate metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const newUsersThisMonth = allUsers.filter(u => {
        const userDate = new Date(u.createdAt || Date.now());
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      }).length;
      
      const totalBookings = allUsers.reduce((sum, u) => sum + (u.bookings?.length || 0), 0);
      const totalRatings = allBarbers.reduce((sum, b) => sum + (b.reviews?.length || 0), 0);
      const averageRating = totalRatings > 0 ? 
        allBarbers.reduce((sum, b) => sum + (b.rating || 0), 0) / allBarbers.length : 0;
      
      setMetrics({
        totalUsers: allUsers.length,
        totalBarbers: barberUsers.length,
        totalClients: clientUsers.length,
        newUsersThisMonth,
        activeBarbers: allBarbers.filter(b => b.services?.length > 0).length,
        totalBookings,
        averageRating: Math.round(averageRating * 10) / 10
      });
      
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await database.deleteUser(userId);
        await loadAllData(); // Refresh data
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await database.updateUser(userId, { 
        isActive: !currentStatus 
      });
      await loadAllData(); // Refresh data
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const exportData = () => {
    const dataToExport = {
      users: users,
      barbers: barbers,
      metrics: metrics,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lebarber-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.userType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage users, barbers, and view analytics</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <button
                onClick={loadAllData}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'All Users', icon: Users },
              { id: 'barbers', label: 'Barbers', icon: Scissors },
              { id: 'clients', label: 'Clients', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Scissors className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Barbers</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalBarbers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalClients}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">New This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.newUsersThisMonth}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.averageRating}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalBookings}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Scissors className="w-8 h-8 text-teal-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Barbers</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.activeBarbers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="barber">Barbers Only</option>
                  <option value="client">Clients Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-600">
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.userType === 'barber' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              className={`${
                                user.isActive !== false 
                                  ? 'text-orange-600 hover:text-orange-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {user.isActive !== false ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Barbers Tab */}
        {activeTab === 'barbers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Barber
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {barbers.map((barber) => (
                      <tr key={barber.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {barber.profileImage ? (
                                <img
                                  src={barber.profileImage}
                                  alt={barber.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-600">
                                    {barber.name?.charAt(0)?.toUpperCase() || 'B'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{barber.name}</div>
                              <div className="text-sm text-gray-500">{barber.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {barber.address || 'No address'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{barber.rating || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {barber.services?.length || 0} services
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedUser(barber)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(barber.userId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {client.name?.charAt(0)?.toUpperCase() || 'C'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{client.name}</div>
                              <div className="text-sm text-gray-500">{client.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.bookings?.length || 0} bookings
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedUser(client)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(client.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.userType}</p>
                </div>
                
                {selectedUser.userType === 'barber' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.businessName || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.address || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.experience || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Services</label>
                      <div className="mt-1">
                        {selectedUser.services?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.services.map((service, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                {service.name} - R{service.price}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No services added</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserAdded={loadAllData}
      />
    </div>
  );
};

export default AdminDashboard;