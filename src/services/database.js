import { openDB } from 'idb';

const DB_NAME = 'leBarberDB';
const DB_VERSION = 2; // Increment version for new stores

// Database schema
const STORES = {
  users: 'users',
  barbers: 'barbers',
  bookings: 'bookings',
  rentals: 'rentals',
  reviews: 'reviews',
  invitations: 'invitations',
  bookingRequests: 'bookingRequests'
};

class LeBarberDatabase {
  constructor() {
    this.db = null;
  }

  // Initialize database
  async init() {
    if (this.db) return this.db;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        // Create stores
        if (!db.objectStoreNames.contains(STORES.users)) {
          const userStore = db.createObjectStore(STORES.users, { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('userType', 'userType', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.barbers)) {
          const barberStore = db.createObjectStore(STORES.barbers, { keyPath: 'id' });
          barberStore.createIndex('userId', 'userId', { unique: true });
          barberStore.createIndex('location', 'location', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.bookings)) {
          const bookingStore = db.createObjectStore(STORES.bookings, { keyPath: 'id' });
          bookingStore.createIndex('clientId', 'clientId', { unique: false });
          bookingStore.createIndex('barberId', 'barberId', { unique: false });
          bookingStore.createIndex('date', 'date', { unique: false });
          bookingStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.rentals)) {
          const rentalStore = db.createObjectStore(STORES.rentals, { keyPath: 'id' });
          rentalStore.createIndex('barberId', 'barberId', { unique: false });
          rentalStore.createIndex('location', 'location', { unique: false });
          rentalStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.reviews)) {
          const reviewStore = db.createObjectStore(STORES.reviews, { keyPath: 'id' });
          reviewStore.createIndex('barberId', 'barberId', { unique: false });
          reviewStore.createIndex('clientId', 'clientId', { unique: false });
        }

        // New stores for version 2
        if (!db.objectStoreNames.contains(STORES.invitations)) {
          const invitationStore = db.createObjectStore(STORES.invitations, { keyPath: 'id' });
          invitationStore.createIndex('inviterId', 'inviterId', { unique: false });
          invitationStore.createIndex('inviteeEmail', 'inviteeEmail', { unique: false });
          invitationStore.createIndex('code', 'code', { unique: true });
          invitationStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.bookingRequests)) {
          const requestStore = db.createObjectStore(STORES.bookingRequests, { keyPath: 'id' });
          requestStore.createIndex('clientId', 'clientId', { unique: false });
          requestStore.createIndex('status', 'status', { unique: false });
          requestStore.createIndex('location', 'location', { unique: false });
          requestStore.createIndex('maxPrice', 'maxPrice', { unique: false });
        }
      }
    });

    return this.db;
  }

  // User operations
  async createUser(userData) {
    await this.init();
    const user = {
      id: userData.id || `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      userType: userData.userType,
      isGoogleUser: userData.isGoogleUser || false,
      picture: userData.picture,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Additional fields based on user type
      ...(userData.userType === 'barber' ? {
        businessName: userData.businessName || '',
        services: userData.services || [],
        location: userData.location || null,
        availability: userData.availability || [],
        pricing: userData.pricing || {},
        portfolio: userData.portfolio || [],
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        invitationCode: userData.invitationCode || null
      } : {
        preferences: {
          preferredServices: userData.preferredServices || [],
          maxDistance: userData.maxDistance || 10,
          priceRange: userData.priceRange || 'any'
        },
        bookingHistory: []
      })
    };

    await this.db.add(STORES.users, user);
    return user;
  }

  async getUserById(id) {
    await this.init();
    return await this.db.get(STORES.users, id);
  }

  async getUserByEmail(email) {
    await this.init();
    const tx = this.db.transaction(STORES.users, 'readonly');
    const store = tx.objectStore(STORES.users);
    const index = store.index('email');
    return await index.get(email);
  }

  async updateUser(id, updates) {
    await this.init();
    const user = await this.getUserById(id);
    if (!user) throw new Error('User not found');

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.db.put(STORES.users, updatedUser);
    return updatedUser;
  }

  async deleteUser(id) {
    await this.init();
    await this.db.delete(STORES.users, id);
  }

  async getAllUsers() {
    await this.init();
    return await this.db.getAll(STORES.users);
  }

  async getUsersByType(userType) {
    await this.init();
    const tx = this.db.transaction(STORES.users, 'readonly');
    const store = tx.objectStore(STORES.users);
    const index = store.index('userType');
    return await index.getAll(userType);
  }

  // Barber operations
  async createBarber(barberData) {
    await this.init();
    const barber = {
      id: barberData.id || `barber_${Date.now()}`,
      userId: barberData.userId,
      name: barberData.name,
      businessName: barberData.businessName,
      email: barberData.email,
      phone: barberData.phone,
      location: barberData.location,
      services: barberData.services || [],
      pricing: barberData.pricing || {},
      availability: barberData.availability || [],
      portfolio: barberData.portfolio || [],
      rating: barberData.rating || 0,
      reviewCount: barberData.reviewCount || 0,
      picture: barberData.picture,
      isVerified: barberData.isVerified || false,
      invitationCode: barberData.invitationCode || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.db.add(STORES.barbers, barber);
    return barber;
  }

  async getBarberById(id) {
    await this.init();
    return await this.db.get(STORES.barbers, id);
  }

  async getBarberByUserId(userId) {
    await this.init();
    const tx = this.db.transaction(STORES.barbers, 'readonly');
    const store = tx.objectStore(STORES.barbers);
    const index = store.index('userId');
    return await index.get(userId);
  }

  async updateBarber(id, updates) {
    await this.init();
    const barber = await this.getBarberById(id);
    if (!barber) throw new Error('Barber not found');

    const updatedBarber = {
      ...barber,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.db.put(STORES.barbers, updatedBarber);
    return updatedBarber;
  }

  async getAllBarbers() {
    await this.init();
    return await this.db.getAll(STORES.barbers);
  }

  async getBarbersByLocation(location, maxDistance = 10) {
    await this.init();
    const barbers = await this.getAllBarbers();
    
    return barbers.filter(barber => {
      if (!barber.location || !location) return false;
      
      const distance = this.calculateDistance(
        location.lat, location.lng,
        barber.location.lat, barber.location.lng
      );
      
      return distance <= maxDistance;
    });
  }

  // Booking operations
  async createBooking(bookingData) {
    await this.init();
    const booking = {
      id: bookingData.id || `booking_${Date.now()}`,
      clientId: bookingData.clientId,
      barberId: bookingData.barberId,
      service: bookingData.service,
      date: bookingData.date,
      time: bookingData.time,
      duration: bookingData.duration,
      price: bookingData.price,
      status: bookingData.status || 'pending',
      notes: bookingData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.db.add(STORES.bookings, booking);
    return booking;
  }

  async getBookingById(id) {
    await this.init();
    return await this.db.get(STORES.bookings, id);
  }

  async getBookingsByClient(clientId) {
    await this.init();
    const tx = this.db.transaction(STORES.bookings, 'readonly');
    const store = tx.objectStore(STORES.bookings);
    const index = store.index('clientId');
    return await index.getAll(clientId);
  }

  async getBookingsByBarber(barberId) {
    await this.init();
    const tx = this.db.transaction(STORES.bookings, 'readonly');
    const store = tx.objectStore(STORES.bookings);
    const index = store.index('barberId');
    return await index.getAll(barberId);
  }

  async getBookingsByStatus(status) {
    await this.init();
    const tx = this.db.transaction(STORES.bookings, 'readonly');
    const store = tx.objectStore(STORES.bookings);
    const index = store.index('status');
    return await index.getAll(status);
  }

  async updateBooking(id, updates) {
    await this.init();
    const booking = await this.getBookingById(id);
    if (!booking) throw new Error('Booking not found');

    const updatedBooking = {
      ...booking,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.db.put(STORES.bookings, updatedBooking);
    return updatedBooking;
  }

  // Rental operations
  async createRental(rentalData) {
    await this.init();
    const rental = {
      id: rentalData.id || `rental_${Date.now()}`,
      barberId: rentalData.barberId,
      title: rentalData.title,
      description: rentalData.description,
      address: rentalData.address,
      location: rentalData.location,
      price: rentalData.price,
      priceType: rentalData.priceType || 'per_day', // per_day, per_week, per_month
      amenities: rentalData.amenities || [],
      images: rentalData.images || [],
      status: rentalData.status || 'available',
      contactInfo: rentalData.contactInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.db.add(STORES.rentals, rental);
    return rental;
  }

  async getRentalById(id) {
    await this.init();
    return await this.db.get(STORES.rentals, id);
  }

  async getRentalsByBarber(barberId) {
    await this.init();
    const tx = this.db.transaction(STORES.rentals, 'readonly');
    const store = tx.objectStore(STORES.rentals);
    const index = store.index('barberId');
    return await index.getAll(barberId);
  }

  async getAllRentals() {
    await this.init();
    return await this.db.getAll(STORES.rentals);
  }

  async updateRental(id, updates) {
    await this.init();
    const rental = await this.getRentalById(id);
    if (!rental) throw new Error('Rental not found');

    const updatedRental = {
      ...rental,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.db.put(STORES.rentals, updatedRental);
    return updatedRental;
  }

  // Invitation operations
  async createInvitation(invitationData) {
    await this.init();
    const invitation = {
      id: invitationData.id || `invitation_${Date.now()}`,
      inviterId: invitationData.inviterId,
      inviterName: invitationData.inviterName,
      inviterEmail: invitationData.inviterEmail,
      inviteeEmail: invitationData.inviteeEmail,
      code: invitationData.code,
      status: invitationData.status || 'pending', // pending, accepted, expired
      expiresAt: invitationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString()
    };

    await this.db.add(STORES.invitations, invitation);
    return invitation;
  }

  async getInvitationByCode(code) {
    await this.init();
    const tx = this.db.transaction(STORES.invitations, 'readonly');
    const store = tx.objectStore(STORES.invitations);
    const index = store.index('code');
    return await index.get(code);
  }

  async getInvitationsByInviter(inviterId) {
    await this.init();
    const tx = this.db.transaction(STORES.invitations, 'readonly');
    const store = tx.objectStore(STORES.invitations);
    const index = store.index('inviterId');
    return await index.getAll(inviterId);
  }

  async updateInvitation(id, updates) {
    await this.init();
    const invitation = await this.db.get(STORES.invitations, id);
    if (!invitation) throw new Error('Invitation not found');

    const updatedInvitation = {
      ...invitation,
      ...updates
    };

    await this.db.put(STORES.invitations, updatedInvitation);
    return updatedInvitation;
  }

  // Booking Request operations
  async createBookingRequest(requestData) {
    await this.init();
    const request = {
      id: requestData.id || `request_${Date.now()}`,
      clientId: requestData.clientId,
      clientName: requestData.clientName,
      clientEmail: requestData.clientEmail,
      service: requestData.service,
      preferredDate: requestData.preferredDate,
      preferredTime: requestData.preferredTime,
      maxPrice: requestData.maxPrice,
      location: requestData.location,
      notes: requestData.notes || '',
      status: requestData.status || 'pending', // pending, accepted, declined, expired
      acceptedBy: requestData.acceptedBy || null,
      acceptedAt: requestData.acceptedAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.db.add(STORES.bookingRequests, request);
    return request;
  }

  async getBookingRequestById(id) {
    await this.init();
    return await this.db.get(STORES.bookingRequests, id);
  }

  async getBookingRequestsByClient(clientId) {
    await this.init();
    const tx = this.db.transaction(STORES.bookingRequests, 'readonly');
    const store = tx.objectStore(STORES.bookingRequests);
    const index = store.index('clientId');
    return await index.getAll(clientId);
  }

  async getPendingBookingRequests() {
    await this.init();
    const tx = this.db.transaction(STORES.bookingRequests, 'readonly');
    const store = tx.objectStore(STORES.bookingRequests);
    const index = store.index('status');
    return await index.getAll('pending');
  }

  async updateBookingRequest(id, updates) {
    await this.init();
    const request = await this.getBookingRequestById(id);
    if (!request) throw new Error('Booking request not found');

    const updatedRequest = {
      ...request,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.db.put(STORES.bookingRequests, updatedRequest);
    return updatedRequest;
  }

  // Review operations
  async createReview(reviewData) {
    await this.init();
    const review = {
      id: reviewData.id || `review_${Date.now()}`,
      clientId: reviewData.clientId,
      barberId: reviewData.barberId,
      rating: reviewData.rating,
      comment: reviewData.comment || '',
      createdAt: new Date().toISOString()
    };

    await this.db.add(STORES.reviews, review);
    
    // Update barber's average rating
    await this.updateBarberRating(reviewData.barberId);
    
    return review;
  }

  async getReviewsByBarber(barberId) {
    await this.init();
    const tx = this.db.transaction(STORES.reviews, 'readonly');
    const store = tx.objectStore(STORES.reviews);
    const index = store.index('barberId');
    return await index.getAll(barberId);
  }

  async updateBarberRating(barberId) {
    const reviews = await this.getReviewsByBarber(barberId);
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.updateBarber(barberId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });
  }

  // Utility functions
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Export/Import data for portability
  async exportData() {
    await this.init();
    const data = {
      users: await this.db.getAll(STORES.users),
      barbers: await this.db.getAll(STORES.barbers),
      bookings: await this.db.getAll(STORES.bookings),
      rentals: await this.db.getAll(STORES.rentals),
      reviews: await this.db.getAll(STORES.reviews),
      invitations: await this.db.getAll(STORES.invitations),
      bookingRequests: await this.db.getAll(STORES.bookingRequests)
    };
    return data;
  }

  async importData(data) {
    await this.init();
    
    // Clear existing data
    await this.db.clear(STORES.users);
    await this.db.clear(STORES.barbers);
    await this.db.clear(STORES.bookings);
    await this.db.clear(STORES.rentals);
    await this.db.clear(STORES.reviews);
    await this.db.clear(STORES.invitations);
    await this.db.clear(STORES.bookingRequests);

    // Import new data
    if (data.users) {
      for (const user of data.users) {
        await this.db.add(STORES.users, user);
      }
    }

    if (data.barbers) {
      for (const barber of data.barbers) {
        await this.db.add(STORES.barbers, barber);
      }
    }

    if (data.bookings) {
      for (const booking of data.bookings) {
        await this.db.add(STORES.bookings, booking);
      }
    }

    if (data.rentals) {
      for (const rental of data.rentals) {
        await this.db.add(STORES.rentals, rental);
      }
    }

    if (data.reviews) {
      for (const review of data.reviews) {
        await this.db.add(STORES.reviews, review);
      }
    }

    if (data.invitations) {
      for (const invitation of data.invitations) {
        await this.db.add(STORES.invitations, invitation);
      }
    }

    if (data.bookingRequests) {
      for (const request of data.bookingRequests) {
        await this.db.add(STORES.bookingRequests, request);
      }
    }
  }

  // Clear all data
  async clearAll() {
    await this.init();
    await this.db.clear(STORES.users);
    await this.db.clear(STORES.barbers);
    await this.db.clear(STORES.bookings);
    await this.db.clear(STORES.rentals);
    await this.db.clear(STORES.reviews);
    await this.db.clear(STORES.invitations);
    await this.db.clear(STORES.bookingRequests);
  }
}

// Create singleton instance
const database = new LeBarberDatabase();

export default database; 