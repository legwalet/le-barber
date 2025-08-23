import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Scissors,
  User,
  Menu,
  X,
  Home,
  Users,
  Building,
  Calendar
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { userType, setUserType } = useApp();

  // Memoize navigation to ensure it updates when userType changes
  const navigation = useMemo(() => [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Find Barbers', href: '/barbers', icon: Users },
    ...(userType === 'client'
      ? [{ name: 'My Bookings', href: '/dashboard/client', icon: Calendar }]
      : [{ name: 'Rentals', href: '/rentals', icon: Building }]
    ),
  ], [userType]);

  const toggleUserType = () => {
    setUserType(userType === 'client' ? 'barber' : 'client');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white sticky top-0 z-50 shadow-trip">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Scissors className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-2xl font-bold text-white">
              Le Barber
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-trip transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Type Toggle & Location */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleUserType}
              className="px-6 py-3 rounded-trip font-medium transition-all duration-200 bg-white/20 text-white border border-white/30 hover:bg-white/30"
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{userType === 'client' ? 'Client' : 'Barber'}</span>
              </div>
            </button>

            <div className="flex items-center space-x-2 text-white/90 bg-white/10 px-4 py-3 rounded-trip border border-white/20">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Cape Town</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-trip text-white hover:bg-white/10 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-primary-700/95">
            <div className="py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-trip transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <button
                onClick={toggleUserType}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-trip font-medium transition-all duration-200 bg-white/20 text-white"
              >
                <User className="w-5 h-5" />
                <span>Switch to {userType === 'client' ? 'Barber' : 'Client'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 