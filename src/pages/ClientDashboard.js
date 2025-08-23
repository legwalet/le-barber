import React from 'react';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary-900 mb-8 text-center">
          Client Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-trip shadow-trip p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">Upcoming Appointments</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-trip p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-primary-900">Haircut</h3>
                    <span className="text-sm text-gray-500">Tomorrow</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Dec 26, 2024</span>
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    <span>10:00 AM</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Sample Barber - Cape Town</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-trip shadow-trip p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold text-primary-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-primary-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Favorite Barber</span>
                  <span className="font-semibold text-primary-900">Sample Barber</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-trip shadow-trip p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Recent Reviews</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-sm text-gray-600">Great service! 5 stars</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-sm text-gray-600">Professional cut 4 stars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard; 