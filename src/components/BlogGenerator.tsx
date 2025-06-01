
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateBlogWithGemini } from '../services/blogService';
import { FileText, Sparkles, MapPin, Cloud, Camera, Newspaper, AlertCircle, Download, FileDown, Share2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getCurrentLocation } from '../services/locationService';
import mermaid from 'mermaid';

interface BlogGeneratorProps {
  weatherData?: any;
  locationData?: any;
  selectedPhotos?: any[];
}

const BlogGenerator = ({ weatherData, locationData: propLocationData, selectedPhotos = [] }: BlogGeneratorProps) => {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [locationData, setLocationData] = useState(propLocationData);
  
  // Enhancement options state
  const [useEnhancedBlog, setUseEnhancedBlog] = useState(true);
  const [includeWeather, setIncludeWeather] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeNews, setIncludeNews] = useState(false);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose'
    });
  }, []);

  // Re-render Mermaid diagrams when blog content changes
  useEffect(() => {
    if (generatedBlog) {
      mermaid.run();
    }
  }, [generatedBlog]);

  // Get location data if not provided
  useEffect(() => {
    if (!locationData && includeLocation) {
      getCurrentLocation().then(location => {
        console.log('Got location data:', location);
        setLocationData(location);
      }).catch(err => {
        console.error('Failed to get location:', err);
      });
    }
  }, [includeLocation]);

  const stripMarkdownFormatting = (content: string) => {
    // Remove markdown code blocks and html tags
    return content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  };

  const handleGenerate = async () => {
    if (!notes.trim()) return;

    setIsGenerating(true);
    setErrorMessage('');
    setGeneratedBlog('');
    
    try {
      console.log('Location data being passed:', includeLocation ? locationData : null);
      console.log('Weather data being passed:', includeWeather ? weatherData : null);
      
      const blog = await generateBlogWithGemini({
        topic: notes,
        locationData: includeLocation ? locationData : null,
        weatherData: includeWeather ? weatherData : null,
        selectedPhotos: includePhotos ? selectedPhotos : [],
        includeNews,
        useEnhanced: useEnhancedBlog
      });
      
      // Strip markdown formatting from the generated blog
      const cleanedBlog = stripMarkdownFormatting(blog);
      setGeneratedBlog(cleanedBlog);
    } catch (error) {
      console.error('Error generating blog:', error);
      setErrorMessage(error.message || 'Failed to generate blog post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Post</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        h2 { color: #1f2937; margin-top: 30px; }
        p { margin-bottom: 15px; }
    </style>
</head>
<body>
    ${generatedBlog}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog-post.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToMarkdown = () => {
    // Convert HTML to Markdown (basic conversion)
    let markdown = generatedBlog
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<br\s*\/?>/gi, '\n');
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog-post.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export using print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Blog Post</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
                h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                h2 { color: #1f2937; margin-top: 30px; }
                p { margin-bottom: 15px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            ${generatedBlog}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
                  <span>{locationData.name || locationData.city || `${locationData.latitude?.toFixed(2)}, ${locationData.longitude?.toFixed(2)}`}</span>
                </Badge>
              )}
              {weatherData && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Cloud className="h-3 w-3" />
                  <span>{weatherData.current?.temperature}°C, {weatherData.current?.conditions}</span>
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
              onCheckedChange={(checked) => setUseEnhancedBlog(checked === true)}
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
                  onCheckedChange={(checked) => setIncludeWeather(checked === true)}
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
                  onCheckedChange={(checked) => setIncludePhotos(checked === true)}
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
                  onCheckedChange={(checked) => setIncludeLocation(checked === true)}
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
                  onCheckedChange={(checked) => setIncludeNews(checked === true)}
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

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
            {errorMessage.includes('API key') && (
              <span className="block mt-2">
                Please go to Settings → API Key Management to add your Google Gemini API key.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Generated Blog */}
      {generatedBlog && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Blog Post</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToHTML}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as HTML
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToMarkdown}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-lg max-w-none 
                prose-headings:font-bold prose-headings:text-gray-900 
                prose-h1:text-4xl prose-h1:font-bold prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-6 prose-h1:mt-0
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 
                prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                prose-p:mb-4 prose-p:leading-relaxed prose-p:text-gray-700 
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-em:text-gray-600"
              dangerouslySetInnerHTML={{ __html: generatedBlog }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogGenerator;
