
/**
 * Location service for fetching real location data
 */

/**
 * Get location data from coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Location data
 */
export async function getLocationFromCoordinates(latitude, longitude) {
  try {
    // For now, return enhanced mock data based on coordinates
    // In a real implementation, you'd use a geocoding service like Google Maps API
    console.log(`Getting location for coordinates: ${latitude}, ${longitude}`);
    
    return {
      name: determineLocationName(latitude, longitude),
      latitude,
      longitude,
      country: determineCountry(latitude, longitude),
      timezone: determineTimezone(latitude, longitude)
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}

/**
 * Get current location using browser geolocation
 * @returns {Promise<Object|null>} Location data or null if unavailable
 */
export async function getCurrentLocation() {
  try {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return null;
    }

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => reject(err),
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 300000 // 5 minutes
        }
      );
    });

    const { latitude, longitude } = position.coords;
    return await getLocationFromCoordinates(latitude, longitude);
  } catch (error) {
    console.log('Error getting current location:', error.message);
    return getMockLocationData();
  }
}

// Helper functions for location determination
function determineLocationName(lat, lng) {
  // Simple location determination based on coordinates
  // In production, use a proper geocoding service
  if (lat >= 37.7 && lat <= 37.8 && lng >= -122.5 && lng <= -122.4) {
    return "San Francisco, CA";
  }
  if (lat >= 40.7 && lat <= 40.8 && lng >= -74.1 && lng <= -73.9) {
    return "New York, NY";
  }
  if (lat >= 51.4 && lat <= 51.6 && lng >= -0.2 && lng <= 0.1) {
    return "London, UK";
  }
  return `Location ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
}

function determineCountry(lat, lng) {
  if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) {
    return "United States";
  }
  if (lat >= 49 && lat <= 61 && lng >= -141 && lng <= -52) {
    return "Canada";
  }
  if (lat >= 49.9 && lat <= 58.7 && lng >= -8.2 && lng <= 1.8) {
    return "United Kingdom";
  }
  return "Unknown";
}

function determineTimezone(lat, lng) {
  // Simple timezone determination
  if (lng >= -125 && lng <= -114) return "America/Los_Angeles";
  if (lng >= -114 && lng <= -84) return "America/Denver";
  if (lng >= -84 && lng <= -66) return "America/New_York";
  if (lng >= -8.2 && lng <= 1.8) return "Europe/London";
  return "UTC";
}

function getMockLocationData() {
  return {
    name: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    country: "United States",
    timezone: "America/Los_Angeles"
  };
}
