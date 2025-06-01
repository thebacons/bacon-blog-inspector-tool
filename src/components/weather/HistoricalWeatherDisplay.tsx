
import React from 'react';
import { getWeatherIcon } from '../../utils/weatherUtils';
import { WeatherData } from '../../types/weather';

interface HistoricalWeatherDisplayProps {
  weatherData: WeatherData;
}

const HistoricalWeatherDisplay = ({ weatherData }: HistoricalWeatherDisplayProps) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default HistoricalWeatherDisplay;
