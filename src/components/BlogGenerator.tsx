
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateBlogWithGemini } from '../services/blogService';
import { FileText, Sparkles, MapPin, Cloud } from 'lucide-react';

interface BlogGeneratorProps {
  weatherData?: any;
  locationData?: any;
  selectedPhotos?: any[];
}

const BlogGenerator = ({ weatherData, locationData, selectedPhotos = [] }: BlogGeneratorProps) => {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState('');

  const handleGenerate = async () => {
    if (!notes.trim()) return;

    setIsGenerating(true);
    try {
      const blog = await generateBlogWithGemini({
        topic: notes,
        locationData,
        weatherData,
        selectedPhotos
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
                  <FileText className="h-3 w-3" />
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
            <span>Blog Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your thoughts, experiences, or notes for today..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <Button 
            onClick={handleGenerate}
            disabled={!notes.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Blog Post'}
          </Button>
        </CardContent>
      </Card>

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
