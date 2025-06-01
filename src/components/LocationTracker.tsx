
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from 'lucide-react';

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  name: string;
  source: 'photo' | 'gps' | 'manual';
}

interface LocationTrackerProps {
  photoLocations: LocationPoint[];
}

const LocationTracker = ({ photoLocations }: LocationTrackerProps) => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);

  useEffect(() => {
    // Combine photo locations with current location
    getCurrentLocation();
    setLocations(photoLocations);
  }, [photoLocations]);

  const getCurrentLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const current: LocationPoint = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString(),
              name: 'Current Location',
              source: 'gps'
            };
            setCurrentLocation(current);
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    } catch (error) {
      console.error('Geolocation error:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const generateMapUrl = () => {
    if (locations.length === 0 && !currentLocation) return null;
    
    const allPoints = [...locations];
    if (currentLocation) allPoints.push(currentLocation);
    
    // Create a simple Google Maps static map URL
    const markers = allPoints.map((point, idx) => 
      `markers=color:${point.source === 'gps' ? 'blue' : 'red'}%7Clabel:${idx + 1}%7C${point.latitude},${point.longitude}`
    ).join('&');
    
    const center = allPoints.length > 0 ? 
      `${allPoints[0].latitude},${allPoints[0].longitude}` : 
      '37.7749,-122.4194';
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=12&size=400x200&${markers}&key=YOUR_GOOGLE_MAPS_API_KEY`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Today's Locations</span>
          <Badge variant="secondary">{locations.length + (currentLocation ? 1 : 0)} points</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map visualization placeholder */}
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>Interactive map will be displayed here</p>
            <p className="text-sm">Showing {locations.length} photo locations</p>
          </div>
        </div>

        {/* Location list */}
        <div className="space-y-2">
          {currentLocation && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">{currentLocation.name}</p>
                  <p className="text-sm text-gray-600">
                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              <Badge variant="outline">Current</Badge>
            </div>
          )}
          
          {locations.map((location, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="font-medium">{location.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(location.timestamp)}</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {location.source}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationTracker;
