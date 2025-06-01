
/**
 * Location service for fetching real location data
 */

/**
 * Get current location using browser geolocation with IP fallback
 * @returns {Promise<Object|null>} Location data or null if unavailable
 */
export async function getCurrentLocation() {
  try {
    console.log('Attempting to get current location...');
    
    // First try browser geolocation (GPS)
    if (navigator.geolocation) {
      console.log('Browser geolocation available, requesting position...');
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.log('GPS location obtained:', pos.coords.latitude, pos.coords.longitude);
              resolve(pos);
            },
            (err) => {
              console.log('GPS location failed:', err.message);
              reject(err);
            },
            { 
              enableHighAccuracy: true, 
              timeout: 10000, 
              maximumAge: 300000 // 5 minutes
            }
          );
        });

        const { latitude, longitude } = position.coords;
        
        // Get location name from coordinates
        const locationName = await getLocationNameFromCoordinates(latitude, longitude);
        
        return {
          name: locationName,
          latitude,
          longitude,
          country: await getCountryFromCoordinates(latitude, longitude),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          source: 'gps'
        };
      } catch (geoError) {
        console.log('GPS geolocation failed, falling back to IP location');
      }
    }
    
    // Fallback to IP-based location
    console.log('Using IP-based location detection...');
    return await getLocationFromIP();
    
  } catch (error) {
    console.error('All location detection methods failed:', error);
    return getMockLocationData();
  }
}

/**
 * Get location from IP address
 */
async function getLocationFromIP() {
  try {
    console.log('Fetching location from IP...');
    
    // Try ipapi.co first (free, no API key needed)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      console.log('IP location obtained:', data.city, data.country_name);
      return {
        name: `${data.city}, ${data.region}`,
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country_name,
        timezone: data.timezone,
        source: 'ip'
      };
    }
    
    throw new Error('No valid IP location data received');
  } catch (error) {
    console.error('IP location failed:', error);
    
    // Try alternative IP service
    try {
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      
      if (data.loc) {
        const [lat, lng] = data.loc.split(',').map(Number);
        console.log('Alternative IP location obtained:', data.city, data.country);
        
        return {
          name: `${data.city}, ${data.region}`,
          latitude: lat,
          longitude: lng,
          country: data.country,
          timezone: data.timezone,
          source: 'ip-fallback'
        };
      }
    } catch (fallbackError) {
      console.error('IP fallback failed:', fallbackError);
    }
    
    return getMockLocationData();
  }
}

/**
 * Get location name from coordinates using reverse geocoding
 */
async function getLocationNameFromCoordinates(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      {
        headers: {
          'User-Agent': 'Lovable-Blog-Generator/1.0'
        }
      }
    );
    
    const data = await response.json();
    if (data.display_name) {
      // Extract city and region from the detailed name
      const parts = data.display_name.split(',');
      if (parts.length >= 3) {
        return `${parts[0].trim()}, ${parts[1].trim()}`;
      }
      return parts[0].trim();
    }
    
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

/**
 * Get country from coordinates
 */
async function getCountryFromCoordinates(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3`,
      {
        headers: {
          'User-Agent': 'Lovable-Blog-Generator/1.0'
        }
      }
    );
    
    const data = await response.json();
    return data.address?.country || 'Unknown';
  } catch (error) {
    console.error('Country lookup failed:', error);
    return 'Unknown';
  }
}

/**
 * Fallback mock location data
 */
function getMockLocationData() {
  console.log('Using fallback mock location data');
  return {
    name: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    country: "United States",
    timezone: "America/Los_Angeles",
    source: 'fallback'
  };
}
