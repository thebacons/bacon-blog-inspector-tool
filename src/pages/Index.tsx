
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhotoPreview from "@/components/PhotoPreview";
import LocationTracker from "@/components/LocationTracker";
import WeatherForecast from "@/components/WeatherForecast";
import { 
  Sparkles, 
  Settings,
  User,
  MessageSquare,
  Image,
  TrendingUp,
  Eye,
  Plus
} from 'lucide-react';

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [autoSources, setAutoSources] = useState({
    photos: true,
    weather: true,
    location: true,
    tasks: false
  });

  const recentBlogs = [
    {
      id: 1,
      title: "Perfect Sunday in Aachen",
      date: "2024-05-31",
      snippet: "Bike ride to the market, delicious bacon and eggs...",
      sources: ["📸 5 photos", "🌤️ Weather", "📍 Aachen"],
      views: 12
    },
    {
      id: 2,
      title: "Productive Week Recap",
      date: "2024-05-30",
      snippet: "Gym session, lawn care, and some great meetings...",
      sources: ["📸 3 photos", "🌧️ Weather", "📍 Home"],
      views: 8
    }
  ];

  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    // This will integrate with the MCP orchestrator
    console.log('Generating blog with:', {
      notes: userNotes,
      photos: selectedPhotos,
      location: currentLocation,
      autoSources
    });
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const handlePhotoSelection = (photos: any[]) => {
    setSelectedPhotos(photos);
  };

  // Extract photo locations for the location tracker
  const photoLocations = selectedPhotos
    .filter(photo => photo.location)
    .map(photo => ({
      latitude: photo.location.latitude,
      longitude: photo.location.longitude,
      timestamp: photo.timestamp,
      name: photo.location.name,
      source: 'photo' as const
    }));

  React.useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AutoBlog AI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Blogs Created</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                    <MessageSquare className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Photos Used</p>
                      <p className="text-2xl font-bold">127</p>
                    </div>
                    <Image className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Views</p>
                      <p className="text-2xl font-bold">1.2k</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Data Sources Tabs */}
            <Tabs defaultValue="photos" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="photos">Photos & Memories</TabsTrigger>
                <TabsTrigger value="location">Location & Travel</TabsTrigger>
                <TabsTrigger value="weather">Weather & Environment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="photos" className="space-y-4">
                <PhotoPreview onSelectionChange={handlePhotoSelection} />
              </TabsContent>
              
              <TabsContent value="location" className="space-y-4">
                <LocationTracker photoLocations={photoLocations} />
              </TabsContent>
              
              <TabsContent value="weather" className="space-y-4">
                <WeatherForecast location={currentLocation} />
              </TabsContent>
            </Tabs>

            {/* Blog Generator */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>Generate Your Daily Blog</span>
                </CardTitle>
                <CardDescription>
                  Add your notes and let AI create a beautiful story from your day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Auto Sources */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">
                    Include in Blog
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant={autoSources.photos ? "default" : "outline"} className="cursor-pointer">
                      📸 {selectedPhotos.length} Photos Selected
                    </Badge>
                    <Badge variant={autoSources.weather ? "default" : "outline"} className="cursor-pointer">
                      🌤️ Weather & Astronomy
                    </Badge>
                    <Badge variant={autoSources.location ? "default" : "outline"} className="cursor-pointer">
                      📍 {photoLocations.length} Locations
                    </Badge>
                  </div>
                </div>

                {/* User Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-semibold">Your Day Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="went to gym, took bike, nice ride, cut lawn, bacon and eggs for lunch..."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerateBlog}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating Your Story...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>Generate Blog Post</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Blogs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Blog Posts</CardTitle>
                <CardDescription>Your latest AI-generated stories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBlogs.map((blog) => (
                    <div key={blog.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{blog.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{blog.snippet}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">{blog.date}</span>
                          {blog.sources.map((source, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{blog.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Summary</CardTitle>
                <CardDescription>Live data overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <Image className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Photos</span>
                  </div>
                  <Badge variant="secondary">{selectedPhotos.length} selected</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">📍 Locations</span>
                  </div>
                  <Badge variant="secondary">{photoLocations.length} visited</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">🌤️ Weather</span>
                  </div>
                  <Badge variant="secondary">22°C</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Data Sources
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Connect Google Account
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Agent
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
