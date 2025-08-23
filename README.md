# 🪒 Le Barber - Find Your Perfect Barber

A modern, location-aware web application for finding and booking appointments with the best barbers in your area. Built with React, featuring interactive maps, real-time location services, and a seamless user experience.

## ✨ Features

### 🗺️ **Interactive Maps**
- **MapQuest.js Integration** - Powerful mapping with geolocation
- **Real-time Location Detection** - Automatically finds your current location
- **Nearby Barber Search** - Triangulates barbers near your location
- **Distance Calculations** - Shows how far each barber is from you

### 👥 **Dual User Types**
- **Client Mode** - Find barbers, book appointments, view bookings
- **Barber Mode** - Manage rental listings, view client bookings

### 🔍 **Smart Search & Filters**
- **Location-based Results** - Barbers sorted by proximity
- **Advanced Filtering** - By rating, services, availability
- **Real-time Search** - Instant results as you type

### 📱 **Responsive Design**
- **Mobile-First Approach** - Works perfectly on all devices
- **Modern UI/UX** - Beautiful, intuitive interface
- **Fast Performance** - Optimized for speed and reliability

## 🚀 Tech Stack

- **Frontend**: React.js with Hooks
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Maps**: MapQuest.js (Leaflet-based)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MapQuest API key (free)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd le-barber
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get MapQuest API Key**
   - Visit [MapQuest Developer Portal](https://developer.mapquest.com/)
   - Sign up for a free account
   - Get your API key

4. **Configure API Key**
   Replace `'YOUR_MAPQUEST_API_KEY'` in these files:
   - `src/pages/HomePage.js`
   - `src/pages/BarberList.js`
   - `src/pages/RentalListings.js`

5. **Start development server**
   ```bash
   npm start
   ```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_MAPQUEST_API_KEY=your_api_key_here
REACT_APP_ENVIRONMENT=development
```

## 📱 Usage

### **For Clients:**
1. Switch to "Client" mode in the header
2. Browse nearby barbers on the map
3. Filter by services, ratings, or distance
4. Book appointments with your preferred barber
5. View your booking history

### **For Barbers:**
1. Switch to "Barber" mode in the header
2. Access rental listings and management
3. View client bookings and schedules
4. Manage your barber profile

## 🚀 Deployment

### **Netlify (Recommended)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Netlify**
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `build`
   - Deploy!

### **Manual Build**
```bash
npm run build
# Upload the 'build' folder to your hosting provider
```

## 🔧 Configuration

### **MapQuest.js Settings**
- Default center: Cape Town, South Africa
- Zoom level: 12
- Tile layer: Standard map view
- Markers: User location + nearby barbers

### **Location Services**
- Automatic geolocation detection
- Fallback to Cape Town coordinates
- Distance calculation using Haversine formula

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Navigation and user type toggle
│   └── ...
├── context/            # React Context for state management
│   └── AppContext.js   # Global app state
├── pages/              # Main page components
│   ├── HomePage.js     # Landing page with map
│   ├── BarberList.js  # Barber search and listing
│   ├── RentalListings.js # Rental management
│   └── ...
├── utils/              # Utility functions
└── App.js              # Main app component
```

## 🎨 Customization

### **Styling**
- Modify `tailwind.config.js` for theme changes
- Update color schemes in CSS classes
- Customize component styling

### **Features**
- Add new user types
- Implement additional map layers
- Extend booking functionality
- Add payment integration

## 🐛 Troubleshooting

### **Map Not Loading**
- Check MapQuest API key configuration
- Ensure internet connection
- Check browser console for errors
- Verify MapQuest.js script loading

### **Location Issues**
- Allow location permissions in browser
- Check HTTPS requirement for geolocation
- Verify fallback coordinates

### **Build Errors**
- Clear `node_modules` and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MapQuest for mapping services
- React community for excellent tooling
- Tailwind CSS for beautiful styling
- Lucide for amazing icons

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Made with ❤️ for the barber community**
