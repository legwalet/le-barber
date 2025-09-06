import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import database from '../services/database';
import { 
  Scissors, 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Camera,
  Upload,
  Calendar,
  Navigation
} from 'lucide-react';

const BarberOnboarding = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const { refreshBarbers } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data for all steps
  const [profileData, setProfileData] = useState({
    // Personal Information
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    
    // Business Information
    businessName: user?.businessName || '',
    description: '',
    address: '',
    location: { lat: null, lng: null },
    
    // Services & Pricing
    services: [
      { name: 'Haircut', price: 120, duration: 30 },
      { name: 'Beard Trim', price: 80, duration: 20 },
      { name: 'Haircut + Beard', price: 180, duration: 45 },
      { name: 'Shave', price: 100, duration: 25 }
    ],
    
    // Business Hours
    businessHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    
    // Additional Info
    experience: '',
    specialties: [],
    profileImage: null,
    
    // Account Setup
    password: '',
    confirmPassword: ''
  });

  const totalSteps = 7;

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...profileData.services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    setProfileData(prev => ({
      ...prev,
      services: updatedServices
    }));
  };

  const addService = () => {
    setProfileData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', price: 0, duration: 30 }]
    }));
  };

  const removeService = (index) => {
    if (profileData.services.length > 1) {
      setProfileData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }));
    }
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setProfileData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Auto-detect address using reverse geocoding
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            if (data.locality && data.city && data.countryName) {
              const address = `${data.locality}, ${data.city}, ${data.countryName}`;
              setProfileData(prev => ({
                ...prev,
                address: address,
                location: { lat: latitude, lng: longitude }
              }));
            } else {
              // Fallback to coordinates if address detection fails
              setProfileData(prev => ({
                ...prev,
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                location: { lat: latitude, lng: longitude }
              }));
            }
          } catch (error) {
            // Fallback to coordinates if API fails
            setProfileData(prev => ({
              ...prev,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              location: { lat: latitude, lng: longitude }
            }));
          }
        },
        (error) => {
          console.log('Location access denied');
          setError('Location access denied. Please enter your address manually.');
        }
      );
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Starting profile creation for user:', user.id);
      console.log('Profile data:', profileData);
      
      // Check if this is a temporary user (new account creation)
      if (user.id.startsWith('temp_')) {
        console.log('Creating new user account...');
        
        try {
          // Create new user account first
          const newUser = await database.createUser({
            email: profileData.email,
            name: profileData.name,
            phone: profileData.phone,
            userType: 'barber',
            isGoogleUser: false,
            businessName: profileData.businessName,
            password: profileData.password // Store password for future login
          });
          console.log('User created successfully:', newUser);

          console.log('Creating barber profile...');
          // Create comprehensive barber profile
          const barberProfile = await database.createBarber({
            userId: newUser.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            businessName: profileData.businessName,
            description: profileData.description,
            address: profileData.address,
            location: profileData.location,
            services: profileData.services,
            businessHours: profileData.businessHours,
            experience: profileData.experience,
            specialties: profileData.specialties,
            profileImage: profileData.profileImage,
            rating: 5.0,
            reviews: []
          });
          console.log('Barber profile created successfully:', barberProfile);

          // Refresh the barbers list to include the new barber
          await refreshBarbers();

          if (onComplete) {
            onComplete(barberProfile);
          } else {
            navigate('/barber-dashboard');
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Fallback: create a mock profile for testing
          const mockBarberProfile = {
            id: `barber_${Date.now()}`,
            userId: `user_${Date.now()}`,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            businessName: profileData.businessName,
            description: profileData.description,
            address: profileData.address,
            location: profileData.location,
            services: profileData.services,
            businessHours: profileData.businessHours,
            experience: profileData.experience,
            specialties: profileData.specialties,
            profileImage: profileData.profileImage,
            rating: 5.0,
            reviews: []
          };
          
          console.log('Using mock profile for testing:', mockBarberProfile);
          
          // Refresh the barbers list even with mock profile
          await refreshBarbers();
          
          if (onComplete) {
            onComplete(mockBarberProfile);
          } else {
            navigate('/barber-dashboard');
          }
        }
      } else {
        // Existing user - update their barber profile
        const existingBarber = await database.getBarberByUserId(user.id);
        
        if (existingBarber) {
          const updatedBarber = await database.updateBarber(existingBarber.id, {
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            businessName: profileData.businessName,
            description: profileData.description,
            address: profileData.address,
            location: profileData.location,
            services: profileData.services,
            businessHours: profileData.businessHours,
            experience: profileData.experience,
            specialties: profileData.specialties,
            rating: 5.0,
            reviews: []
          });

          if (onComplete) {
            onComplete(updatedBarber);
          } else {
            navigate('/barber-dashboard');
          }
        } else {
          // Create new barber profile for existing user
          const barberProfile = await database.createBarber({
            userId: user.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            businessName: profileData.businessName,
            description: profileData.description,
            address: profileData.address,
            location: profileData.location,
            services: profileData.services,
            businessHours: profileData.businessHours,
            experience: profileData.experience,
            specialties: profileData.specialties,
            rating: 5.0,
            reviews: []
          });

          if (onComplete) {
            onComplete(barberProfile);
          } else {
            navigate('/barber-dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Error creating/updating barber profile:', error);
      console.error('Error details:', error.message, error.stack);
      setError(`Failed to create profile: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 <= currentStep
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-16 h-1 mx-2 ${
                i + 1 < currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfoCard = () => (
    <div className="bg-white rounded-trip shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
          <input
            type="text"
            value={profileData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., 5 years, 10+ years"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="bg-primary-600 text-white px-6 py-3 rounded-trip hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderBusinessInfoCard = () => (
    <div className="bg-white rounded-trip shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
          <Building className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input
            type="text"
            value={profileData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your business name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
          <textarea
            value={profileData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Describe your business and what makes it special"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your business address"
              required
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-trip hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Use Location</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-trip hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="bg-primary-600 text-white px-6 py-3 rounded-trip hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderServicesCard = () => (
    <div className="bg-white rounded-trip shadow-lg p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
          <Scissors className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Services & Pricing</h2>
        <p className="text-gray-600">Set up your services and pricing</p>
      </div>

      <div className="space-y-6">
        {profileData.services.map((service, index) => (
          <div key={index} className="border border-gray-200 rounded-trip p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Haircut, Beard Trim"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (R)</label>
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="120"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={service.duration}
                  onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value) || 30)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="30"
                  required
                />
              </div>
            </div>
            {profileData.services.length > 1 && (
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addService}
          className="w-full border-2 border-dashed border-gray-300 rounded-trip p-6 text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Another Service</span>
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-trip hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="bg-primary-600 text-white px-6 py-3 rounded-trip hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderImageUploadCard = () => (
    <div className="bg-white rounded-trip shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Image</h2>
        <p className="text-gray-600">Add a professional photo to help clients recognize you</p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          {profileData.profileImage ? (
            <div className="relative inline-block">
              <img
                src={profileData.profileImage}
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
              />
              <button
                onClick={() => setProfileData(prev => ({ ...prev, profileImage: null }))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-4 border-dashed border-gray-300">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="bg-primary-600 text-white px-6 py-3 rounded-trip hover:bg-primary-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{profileData.profileImage ? 'Change Image' : 'Upload Image'}</span>
          </label>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>• Recommended: Square image, at least 300x300px</p>
          <p>• Professional headshot works best</p>
          <p>• This will appear on your barber profile</p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-trip hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="bg-primary-600 text-white px-6 py-3 rounded-trip hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderBusinessHoursCard = () => (
    <div className="bg-white rounded-trip shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Hours</h2>
        <p className="text-gray-600">Set your operating hours</p>
      </div>

      <div className="space-y-4">
        {Object.entries(profileData.businessHours).map(([day, hours]) => (
          <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-trip">
            <div className="w-20">
              <span className="font-medium text-gray-700 capitalize">{day}</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!hours.closed}
                onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Open</span>
            </div>
            {!hours.closed && (
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
            {hours.closed && (
              <span className="text-sm text-gray-500">Closed</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-trip hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="bg-primary-600 text-white px-6 py-3 rounded-trip hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderAccountSetupCard = () => (
    <div className="bg-white rounded-trip shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Setup</h2>
        <p className="text-gray-600">Set your preferred name and secure password</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Display Name</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="How should clients see your name?"
            required
          />
          <p className="text-sm text-gray-500 mt-1">This is how your name will appear to clients</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={profileData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Create a secure password"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Use at least 8 characters with numbers and letters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            value={profileData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Confirm your password"
            required
          />
        </div>

        {profileData.password && profileData.confirmPassword && profileData.password !== profileData.confirmPassword && (
          <div className="text-red-600 text-sm">
            Passwords do not match
          </div>
        )}
        
        {(!profileData.password || !profileData.confirmPassword || profileData.password !== profileData.confirmPassword || profileData.password.length < 6) && (
          <div className="text-gray-500 text-sm">
            {!profileData.password ? 'Please enter a password' :
             !profileData.confirmPassword ? 'Please confirm your password' :
             profileData.password !== profileData.confirmPassword ? 'Passwords do not match' :
             profileData.password.length < 6 ? 'Password must be at least 6 characters' : ''}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-trip hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={() => {
            console.log('Review Profile clicked, current step:', currentStep);
            console.log('Password data:', { password: profileData.password, confirmPassword: profileData.confirmPassword });
            handleNext();
          }}
          disabled={!profileData.password || !profileData.confirmPassword || profileData.password !== profileData.confirmPassword || profileData.password.length < 6}
          className="bg-primary-600 text-white px-6 py-3 rounded-trip hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>Review & Complete</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderReviewCard = () => (
    <div className="bg-white rounded-trip shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Profile</h2>
        <p className="text-gray-600">Review your information before completing setup</p>
      </div>

      <div className="space-y-6">
        {/* Profile Image Preview */}
        {profileData.profileImage && (
          <div className="text-center">
            <img
              src={profileData.profileImage}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-200 mx-auto"
            />
            <p className="text-sm text-gray-600 mt-2">Your profile image</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-trip p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {profileData.name}</p>
            <p><span className="font-medium">Email:</span> {profileData.email}</p>
            <p><span className="font-medium">Phone:</span> {profileData.phone || 'Not provided'}</p>
            <p><span className="font-medium">Experience:</span> {profileData.experience || 'Not provided'}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-trip p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Business Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Business Name:</span> {profileData.businessName}</p>
            <p><span className="font-medium">Description:</span> {profileData.description || 'Not provided'}</p>
            <p><span className="font-medium">Address:</span> {profileData.address || 'Not provided'}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-trip p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
          <div className="space-y-2 text-sm">
            {profileData.services.map((service, index) => (
              <p key={index}>
                <span className="font-medium">{service.name}:</span> R{service.price} ({service.duration} min)
              </p>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-trip text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-trip hover:bg-gray-400 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={handleComplete}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-3 rounded-trip hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          <span>{loading ? 'Creating Profile...' : 'Complete Setup'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {renderStepIndicator()}
        
        {currentStep === 1 && renderPersonalInfoCard()}
        {currentStep === 2 && renderBusinessInfoCard()}
        {currentStep === 3 && renderServicesCard()}
        {currentStep === 4 && renderImageUploadCard()}
        {currentStep === 5 && renderBusinessHoursCard()}
        {currentStep === 6 && renderAccountSetupCard()}
        {currentStep === 7 && renderReviewCard()}
      </div>
    </div>
  );
};

export default BarberOnboarding;