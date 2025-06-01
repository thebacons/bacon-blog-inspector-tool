
import React from 'react';
import { getWeatherIcon } from '../../utils/weatherUtils';
import { WeatherData } from '../../types/weather';

interface HourlyWeatherDisplayProps {
  weatherData: WeatherData;
}

const HourlyWeatherDisplay = ({ weatherData }: HourlyWeatherDisplayProps) => {
  return (
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
  );
};

export default HourlyWeatherDisplay;
