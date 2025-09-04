import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BarberList from './pages/BarberList';
import BarberProfile from './pages/BarberProfile';
import BookingPage from './pages/BookingPage';
import RentalListings from './pages/RentalListings';
import AuthPage from './pages/AuthPage';
import ClientRequestPage from './pages/ClientRequestPage';
import BarberDashboard from './pages/BarberDashboard';
import ClientDashboard from './pages/ClientDashboard';

// Sync component to keep AuthContext and AppContext in sync
const ContextSync = ({ children }) => {
  const { userType, setUserType } = useApp();
  const { userType: authUserType } = useAuth();

  useEffect(() => {
    if (authUserType && authUserType !== userType) {
      setUserType(authUserType);
    }
  }, [authUserType, userType, setUserType]);

  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <AppProvider>
        <AuthProvider>
          <ContextSync>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/barbers" element={<BarberList />} />
                    <Route path="/barber/:barberId" element={<BarberProfile />} />
                    <Route path="/book/:barberId" element={<BookingPage />} />
                    <Route path="/dashboard/barber" element={<BarberDashboard />} />
                    <Route path="/dashboard/client" element={<ClientDashboard />} />
                    <Route path="/rentals" element={<RentalListings />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/request-barber" element={<ClientRequestPage />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </ContextSync>
        </AuthProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  );
}

export default App; 