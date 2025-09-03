import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
  Scissors,
  User,
  Mail,
  Lock,
  Phone,
  Building,
  MapPin,
  Star,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { googleLogin, manualRegister, manualLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    businessName: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await googleLogin(credentialResponse.credential, userType);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth error
  const handleGoogleError = () => {
    setError('Google login failed. Please try manual registration.');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await manualLogin(formData.email, formData.password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const userData = {
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          ...(userType === 'barber' && { businessName: formData.businessName })
        };

        const result = await manualRegister(userData, userType);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Go back to user type selection
  const goBack = () => {
    if (step === 1) {
      setUserType(null);
    } else {
      setStep(1);
    }
  };

  // Barber onboarding steps
  const renderBarberOnboarding = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Scissors className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join as a Barber</h2>
        <p className="text-gray-600">Connect with clients and grow your business</p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-trip border border-primary-200">
            <h3 className="text-lg font-semibold text-primary-800 mb-3">Why Join as a Barber?</h3>
            <ul className="space-y-2 text-sm text-primary-700">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Reach more clients in your area
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Manage bookings and appointments
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Showcase your services and portfolio
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Set your own pricing and availability
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-trip font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <button
              onClick={goBack}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-trip font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your Barber Shop Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your Full Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+27 123 456 789"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-trip p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-trip font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Barber Account'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>

          <button
            onClick={goBack}
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-trip font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      )}
    </div>
  );

  // Client onboarding steps
  const renderClientOnboarding = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join as a Client</h2>
        <p className="text-gray-600">Find and book the best barbers in your area</p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-trip border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Why Join as a Client?</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Discover top-rated barbers nearby
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Easy booking and appointment management
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Read reviews and see portfolios
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Get notifications and reminders
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-trip font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <button
              onClick={goBack}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-trip font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Full Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+27 123 456 789"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-trip p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-trip font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Client Account'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>

          <button
            onClick={goBack}
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-trip font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      )}
    </div>
  );

  // User type selection
  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Le Barber</h1>
            <p className="text-xl text-gray-600">Choose how you'd like to join our community</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Barber Card */}
            <div 
              onClick={() => setUserType('barber')}
              className="bg-white rounded-trip p-8 shadow-trip hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">I'm a Barber</h3>
              <p className="text-gray-600 mb-6">Join as a professional barber to showcase your services, manage bookings, and grow your business.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary-600 mr-2" />
                  Manage appointments
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary-600 mr-2" />
                  Showcase your portfolio
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary-600 mr-2" />
                  Set your pricing
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-trip font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200">
                Join as Barber
              </button>
            </div>

            {/* Client Card */}
            <div 
              onClick={() => setUserType('client')}
              className="bg-white rounded-trip p-8 shadow-trip hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">I'm a Client</h3>
              <p className="text-gray-600 mb-6">Join as a client to discover amazing barbers, book appointments, and get the perfect haircut.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                  Find nearby barbers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                  Book appointments
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                  Read reviews
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-trip font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                Join as Client
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setUserType('client');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {userType === 'barber' ? renderBarberOnboarding() : renderClientOnboarding()}
      </div>
    </div>
  );
};

export default AuthPage; 