import React from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, User, Phone } from 'lucide-react';

const BookingPage = () => {
  const { barberId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-trip shadow-trip p-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-6 text-center">
            Book Appointment
          </h1>
          
          <div className="space-y-6">
            <div className="text-center p-4 bg-primary-50 rounded-trip">
              <h3 className="font-semibold text-primary-900 mb-2">Sample Barber {barberId}</h3>
              <p className="text-gray-600">Professional barber in Cape Town</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Select time</option>
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>12:00 PM</option>
                    <option>01:00 PM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                    <option>04:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Select service</option>
                  <option>Haircut - R120</option>
                  <option>Beard Trim - R80</option>
                  <option>Haircut + Beard - R180</option>
                  <option>Kids Cut - R90</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <button className="w-full btn-primary text-lg py-4">
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 