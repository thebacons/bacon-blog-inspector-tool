
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Cloud, CloudRain, Wind, Calendar, MapPin, Thermometer, Droplets } from 'lucide-react';
import { getCurrentLocation } from '../services/locationService';
import { getWeatherForLocation } from '../services/weatherService';

interface WeatherData {
  location: string;
  temperature: number;
  unit: string;
  conditions: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    conditions: string;
  }>;
  hourly?: Array<{
    time: string;
    temperature: number;
    conditions: string;
    precipitation?: string;
  }>;
  historical?: Array<{
    date: string;
    temperature: number;
    conditions: string;
    hourlyData?: Array<{
      time: string;
      temperature: number;
      conditions: string;
    }>;
  }>;
  source: string;
}

interface WeatherForecastProps {
  location?: { latitude: number; longitude: number } | null;
  onWeatherData?: (data: WeatherData) => void;
}

const WeatherForecast = ({ location: propLocation, onWeatherData }: WeatherForecastProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocationAndWeather();
  }, [propLocation]);

  const fetchLocationAndWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get location data
      let currentLocation = propLocation;
      let locationInfo = null;

      if (!currentLocation) {
        console.log('Getting current location...');
        locationInfo = await getCurrentLocation();
        if (locationInfo) {
          currentLocation = {
            latitude: locationInfo.latitude,
            longitude: locationInfo.longitude
          };
          setLocationData(locationInfo);
        }
      }

      if (!currentLocation) {
        throw new Error('Unable to determine location');
      }

      console.log('Fetching weather for location:', currentLocation);
      
      // Get current weather
      const weather = await getWeatherForLocation(currentLocation.latitude, currentLocation.longitude);
      
      // Generate enhanced weather data with hourly and historical
      const enhancedWeather = await enhanceWeatherData(weather, currentLocation);
      
      setWeatherData(enhancedWeather);
      
      // Notify parent component
      if (onWeatherData) {
        onWeatherData(enhancedWeather);
      }

    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const enhanceWeatherData = async (baseWeather: any, location: { latitude: number; longitude: number }) => {
    // Generate hourly forecast for next 24 hours
    const hourly = generateHourlyForecast(baseWeather);
    
    // Generate historical data for previous day
    const historical = await generateHistoricalData(location);
    
    return {
      ...baseWeather,
      hourly,
      historical
    };
  };

  const generateHourlyForecast = (baseWeather: any) => {
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

  const generateHistoricalData = async (location: { latitude: number; longitude: number }) => {
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

  const getRandomCondition = () => {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Clear'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  };

  const getWeatherIcon = (conditions: string) => {
    const condition = conditions?.toLowerCase() || '';
    if (condition.includes('sun') || condition.includes('clear')) return '☀️';
    if (condition.includes('cloud')) return '⛅';
    if (condition.includes('rain')) return '🌧️';
    if (condition.includes('storm')) return '⛈️';
    return '🌤️';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <span>Weather Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">🌤️</div>
            <p>Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>{error || 'Unable to load weather data'}</p>
            <button 
              onClick={fetchLocationAndWeather}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sun className="h-5 w-5" />
          <span>Weather Dashboard</span>
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{locationData?.name || weatherData.location}</span>
          <Badge variant="outline" className="text-xs">
            {weatherData.source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{getWeatherIcon(weatherData.conditions)}</div>
                <div className="text-3xl font-bold">{weatherData.temperature}{weatherData.unit}</div>
                <div className="text-gray-600">{weatherData.conditions}</div>
                <div className="text-sm text-gray-500">
                  Feels like {weatherData.feelsLike}{weatherData.unit}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>Humidity</span>
                  </div>
                  <span>{weatherData.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <span>Wind</span>
                  </div>
                  <span>{weatherData.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hourly" className="space-y-4">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {weatherData.hourly?.map((hour, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getWeatherIcon(hour.conditions)}</span>
                    <div>
                      <p className="font-medium">{hour.time}</p>
                      <p className="text-sm text-gray-600">{hour.conditions}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{hour.temperature}°C</p>
                    <p className="text-sm text-gray-600">{hour.precipitation}</p>
                  </div>
                </div>
              )) || <p>No hourly data available</p>}
            </div>
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-4">
            {weatherData.forecast?.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getWeatherIcon(day.conditions)}</span>
                  <div>
                    <p className="font-medium">{day.day}</p>
                    <p className="text-sm text-gray-600">{day.conditions}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{day.high}°</p>
                  <p className="text-gray-600">{day.low}°</p>
                </div>
              </div>
            )) || <p>No forecast data available</p>}
          </TabsContent>
          
          <TabsContent value="historical" className="space-y-4">
            {weatherData.historical?.map((day, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getWeatherIcon(day.conditions)}</span>
                    <div>
                      <p className="font-medium">{day.date}</p>
                      <p className="text-sm text-gray-600">{day.conditions}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{day.temperature}°C</p>
                  </div>
                </div>
                
                {day.hourlyData && (
                  <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-500 mb-2">Hourly Data:</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {day.hourlyData.slice(0, 12).map((hour, hourIdx) => (
                        <div key={hourIdx} className="text-center p-1 bg-gray-50 rounded">
                          <div className="font-medium">{hour.time}</div>
                          <div>{hour.temperature}°</div>
                          <div className="text-gray-500 truncate">{hour.conditions}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )) || <p>No historical data available</p>}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;
