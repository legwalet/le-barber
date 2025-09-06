import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Map as MapIcon, List, Star, MapPin, Scissors, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BarberList = () => {
  const { barbers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [filteredBarbers, setFilteredBarbers] = useState(barbers);
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

  useEffect(() => {
    let filtered = barbers.filter(barber => {
      const matchesSearch = barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           barber.address.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    
    setFilteredBarbers(filtered);
  }, [searchTerm, barbers]);

  // Initialize MapQuest map
  useEffect(() => {
    const initMap = () => {
      if (viewMode === 'map' && window.L && window.L.mapquest && userLocation && !mapInstance.current) {
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

          // Add markers for filtered barbers
          filteredBarbers.forEach((barber) => {
            const distance = userLocation.lat !== -33.9249 
              ? calculateDistance(
                  userLocation.lat, userLocation.lng,
                  barber.location.lat, barber.location.lng
                )
              : null;
            
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
                  ${distance ? `<div class="text-sm text-blue-600 mb-2">📍 ${distance.toFixed(1)}km away</div>` : ''}
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

    // Cleanup when switching away from map view
    if (viewMode !== 'map' && mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [viewMode, filteredBarbers, userLocation]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            Find Your Perfect Barber
          </h1>
          <p className="text-lg text-gray-600">
            Discover top-rated barbers across Cape Town
          </p>
        </div>

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

        {/* Search and View Toggle */}
        <div className="bg-white rounded-trip shadow-trip p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search barbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-trip overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-6 py-3 font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="inline-block w-5 h-5 mr-2" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-6 py-3 font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MapIcon className="inline-block w-5 h-5 mr-2" />
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBarbers.length} of {barbers.length} barbers
          </p>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarbers.map((barber) => {
              const distance = userLocation && userLocation.lat !== -33.9249 
                ? calculateDistance(
                    userLocation.lat, userLocation.lng,
                    barber.location.lat, barber.location.lng
                  )
                : null;

              return (
                <div key={barber.id} className="bg-white rounded-trip shadow-trip overflow-hidden hover:shadow-trip-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    {barber.profileImage ? (
                      <img
                        src={barber.profileImage}
                        alt={barber.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <Scissors className="w-16 h-16 text-primary-600" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary-900 mb-2">{barber.name}</h3>
                    <p className="text-gray-600 mb-3">{barber.address}</p>
                    {distance && (
                      <div className="mb-3 text-sm text-blue-600">
                        📍 {distance.toFixed(1)}km away
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{barber.rating} ({barber.reviews?.length || 0} reviews)</span>
                      </div>
                      <span className="text-sm font-semibold text-primary-600">
                        From R{barber.services?.length > 0 ? Math.min(...barber.services.map(s => s.price)) : 'Contact'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/barber/${barber.id}`} className="flex-1 btn-primary text-center text-sm">
                        View Profile
                      </Link>
                      <Link to={`/book/${barber.id}`} className="flex-1 btn-accent text-center text-sm">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-trip shadow-trip p-0 overflow-hidden">
            <div 
              ref={mapRef} 
              id="barber-map" 
              style={{ width: '100%', height: '600px' }}
            ></div>
          </div>
        )}

        {/* No Results */}
        {filteredBarbers.length === 0 && (
          <div className="text-center py-12">
            <Scissors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No barbers found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-primary"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarberList; 