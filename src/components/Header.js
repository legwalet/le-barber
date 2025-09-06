import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Scissors,
  User,
  Menu,
  X,
  Search,
  Phone,
  Mail,
  Star,
  Clock,
  Users,
  Building,
  Calendar,
  LogOut,
  LogIn,
  UserCircle,
  Bell,
  Shield
} from 'lucide-react';
import { useState, useMemo } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { userType } = useAuth(); // Use AuthContext for userType
  const { user, isAuthenticated, logout } = useAuth();

  // Check if current user is admin (Tshego)
  const isAdmin = user?.email === 'tshego@lebarber.com' || user?.name === 'Tshego';

  // Memoize navigation to ensure it updates when userType changes
  const navigation = useMemo(() => {
    const baseNav = [
      { name: 'Home', href: '/', icon: null }
    ];

    // Add conditional navigation items based on user type and authentication
    if (isAuthenticated()) {
      // Add admin link for Tshego
      if (isAdmin) {
        baseNav.push({ name: 'Admin', href: '/admin', icon: Shield });
      }
      
      if (userType === 'barber') {
        baseNav.push(
          { name: 'Dashboard', href: '/dashboard/barber', icon: null },
          { name: 'Live Clients', href: '/dashboard/barber?tab=live', icon: null },
          { name: 'Rentals', href: '/rentals', icon: null }
        );
      } else if (userType === 'client') {
        baseNav.push(
          { name: 'Find Barbers', href: '/barbers', icon: null },
          { name: 'My Bookings', href: '/dashboard/client', icon: null }
        );
      }
    } else {
      // For unauthenticated users, show basic navigation
      baseNav.push({ name: 'Find Barbers', href: '/barbers', icon: null });
    }

    return baseNav;
  }, [userType, isAuthenticated, isAdmin]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Scissors className="w-8 h-8" />
            <span className="text-xl font-bold">Le Barber</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-trip font-medium transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Actions & Location */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white/10 px-4 py-3 rounded-trip border border-white/20">
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-white/90" />
                  )}
                  <div className="text-sm">
                    <div className="font-medium text-white">{user?.name}</div>
                    <div className="text-white/70 text-xs">
                      {userType === 'barber' ? 'Barber' : 'Client'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-trip font-medium transition-all duration-200 bg-red-600/20 text-white border border-red-300/30 hover:bg-red-600/30"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-3 rounded-trip font-medium transition-all duration-200 bg-white text-primary-600 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </div>
              </Link>
            )}

            <div className="flex items-center space-x-2 text-white/90 bg-white/10 px-4 py-3 rounded-trip border border-white/20">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Cape Town</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-trip text-white hover:bg-white/10"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-trip font-medium transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-6 space-y-3">
              {isAuthenticated() ? (
                <>
                  <div className="px-4 py-3 border-t border-white/20">
                    <div className="flex items-center space-x-3 mb-3">
                      {user?.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <UserCircle className="w-10 h-10 text-white/90" />
                      )}
                      <div>
                        <div className="font-medium text-white">{user?.name}</div>
                        <div className="text-white/70 text-sm">
                          {userType === 'barber' ? 'Barber' : 'Client'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-trip font-medium transition-all duration-200 bg-red-600/20 text-white"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-trip font-medium transition-all duration-200 bg-white text-primary-600"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 