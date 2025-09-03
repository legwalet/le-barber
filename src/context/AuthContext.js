import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import database from '../services/database';

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
    const checkAuth = async () => {
      try {
        const savedUserId = localStorage.getItem('leBarberUserId');
        if (savedUserId) {
          const userData = await database.getUserById(savedUserId);
          if (userData) {
            setUser(userData);
            setUserType(userData.userType);
            // Mark user as online
            await database.markUserOnline(userData.id, userData.userType);
          } else {
            // Clear invalid user data
            localStorage.removeItem('leBarberUserId');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('leBarberUserId');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mark user offline when component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        database.markUserOffline(user.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (user) {
        database.markUserOffline(user.id);
      }
    };
  }, [user]);

  // Google OAuth Login
  const googleLogin = async (credential, userType) => {
    try {
      const decoded = jwtDecode(credential);
      
      // Check if user already exists
      let userData = await database.getUserByEmail(decoded.email);
      
      if (userData) {
        // User exists, update with new Google data
        userData = await database.updateUser(userData.id, {
          name: decoded.name,
          picture: decoded.picture,
          isGoogleUser: true,
          userType: userType
        });
      } else {
        // Create new user
        userData = await database.createUser({
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          userType: userType,
          isGoogleUser: true
        });

        // If user is a barber, create barber profile
        if (userType === 'barber') {
          await database.createBarber({
            userId: userData.id,
            name: userData.name,
            email: userData.email,
            picture: userData.picture
          });
        }
      }

      setUser(userData);
      setUserType(userType);
      localStorage.setItem('leBarberUserId', userData.id);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google login failed' };
    }
  };

  // Manual Registration
  const manualRegister = async (userData, userType) => {
    try {
      // Check if user already exists
      const existingUser = await database.getUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create new user
      const newUser = await database.createUser({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userType,
        isGoogleUser: false,
        ...(userType === 'barber' && { businessName: userData.businessName })
      });

      // If user is a barber, create barber profile
      if (userType === 'barber') {
        await database.createBarber({
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          businessName: newUser.businessName
        });
      }

      setUser(newUser);
      setUserType(userType);
      localStorage.setItem('leBarberUserId', newUser.id);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Manual registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  // Manual Login
  const manualLogin = async (email, password) => {
    try {
      // In a real app, this would validate password
      // For now, we'll just check if the user exists
      const userData = await database.getUserByEmail(email);
      
      if (userData) {
        setUser(userData);
        setUserType(userData.userType);
        localStorage.setItem('leBarberUserId', userData.id);
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Manual login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  // Logout
  const logout = () => {
    if (user) {
      database.markUserOffline(user.id);
    }
    setUser(null);
    setUserType(null);
    localStorage.removeItem('leBarberUserId');
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const updatedUser = await database.updateUser(user.id, updates);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
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

  // Get user's barber profile (if they are a barber)
  const getBarberProfile = async () => {
    if (!user || userType !== 'barber') return null;
    
    try {
      return await database.getBarberByUserId(user.id);
    } catch (error) {
      console.error('Error getting barber profile:', error);
      return null;
    }
  };

  // Get user's bookings
  const getUserBookings = async () => {
    if (!user) return [];
    
    try {
      if (userType === 'client') {
        return await database.getBookingsByClient(user.id);
      } else {
        const barberProfile = await getBarberProfile();
        if (barberProfile) {
          return await database.getBookingsByBarber(barberProfile.id);
        }
      }
      return [];
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return [];
    }
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
    setUserType,
    getBarberProfile,
    getUserBookings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 