
import React from 'react';
import { getWeatherIcon } from '../../utils/weatherUtils';
import { WeatherData } from '../../types/weather';

interface ForecastWeatherDisplayProps {
  weatherData: WeatherData;
}

const ForecastWeatherDisplay = ({ weatherData }: ForecastWeatherDisplayProps) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default ForecastWeatherDisplay;
