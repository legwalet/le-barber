import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BarberList from './pages/BarberList';
import BarberProfile from './pages/BarberProfile';
import BookingPage from './pages/BookingPage';
import ClientDashboard from './pages/ClientDashboard';
import BarberDashboard from './pages/BarberDashboard';
import RentalListings from './pages/RentalListings';

function App() {
  return (
    <AppProvider>
      <Router future={{ v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/barbers" element={<BarberList />} />
              <Route path="/barber/:id" element={<BarberProfile />} />
              <Route path="/book/:barberId" element={<BookingPage />} />
              <Route path="/dashboard/client" element={<ClientDashboard />} />
              <Route path="/dashboard/barber" element={<BarberDashboard />} />
              <Route path="/rentals" element={<RentalListings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App; 