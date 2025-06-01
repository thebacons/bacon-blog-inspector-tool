
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Cloud, CloudRain, Wind, Calendar } from 'lucide-react';

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  historical: {
    date: string;
    temperature: number;
    condition: string;
    precipitation: number;
  }[];
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }[];
  astronomy: {
    sunrise: string;
    sunset: string;
    dayLength: string;
  };
}

interface WeatherForecastProps {
  location: { latitude: number; longitude: number } | null;
}

const WeatherForecast = ({ location }: WeatherForecastProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      // Mock weather data - this will integrate with weather APIs
      const mockData: WeatherData = {
        current: {
          temperature: 22,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          icon: '⛅'
        },
        historical: [
          { date: '2024-05-30', temperature: 20, condition: 'Sunny', precipitation: 0 },
          { date: '2024-05-31', temperature: 18, condition: 'Cloudy', precipitation: 2.3 },
        ],
        forecast: [
          { date: 'Today', high: 24, low: 16, condition: 'Partly Cloudy', icon: '⛅' },
          { date: 'Tomorrow', high: 26, low: 18, condition: 'Sunny', icon: '☀️' },
          { date: 'Day After', high: 23, low: 15, condition: 'Light Rain', icon: '🌦️' },
        ],
        astronomy: {
          sunrise: '6:24 AM',
          sunset: '7:52 PM',
          dayLength: '13h 28m'
        }
      };
      
      setWeatherData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const calculateSunPosition = () => {
    if (!weatherData) return 0;
    
    const now = new Date();
    const sunrise = new Date();
    const sunset = new Date();
    
    // Parse sunrise/sunset times (simplified)
    const [sunriseHour, sunriseMin] = weatherData.astronomy.sunrise.split(':');
    const [sunsetHour, sunsetMin] = weatherData.astronomy.sunset.split(':');
    
    sunrise.setHours(parseInt(sunriseHour), parseInt(sunriseMin), 0, 0);
    sunset.setHours(parseInt(sunsetHour) + (weatherData.astronomy.sunset.includes('PM') ? 12 : 0), parseInt(sunsetMin), 0, 0);
    
    const totalDaylight = sunset.getTime() - sunrise.getTime();
    const currentProgress = now.getTime() - sunrise.getTime();
    
    return Math.max(0, Math.min(100, (currentProgress / totalDaylight) * 100));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <span>Weather & Astronomy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading weather data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather & Astronomy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Unable to load weather data
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
          <span>Weather & Astronomy</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="astronomy">Sun/Moon</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{weatherData.current.icon}</div>
                <div className="text-2xl font-bold">{weatherData.current.temperature}°C</div>
                <div className="text-gray-600">{weatherData.current.condition}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span>{weatherData.current.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind:</span>
                  <span>{weatherData.current.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-4">
            {weatherData.forecast.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{day.icon}</span>
                  <div>
                    <p className="font-medium">{day.date}</p>
                    <p className="text-sm text-gray-600">{day.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{day.high}°</p>
                  <p className="text-gray-600">{day.low}°</p>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="historical" className="space-y-4">
            {weatherData.historical.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{day.date}</p>
                  <p className="text-sm text-gray-600">{day.condition}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{day.temperature}°C</p>
                  <p className="text-sm text-gray-600">{day.precipitation}mm rain</p>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="astronomy" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-orange-500" />
                  <span>Sunrise</span>
                </div>
                <span className="font-bold">{weatherData.astronomy.sunrise}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-purple-500" />
                  <span>Sunset</span>
                </div>
                <span className="font-bold">{weatherData.astronomy.sunset}</span>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Daylight Duration</span>
                  <span className="font-bold">{weatherData.astronomy.dayLength}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${calculateSunPosition()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  Sun position throughout the day
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;
