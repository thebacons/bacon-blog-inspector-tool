
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, MapPin, Clock, User, ExternalLink, Eye } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  originalUrl: string;
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
  aiAnalysis?: {
    description: string;
    objects: string[];
    scene: string;
    mood: string;
    activity: string;
  };
}

interface PhotoPreviewProps {
  onSelectionChange: (selectedPhotos: Photo[]) => void;
}

const PhotoPreview = ({ onSelectionChange }: PhotoPreviewProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchTodaysPhotos();
  }, []);

  const fetchTodaysPhotos = async () => {
    try {
      // This will integrate with Google Photos API
      const mockPhotos: Photo[] = [
        {
          id: '1',
          url: 'https://picsum.photos/800/600?random=1',
          thumbnailUrl: 'https://picsum.photos/120/80?random=1',
          originalUrl: 'https://photos.google.com/share/photo1',
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
          },
          aiAnalysis: {
            description: 'Morning coffee with friends at a busy urban cafe',
            objects: ['coffee cup', 'pastry', 'smartphone'],
            scene: 'cafe interior',
            mood: 'relaxed',
            activity: 'socializing'
          }
        },
        {
          id: '2',
          url: 'https://picsum.photos/800/600?random=2',
          thumbnailUrl: 'https://picsum.photos/120/80?random=2',
          originalUrl: 'https://photos.google.com/share/photo2',
          timestamp: '2024-06-01T14:15:00Z',
          location: {
            latitude: 37.8199,
            longitude: -122.4783,
            name: 'Golden Gate Bridge'
          },
          metadata: {
            camera: 'iPhone 15 Pro',
            tags: ['landmark', 'bridge', 'afternoon']
          },
          aiAnalysis: {
            description: 'Iconic Golden Gate Bridge captured during golden hour',
            objects: ['bridge', 'water', 'mountains'],
            scene: 'outdoor landmark',
            mood: 'inspiring',
            activity: 'sightseeing'
          }
        },
        {
          id: '3',
          url: 'https://picsum.photos/800/600?random=3',
          thumbnailUrl: 'https://picsum.photos/120/80?random=3',
          originalUrl: 'https://photos.google.com/share/photo3',
          timestamp: '2024-06-01T18:45:00Z',
          metadata: {
            camera: 'iPhone 15 Pro',
            people: ['Emma'],
            tags: ['food', 'dinner', 'restaurant']
          },
          aiAnalysis: {
            description: 'Delicious dinner plate with fresh ingredients',
            objects: ['plate', 'food', 'wine glass', 'cutlery'],
            scene: 'restaurant table',
            mood: 'satisfied',
            activity: 'dining'
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

  const analyzePhotosWithAI = async () => {
    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      console.log('AI analysis completed for selected photos');
      setAnalyzing(false);
    }, 2000);
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
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{selectedPhotos.size} selected</Badge>
            <Button 
              size="sm" 
              onClick={analyzePhotosWithAI}
              disabled={analyzing || selectedPhotos.size === 0}
            >
              <Eye className="h-4 w-4 mr-1" />
              {analyzing ? 'Analyzing...' : 'AI Analyze'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              <div className="relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={photo.thumbnailUrl} 
                    alt="Photo thumbnail"
                    className="w-full h-20 object-cover"
                  />
                  <div className="absolute top-1 left-1">
                    <Checkbox
                      checked={selectedPhotos.has(photo.id)}
                      onCheckedChange={() => togglePhotoSelection(photo.id)}
                      className="bg-white/90 shadow-sm"
                    />
                  </div>
                  <a
                    href={photo.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="bg-white/90 rounded p-1 shadow-sm hover:bg-white">
                      <ExternalLink className="h-3 w-3 text-gray-600" />
                    </div>
                  </a>
                </div>
                
                <div className="p-2 space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(photo.timestamp)}</span>
                  </div>
                  
                  {photo.location && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{photo.location.name}</span>
                    </div>
                  )}
                  
                  {photo.metadata.people && photo.metadata.people.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <User className="h-3 w-3" />
                      <span className="truncate">{photo.metadata.people.join(', ')}</span>
                    </div>
                  )}
                  
                  {photo.aiAnalysis && (
                    <div className="text-xs text-blue-600 italic truncate" title={photo.aiAnalysis.description}>
                      {photo.aiAnalysis.description}
                    </div>
                  )}
                  
                  {photo.metadata.tags && (
                    <div className="flex flex-wrap gap-1">
                      {photo.metadata.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {photo.metadata.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{photo.metadata.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedPhotos.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Selected Photos Analysis Summary</h4>
            <div className="text-sm text-gray-600">
              <p>Ready to enhance your blog with {selectedPhotos.size} photos including locations, people, and AI-generated descriptions.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoPreview;
