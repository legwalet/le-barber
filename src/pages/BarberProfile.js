import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Mail, Scissors } from 'lucide-react';

const BarberProfile = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-trip shadow-trip overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Scissors className="w-24 h-24 text-primary-600" />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-4">Sample Barber {id}</h1>
            <p className="text-gray-600 mb-6">Professional barber with years of experience in Cape Town</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-primary-900 mb-3">Contact Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>123 Sample Street, Cape Town</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>+27 21 123 4567</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>barber@example.com</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-primary-900 mb-3">Rating</h3>
                <div className="flex items-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-xl font-bold">4.8</span>
                  <span className="text-gray-600 ml-2">(24 reviews)</span>
                </div>
                <p className="text-gray-600">Excellent service and attention to detail</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link to={`/book/${id}`} className="btn-primary text-lg px-8 py-4">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberProfile; 