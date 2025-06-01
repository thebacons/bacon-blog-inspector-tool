
export const getWeatherIcon = (conditions: string) => {
  const condition = conditions?.toLowerCase() || '';
  if (condition.includes('sun') || condition.includes('clear')) return '☀️';
  if (condition.includes('cloud')) return '⛅';
  if (condition.includes('rain')) return '🌧️';
  if (condition.includes('storm')) return '⛈️';
  return '🌤️';
};

export const getRandomCondition = () => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Clear'];
  return conditions[Math.floor(Math.random() * conditions.length)];
};

export const generateHourlyForecast = (baseWeather: any) => {
  const hourly = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = forecastTime.getHours();
    const hourFormatted = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    
    // Temperature variation throughout the day
    const timeOfDay = (hour - 14) / 24;
    const tempVariation = -Math.cos(timeOfDay * 2 * Math.PI) * 6;
    const baseTemp = baseWeather.temperature || 20;
    
    hourly.push({
      time: hourFormatted,
      temperature: Math.round(baseTemp + tempVariation),
      conditions: i < 6 ? baseWeather.conditions : getRandomCondition(),
      precipitation: Math.round(Math.random() * 30) + '%'
    });
  }
  
  return hourly;
};

export const generateHistoricalData = async (location: { latitude: number; longitude: number }) => {
  const historical = [];
  const today = new Date();
  
  // Generate data for previous 3 days
  for (let i = 1; i <= 3; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString();
    
    // Generate hourly data for the day
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeOfDay = (hour - 14) / 24;
      const tempVariation = -Math.cos(timeOfDay * 2 * Math.PI) * 5;
      const baseTemp = 18 + Math.random() * 8;
      
      hourlyData.push({
        time: hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`,
        temperature: Math.round(baseTemp + tempVariation),
        conditions: getRandomCondition()
      });
    }
    
    historical.push({
      date: dateStr,
      temperature: Math.round(18 + Math.random() * 8),
      conditions: getRandomCondition(),
      hourlyData
    });
  }
  
  return historical;
};
