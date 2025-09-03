import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  UserPlus
} from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { googleLogin, manualRegister, manualLogin } = useAuth();
  const [userType, setUserType] = useState(null); // 'barber' or 'client'
  const [step, setStep] = useState(1);
  const [authMode, setAuthMode] = useState(null); // 'login' or 'signin'
  const [redirectInfo, setRedirectInfo] = useState(null);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check for redirect parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    const id = urlParams.get('id');
    
    if (redirect === 'barber' && id) {
      setRedirectInfo({ type: 'barber', id });
      // Auto-select client user type for barber bookings
      setUserType('client');
    }
  }, []);

  const handleSuccessfulAuth = () => {
    if (redirectInfo && redirectInfo.type === 'barber') {
      // Redirect back to the specific barber profile
      navigate(`/barber/${redirectInfo.id}`);
    } else {
      // Default redirect to home
      navigate('/');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await googleLogin(credentialResponse.credential, userType);
      if (result.success) {
        handleSuccessfulAuth();
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (error) {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await manualLogin(formData.email, formData.password);
      
      if (result.success) {
        handleSuccessfulAuth();
      } else {
        setError(result.error || 'Invalid credentials. Please check your email and password.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      const result = await manualRegister({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        businessName: formData.businessName
      }, userType);

      if (result.success) {
        handleSuccessfulAuth();
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
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

  const goBack = () => {
    if (authMode) {
      setAuthMode(null);
    } else if (step > 1) {
      setStep(step - 1);
    } else {
      setUserType(null);
    }
    setError('');
  };

  const renderBarberOnboarding = () => (
    <div className="max-w-md mx-auto">
      {step === 1 && (
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, Barber!</h2>
            <p className="text-gray-600">Join our platform and start growing your business</p>
          </div>
          
          <button
            onClick={() => setStep(2)}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-trip font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && !authMode && (
        <div>
          <div className="mb-6">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Your Account</h2>
            <p className="text-gray-600">
              Choose how you'd like to access your barber account
            </p>
          </div>

          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setAuthMode('login')}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-trip font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Login to Existing Account</span>
            </button>

            <button
              onClick={() => setAuthMode('signin')}
              className="w-full bg-white text-primary-600 py-4 px-6 rounded-trip font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create New Account</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && authMode && (
        <div>
          <div className="mb-6">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {authMode === 'login' ? 'Login to Your Account' : 'Create New Account'}
            </h2>
            <p className="text-gray-600">
              {authMode === 'login' 
                ? 'Enter your credentials to access your account'
                : 'Fill in your details to create a new barber account'
              }
            </p>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleSignIn} className="space-y-4">
            {authMode === 'signin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required={authMode === 'signin'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {authMode === 'signin' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={authMode === 'login' ? "Enter your password" : "Create a password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authMode === 'signin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required={authMode === 'signin'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-trip text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-trip font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {authMode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{authMode === 'login' ? 'Login' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );

  const renderClientOnboarding = () => (
    <div className="max-w-md mx-auto">
      {step === 1 && (
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, Client!</h2>
            <p className="text-gray-600">Find and book the best barbers in your area</p>
          </div>
          
          <button
            onClick={() => setStep(2)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-trip font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && !authMode && (
        <div>
          <div className="mb-6">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Your Account</h2>
            <p className="text-gray-600">
              Choose how you'd like to access your client account
            </p>
          </div>

          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setAuthMode('login')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-trip font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Login to Existing Account</span>
            </button>

            <button
              onClick={() => setAuthMode('signin')}
              className="w-full bg-white text-blue-600 py-4 px-6 rounded-trip font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create New Account</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && authMode && (
        <div>
          <div className="mb-6">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {authMode === 'login' ? 'Login to Your Account' : 'Create New Account'}
            </h2>
            <p className="text-gray-600">
              {authMode === 'login' 
                ? 'Enter your credentials to access your account'
                : 'Fill in your details to create a new client account'
              }
            </p>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleSignIn} className="space-y-4">
            {authMode === 'signin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required={authMode === 'signin'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {authMode === 'signin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={authMode === 'login' ? "Enter your password" : "Create a password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authMode === 'signin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-trip focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required={authMode === 'signin'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-trip text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-trip font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {authMode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{authMode === 'login' ? 'Login' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Le Barber</h1>
            <p className="text-gray-600">
              {redirectInfo ? 'Choose your role to continue booking' : 'Choose your role to get started'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Barber Card */}
            <div 
              onClick={() => setUserType('barber')}
              className="bg-white rounded-trip p-8 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-primary-200"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">I'm a Barber</h3>
              <p className="text-gray-600 text-sm">Join our platform to grow your business and connect with clients</p>
            </div>

            {/* Client Card */}
            <div 
              onClick={() => setUserType('client')}
              className="bg-white rounded-trip p-8 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">I'm a Client</h3>
              <p className="text-gray-600 text-sm">Find and book appointments with the best barbers in your area</p>
            </div>
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