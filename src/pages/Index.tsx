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
      // Enhanced mock implementation that creates intelligent narratives
      const enhancedBlog = generateIntelligentBlog();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedBlog(enhancedBlog);
      
      toast({
        title: "Blog Generated",
        description: "Your blog post has been generated successfully!",
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

  const generateIntelligentBlog = () => {
    const today = format(new Date(), "EEEE, MMMM do, yyyy");
    const timeOfDay = new Date().getHours();
    const isEvening = timeOfDay >= 17;
    const isMorning = timeOfDay < 12;
    const isAfternoon = timeOfDay >= 12 && timeOfDay < 17;
    
    // Parse the user's notes to extract activities and create a narrative
    const notes = blogTopic.trim().toLowerCase();
    const activities = parseActivities(notes);
    const people = extractPeople(notes);
    
    // Create an intelligent title based on the day's main activity
    const mainActivity = activities.length > 0 ? activities[0] : 'day';
    const title = generateSmartTitle(today, mainActivity, weatherData?.conditions);
    
    let blogContent = `<h1>${title}</h1>\n\n`;
    
    // Opening paragraph with weather and mood setting
    if (weatherData) {
      const weatherMood = getWeatherMood(weatherData.conditions);
      blogContent += `<p>What a ${weatherMood} ${today}! `;
      
      if (isMorning) {
        blogContent += `The morning greeted me with ${weatherData.conditions.toLowerCase()} skies and a comfortable ${weatherData.temperature}${weatherData.unit}. `;
      } else if (isAfternoon) {
        blogContent += `The afternoon brought ${weatherData.conditions.toLowerCase()} weather with temperatures reaching ${weatherData.temperature}${weatherData.unit}. `;
      } else {
        blogContent += `As evening settles in, I'm reflecting on a day that was blessed with ${weatherData.conditions.toLowerCase()} weather and temperatures of ${weatherData.temperature}${weatherData.unit}. `;
      }
      
      blogContent += `Perfect weather for the adventures that lay ahead.</p>\n\n`;
    } else {
      blogContent += `<p>What a wonderful ${today}! `;
      if (isEvening) {
        blogContent += `As I reflect on the day that's coming to a close, `;
      } else {
        blogContent += `The day has been filled with `;
      }
      blogContent += `moments that remind me why I love documenting these experiences.</p>\n\n`;
    }
    
    // Create narrative sections based on activities
    const narrativeSections = createNarrativeSections(activities, people, notes);
    blogContent += narrativeSections;
    
    // Add photo context if available
    if (includePhotos && selectedPhotos.length > 0) {
      blogContent += `<h2>Moments Captured</h2>\n\n`;
      blogContent += `<p>Today I was fortunate to capture ${selectedPhotos.length} beautiful moments that truly tell the story of this ${mainActivity === 'day' ? 'wonderful day' : mainActivity}. `;
      
      selectedPhotos.forEach((photo, index) => {
        if (photo.aiAnalysis?.description) {
          const description = photo.aiAnalysis.description.toLowerCase();
          if (index === 0) {
            blogContent += `The first image reveals ${description}, setting the tone for the entire day. `;
          } else if (index === selectedPhotos.length - 1) {
            blogContent += `The final capture shows ${description}, a perfect ending to the visual story. `;
          } else {
            blogContent += `Another frame captures ${description}, adding another layer to the day's narrative. `;
          }
        }
      });
      
      blogContent += `Each photograph serves as a window into the emotions and experiences that made today special.</p>\n\n`;
    }
    
    // Add location context
    if (includeLocation && locationData) {
      blogContent += `<p>Being here in ${locationData.name} adds an extra dimension to these experiences. There's something magical about this place that makes even ordinary moments feel extraordinary. The familiar streets, the local atmosphere, and the sense of community all contribute to making days like this memorable.</p>\n\n`;
    }
    
    // Closing reflection
    blogContent += `<h2>Evening Reflections</h2>\n\n`;
    blogContent += `<p>As ${today} draws to a close, I'm filled with gratitude for the simple yet meaningful experiences that shaped this day. `;
    
    if (activities.length > 1) {
      blogContent += `From ${activities[0]} to ${activities[activities.length - 1]}, each moment contributed to a day well-lived. `;
    }
    
    if (people.length > 0) {
      blogContent += `Sharing these moments with ${people.join(' and ')} made them even more special. `;
    }
    
    blogContent += `These are the days that remind us to appreciate the beauty in routine, the joy in simple pleasures, and the importance of being present in each moment.</p>`;
    
    return blogContent;
  };

  const parseActivities = (notes) => {
    const activities = [];
    
    // Enhanced activity detection with better narrative descriptions
    const activityMap = {
      'gym': 'energizing workout session',
      'bicycle': 'refreshing bicycle ride',
      'motorcycle': 'exhilarating motorcycle journey',
      'lawn': 'therapeutic lawn maintenance',
      'mow': 'satisfying lawn care',
      'petrol': 'practical errands around town',
      'gas': 'essential stops during the day',
      'coffee': 'delightful coffee moments',
      'lunch': 'wonderful lunch experience',
      'dinner': 'memorable dinner',
      'walk': 'peaceful walk',
      'run': 'invigorating run',
      'dog': 'quality time with furry companion',
      'beer': 'relaxing social time',
      'shopping': 'productive shopping trip',
      'work': 'focused work session',
      'meeting': 'important meeting'
    };
    
    Object.entries(activityMap).forEach(([keyword, description]) => {
      if (notes.includes(keyword)) {
        activities.push(description);
      }
    });
    
    return activities.length > 0 ? activities : ['wonderful day'];
  };

  const extractPeople = (notes) => {
    const people = [];
    
    // Simple name detection (capitalize first letter of potential names)
    const words = notes.split(' ');
    words.forEach(word => {
      // Look for capitalized words that might be names (basic detection)
      if (word.length > 2 && word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) {
        // Filter out common words that might be capitalized
        const commonWords = ['the', 'and', 'met', 'went', 'got', 'back', 'when', 'morning', 'afternoon', 'evening'];
        if (!commonWords.includes(word.toLowerCase())) {
          people.push(word);
        }
      }
    });
    
    return people;
  };

  const generateSmartTitle = (date, mainActivity, weather) => {
    const dayName = format(new Date(), "EEEE");
    
    if (weather) {
      const weatherAdj = getWeatherAdjective(weather);
      return `${dayName}'s ${weatherAdj} Adventure: ${capitalizeFirst(mainActivity)}`;
    }
    
    return `A Perfect ${dayName}: ${capitalizeFirst(mainActivity)}`;
  };

  const getWeatherMood = (conditions) => {
    const condition = conditions?.toLowerCase() || '';
    if (condition.includes('sunny') || condition.includes('clear')) return 'glorious';
    if (condition.includes('cloudy') || condition.includes('overcast')) return 'contemplative';
    if (condition.includes('rain')) return 'cozy';
    if (condition.includes('snow')) return 'magical';
    return 'beautiful';
  };

  const getWeatherAdjective = (conditions) => {
    const condition = conditions?.toLowerCase() || '';
    if (condition.includes('sunny')) return 'Sun-Kissed';
    if (condition.includes('cloudy')) return 'Thoughtful';
    if (condition.includes('rain')) return 'Refreshing';
    if (condition.includes('clear')) return 'Crystal Clear';
    return 'Beautiful';
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const createNarrativeSections = (activities, people, notes) => {
    let narrative = `<h2>The Day Unfolds</h2>\n\n`;
    
    // Create a flowing narrative based on the original notes
    if (notes.includes('sunny') && notes.includes('morning')) {
      narrative += `<p>The day began with brilliant sunshine streaming through the windows, promising adventures ahead. `;
    } else {
      narrative += `<p>The morning started with a sense of anticipation for the day's activities. `;
    }
    
    if (notes.includes('gym') && notes.includes('bicycle')) {
      narrative += `I decided to combine fitness with eco-friendly transportation, cycling to the gym for my workout. There's something invigorating about starting the day with movement, feeling the morning air as I pedal through the neighborhood. The gym session that followed was exactly what I needed to set a positive tone for the hours ahead.</p>\n\n`;
    } else if (notes.includes('gym')) {
      narrative += `A trip to the gym provided the perfect start to the day. There's nothing quite like that post-workout endorphin rush that colors everything else with positivity.</p>\n\n`;
    }
    
    if (notes.includes('lawn') || notes.includes('mow')) {
      narrative += `<p>Returning home, I turned my attention to the lawn. There's something deeply satisfying about lawn care - the rhythmic motion, the immediate visual results, and that sense of taking care of your space. `;
      if (notes.includes('got back')) {
        narrative += `It felt good to transition from the energy of the gym to this more meditative, grounding activity. `;
      }
      narrative += `Working outdoors, I could appreciate the weather and feel connected to the simple pleasure of maintaining our home.</p>\n\n`;
    }
    
    if (notes.includes('dog') && notes.includes('fed')) {
      narrative += `<p>Of course, no day is complete without tending to our four-legged family member. Feeding time is always a moment of pure joy - seeing that excited tail wag and grateful eyes reminds me of the simple pleasures in daily routines.</p>\n\n`;
    }
    
    if (people.length > 0 && (notes.includes('lunch') || notes.includes('beer'))) {
      narrative += `<p>The afternoon brought social connection when I met up with ${people.join(' and ')} for `;
      if (notes.includes('beer') && notes.includes('lunch')) {
        narrative += `a relaxing lunch and drinks. `;
      } else if (notes.includes('beer')) {
        narrative += `some refreshing drinks. `;
      } else {
        narrative += `lunch. `;
      }
      narrative += `These moments of connection, sharing stories and laughter, are what transform ordinary days into memorable ones. There's something special about taking time to catch up with good people over good food and drinks.</p>\n\n`;
    }
    
    if (notes.includes('petrol') || notes.includes('gas')) {
      narrative += `<p>Even practical tasks like filling up with fuel became part of the day's rhythm. These routine errands, while mundane on the surface, offer moments for reflection and appreciation of our freedom to move through the world.</p>\n\n`;
    }
    
    return narrative;
  };

  const fetchWeatherData = async (): Promise<WeatherData> => {
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

  const fetchLocationData = async (): Promise<LocationData> => {
    // Mock location data
    return {
      name: "San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
      country: "United States",
      timezone: "America/Los_Angeles"
    };
  };

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

  const { data: weather, isLoading: isLoadingWeather } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeatherData,
    enabled: includeWeather
  });

  const { data: location, isLoading: isLoadingLocation } = useQuery({
    queryKey: ["location"],
    queryFn: fetchLocationData,
    enabled: includeLocation
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
              <p className="text-gray-600">Generate enhanced blog posts with AI</p>
            </div>
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
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {showMCPSettings ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowMCPSettings(false)}
              >
                ← Back
              </Button>
              <h2 className="text-xl font-bold">MCP Server Settings</h2>
            </div>
            <MCPServerManager />
          </div>
        ) : (
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
        )}
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
