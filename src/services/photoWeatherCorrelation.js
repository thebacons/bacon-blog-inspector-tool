
/**
 * Service for correlating photo timestamps with weather data
 */

/**
 * Correlate photo timestamps with weather conditions
 * @param {Array} photos - Array of photos with timestamps and metadata
 * @param {Object} weatherData - Weather data including historical information
 * @param {Object} locationData - Location information
 * @returns {Array} Photos enhanced with weather context
 */
export function correlatePhotosWithWeather(photos, weatherData, locationData) {
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return [];
  }

  console.log('Correlating photos with weather data:', {
    photoCount: photos.length,
    hasWeatherData: !!weatherData,
    hasHistorical: !!(weatherData?.historical)
  });

  return photos.map(photo => {
    const enhancedPhoto = { ...photo };
    
    // Get photo timestamp
    const photoTime = getPhotoTimestamp(photo);
    if (!photoTime) {
      return enhancedPhoto;
    }

    // Find matching weather data
    const weatherContext = findWeatherForTimestamp(photoTime, weatherData);
    
    if (weatherContext) {
      enhancedPhoto.weatherContext = weatherContext;
      enhancedPhoto.weatherNarrative = generateWeatherNarrative(photoTime, weatherContext, photo);
    }

    return enhancedPhoto;
  });
}

/**
 * Extract timestamp from photo metadata
 * @param {Object} photo - Photo object
 * @returns {Date|null} Photo timestamp
 */
function getPhotoTimestamp(photo) {
  try {
    // Try different timestamp sources
    if (photo.timestamp) {
      return new Date(photo.timestamp);
    }
    
    if (photo.metadata?.timestamp) {
      return new Date(photo.metadata.timestamp);
    }
    
    if (photo.exif?.DateTime) {
      return new Date(photo.exif.DateTime);
    }
    
    if (photo.lastModified) {
      return new Date(photo.lastModified);
    }
    
    // Default to current time for new photos
    return new Date();
  } catch (error) {
    console.error('Error parsing photo timestamp:', error);
    return null;
  }
}

/**
 * Find weather data for a specific timestamp
 * @param {Date} timestamp - Photo timestamp
 * @param {Object} weatherData - Weather data with historical information
 * @returns {Object|null} Matching weather context
 */
function findWeatherForTimestamp(timestamp, weatherData) {
  const photoDate = timestamp.toLocaleDateString();
  const photoHour = timestamp.getHours();
  const photoTime = timestamp.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  console.log(`Looking for weather at ${photoDate} ${photoTime}`);

  // Check if photo is from today
  const today = new Date().toLocaleDateString();
  if (photoDate === today && weatherData.hourly) {
    // Find closest hourly data
    const closestHour = findClosestHourlyData(photoHour, weatherData.hourly);
    if (closestHour) {
      return {
        type: 'current',
        time: photoTime,
        temperature: closestHour.temperature,
        conditions: closestHour.conditions,
        precipitation: closestHour.precipitation,
        source: 'hourly forecast'
      };
    }
  }

  // Check historical data
  if (weatherData.historical) {
    for (const historicalDay of weatherData.historical) {
      if (historicalDay.date === photoDate && historicalDay.hourlyData) {
        const closestHour = findClosestHourlyData(photoHour, historicalDay.hourlyData);
        if (closestHour) {
          return {
            type: 'historical',
            time: photoTime,
            temperature: closestHour.temperature,
            conditions: closestHour.conditions,
            source: 'historical data'
          };
        }
      }
    }
  }

  // Fallback to current weather
  if (weatherData.temperature !== undefined) {
    return {
      type: 'current',
      time: photoTime,
      temperature: weatherData.temperature,
      conditions: weatherData.conditions,
      source: 'current weather'
    };
  }

  return null;
}

/**
 * Find the closest hourly weather data for a given hour
 * @param {number} targetHour - Target hour (0-23)
 * @param {Array} hourlyData - Array of hourly weather data
 * @returns {Object|null} Closest hourly data
 */
function findClosestHourlyData(targetHour, hourlyData) {
  if (!hourlyData || !Array.isArray(hourlyData)) {
    return null;
  }

  let closestData = null;
  let closestDiff = Infinity;

  for (const hourData of hourlyData) {
    const hourValue = parseHourFromTimeString(hourData.time);
    if (hourValue !== null) {
      const diff = Math.abs(hourValue - targetHour);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestData = hourData;
      }
    }
  }

  return closestData;
}

/**
 * Parse hour from time string like "2 PM" or "10 AM"
 * @param {string} timeString - Time string
 * @returns {number|null} Hour in 24-hour format
 */
function parseHourFromTimeString(timeString) {
  try {
    const match = timeString.match(/(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    
    let hour = parseInt(match[1]);
    const period = match[2].toUpperCase();
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return hour;
  } catch (error) {
    return null;
  }
}

/**
 * Generate narrative text about weather conditions during photo
 * @param {Date} photoTime - Photo timestamp
 * @param {Object} weatherContext - Weather context for the photo
 * @param {Object} photo - Photo object
 * @returns {string} Weather narrative
 */
function generateWeatherNarrative(photoTime, weatherContext, photo) {
  const { temperature, conditions, time } = weatherContext;
  const timeStr = photoTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  // Generate contextual narrative based on conditions
  const conditionsLower = conditions.toLowerCase();
  
  let narrative = `At ${timeStr}, it was ${temperature}°C with ${conditions.toLowerCase()}`;
  
  // Add descriptive elements based on weather
  if (conditionsLower.includes('rain') || conditionsLower.includes('storm')) {
    if (photo.aiAnalysis?.description?.toLowerCase().includes('wet') || 
        photo.aiAnalysis?.description?.toLowerCase().includes('water')) {
      narrative += ` - you can see the effects of the rain in this photo`;
    } else {
      narrative += ` - we got caught in the weather at this moment`;
    }
  } else if (conditionsLower.includes('sun')) {
    narrative += ` - perfect lighting for this shot`;
  } else if (conditionsLower.includes('cloud')) {
    narrative += ` - the overcast sky created nice even lighting`;
  }

  // Add temperature context
  if (temperature < 5) {
    narrative += `, quite chilly`;
  } else if (temperature > 25) {
    narrative += `, pleasantly warm`;
  }

  return narrative;
}

/**
 * Generate a weather story for blog post based on photo timeline
 * @param {Array} correlatedPhotos - Photos with weather correlation
 * @param {Object} weatherData - Full weather data
 * @returns {string} Weather story narrative
 */
export function generateWeatherStory(correlatedPhotos, weatherData) {
  if (!correlatedPhotos || correlatedPhotos.length === 0) {
    return '';
  }

  const weatherEvents = [];
  let previousConditions = null;
  
  // Sort photos by timestamp
  const sortedPhotos = correlatedPhotos
    .filter(photo => photo.weatherContext)
    .sort((a, b) => {
      const timeA = getPhotoTimestamp(a);
      const timeB = getPhotoTimestamp(b);
      return timeA && timeB ? timeA.getTime() - timeB.getTime() : 0;
    });

  // Track weather changes throughout the day
  for (const photo of sortedPhotos) {
    const { weatherContext } = photo;
    const currentConditions = weatherContext.conditions.toLowerCase();
    
    if (previousConditions && previousConditions !== currentConditions) {
      // Weather changed
      const photoTime = getPhotoTimestamp(photo);
      const timeStr = photoTime?.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      if (currentConditions.includes('rain') && !previousConditions.includes('rain')) {
        weatherEvents.push(`the rain started around ${timeStr}`);
      } else if (!currentConditions.includes('rain') && previousConditions.includes('rain')) {
        weatherEvents.push(`the rain cleared up by ${timeStr}`);
      } else if (currentConditions.includes('sun') && previousConditions.includes('cloud')) {
        weatherEvents.push(`the sun came out around ${timeStr}`);
      } else if (currentConditions.includes('cloud') && previousConditions.includes('sun')) {
        weatherEvents.push(`it became overcast around ${timeStr}`);
      }
    }
    
    previousConditions = currentConditions;
  }

  if (weatherEvents.length > 0) {
    return `The weather was quite dynamic today - ${weatherEvents.join(', and ')}.`;
  }

  return '';
}

export default {
  correlatePhotosWithWeather,
  generateWeatherStory
};
