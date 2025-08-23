import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Users, Star, ArrowRight, MapPin, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';

const HomePage = () => {
  const { barbers } = useApp();
  const [popupInfo, setPopupInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyBarbers, setNearbyBarbers] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Find nearby barbers (within 10km)
          const nearby = barbers.filter(barber => {
            const distance = calculateDistance(
              latitude, longitude,
              barber.location.lat, barber.location.lng
            );
            return distance <= 10; // 10km radius
          });
          setNearbyBarbers(nearby);
        },
        (error) => {
          console.log('Location access denied, using Cape Town center');
          setUserLocation({ lat: -33.9249, lng: 18.4241 });
        }
      );
    } else {
      setUserLocation({ lat: -33.9249, lng: 18.4241 });
    }
  }, [barbers]);

  // Calculate distance between two points (Haversine formula)
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
                <p class="text-gray-600 text-sm">Finding barbers near you...</p>
              </div>
            `);

          // Add markers for nearby barbers
          nearbyBarbers.forEach((barber) => {
            const distance = calculateDistance(
              userLocation.lat, userLocation.lng,
              barber.location.lat, barber.location.lng
            );
            
            const marker = window.L.marker([barber.location.lat, barber.location.lng])
              .addTo(mapInstance.current)
              .bindPopup(`
                <div class="p-4 max-w-xs">
                  <h3 class="font-bold text-lg mb-2">${barber.name}</h3>
                  <p class="text-gray-600 text-sm mb-2">${barber.address}</p>
                  <div class="flex items-center mb-2">
                    <span class="text-yellow-400 mr-1">★</span>
                    <span class="text-sm">${barber.rating} (${barber.reviews.length} reviews)</span>
                  </div>
                  <div class="text-sm text-blue-600 mb-2">
                    📍 ${distance.toFixed(1)}km away
                  </div>
                  <div class="flex gap-2">
                    <a href="/barber/${barber.id}" class="btn-primary text-xs px-3 py-1">View Profile</a>
                    <a href="/book/${barber.id}" class="btn-accent text-xs px-3 py-1">Book Now</a>
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
  }, [userLocation, nearbyBarbers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-900 mb-6">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
              Barber Near You
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-600 mb-8 max-w-2xl mx-auto">
            Connect with top-rated barbers in your area, book appointments instantly, and get the perfect cut every time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/barbers" className="btn-primary text-lg px-8 py-4">
              Find Barbers Now
            </Link>
            <Link to="/dashboard/client" className="btn-secondary text-lg px-8 py-4">
              View My Bookings
            </Link>
          </div>
        </div>
      </section>

      {/* Location Info */}
      {userLocation && (
        <section className="py-6 bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-primary-600">
              <Navigation className="w-5 h-5" />
              <span className="font-medium">
                {userLocation.lat === -33.9249 ? 'Using Cape Town center' : 'Using your current location'}
              </span>
            </div>
            {nearbyBarbers.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Found {nearbyBarbers.length} barber{nearbyBarbers.length !== 1 ? 's' : ''} within 10km
              </p>
            )}
          </div>
        </section>
      )}

      {/* Map Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">
              Find Barbers Near You
            </h2>
            <p className="text-lg text-primary-600">
              {userLocation && userLocation.lat !== -33.9249 
                ? 'Explore our interactive map to discover top-rated barbers in your area.'
                : 'Explore our interactive map to discover top-rated barbers across Cape Town.'
              }
            </p>
          </div>
          
          <div className="card p-0 overflow-hidden">
            <div 
              ref={mapRef} 
              id="map" 
              style={{ width: '100%', height: '500px' }}
            ></div>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/barbers" className="btn-primary inline-flex items-center space-x-2 text-lg">
              <span>View All Barbers</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Stats */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-white/90">Expert Barbers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-white/90">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.8★</div>
              <div className="text-white/90">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-white/90">Online Booking</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 