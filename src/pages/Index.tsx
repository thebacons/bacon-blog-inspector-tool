import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Send, CloudSun, Image as ImageIcon, RefreshCw, MapPin, Calendar, Thermometer, Wind, Droplets, Sun, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, CloudFog, CloudOff, Sunrise, Sunset, Umbrella, Zap, Settings, Server } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import IdeasProjectsManager from "../components/IdeasProjectsManager";
import MCPServerManager from "../components/MCPServerManager";
import PhotoPreview from "../components/PhotoPreview";
import { generateBlogWithGemini } from "../services/blogService";
import { getCurrentLocation } from "../services/locationService";
import { getWeatherForLocation } from "../services/weatherService";

interface WeatherData {
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
}

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
}

interface PhotoData {
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

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("blog");
  const [blogTopic, setBlogTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState("");
  const [useEnhancedBlog, setUseEnhancedBlog] = useState(true);
  const [includeWeather, setIncludeWeather] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeNews, setIncludeNews] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoData[]>([]);
  const [newsTopics, setNewsTopics] = useState("");
  const [showMCPSettings, setShowMCPSettings] = useState(false);

  const handleGenerateBlog = async () => {
    if (!blogTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a blog topic to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedBlog("");

    try {
      console.log('Generating blog with Gemini 2.5 Flash...');
      
      // Use the real Gemini service with all context data
      const blogContent = await generateBlogWithGemini({
        topic: blogTopic,
        locationData: includeLocation ? locationData : null,
        weatherData: includeWeather ? weatherData : null,
        selectedPhotos: includePhotos ? selectedPhotos : []
      });
      
      setGeneratedBlog(blogContent);
      
      toast({
        title: "Blog Generated",
        description: "Your enhanced blog post has been generated with Gemini 2.5 Flash!",
      });
    } catch (error) {
      console.error('Blog generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate blog content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch real location data
  const { data: location, isLoading: isLoadingLocation } = useQuery({
    queryKey: ["location"],
    queryFn: getCurrentLocation,
    enabled: includeLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Fetch real weather data based on location
  const { data: weather, isLoading: isLoadingWeather } = useQuery({
    queryKey: ["weather", location?.latitude, location?.longitude],
    queryFn: () => location ? getWeatherForLocation(location.latitude, location.longitude) : null,
    enabled: includeWeather && !!location,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });

  const fetchPhotos = async (): Promise<PhotoData[]> => {
    // Mock photos data
    return [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
        thumbnailUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=100",
        originalUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
        timestamp: "2023-05-15",
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          name: "Downtown"
        },
        metadata: {
          camera: "Canon EOS R5",
          people: ["John Doe", "Jane Smith"],
          tags: ["city", "skyline", "sunset", "urban"]
        },
        aiAnalysis: {
          description: "A beautiful city skyline at sunset",
          objects: ["city", "skyline", "sunset", "urban"],
          scene: "cityscape",
          mood: "sunny",
          activity: "sunset"
        }
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        thumbnailUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=100",
        originalUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        timestamp: "2023-05-10",
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          name: "Mountain Range"
        },
        metadata: {
          camera: "Nikon D850",
          people: ["Tom Smith"],
          tags: ["mountains", "nature", "landscape", "snow"]
        },
        aiAnalysis: {
          description: "Mountain range with snow caps",
          objects: ["mountains", "snow"],
          scene: "mountain range",
          mood: "sunny",
          activity: "sunset"
        }
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
        thumbnailUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=100",
        originalUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
        timestamp: "2023-05-05",
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          name: "Ocean Beach"
        },
        metadata: {
          camera: "Sony Alpha A7R IV",
          people: ["Alice Johnson"],
          tags: ["beach", "sunset", "ocean", "waves"]
        },
        aiAnalysis: {
          description: "Sunset view at the beach",
          objects: ["beach", "waves"],
          scene: "beach",
          mood: "sunny",
          activity: "sunset"
        }
      }
    ];
  };

  const { data: photos = [], isLoading: isLoadingPhotos } = useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
    enabled: includePhotos
  });

  // Handle weather data updates
  useEffect(() => {
    if (weather) {
      setWeatherData(weather as WeatherData);
    }
  }, [weather]);

  // Handle location data updates
  useEffect(() => {
    if (location) {
      setLocationData(location as LocationData);
    }
  }, [location]);

  const handlePhotoSelectionChange = (photos: PhotoData[]) => {
    setSelectedPhotos(photos);
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) return <Sun className="h-6 w-6 text-yellow-500" />;
    if (conditionLower.includes("rain")) return <CloudRain className="h-6 w-6 text-blue-500" />;
    if (conditionLower.includes("thunder") || conditionLower.includes("lightning")) return <CloudLightning className="h-6 w-6 text-purple-500" />;
    if (conditionLower.includes("snow")) return <CloudSnow className="h-6 w-6 text-blue-200" />;
    if (conditionLower.includes("drizzle")) return <CloudDrizzle className="h-6 w-6 text-blue-400" />;
    if (conditionLower.includes("fog") || conditionLower.includes("mist")) return <CloudFog className="h-6 w-6 text-gray-400" />;
    if (conditionLower.includes("cloud")) return <CloudSun className="h-6 w-6 text-gray-500" />;
    return <CloudOff className="h-6 w-6 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auto Blog Platform</h1>
              <p className="text-gray-600">Generate enhanced blog posts with Gemini 2.5 Flash</p>
            </div>
            <div className="flex items-center space-x-2">
              {!import.meta.env.VITE_GOOGLE_API_KEY && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Demo Mode
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowMCPSettings(true)}>
                    <Server className="h-4 w-4 mr-2" />
                    MCP Servers
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {!import.meta.env.VITE_GOOGLE_API_KEY && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CloudSun className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Demo Mode: Add your Google Gemini API key as VITE_GOOGLE_API_KEY to enable real AI generation
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Currently using enhanced mock generation with location and weather context
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="blog">Auto Blog</TabsTrigger>
            <TabsTrigger value="ideas">Ideas & Projects</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="blog" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Blog Post</CardTitle>
                    <CardDescription>Enter a topic or idea to generate a blog post</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Blog Topic</Label>
                      <Textarea
                        id="topic"
                        placeholder="Enter your blog topic or idea here..."
                        value={blogTopic}
                        onChange={(e) => setBlogTopic(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enhanced-blog">Use Enhanced Blog</Label>
                        <Switch
                          id="enhanced-blog"
                          checked={useEnhancedBlog}
                          onCheckedChange={setUseEnhancedBlog}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Enhanced blogs include contextual information like weather, location, and photos
                      </p>
                    </div>

                    {useEnhancedBlog && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-medium">Enhancement Options</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="include-weather"
                              checked={includeWeather}
                              onCheckedChange={setIncludeWeather}
                            />
                            <Label htmlFor="include-weather">Include Weather</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="include-location"
                              checked={includeLocation}
                              onCheckedChange={setIncludeLocation}
                            />
                            <Label htmlFor="include-location">Include Location</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="include-photos"
                              checked={includePhotos}
                              onCheckedChange={setIncludePhotos}
                            />
                            <Label htmlFor="include-photos">Include Photos</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="include-news"
                              checked={includeNews}
                              onCheckedChange={setIncludeNews}
                            />
                            <Label htmlFor="include-news">Include News</Label>
                          </div>
                        </div>

                        {includeNews && (
                          <div className="space-y-2">
                            <Label htmlFor="news-topics">News Topics (comma separated)</Label>
                            <Input
                              id="news-topics"
                              placeholder="technology, science, health"
                              value={newsTopics}
                              onChange={(e) => setNewsTopics(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleGenerateBlog} 
                      disabled={isGenerating || !blogTopic.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Generate Blog
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {generatedBlog && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Blog Post</CardTitle>
                      <CardDescription>
                        {format(new Date(), "MMMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: generatedBlog }}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(generatedBlog)}
                      >
                        Copy to Clipboard
                      </Button>
                      <Button variant="outline">Download as Markdown</Button>
                    </CardFooter>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {useEnhancedBlog && includeWeather && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CloudSun className="mr-2 h-5 w-5" />
                        Weather Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingWeather ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : weatherData ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">{weatherData.location}</p>
                              <div className="flex items-center">
                                {getWeatherIcon(weatherData.conditions)}
                                <span className="text-2xl font-bold ml-2">
                                  {weatherData.temperature}{weatherData.unit}
                                </span>
                              </div>
                              <p className="text-sm">{weatherData.conditions}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end space-x-1 text-sm text-gray-500">
                                <Thermometer className="h-4 w-4" />
                                <span>Feels like {weatherData.feelsLike}{weatherData.unit}</span>
                              </div>
                              <div className="flex items-center justify-end space-x-1 text-sm text-gray-500">
                                <Wind className="h-4 w-4" />
                                <span>{weatherData.windSpeed} km/h</span>
                              </div>
                              <div className="flex items-center justify-end space-x-1 text-sm text-gray-500">
                                <Droplets className="h-4 w-4" />
                                <span>{weatherData.humidity}%</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Forecast</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {weatherData.forecast.map((day, i) => (
                                <div key={i} className="text-center p-2 bg-gray-50 rounded">
                                  <p className="text-xs font-medium">{day.day}</p>
                                  <div className="my-1">
                                    {getWeatherIcon(day.conditions)}
                                  </div>
                                  <p className="text-xs">
                                    <span className="font-medium">{day.high}°</span> / {day.low}°
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <CloudOff className="h-8 w-8 mx-auto mb-2" />
                          <p>Weather data unavailable</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {useEnhancedBlog && includeLocation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingLocation ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : locationData ? (
                        <div className="space-y-2">
                          <p className="font-medium">{locationData.name}</p>
                          <p className="text-sm text-gray-500">{locationData.country}</p>
                          <p className="text-sm text-gray-500">
                            {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Timezone: {locationData.timezone}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p>Location data unavailable</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {useEnhancedBlog && includePhotos && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ImageIcon className="mr-2 h-5 w-5" />
                          Photos
                        </div>
                        <Badge>{selectedPhotos.length} selected</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PhotoPreview onSelectionChange={handlePhotoSelectionChange} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ideas">
            <IdeasProjectsManager />
          </TabsContent>

          <TabsContent value="weather" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weather Dashboard</CardTitle>
                <CardDescription>View detailed weather information for your location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CloudSun className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-medium">Weather Dashboard Coming Soon</h3>
                  <p className="text-gray-500 mt-2">This feature is under development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <PhotoPreview onSelectionChange={handlePhotoSelectionChange} />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
