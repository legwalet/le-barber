import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import database from '../services/database';
import { 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  FileText, 
  Send, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    service: '',
    preferredDate: '',
    preferredTime: '',
    maxPrice: '',
    location: '',
    notes: ''
  });

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create booking request
      await database.createBookingRequest({
        clientId: user.id,
        clientName: user.name,
        clientEmail: user.email,
        service: formData.service,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        maxPrice: parseFloat(formData.maxPrice),
        location: formData.location || (userLocation ? `${userLocation.lat},${userLocation.lng}` : ''),
        notes: formData.notes
      });

      setSuccess(true);
      setFormData({
        service: '',
        preferredDate: '',
        preferredTime: '',
        maxPrice: '',
        location: '',
        notes: ''
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard/client');
      }, 3000);

    } catch (error) {
      console.error('Error creating booking request:', error);
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your booking request has been sent to barbers in your area. 
            You'll be notified when someone accepts your request.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-trip p-4">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong><br />
              • Barbers will review your request<br />
              • You'll receive notifications when accepted<br />
              • You can manage your requests in your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/dashboard/client')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Request a Barber</h1>
                <p className="text-gray-600">Let barbers know what you need</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-trip shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request</h2>
            <p className="text-gray-600">
              Submit your request and barbers in your area will be notified. 
              You can specify your budget and preferences.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-trip text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What service do you need?
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a service</option>
                <option value="Haircut">Haircut</option>
                <option value="Beard Trim">Beard Trim</option>
                <option value="Haircut & Beard Trim">Haircut & Beard Trim</option>
                <option value="Hair Styling">Hair Styling</option>
                <option value="Hair Coloring">Hair Coloring</option>
                <option value="Hair Treatment">Hair Treatment</option>
                <option value="Shave">Shave</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Budget (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your maximum budget"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Barbers will see this amount and can accept or negotiate within your budget.
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your address or area"
                />
              </div>
              {userLocation && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Location detected automatically
                </p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any specific requirements, style preferences, or special requests..."
                  rows="4"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-trip font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Information Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-trip p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">How it works</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>Submit your request</strong> with your service needs and budget</p>
              <p>• <strong>Barbers in your area</strong> will be notified of your request</p>
              <p>• <strong>Barbers can accept</strong> your request and create a booking</p>
              <p>• <strong>You'll be notified</strong> when someone accepts your request</p>
              <p>• <strong>Manage your requests</strong> in your client dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRequestPage; 