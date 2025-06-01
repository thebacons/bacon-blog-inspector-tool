
import React, { useState } from 'react';
import BlogGenerator from '../components/BlogGenerator';
import IdeasProjectsManager from '../components/IdeasProjectsManager';
import WeatherForecast from '../components/WeatherForecast';
import PhotoPreview from '../components/PhotoPreview';
import LocationTracker from '../components/LocationTracker';
import MCPServerManager from '../components/MCPServerManager';
import APIKeyManager from '../components/APIKeyManager';
import { FileText, Lightbulb, Cloud, Camera, Settings, Sparkles, ExternalLink, Server, Key } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const Index = () => {
  const [activeTab, setActiveTab] = useState('blog');
  const [showMCPSettings, setShowMCPSettings] = useState(false);
  const [showAPIKeySettings, setShowAPIKeySettings] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);

  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    console.log('Location updated:', location);
    setCurrentLocation(location);
  };

  const handleWeatherUpdate = (weather: any) => {
    console.log('Weather updated:', weather);
    setWeatherData(weather);
  };

  const handlePhotoSelectionChange = (photos: any[]) => {
    console.log('Photo selection changed:', photos);
    setSelectedPhotos(photos);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'blog':
        return <BlogGenerator weatherData={weatherData} locationData={currentLocation} selectedPhotos={selectedPhotos} />;
      case 'ideas':
        return <IdeasProjectsManager />;
      case 'weather':
        return <WeatherForecast location={currentLocation} onWeatherData={handleWeatherUpdate} />;
      case 'photos':
        return <PhotoPreview onSelectionChange={handlePhotoSelectionChange} />;
      case 'mcp':
        return <MCPServerManager />;
      case 'api-keys':
        return <APIKeyManager />;
      default:
        return <BlogGenerator weatherData={weatherData} locationData={currentLocation} selectedPhotos={selectedPhotos} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AB</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Auto Blog Platform</h1>
                  <p className="text-sm text-gray-600">Generate enhanced blog posts with Gemini 2.5 Flash</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Demo Mode
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                  <DropdownMenuLabel>Application Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab('api-keys')}>
                    <Key className="h-4 w-4 mr-2" />
                    API Key Management
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('mcp')}>
                    <Server className="h-4 w-4 mr-2" />
                    MCP Server Manager
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Google API Key
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5" />
            <div>
              <p className="font-medium">Demo Mode: Add your Google Gemini API key as VITE_GOOGLE_API_KEY to enable real AI generation</p>
              <p className="text-blue-100 text-sm">Currently using enhanced mock generation with location and weather context</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs - only show main tabs, settings tabs are accessed via dropdown */}
        {!['mcp', 'api-keys'].includes(activeTab) && (
          <div className="mb-8">
            <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
              {[
                { id: 'blog', label: 'Auto Blog', icon: FileText },
                { id: 'ideas', label: 'Ideas & Projects', icon: Lightbulb },
                { id: 'weather', label: 'Weather', icon: Cloud },
                { id: 'photos', label: 'Photos', icon: Camera }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Settings Header for settings tabs */}
        {['mcp', 'api-keys'].includes(activeTab) && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'mcp' ? 'MCP Server Manager' : 'API Key Management'}
                </h2>
              </div>
              <Button onClick={() => setActiveTab('blog')} variant="outline">
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {renderActiveTab()}

        {/* Location Tracker (hidden but active) */}
        <LocationTracker photoLocations={[]} />
      </main>
    </div>
  );
};

export default Index;
