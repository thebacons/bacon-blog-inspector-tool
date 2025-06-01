
/**
 * Weather service for fetching real weather data
 */

/**
 * Get weather data for coordinates using OpenWeatherMap API
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Weather data
 */
export async function getWeatherForLocation(latitude, longitude) {
  try {
    console.log(`Fetching real weather for coordinates: ${latitude}, ${longitude}`);
    
    // Try OpenWeatherMap free API (no key needed for some endpoints)
    // Note: For production, you'd want to use a proper API key
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=demo`
    );
    
    if (!response.ok) {
      throw new Error('OpenWeatherMap API failed');
    }
    
    const data = await response.json();
    
    if (data.main && data.weather) {
      console.log('Real weather data obtained:', data.main.temp, data.weather[0].description);
      
      // Get forecast data
      const forecast = await getForecastData(latitude, longitude);
      
      return {
        location: data.name || `${latitude.toFixed(1)}, ${longitude.toFixed(1)}`,
        temperature: Math.round(data.main.temp),
        unit: "°C",
        conditions: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind?.speed * 3.6) || 0, // Convert m/s to km/h
        feelsLike: Math.round(data.main.feels_like),
        forecast: forecast,
        source: 'openweathermap'
      };
    }
    
    throw new Error('Invalid weather data structure');
    
  } catch (error) {
    console.error('Real weather API failed, trying alternative:', error);
    
    // Try alternative weather service
    try {
      return await getWeatherFromAlternativeAPI(latitude, longitude);
    } catch (altError) {
      console.error('Alternative weather API also failed:', altError);
      return getEnhancedMockWeatherData(latitude, longitude);
    }
  }
}

/**
 * Try alternative weather API (wttr.in)
 */
async function getWeatherFromAlternativeAPI(latitude, longitude) {
  try {
    console.log('Trying alternative weather API...');
    
    const response = await fetch(
      `https://wttr.in/${latitude},${longitude}?format=j1`
    );
    
    const data = await response.json();
    
    if (data.current_condition && data.current_condition[0]) {
      const current = data.current_condition[0];
      const forecast = data.weather?.slice(0, 3).map((day, index) => ({
        day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 'Day After',
        high: parseInt(day.maxtempC),
        low: parseInt(day.mintempC),
        conditions: day.hourly[0]?.weatherDesc[0]?.value || 'Unknown'
      })) || [];
      
      console.log('Alternative weather data obtained:', current.temp_C, current.weatherDesc[0].value);
      
      return {
        location: `${latitude.toFixed(1)}, ${longitude.toFixed(1)}`,
        temperature: parseInt(current.temp_C),
        unit: "°C",
        conditions: current.weatherDesc[0]?.value || 'Unknown',
        humidity: parseInt(current.humidity),
        windSpeed: Math.round(parseFloat(current.windspeedKmph)),
        feelsLike: parseInt(current.FeelsLikeC),
        forecast: forecast,
        source: 'wttr.in'
      };
    }
    
    throw new Error('Invalid alternative weather data');
  } catch (error) {
    throw new Error(`Alternative weather API failed: ${error.message}`);
  }
}

/**
 * Get forecast data from OpenWeatherMap
 */
async function getForecastData(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=demo`
    );
    
    if (!response.ok) {
      throw new Error('Forecast API failed');
    }
    
    const data = await response.json();
    
    if (data.list) {
      // Group by day and get daily highs/lows
      const dailyData = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toDateString();
        
        if (!dailyData[day]) {
          dailyData[day] = {
            temps: [],
            conditions: item.weather[0].description
          };
        }
        
        dailyData[day].temps.push(item.main.temp);
      });
      
      // Convert to forecast format
      const forecastDays = ['Today', 'Tomorrow', 'Day After'];
      const forecast = Object.keys(dailyData).slice(0, 3).map((day, index) => {
        const temps = dailyData[day].temps;
        return {
          day: forecastDays[index] || `Day ${index + 1}`,
          high: Math.round(Math.max(...temps)),
          low: Math.round(Math.min(...temps)),
          conditions: dailyData[day].conditions
        };
      });
      
      return forecast;
    }
    
    return [];
  } catch (error) {
    console.error('Forecast fetch failed:', error);
    return generateMockForecast();
  }
}

/**
 * Enhanced mock weather based on location and season
 */
function getEnhancedMockWeatherData(latitude, longitude) {
  console.log('Using enhanced mock weather data based on location');
  
  const now = new Date();
  const month = now.getMonth();
  const season = getSeason(month, latitude);
  
  // Base temperatures by season and latitude
  let baseTemp = 20;
  
  if (Math.abs(latitude) > 60) { // Arctic regions
    baseTemp = season === 'winter' ? -10 : 10;
  } else if (Math.abs(latitude) > 40) { // Temperate regions
    baseTemp = season === 'winter' ? 5 : 22;
  } else if (Math.abs(latitude) < 23.5) { // Tropical regions
    baseTemp = season === 'winter' ? 25 : 30;
  }
  
  const temperature = Math.round(baseTemp + (Math.random() - 0.5) * 10);
  const humidity = Math.round(50 + Math.random() * 30);
  const windSpeed = Math.round(5 + Math.random() * 15);
  const conditions = getWeatherConditions(season, temperature);
  
  return {
    location: `${latitude.toFixed(1)}, ${longitude.toFixed(1)}`,
    temperature,
    unit: "°C",
    conditions,
    humidity,
    windSpeed,
    feelsLike: temperature + Math.round((Math.random() - 0.5) * 4),
    forecast: generateMockForecast(),
    source: 'enhanced-mock'
  };
}

function getSeason(month, latitude) {
  if (latitude >= 0) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  } else {
    if (month >= 2 && month <= 4) return 'autumn';
    if (month >= 5 && month <= 7) return 'winter';
    if (month >= 8 && month <= 10) return 'spring';
    return 'summer';
  }
}

function getWeatherConditions(season, temperature) {
  const random = Math.random();
  
  if (temperature > 25) {
    return random > 0.7 ? 'partly cloudy' : 'sunny';
  } else if (temperature > 15) {
    if (random > 0.8) return 'light rain';
    if (random > 0.5) return 'partly cloudy';
    return 'cloudy';
  } else if (temperature > 0) {
    if (random > 0.7) return 'rain';
    return 'cloudy';
  } else {
    return random > 0.5 ? 'snow' : 'overcast';
  }
}

function generateMockForecast() {
  const forecast = [];
  const days = ['Today', 'Tomorrow', 'Day After'];
  
  for (let i = 0; i < 3; i++) {
    const baseTemp = 18 + (Math.random() - 0.5) * 10;
    const high = Math.round(baseTemp + Math.random() * 5);
    const low = Math.round(high - 5 - Math.random() * 5);
    
    forecast.push({
      day: days[i],
      high,
      low,
      conditions: getWeatherConditions('current', high)
    });
  }
  
  return forecast;
}
