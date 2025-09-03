import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'barber' or 'client'

  // Check for existing user on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('leBarberUser');
    const savedUserType = localStorage.getItem('leBarberUserType');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserType(savedUserType || 'client');
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('leBarberUser');
        localStorage.removeItem('leBarberUserType');
      }
    }
    setLoading(false);
  }, []);

  // Google OAuth Login
  const googleLogin = async (credential, userType) => {
    try {
      const decoded = jwtDecode(credential);
      
      const userData = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        userType: userType,
        isGoogleUser: true,
        createdAt: new Date().toISOString(),
        // Additional fields based on user type
        ...(userType === 'barber' ? {
          businessName: '',
          services: [],
          location: null,
          availability: [],
          pricing: {},
          portfolio: []
        } : {
          preferences: {
            preferredServices: [],
            maxDistance: 10,
            priceRange: 'any'
          },
          bookingHistory: []
        })
      };

      setUser(userData);
      setUserType(userType);
      localStorage.setItem('leBarberUser', JSON.stringify(userData));
      localStorage.setItem('leBarberUserType', userType);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google login failed' };
    }
  };

  // Manual Registration
  const manualRegister = async (userData, userType) => {
    try {
      const newUser = {
        id: `manual_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userType,
        isGoogleUser: false,
        createdAt: new Date().toISOString(),
        // Additional fields based on user type
        ...(userType === 'barber' ? {
          businessName: userData.businessName || '',
          services: userData.services || [],
          location: userData.location || null,
          availability: userData.availability || [],
          pricing: userData.pricing || {},
          portfolio: userData.portfolio || []
        } : {
          preferences: {
            preferredServices: userData.preferredServices || [],
            maxDistance: userData.maxDistance || 10,
            priceRange: userData.priceRange || 'any'
          },
          bookingHistory: []
        })
      };

      setUser(newUser);
      setUserType(userType);
      localStorage.setItem('leBarberUser', JSON.stringify(newUser));
      localStorage.setItem('leBarberUserType', userType);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Manual registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  // Manual Login
  const manualLogin = async (email, password) => {
    try {
      // In a real app, this would validate against a backend
      const savedUser = localStorage.getItem('leBarberUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.email === email) {
          setUser(userData);
          setUserType(userData.userType);
          return { success: true, user: userData };
        }
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Manual login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('leBarberUser');
    localStorage.removeItem('leBarberUserType');
  };

  // Update user profile
  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('leBarberUser', JSON.stringify(updatedUser));
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  // Check if user is a barber
  const isBarber = () => {
    return userType === 'barber';
  };

  // Check if user is a client
  const isClient = () => {
    return userType === 'client';
  };

  const value = {
    user,
    userType,
    loading,
    googleLogin,
    manualRegister,
    manualLogin,
    logout,
    updateProfile,
    isAuthenticated,
    isBarber,
    isClient,
    setUserType
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 