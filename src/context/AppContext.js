import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

// Initial state
const initialState = {
  user: null,
  userType: 'client', // Add userType state
  barbers: [],
  bookings: [],
  userLocation: null,
  loading: false,
  error: null,
  // New rental system state
  rentalListings: [],
  barberShops: [],
  rentalRequests: [],
};

// Action types
const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_USER_TYPE: 'SET_USER_TYPE', // Add SET_USER_TYPE action
  SET_BARBERS: 'SET_BARBERS',
  SET_BOOKINGS: 'SET_BOOKINGS',
  SET_LOCATION: 'SET_LOCATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_BOOKING: 'ADD_BOOKING',
  UPDATE_BOOKING: 'UPDATE_BOOKING',
  ADD_REVIEW: 'ADD_REVIEW',
  // New rental actions
  SET_RENTAL_LISTINGS: 'SET_RENTAL_LISTINGS',
  ADD_RENTAL_LISTING: 'ADD_RENTAL_LISTING',
  UPDATE_RENTAL_LISTING: 'UPDATE_RENTAL_LISTING',
  REMOVE_RENTAL_LISTING: 'REMOVE_RENTAL_LISTING',
  SET_BARBER_SHOPS: 'SET_BARBER_SHOPS',
  ADD_BARBER_SHOP: 'ADD_BARBER_SHOP',
  SET_RENTAL_REQUESTS: 'SET_RENTAL_REQUESTS',
  ADD_RENTAL_REQUEST: 'ADD_RENTAL_REQUEST',
  UPDATE_RENTAL_REQUEST: 'UPDATE_RENTAL_REQUEST',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.SET_USER_TYPE: // Add SET_USER_TYPE case
      return { ...state, userType: action.payload };
    case ACTIONS.SET_BARBERS:
      return { ...state, barbers: action.payload };
    case ACTIONS.SET_BOOKINGS:
      return { ...state, bookings: action.payload };
    case ACTIONS.SET_LOCATION:
      return { ...state, userLocation: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.ADD_BOOKING:
      return { ...state, bookings: [...state.bookings, action.payload] };
    case ACTIONS.UPDATE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id ? action.payload : booking
        ),
      };
    case ACTIONS.ADD_REVIEW:
      return {
        ...state,
        barbers: state.barbers.map(barber =>
          barber.id === action.payload.barberId
            ? {
                ...barber,
                reviews: [...(barber.reviews || []), action.payload.review],
                rating: calculateNewRating(barber, action.payload.review),
              }
            : barber
        ),
      };
    // New rental cases
    case ACTIONS.SET_RENTAL_LISTINGS:
      return { ...state, rentalListings: action.payload };
    case ACTIONS.ADD_RENTAL_LISTING:
      return { ...state, rentalListings: [...state.rentalListings, action.payload] };
    case ACTIONS.UPDATE_RENTAL_LISTING:
      return {
        ...state,
        rentalListings: state.rentalListings.map(listing =>
          listing.id === action.payload.id ? action.payload : listing
        ),
      };
    case ACTIONS.REMOVE_RENTAL_LISTING:
      return {
        ...state,
        rentalListings: state.rentalListings.filter(listing => listing.id !== action.payload),
      };
    case ACTIONS.SET_BARBER_SHOPS:
      return { ...state, barberShops: action.payload };
    case ACTIONS.ADD_BARBER_SHOP:
      return { ...state, barberShops: [...state.barberShops, action.payload] };
    case ACTIONS.SET_RENTAL_REQUESTS:
      return { ...state, rentalRequests: action.payload };
    case ACTIONS.ADD_RENTAL_REQUEST:
      return { ...state, rentalRequests: [...state.rentalRequests, action.payload] };
    case ACTIONS.UPDATE_RENTAL_REQUEST:
      return {
        ...state,
        rentalRequests: state.rentalRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        ),
      };
    default:
      return state;
  }
}

// Helper function to calculate new rating
function calculateNewRating(barber, newReview) {
  const reviews = [...(barber.reviews || []), newReview];
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / reviews.length) * 10) / 10;
}

// Mock data for barbers
const mockBarbers = [
  {
    id: 1,
    name: 'Sipho Maseko',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9249, lng: 18.4241 }, // Cape Town CBD
    address: '123 Long Street, Cape Town CBD, 8001',
    services: [
      { name: 'Haircut', price: 120, duration: 30 },
      { name: 'Beard Trim', price: 60, duration: 20 },
      { name: 'Haircut + Beard', price: 160, duration: 45 },
    ],
    rating: 4.8,
    reviews: [
      { id: 1, clientName: 'Tshego', rating: 5, comment: 'Amazing service! Very professional.', date: '2024-01-15' },
      { id: 2, clientName: 'David', rating: 4, comment: 'Great haircut, will definitely return.', date: '2024-01-10' },
    ],
    availability: [
      { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    ],
    skills: ['Fade', 'Classic Cut', 'Modern Styles', 'Beard Grooming'],
    experience: '5 years',
    bio: 'Professional barber with a passion for creating the perfect look for every client.',
    // New rental properties
    hasShop: true,
    shopId: 1,
    isRentingSpace: false,
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9180, lng: 18.4231 }, // Green Point
    address: '456 Main Road, Green Point, Cape Town, 8005',
    services: [
      { name: 'Haircut', price: 150, duration: 35 },
      { name: 'Beard Trim', price: 80, duration: 25 },
      { name: 'Kids Haircut', price: 100, duration: 25 },
    ],
    rating: 4.6,
    reviews: [
      { id: 3, clientName: 'Sarah', rating: 5, comment: 'Perfect fade every time!', date: '2024-01-12' },
      { id: 4, clientName: 'Mike', rating: 4, comment: 'Great with kids, very patient.', date: '2024-01-08' },
    ],
    availability: [
      { day: 'Monday', hours: '8:00 AM - 7:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM - 7:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 7:00 PM' },
      { day: 'Thursday', hours: '8:00 AM - 7:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 7:00 PM' },
      { day: 'Saturday', hours: '9:00 AM - 5:00 PM' },
    ],
    skills: ['Fade', 'Kids Cuts', 'Beard Design', 'Hair Coloring'],
    experience: '8 years',
    bio: 'Experienced barber specializing in modern fades and kids haircuts.',
    // New rental properties
    hasShop: false,
    isRentingSpace: true,
    currentRental: 1,
  },
  {
    id: 3,
    name: 'Alex Rodriguez',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9289, lng: 18.4174 }, // Sea Point
    address: '789 Beach Road, Sea Point, Cape Town, 8005',
    services: [
      { name: 'Haircut', price: 180, duration: 40 },
      { name: 'Beard Trim', price: 100, duration: 30 },
      { name: 'Hair Styling', price: 120, duration: 35 },
    ],
    rating: 4.9,
    reviews: [
      { id: 5, clientName: 'James', rating: 5, comment: 'Best barber in town!', date: '2024-01-14' },
      { id: 6, clientName: 'Tom', rating: 5, comment: 'Incredible attention to detail.', date: '2024-01-11' },
    ],
    availability: [
      { day: 'Monday', hours: '10:00 AM - 8:00 PM' },
      { day: 'Tuesday', hours: '10:00 AM - 8:00 PM' },
      { day: 'Wednesday', hours: '10:00 AM - 8:00 PM' },
      { day: 'Thursday', hours: '10:00 AM - 8:00 PM' },
      { day: 'Friday', hours: '10:00 AM - 8:00 PM' },
      { day: 'Saturday', hours: '11:00 AM - 6:00 PM' },
    ],
    skills: ['Precision Cuts', 'Beard Sculpting', 'Hair Art', 'Consultation'],
    experience: '12 years',
    bio: 'Master barber with over a decade of experience in creating unique styles.',
    // New rental properties
    hasShop: true,
    shopId: 2,
    isRentingSpace: true,
  },
  {
    id: 4,
    name: 'Thabo Ndlovu',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9068, lng: 18.4111 }, // Observatory
    address: '321 Lower Main Road, Observatory, Cape Town, 7925',
    services: [
      { name: 'Haircut', price: 90, duration: 30 },
      { name: 'Beard Trim', price: 50, duration: 20 },
      { name: 'Student Discount', price: 80, duration: 30 },
    ],
    rating: 4.7,
    reviews: [
      { id: 7, clientName: 'Lerato', rating: 5, comment: 'Great value for students!', date: '2024-01-13' },
      { id: 8, clientName: 'Chris', rating: 4, comment: 'Friendly service, good cuts.', date: '2024-01-09' },
    ],
    availability: [
      { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    ],
    skills: ['Student Cuts', 'Budget Friendly', 'Quick Service', 'Walk-ins'],
    experience: '3 years',
    bio: 'Student-friendly barber offering quality cuts at affordable prices.',
    // New rental properties
    hasShop: false,
    isRentingSpace: true,
    currentRental: 2,
  },
  {
    id: 5,
    name: 'Jake Williams',
    photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9591, lng: 18.4607 }, // Camps Bay
    address: '567 Victoria Road, Camps Bay, Cape Town, 8005',
    services: [
      { name: 'Luxury Haircut', price: 350, duration: 45 },
      { name: 'Beard Sculpting', price: 180, duration: 35 },
      { name: 'VIP Package', price: 480, duration: 90 },
    ],
    rating: 4.9,
    reviews: [
      { id: 9, clientName: 'Michael', rating: 5, comment: 'Luxury experience worth every penny!', date: '2024-01-16' },
      { id: 10, clientName: 'Robert', rating: 5, comment: 'Premium service in a beautiful location.', date: '2024-01-12' },
    ],
    availability: [
      { day: 'Monday', hours: '10:00 AM - 7:00 PM' },
      { day: 'Tuesday', hours: '10:00 AM - 7:00 PM' },
      { day: 'Wednesday', hours: '10:00 AM - 7:00 PM' },
      { day: 'Thursday', hours: '10:00 AM - 7:00 PM' },
      { day: 'Friday', hours: '10:00 AM - 7:00 PM' },
      { day: 'Saturday', hours: '11:00 AM - 6:00 PM' },
    ],
    skills: ['Luxury Cuts', 'Premium Service', 'Beard Artistry', 'VIP Experience'],
    experience: '15 years',
    bio: 'Premium barber offering luxury grooming experiences in the heart of Camps Bay.',
    // New rental properties
    hasShop: true,
    shopId: 3,
    isRentingSpace: false,
  },
  {
    id: 6,
    name: 'Lungile Dlamini',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9719, lng: 18.4671 }, // Hout Bay
    address: '789 Main Road, Hout Bay, Cape Town, 7806',
    services: [
      { name: 'Haircut', price: 130, duration: 30 },
      { name: 'Beard Trim', price: 70, duration: 20 },
      { name: 'Family Package', price: 320, duration: 120 },
    ],
    rating: 4.5,
    reviews: [
      { id: 11, clientName: 'Sipho', rating: 4, comment: 'Great family barber, very patient.', date: '2024-01-15' },
      { id: 12, clientName: 'Nomsa', rating: 5, comment: 'Perfect for the whole family!', date: '2024-01-10' },
    ],
    availability: [
      { day: 'Monday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Thursday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Saturday', hours: '9:00 AM - 5:00 PM' },
    ],
    skills: ['Family Cuts', 'Kids Specialists', 'Beard Grooming', 'Walk-ins'],
    experience: '6 years',
    bio: 'Family-oriented barber providing quality cuts for all ages in Hout Bay.',
    // New rental properties
    hasShop: false,
    isRentingSpace: false,
  },
  // New additional barbers
  {
    id: 7,
    name: 'Kabelo Mokoena',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9150, lng: 18.4150 }, // Woodstock
    address: '456 Albert Road, Woodstock, Cape Town, 7925',
    services: [
      { name: 'Haircut', price: 110, duration: 25 },
      { name: 'Beard Trim', price: 60, duration: 15 },
      { name: 'Quick Fade', price: 90, duration: 20 },
    ],
    rating: 4.3,
    reviews: [
      { id: 13, clientName: 'Themba', rating: 4, comment: 'Fast and efficient service.', date: '2024-01-14' },
      { id: 14, clientName: 'Lebo', rating: 5, comment: 'Great value for money!', date: '2024-01-11' },
    ],
    availability: [
      { day: 'Monday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Thursday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Saturday', hours: '9:00 AM - 3:00 PM' },
    ],
    skills: ['Quick Cuts', 'Fade Specialist', 'Budget Friendly', 'Walk-ins'],
    experience: '4 years',
    bio: 'Efficient barber specializing in quick, quality cuts for busy professionals.',
    hasShop: false,
    isRentingSpace: true,
    currentRental: 4,
  },
  {
    id: 8,
    name: 'David Chen',
    photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9350, lng: 18.4350 }, // Gardens
    address: '123 Kloof Street, Gardens, Cape Town, 8001',
    services: [
      { name: 'Haircut', price: 200, duration: 45 },
      { name: 'Beard Trim', price: 120, duration: 30 },
      { name: 'Hair & Beard Package', price: 280, duration: 60 },
    ],
    rating: 4.7,
    reviews: [
      { id: 15, clientName: 'Andrew', rating: 5, comment: 'Excellent attention to detail.', date: '2024-01-16' },
      { id: 16, clientName: 'Simon', rating: 4, comment: 'Professional service in a great location.', date: '2024-01-13' },
    ],
    availability: [
      { day: 'Monday', hours: '9:00 AM - 7:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 7:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 7:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 7:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 7:00 PM' },
      { day: 'Saturday', hours: '10:00 AM - 5:00 PM' },
    ],
    skills: ['Precision Cuts', 'Beard Sculpting', 'Hair Styling', 'Consultation'],
    experience: '10 years',
    bio: 'Artistic barber creating unique styles that reflect each client\'s personality.',
    hasShop: true,
    shopId: 4,
    isRentingSpace: true,
  },
  {
    id: 9,
    name: 'Miguel Santos',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9450, lng: 18.4450 }, // Tamboerskloof
    address: '789 Kloof Nek Road, Tamboerskloof, Cape Town, 8001',
    services: [
      { name: 'Haircut', price: 140, duration: 35 },
      { name: 'Beard Trim', price: 80, duration: 25 },
      { name: 'Kids Haircut', price: 100, duration: 25 },
    ],
    rating: 4.6,
    reviews: [
      { id: 17, clientName: 'Carlos', rating: 5, comment: 'Great with kids and adults alike!', date: '2024-01-15' },
      { id: 18, clientName: 'Maria', rating: 4, comment: 'Patient and skilled barber.', date: '2024-01-12' },
    ],
    availability: [
      { day: 'Monday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Thursday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    ],
    skills: ['Family Cuts', 'Kids Specialist', 'Beard Grooming', 'Walk-ins'],
    experience: '7 years',
    bio: 'Family-focused barber providing quality cuts for all ages in a welcoming environment.',
    hasShop: false,
    isRentingSpace: true,
    currentRental: 5,
  },
  {
    id: 10,
    name: 'Ahmed Hassan',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    location: { lat: -33.9550, lng: 18.4550 }, // Vredehoek
    address: '456 Molteno Road, Vredehoek, Cape Town, 8001',
    services: [
      { name: 'Haircut', price: 130, duration: 30 },
      { name: 'Beard Trim', price: 70, duration: 20 },
      { name: 'Haircut + Beard', price: 180, duration: 45 },
    ],
    rating: 4.4,
    reviews: [
      { id: 19, clientName: 'Omar', rating: 4, comment: 'Good service, fair prices.', date: '2024-01-14' },
      { id: 20, clientName: 'Yusuf', rating: 5, comment: 'Very professional and clean.', date: '2024-01-10' },
    ],
    availability: [
      { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    ],
    skills: ['Classic Cuts', 'Beard Grooming', 'Quick Service', 'Walk-ins'],
    experience: '6 years',
    bio: 'Traditional barber providing classic cuts and excellent beard grooming services.',
    hasShop: false,
    isRentingSpace: false,
  }
];

// Mock data for barber shops
const mockBarberShops = [
  {
    id: 1,
    name: 'Sipho\'s Barber Shop',
    owner: 'Sipho Maseko',
    location: { lat: -33.9249, lng: 18.4241 },
    address: '123 Long Street, Cape Town CBD, 8001',
    description: 'Modern barber shop in the heart of Cape Town CBD',
    amenities: ['Air Conditioning', 'WiFi', 'TV', 'Coffee Bar', 'Parking'],
    totalStations: 4,
    availableStations: 1,
    monthlyRent: 3500,
    utilities: 500,
    deposit: 2000,
    contractLength: '12 months',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 123 4567',
      email: 'sipho@barbershop.co.za'
    }
  },
  {
    id: 2,
    name: 'Alex\'s Premium Cuts',
    owner: 'Alex Rodriguez',
    location: { lat: -33.9289, lng: 18.4174 },
    address: '789 Beach Road, Sea Point, Cape Town, 8005',
    description: 'Luxury barber shop with premium facilities',
    amenities: ['Premium Chairs', 'Private Rooms', 'WiFi', 'Refreshments', 'Valet Parking'],
    totalStations: 3,
    availableStations: 1,
    monthlyRent: 4500,
    utilities: 600,
    deposit: 3000,
    contractLength: '12 months',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 987 6543',
      email: 'alex@premiumcuts.co.za'
    }
  },
  {
    id: 3,
    name: 'Jake\'s Luxury Grooming',
    owner: 'Jake Williams',
    location: { lat: -33.9591, lng: 18.4607 },
    address: '567 Victoria Road, Camps Bay, Cape Town, 8005',
    description: 'Exclusive grooming salon in Camps Bay',
    amenities: ['Ocean View', 'Premium Equipment', 'WiFi', 'Champagne Service', 'Secure Parking'],
    totalStations: 2,
    availableStations: 0,
    monthlyRent: 6000,
    utilities: 800,
    deposit: 4000,
    contractLength: '12 months',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 555 1234',
      email: 'jake@luxurygrooming.co.za'
    }
  },
  // New additional barber shops
  {
    id: 4,
    name: 'David\'s Artistic Cuts',
    owner: 'David Chen',
    location: { lat: -33.9350, lng: 18.4350 },
    address: '123 Kloof Street, Gardens, Cape Town, 8001',
    description: 'Creative barber shop in the trendy Gardens district',
    amenities: ['Art Gallery', 'WiFi', 'Coffee Bar', 'Outdoor Seating', 'Street Parking'],
    totalStations: 3,
    availableStations: 1,
    monthlyRent: 3800,
    utilities: 450,
    deposit: 2500,
    contractLength: '12 months',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 456 7890',
      email: 'david@artisticcuts.co.za'
    }
  },
  {
    id: 5,
    name: 'Woodstock Barber Collective',
    owner: 'Kabelo Mokoena',
    location: { lat: -33.9150, lng: 18.4150 },
    address: '456 Albert Road, Woodstock, Cape Town, 7925',
    description: 'Community-focused barber shop in the heart of Woodstock',
    amenities: ['Community Space', 'WiFi', 'Local Art', 'Street Food Nearby', 'Public Transport'],
    totalStations: 2,
    availableStations: 1,
    monthlyRent: 2800,
    utilities: 300,
    deposit: 1500,
    contractLength: '6 months',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 789 0123',
      email: 'kabelo@woodstockbarber.co.za'
    }
  },
  {
    id: 6,
    name: 'Tamboerskloof Family Cuts',
    owner: 'Miguel Santos',
    location: { lat: -33.9450, lng: 18.4450 },
    address: '789 Kloof Nek Road, Tamboerskloof, Cape Town, 8001',
    description: 'Family-friendly barber shop with a warm atmosphere',
    amenities: ['Kids Play Area', 'WiFi', 'Family Room', 'Street Parking', 'Near Schools'],
    totalStations: 2,
    availableStations: 1,
    monthlyRent: 3200,
    utilities: 400,
    deposit: 2000,
    contractLength: '12 months',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 321 6540',
      email: 'miguel@familycuts.co.za'
    }
  },
  {
    id: 7,
    name: 'Vredehoek Traditional Barbers',
    owner: 'Ahmed Hassan',
    location: { lat: -33.9550, lng: 18.4550 },
    address: '456 Molteno Road, Vredehoek, Cape Town, 8001',
    description: 'Traditional barber shop preserving classic techniques',
    amenities: ['Traditional Tools', 'WiFi', 'Tea Service', 'Street Parking', 'Mountain Views'],
    totalStations: 1,
    availableStations: 0,
    monthlyRent: 2500,
    utilities: 250,
    deposit: 1500,
    contractLength: '12 months',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 654 3210',
      email: 'ahmed@traditionalbarbers.co.za'
    }
  },
  {
    id: 8,
    name: 'Observatory Student Barbers',
    owner: 'Thabo Ndlovu',
    location: { lat: -33.9068, lng: 18.4111 },
    address: '321 Lower Main Road, Observatory, Cape Town, 7925',
    description: 'Student-friendly barber shop with budget prices',
    amenities: ['Student Discounts', 'WiFi', 'Study Space', 'Street Parking', 'Near Universities'],
    totalStations: 2,
    availableStations: 1,
    monthlyRent: 2200,
    utilities: 200,
    deposit: 1000,
    contractLength: '6 months',
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 147 2580',
      email: 'thabo@studentbarbers.co.za'
    }
  }
];

// Mock data for rental listings
const mockRentalListings = [
  {
    id: 1,
    shopId: 1,
    shopName: 'Sipho\'s Barber Shop',
    owner: 'Sipho Maseko',
    location: { lat: -33.9249, lng: 18.4241 },
    address: '123 Long Street, Cape Town CBD, 8001',
    description: 'Modern barber shop in the heart of Cape Town CBD',
    monthlyRent: 3500,
    utilities: 500,
    deposit: 2000,
    contractLength: '12 months',
    availableFrom: '2024-02-01',
    amenities: ['Air Conditioning', 'WiFi', 'TV', 'Coffee Bar', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 123 4567',
      email: 'sipho@barbershop.co.za'
    },
    status: 'available', // available, rented, pending
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    shopId: 2,
    shopName: 'Alex\'s Premium Cuts',
    owner: 'Alex Rodriguez',
    location: { lat: -33.9289, lng: 18.4174 },
    address: '789 Beach Road, Sea Point, Cape Town, 8005',
    description: 'Luxury barber shop with premium facilities',
    monthlyRent: 4500,
    utilities: 600,
    deposit: 3000,
    contractLength: '12 months',
    availableFrom: '2024-02-15',
    amenities: ['Premium Chairs', 'Private Rooms', 'WiFi', 'Refreshments', 'Valet Parking'],
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 987 6543',
      email: 'alex@premiumcuts.co.za'
    },
    status: 'available',
    createdAt: '2024-01-20'
  },
  // New additional rental listings
  {
    id: 3,
    shopId: 4,
    shopName: 'David\'s Artistic Cuts',
    owner: 'David Chen',
    location: { lat: -33.9350, lng: 18.4350 },
    address: '123 Kloof Street, Gardens, Cape Town, 8001',
    description: 'Creative barber shop in the trendy Gardens district',
    monthlyRent: 3800,
    utilities: 450,
    deposit: 2500,
    contractLength: '12 months',
    availableFrom: '2024-02-20',
    amenities: ['Art Gallery', 'WiFi', 'Coffee Bar', 'Outdoor Seating', 'Street Parking'],
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 456 7890',
      email: 'david@artisticcuts.co.za'
    },
    status: 'available',
    createdAt: '2024-01-25'
  },
  {
    id: 4,
    shopId: 5,
    shopName: 'Woodstock Barber Collective',
    owner: 'Kabelo Mokoena',
    location: { lat: -33.9150, lng: 18.4150 },
    address: '456 Albert Road, Woodstock, Cape Town, 7925',
    description: 'Community-focused barber shop in the heart of Woodstock',
    monthlyRent: 2800,
    utilities: 300,
    deposit: 1500,
    contractLength: '6 months',
    availableFrom: '2024-03-01',
    amenities: ['Community Space', 'WiFi', 'Local Art', 'Street Food Nearby', 'Public Transport'],
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 789 0123',
      email: 'kabelo@woodstockbarber.co.za'
    },
    status: 'available',
    createdAt: '2024-01-28'
  },
  {
    id: 5,
    shopId: 6,
    shopName: 'Tamboerskloof Family Cuts',
    owner: 'Miguel Santos',
    location: { lat: -33.9450, lng: 18.4450 },
    address: '789 Kloof Nek Road, Tamboerskloof, Cape Town, 8001',
    description: 'Family-friendly barber shop with a warm atmosphere',
    monthlyRent: 3200,
    utilities: 400,
    deposit: 2000,
    contractLength: '12 months',
    availableFrom: '2024-02-10',
    amenities: ['Kids Play Area', 'WiFi', 'Family Room', 'Street Parking', 'Near Schools'],
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 321 6540',
      email: 'miguel@familycuts.co.za'
    },
    status: 'available',
    createdAt: '2024-01-30'
  },
  {
    id: 6,
    shopId: 8,
    shopName: 'Observatory Student Barbers',
    owner: 'Thabo Ndlovu',
    location: { lat: -33.9068, lng: 18.4111 },
    address: '321 Lower Main Road, Observatory, Cape Town, 7925',
    description: 'Student-friendly barber shop with budget prices',
    monthlyRent: 2200,
    utilities: 200,
    deposit: 1000,
    contractLength: '6 months',
    availableFrom: '2024-03-15',
    amenities: ['Student Discounts', 'WiFi', 'Study Space', 'Street Parking', 'Near Universities'],
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 147 2580',
      email: 'thabo@studentbarbers.co.za'
    },
    status: 'available',
    createdAt: '2024-02-01'
  },
  {
    id: 7,
    shopId: 1,
    shopName: 'Sipho\'s Barber Shop',
    owner: 'Sipho Maseko',
    location: { lat: -33.9249, lng: 18.4241 },
    address: '123 Long Street, Cape Town CBD, 8001',
    description: 'Second station available in our busy CBD location',
    monthlyRent: 3200,
    utilities: 400,
    deposit: 1800,
    contractLength: '6 months',
    availableFrom: '2024-02-28',
    amenities: ['Air Conditioning', 'WiFi', 'TV', 'Coffee Bar', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 123 4567',
      email: 'sipho@barbershop.co.za'
    },
    status: 'available',
    createdAt: '2024-02-02'
  },
  {
    id: 8,
    shopId: 4,
    shopName: 'David\'s Artistic Cuts',
    owner: 'David Chen',
    location: { lat: -33.9350, lng: 18.4350 },
    address: '123 Kloof Street, Gardens, Cape Town, 8001',
    description: 'Creative space for artistic barbers in trendy Gardens',
    monthlyRent: 4200,
    utilities: 500,
    deposit: 2800,
    contractLength: '12 months',
    availableFrom: '2024-03-01',
    amenities: ['Art Gallery', 'WiFi', 'Coffee Bar', 'Outdoor Seating', 'Street Parking'],
    images: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop'
    ],
    contact: {
      phone: '+27 21 456 7890',
      email: 'david@artisticcuts.co.za'
    },
    status: 'pending',
    createdAt: '2024-02-03'
  }
];

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize with mock data
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_BARBERS, payload: mockBarbers });
    dispatch({ type: ACTIONS.SET_BARBER_SHOPS, payload: mockBarberShops });
    dispatch({ type: ACTIONS.SET_RENTAL_LISTINGS, payload: mockRentalListings });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch({
            type: ACTIONS.SET_LOCATION,
            payload: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          // Default to Cape Town
          dispatch({
            type: ACTIONS.SET_LOCATION,
            payload: { lat: -33.9249, lng: 18.4241 },
          });
        }
      );
    }
  }, []);

  // Actions
  const actions = {
    setUser: (user) => dispatch({ type: ACTIONS.SET_USER, payload: user }),
    setUserType: (userType) => dispatch({ type: ACTIONS.SET_USER_TYPE, payload: userType }),
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    addBooking: (booking) => dispatch({ type: ACTIONS.ADD_BOOKING, payload: booking }),
    updateBooking: (booking) => dispatch({ type: ACTIONS.UPDATE_BOOKING, payload: booking }),
    addReview: (barberId, review) => dispatch({ type: ACTIONS.ADD_REVIEW, payload: { barberId, review } }),
    // New rental actions
    addRentalListing: (listing) => dispatch({ type: ACTIONS.ADD_RENTAL_LISTING, payload: listing }),
    updateRentalListing: (listing) => dispatch({ type: ACTIONS.UPDATE_RENTAL_LISTING, payload: listing }),
    removeRentalListing: (id) => dispatch({ type: ACTIONS.REMOVE_RENTAL_LISTING, payload: id }),
    addBarberShop: (shop) => dispatch({ type: ACTIONS.ADD_BARBER_SHOP, payload: shop }),
    addRentalRequest: (request) => dispatch({ type: ACTIONS.ADD_RENTAL_REQUEST, payload: request }),
    updateRentalRequest: (request) => dispatch({ type: ACTIONS.UPDATE_RENTAL_REQUEST, payload: request }),
  };

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 