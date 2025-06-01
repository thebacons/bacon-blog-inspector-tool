
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { generateBlogWithGemini } from '../services/blogService';
import { FileText, Sparkles, MapPin, Cloud, Camera, Newspaper } from 'lucide-react';

interface BlogGeneratorProps {
  weatherData?: any;
  locationData?: any;
  selectedPhotos?: any[];
}

const BlogGenerator = ({ weatherData, locationData, selectedPhotos = [] }: BlogGeneratorProps) => {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState('');
  
  // Enhancement options state
  const [useEnhancedBlog, setUseEnhancedBlog] = useState(true);
  const [includeWeather, setIncludeWeather] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeNews, setIncludeNews] = useState(false);

  const handleGenerate = async () => {
    if (!notes.trim()) return;

    setIsGenerating(true);
    try {
      const blog = await generateBlogWithGemini({
        topic: notes,
        locationData: includeLocation ? locationData : null,
        weatherData: includeWeather ? weatherData : null,
        selectedPhotos: includePhotos ? selectedPhotos : [],
        includeNews,
        useEnhanced: useEnhancedBlog
      });
      setGeneratedBlog(blog);
    } catch (error) {
      console.error('Error generating blog:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Information */}
      {(locationData || weatherData) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Real Context Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {locationData && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{locationData.name || `${locationData.latitude?.toFixed(2)}, ${locationData.longitude?.toFixed(2)}`}</span>
                </Badge>
              )}
              {weatherData && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Cloud className="h-3 w-3" />
                  <span>{weatherData.temperature}°C, {weatherData.conditions}</span>
                </Badge>
              )}
              {selectedPhotos.length > 0 && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Camera className="h-3 w-3" />
                  <span>{selectedPhotos.length} photos selected</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Blog Topic</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your blog topic or idea here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Enhanced Blog Options */}
      <Card>
        <CardHeader>
          <CardTitle>Use Enhanced Blog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enhanced-blog"
              checked={useEnhancedBlog}
              onCheckedChange={setUseEnhancedBlog}
            />
            <label htmlFor="enhanced-blog" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Enhanced blogs include contextual information like weather, location, and photos
            </label>
          </div>
          
          {useEnhancedBlog && (
            <div className="ml-6 space-y-3">
              <h4 className="text-sm font-medium">Enhancement Options</h4>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-weather"
                  checked={includeWeather}
                  onCheckedChange={setIncludeWeather}
                />
                <Cloud className="h-4 w-4" />
                <label htmlFor="include-weather" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Include Weather
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-photos"
                  checked={includePhotos}
                  onCheckedChange={setIncludePhotos}
                />
                <Camera className="h-4 w-4" />
                <label htmlFor="include-photos" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Include Photos
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-location"
                  checked={includeLocation}
                  onCheckedChange={setIncludeLocation}
                />
                <MapPin className="h-4 w-4" />
                <label htmlFor="include-location" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Include Location
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-news"
                  checked={includeNews}
                  onCheckedChange={setIncludeNews}
                />
                <Newspaper className="h-4 w-4" />
                <label htmlFor="include-news" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Include News
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button 
        onClick={handleGenerate}
        disabled={!notes.trim() || isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating...' : 'Generate Blog'}
      </Button>

      {/* Generated Blog */}
      {generatedBlog && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedBlog }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogGenerator;
