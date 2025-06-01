
/**
 * Weather service for fetching real weather data
 */

/**
 * Get weather data for coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Weather data
 */
export async function getWeatherForLocation(latitude, longitude) {
  try {
    // For now, return enhanced mock data based on location
    // In production, you'd use a weather API like OpenWeatherMap
    console.log(`Getting weather for coordinates: ${latitude}, ${longitude}`);
    
    const weatherConditions = generateRealisticWeather(latitude, longitude);
    
    return {
      location: `${latitude.toFixed(1)}, ${longitude.toFixed(1)}`,
      temperature: weatherConditions.temperature,
      unit: "°C",
      conditions: weatherConditions.conditions,
      humidity: weatherConditions.humidity,
      windSpeed: weatherConditions.windSpeed,
      feelsLike: weatherConditions.feelsLike,
      forecast: generateForecast(weatherConditions)
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData();
  }
}

/**
 * Generate realistic weather based on location and season
 */
function generateRealisticWeather(latitude, longitude) {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const season = getSeason(month, latitude);
  
  // Base temperatures by season and latitude
  let baseTemp = 20; // Default to moderate
  
  if (Math.abs(latitude) > 60) { // Arctic regions
    baseTemp = season === 'winter' ? -10 : 10;
  } else if (Math.abs(latitude) > 40) { // Temperate regions
    baseTemp = season === 'winter' ? 5 : 22;
  } else if (Math.abs(latitude) < 23.5) { // Tropical regions
    baseTemp = season === 'winter' ? 25 : 30;
  }
  
  // Add some randomness
  const temperature = Math.round(baseTemp + (Math.random() - 0.5) * 10);
  const humidity = Math.round(50 + Math.random() * 30);
  const windSpeed = Math.round(5 + Math.random() * 15);
  
  // Determine conditions based on season and randomness
  const conditions = getWeatherConditions(season, temperature);
  
  return {
    temperature,
    feelsLike: temperature + Math.round((Math.random() - 0.5) * 4),
    humidity,
    windSpeed,
    conditions
  };
}

function getSeason(month, latitude) {
  // Northern hemisphere seasons
  if (latitude >= 0) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  } else {
    // Southern hemisphere (opposite seasons)
    if (month >= 2 && month <= 4) return 'autumn';
    if (month >= 5 && month <= 7) return 'winter';
    if (month >= 8 && month <= 10) return 'spring';
    return 'summer';
  }
}

function getWeatherConditions(season, temperature) {
  const random = Math.random();
  
  if (temperature > 25) {
    return random > 0.7 ? 'Partly Cloudy' : 'Sunny';
  } else if (temperature > 15) {
    if (random > 0.8) return 'Light Rain';
    if (random > 0.5) return 'Partly Cloudy';
    return 'Cloudy';
  } else if (temperature > 0) {
    if (random > 0.7) return 'Rain';
    return 'Cloudy';
  } else {
    return random > 0.5 ? 'Snow' : 'Overcast';
  }
}

function generateForecast(currentWeather) {
  const forecast = [];
  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday'];
  
  for (let i = 0; i < 3; i++) {
    const tempVariation = (Math.random() - 0.5) * 6;
    const high = Math.round(currentWeather.temperature + tempVariation + Math.random() * 3);
    const low = Math.round(high - 5 - Math.random() * 5);
    
    forecast.push({
      day: days[i] || `Day ${i + 1}`,
      high,
      low,
      conditions: getWeatherConditions('current', high)
    });
  }
  
  return forecast;
}

function getMockWeatherData() {
  return {
    location: "San Francisco, CA",
    temperature: 18,
    unit: "°C",
    conditions: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    feelsLike: 17,
    forecast: [
      { day: "Today", high: 19, low: 14, conditions: "Partly Cloudy" },
      { day: "Tomorrow", high: 21, low: 15, conditions: "Sunny" },
      { day: "Wednesday", high: 20, low: 14, conditions: "Cloudy" }
    ]
  };
}
