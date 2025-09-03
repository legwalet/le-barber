import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BarberList from './pages/BarberList';
import BarberProfile from './pages/BarberProfile';
import BookingPage from './pages/BookingPage';
import ClientDashboard from './pages/ClientDashboard';
import BarberDashboard from './pages/BarberDashboard';
import RentalListings from './pages/RentalListings';
import AuthPage from './pages/AuthPage';
import ClientRequestPage from './pages/ClientRequestPage';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <AuthProvider>
        <AppProvider>
          <Router future={{ v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/barbers" element={<BarberList />} />
                  <Route path="/barber/:barberId" element={<BarberProfile />} />
                  <Route path="/dashboard/barber" element={<BarberDashboard />} />
                  <Route path="/dashboard/client" element={<ClientDashboard />} />
                  <Route path="/rentals" element={<RentalListings />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/request-barber" element={<ClientRequestPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App; 