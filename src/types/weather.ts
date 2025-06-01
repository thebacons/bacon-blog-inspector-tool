
export interface WeatherData {
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

export interface WeatherForecastProps {
  location?: { latitude: number; longitude: number } | null;
  onWeatherData?: (data: WeatherData) => void;
}
