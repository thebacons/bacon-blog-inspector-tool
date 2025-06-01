import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Send, CloudSun, Image as ImageIcon, RefreshCw, MapPin, Calendar, Thermometer, Wind, Droplets, Sun, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, CloudFog, CloudOff, Sunrise, Sunset, Umbrella, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import IdeasProjectsManager from "../components/IdeasProjectsManager";
import MCPServerManager from "../components/MCPServerManager";

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
  const [weatherData, setWeatherData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [newsTopics, setNewsTopics] = useState("");

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
      // Simulate API call with a timeout
      setTimeout(() => {
        const mockBlog = `# ${blogTopic}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.\n\n## Section 1\n\nNullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.\n\n## Section 2\n\nNullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.`;
        
        setGeneratedBlog(mockBlog);
        setIsGenerating(false);
        
        toast({
          title: "Blog Generated",
          description: "Your blog post has been generated successfully!",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate blog content. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const fetchWeatherData = async () => {
    // Mock weather data
    return {
      location: "San Francisco, CA",
      temperature: 18,
      unit: "°C",
      conditions: "Partly Cloudy",
      humidity: 65,
      windSpeed: 12,
      feelsLike: 17,
      forecast: [
        { day: "Today", high: 19, low: 14, conditions: "Partly Cloudy" },
        { day: "Tomorrow", high: 21, low: 15, conditions: "Sunny" },
        { day: "Wednesday", high: 20, low: 14, conditions: "Cloudy" }
      ]
    };
  };

  const fetchLocationData = async () => {
    // Mock location data
    return {
      name: "San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
      country: "United States",
      timezone: "America/Los_Angeles"
    };
  };

  const fetchPhotos = async () => {
    // Mock photos data
    return [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
        title: "City Skyline",
        date: "2023-05-15",
        analysis: {
          description: "A beautiful city skyline at sunset",
          location: { locationName: "Downtown" },
          tags: ["city", "skyline", "sunset", "urban"]
        }
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        title: "Mountain Landscape",
        date: "2023-05-10",
        analysis: {
          description: "Mountain range with snow caps",
          location: { locationName: "Mountain Range" },
          tags: ["mountains", "nature", "landscape", "snow"]
        }
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
        title: "Beach Sunset",
        date: "2023-05-05",
        analysis: {
          description: "Sunset view at the beach",
          location: { locationName: "Ocean Beach" },
          tags: ["beach", "sunset", "ocean", "waves"]
        }
      }
    ];
  };

  const { data: photos = [], isLoading: isLoadingPhotos } = useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
    enabled: includePhotos
  });

  const { data: weather, isLoading: isLoadingWeather } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeatherData,
    enabled: includeWeather,
    onSuccess: (data) => setWeatherData(data)
  });

  const { data: location, isLoading: isLoadingLocation } = useQuery({
    queryKey: ["location"],
    queryFn: fetchLocationData,
    enabled: includeLocation,
    onSuccess: (data) => setLocationData(data)
  });

  const handlePhotoSelect = (photo) => {
    if (selectedPhotos.some(p => p.id === photo.id)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id));
    } else {
      setSelectedPhotos([...selectedPhotos, photo]);
    }
  };

  const getWeatherIcon = (condition) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Auto Blog Platform</h1>
          <p className="text-gray-600">Generate enhanced blog posts with AI</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="blog">Auto Blog</TabsTrigger>
            <TabsTrigger value="ideas">Ideas & Projects</TabsTrigger>
            <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
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
                      <div className="prose max-w-none">
                        {generatedBlog.split('\n').map((line, i) => {
                          if (line.startsWith('# ')) {
                            return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                          } else if (line.startsWith('## ')) {
                            return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
                          } else if (line.trim() === '') {
                            return <br key={i} />;
                          } else {
                            return <p key={i} className="mb-2">{line}</p>;
                          }
                        })}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Copy to Clipboard</Button>
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
                      ) : weather ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">{weather.location}</p>
                              <div className="flex items-center">
                                {getWeatherIcon(weather.conditions)}
                                <span className="text-2xl font-bold ml-2">
                                  {weather.temperature}{weather.unit}
                                </span>
                              </div>
                              <p className="text-sm">{weather.conditions}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end space-x-1 text-sm text-gray-500">
                                <Thermometer className="h-4 w-4" />
                                <span>Feels like {weather.feelsLike}{weather.unit}</span>
                              </div>
                              <div className="flex items-center justify-end space-x-1 text-sm text-gray-500">
                                <Wind className="h-4 w-4" />
                                <span>{weather.windSpeed} km/h</span>
                              </div>
                              <div className="flex items-center justify-end space-x-1 text-sm text-gray-500">
                                <Droplets className="h-4 w-4" />
                                <span>{weather.humidity}%</span>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Forecast</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {weather.forecast.map((day, i) => (
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
                      ) : location ? (
                        <div className="space-y-2">
                          <p className="font-medium">{location.name}</p>
                          <p className="text-sm text-gray-500">{location.country}</p>
                          <p className="text-sm text-gray-500">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Timezone: {location.timezone}
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
                      {isLoadingPhotos ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {photos.map((photo) => (
                            <div 
                              key={photo.id} 
                              className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${
                                selectedPhotos.some(p => p.id === photo.id) 
                                  ? 'border-blue-500' 
                                  : 'border-transparent'
                              }`}
                              onClick={() => handlePhotoSelect(photo)}
                            >
                              <img 
                                src={photo.url} 
                                alt={photo.title} 
                                className="w-full h-24 object-cover"
                              />
                              {selectedPhotos.some(p => p.id === photo.id) && (
                                <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                          <p>No photos available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ideas">
            <IdeasProjectsManager />
          </TabsContent>

          <TabsContent value="mcp">
            <MCPServerManager />
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
            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery</CardTitle>
                <CardDescription>Browse and manage your photos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-medium">Photo Gallery Coming Soon</h3>
                  <p className="text-gray-500 mt-2">This feature is under development</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
