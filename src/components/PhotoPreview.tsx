
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, MapPin, Clock, User } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  metadata: {
    camera?: string;
    people?: string[];
    tags?: string[];
  };
}

interface PhotoPreviewProps {
  onSelectionChange: (selectedPhotos: Photo[]) => void;
}

const PhotoPreview = ({ onSelectionChange }: PhotoPreviewProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch today's photos from Google Photos API
    fetchTodaysPhotos();
  }, []);

  const fetchTodaysPhotos = async () => {
    try {
      // This will integrate with Google Photos API
      const mockPhotos: Photo[] = [
        {
          id: '1',
          url: 'https://picsum.photos/800/600?random=1',
          thumbnailUrl: 'https://picsum.photos/200/150?random=1',
          timestamp: '2024-06-01T08:30:00Z',
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
            name: 'San Francisco, CA'
          },
          metadata: {
            camera: 'iPhone 15 Pro',
            people: ['John', 'Sarah'],
            tags: ['outdoor', 'city', 'morning']
          }
        },
        {
          id: '2',
          url: 'https://picsum.photos/800/600?random=2',
          thumbnailUrl: 'https://picsum.photos/200/150?random=2',
          timestamp: '2024-06-01T14:15:00Z',
          location: {
            latitude: 37.8199,
            longitude: -122.4783,
            name: 'Golden Gate Bridge'
          },
          metadata: {
            camera: 'iPhone 15 Pro',
            tags: ['landmark', 'bridge', 'afternoon']
          }
        }
      ];
      
      setPhotos(mockPhotos);
      // Select all photos by default
      const allIds = new Set(mockPhotos.map(p => p.id));
      setSelectedPhotos(allIds);
      onSelectionChange(mockPhotos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
    
    const selectedPhotoObjects = photos.filter(p => newSelection.has(p.id));
    onSelectionChange(selectedPhotoObjects);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Today's Photos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading photos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Today's Photos</span>
            <Badge variant="secondary">{photos.length} found</Badge>
          </div>
          <Badge variant="outline">{selectedPhotos.size} selected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="border rounded-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={photo.thumbnailUrl} 
                  alt="Photo from today"
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedPhotos.has(photo.id)}
                    onCheckedChange={() => togglePhotoSelection(photo.id)}
                    className="bg-white/90"
                  />
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(photo.timestamp)}</span>
                </div>
                {photo.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{photo.location.name}</span>
                  </div>
                )}
                {photo.metadata.people && photo.metadata.people.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{photo.metadata.people.join(', ')}</span>
                  </div>
                )}
                {photo.metadata.tags && (
                  <div className="flex flex-wrap gap-1">
                    {photo.metadata.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoPreview;
