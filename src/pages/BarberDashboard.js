import React from 'react';
import { Calendar, Clock, Users, Star, DollarSign } from 'lucide-react';

const BarberDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary-900 mb-8 text-center">
          Barber Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-trip shadow-trip p-6 text-center">
            <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary-900">24</div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </div>
          
          <div className="bg-white rounded-trip shadow-trip p-6 text-center">
            <Calendar className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary-900">8</div>
            <div className="text-sm text-gray-600">Today's Bookings</div>
          </div>
          
          <div className="bg-white rounded-trip shadow-trip p-6 text-center">
            <Star className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary-900">4.8</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          
          <div className="bg-white rounded-trip shadow-trip p-6 text-center">
            <DollarSign className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary-900">R2,400</div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-trip shadow-trip p-6">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">Today's Schedule</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-trip">
                <div>
                  <div className="font-medium text-primary-900">John Doe</div>
                  <div className="text-sm text-gray-600">Haircut</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-primary-900">10:00 AM</div>
                  <div className="text-sm text-gray-600">R120</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-trip">
                <div>
                  <div className="font-medium text-primary-900">Mike Smith</div>
                  <div className="text-sm text-gray-600">Beard Trim</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-primary-900">11:30 AM</div>
                  <div className="text-sm text-gray-600">R80</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-trip shadow-trip p-6">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">Recent Reviews</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-trip">
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="font-medium text-primary-900">5.0</span>
                  <span className="text-sm text-gray-600 ml-2">- Excellent service!</span>
                </div>
                <p className="text-sm text-gray-600">"Great haircut, very professional!"</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-trip">
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="font-medium text-primary-900">4.5</span>
                  <span className="text-sm text-gray-600 ml-2">- Very good</span>
                </div>
                <p className="text-sm text-gray-600">"Clean cut, good attention to detail"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard; 