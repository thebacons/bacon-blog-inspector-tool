
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, MapPin } from 'lucide-react';
import { getCurrentLocation } from '../services/locationService';
import { getWeatherForLocation } from '../services/weatherService';
import { generateHourlyForecast, generateHistoricalData } from '../utils/weatherUtils';
import { WeatherData, WeatherForecastProps } from '../types/weather';
import CurrentWeatherDisplay from './weather/CurrentWeatherDisplay';
import HourlyWeatherDisplay from './weather/HourlyWeatherDisplay';
import ForecastWeatherDisplay from './weather/ForecastWeatherDisplay';
import HistoricalWeatherDisplay from './weather/HistoricalWeatherDisplay';

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
            <CurrentWeatherDisplay weatherData={weatherData} />
          </TabsContent>
          
          <TabsContent value="hourly" className="space-y-4">
            <HourlyWeatherDisplay weatherData={weatherData} />
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-4">
            <ForecastWeatherDisplay weatherData={weatherData} />
          </TabsContent>
          
          <TabsContent value="historical" className="space-y-4">
            <HistoricalWeatherDisplay weatherData={weatherData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;
