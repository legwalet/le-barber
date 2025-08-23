// MapQuest API Configuration
// Get your free API key at: https://developer.mapquest.com/

export const MAPQUEST_CONFIG = {
  // Replace this with your actual MapQuest API key
  API_KEY: 'YOUR_MAPQUEST_API_KEY',
  
  // Default map center (Johannesburg, South Africa)
  DEFAULT_CENTER: [-26.2041, 28.0473],
  
  // Default zoom level
  DEFAULT_ZOOM: 12,
  
  // Map tile layer type
  TILE_LAYER: 'map', // Options: 'map', 'satellite', 'hybrid'
  
  // Map styles and appearance
  MAP_STYLES: {
    // You can customize map appearance here
    // Refer to MapQuest documentation for available options
  }
};

// Helper function to get MapQuest API key
export const getMapQuestKey = () => {
  const key = MAPQUEST_CONFIG.API_KEY;
  
  if (key === 'YOUR_MAPQUEST_API_KEY') {
    console.warn('⚠️ Please set your MapQuest API key in src/config/mapquest.js');
    console.warn('📝 Get your free API key at: https://developer.mapquest.com/');
    return null;
  }
  
  return key;
}; 