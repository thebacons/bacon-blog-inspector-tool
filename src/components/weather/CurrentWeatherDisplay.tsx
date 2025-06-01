
import React from 'react';
import { Droplets, Wind } from 'lucide-react';
import { getWeatherIcon } from '../../utils/weatherUtils';
import { WeatherData } from '../../types/weather';

interface CurrentWeatherDisplayProps {
  weatherData: WeatherData;
}

const CurrentWeatherDisplay = ({ weatherData }: CurrentWeatherDisplayProps) => {
  return (
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
  );
};

export default CurrentWeatherDisplay;
