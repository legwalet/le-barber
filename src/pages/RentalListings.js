import React, { useState, useEffect, useRef } from 'react';
import { Building, MapPin, Calendar, Phone, Mail, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';

const RentalListings = () => {
  const { rentalListings } = useApp();
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Get user's current location
  useEffect(() => {
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
  }, []);

  // Initialize MapQuest map
  useEffect(() => {
    const initMap = () => {
      if (window.L && window.L.mapquest && userLocation && !mapInstance.current) {
        try {
          // Set your MapQuest API key here
          window.L.mapquest.key = 'YOUR_MAPQUEST_API_KEY';

          // Create the map centered on user location
          mapInstance.current = window.L.mapquest.map(mapRef.current, {
            center: [userLocation.lat, userLocation.lng],
            layers: window.L.mapquest.tileLayer('map'),
            zoom: 12
          });

          // Add user location marker
          const userMarker = window.L.marker([userLocation.lat, userLocation.lng])
            .addTo(mapInstance.current)
            .bindPopup(`
              <div class="p-4 max-w-xs">
                <h3 class="font-bold text-lg mb-2 text-blue-600">📍 Your Location</h3>
                <p class="text-gray-600 text-sm">Finding rentals near you...</p>
              </div>
            `);

          // Add markers for each rental listing
          rentalListings.forEach((listing) => {
            const marker = window.L.marker([listing.location.lat, listing.location.lng])
              .addTo(mapInstance.current)
              .bindPopup(`
                <div class="p-4 max-w-xs">
                  <h3 class="font-bold text-lg mb-2">${listing.shopName}</h3>
                  <p class="text-gray-600 text-sm mb-2">${listing.address}</p>
                  <div class="flex items-center mb-2">
                    <span class="text-green-500 mr-1">R</span>
                    <span class="text-sm">R{listing.monthlyRent.toLocaleString()}/month</span>
                  </div>
                  <div class="flex items-center mb-2">
                    <span class="text-blue-500 mr-1">📅</span>
                    <span class="text-sm">${listing.contractLength}</span>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-primary text-xs px-3 py-1">
                      <span class="mr-1">📞</span> Call
                    </button>
                    <button class="btn-accent text-xs px-3 py-1">
                      <span class="mr-1">✉️</span> Email
                    </button>
                  </div>
                </div>
              `);
          });
        } catch (error) {
          console.error('Error initializing MapQuest map:', error);
        }
      }
    };

    // Wait for MapQuest to load
    if (window.L && window.L.mapquest) {
      initMap();
    } else {
      // Poll for MapQuest to be available
      const interval = setInterval(() => {
        if (window.L && window.L.mapquest) {
          clearInterval(interval);
          initMap();
        }
      }, 100);
      
      return () => clearInterval(interval);
    }

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [userLocation, rentalListings]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary-900 mb-8 text-center">
          Barber Shop Rentals
        </h1>

        {/* Location Info */}
        {userLocation && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 text-primary-600 bg-white px-4 py-2 rounded-trip shadow-trip">
              <Navigation className="w-4 h-4" />
              <span className="text-sm font-medium">
                {userLocation.lat === -33.9249 ? 'Using Cape Town center' : 'Using your current location'}
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {rentalListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-trip shadow-trip overflow-hidden hover:shadow-trip-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <Building className="w-16 h-16 text-primary-600" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary-900 mb-2">{listing.shopName}</h3>
                <p className="text-gray-600 mb-3">{listing.address}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-semibold text-primary-600">R{listing.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="font-semibold text-primary-600">R{listing.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Contract:</span>
                    <span className="font-semibold text-primary-600">{listing.contractLength}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 btn-primary text-center text-sm">
                    <Phone className="inline-block w-4 h-4 mr-2" />
                    Call
                  </button>
                  <button className="flex-1 btn-accent text-center text-sm">
                    <Mail className="inline-block w-4 h-4 mr-2" />
                    Email
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map View */}
        <div className="bg-white rounded-trip shadow-trip p-0 overflow-hidden">
          <div 
            ref={mapRef} 
            id="rental-map" 
            style={{ width: '100%', height: '500px' }}
          ></div>
        </div>
        
        <div className="text-center mt-12">
          <div className="bg-white rounded-trip shadow-trip p-8 max-w-2xl mx-auto">
            <Building className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary-900 mb-4">Have Space to Rent?</h2>
            <p className="text-gray-600 mb-6">
              List your barber shop space and connect with barbers looking for rental opportunities.
            </p>
            <button className="btn-primary text-lg px-8 py-4">
              List Your Space
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalListings; 