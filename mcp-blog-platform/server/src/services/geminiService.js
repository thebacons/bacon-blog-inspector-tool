
// src/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import logger from '../logger.js';

dotenv.config();

// Helper function to safely stringify objects with circular references
const safeStringify = (obj, indent = 2) => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return '[Circular]';
      cache.add(value);
    }
    return value;
  }, indent);
};

// Helper function to safely access nested object properties
const safeGet = (obj, path, defaultValue = '') => {
  if (!obj) return defaultValue;
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined || result === null) return defaultValue;
  }
  return result;
};

// Initialize Google Generative AI
const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

/**
 * Generate a simple blog post from user notes using Google Gemini
 * @param {string} text - User's notes to transform into a blog post
 * @returns {Promise<string>} - Generated blog post with HTML formatting
 */
export async function generateBlogPost(text) {
  try {
    if (!genAI) {
      logger.warn('Google API key not configured, using demo mode');
      return generateDemoBlogPost(text);
    }

    logger.info('Generating blog post with Gemini API for text:', text);
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Create a well-structured blog post based on this topic: "${text}". 
    
    Please format the response as HTML with:
    - An h1 title
    - Multiple h2 section headers
    - Paragraph content with proper p tags
    - Make it engaging and informative
    - Keep it concise but substantial (3-4 sections)
    
    Topic: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const blogPost = response.text();
    
    logger.info('Blog post generated successfully with Gemini');
    return blogPost;
  } catch (error) {
    logger.error('Error generating blog post with Gemini:', error);
    // Fallback to demo mode if API fails
    return generateDemoBlogPost(text);
  }
}

/**
 * Generate an enhanced blog post incorporating smart location, date-based title, today's photos, weather, and news
 * @param {Object} payload - Parameters for blog generation
 * @returns {Promise<string>} - Generated enhanced blog post with HTML formatting
 */
export async function generateEnhancedBlogPost(payload) {
  try {
    if (!genAI) {
      logger.warn('Google API key not configured, using demo mode');
      return generateDemoEnhancedBlogPost(payload);
    }

    // Extract all parameters from the payload
    const {
      text = '',
      useDateTitle = true,
      useTodaysPhotos = true,
      usePhotoData = true,
      useSmartLocation = true,
      useWeatherData = true,
      useNewsData = true,
      selectedPhotos = [],
      newsTopics = [],
      locationData = {},
      weatherData = {},
      photoMetadata,
      newsData,
      titleInfo,
      todaysPhotos = selectedPhotos,
    } = payload;

    logger.info('Generating enhanced blog post with Gemini API', {
      text: text ? `${text.substring(0, 50)}...` : 'No text',
      hasLocationData: Object.keys(locationData || {}).length > 0,
      hasWeatherData: Object.keys(weatherData || {}).length > 0,
      hasPhotos: todaysPhotos?.length > 0
    });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Generate current date information
    const now = new Date();
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);
    
    // Build comprehensive context for the AI
    let contextPrompt = `Write a personal, engaging blog post for ${formattedDate}. Use the following information to create a natural, flowing narrative:

PERSONAL NOTES/THOUGHTS:
"${text}"

`;

    // Add location context
    if (useSmartLocation && locationData?.name) {
      contextPrompt += `LOCATION: Currently in ${locationData.name}\n\n`;
    }
    
    // Add detailed weather context
    if (useWeatherData && weatherData?.temperature) {
      const temp = weatherData.temperature;
      const unit = weatherData.unit === 'Â°C' ? '°C' : (weatherData.unit || '°C');
      const conditions = weatherData.conditions || '';
      
      contextPrompt += `WEATHER INFORMATION:
- Current temperature: ${temp}${unit}
- Conditions: ${conditions}`;
      
      if (weatherData.feelsLike) {
        contextPrompt += `
- Feels like: ${weatherData.feelsLike}${unit}`;
      }
      
      if (weatherData.humidity) {
        contextPrompt += `
- Humidity: ${weatherData.humidity}%`;
      }
      
      if (weatherData.windSpeed) {
        contextPrompt += `
- Wind speed: ${weatherData.windSpeed} km/h`;
      }
      
      // Add forecast information
      if (weatherData.forecast && weatherData.forecast.length > 0) {
        contextPrompt += `
- Forecast: `;
        weatherData.forecast.forEach((day, index) => {
          if (index === 0) {
            contextPrompt += `Today will be ${day.conditions} with a high of ${day.high}° and low of ${day.low}°. `;
          } else {
            contextPrompt += `${day.day} will be ${day.conditions} (${day.high}°/${day.low}°). `;
          }
        });
      }
      
      contextPrompt += `\n\n`;
    }
    
    // Add photo context with details
    if (useTodaysPhotos && todaysPhotos?.length > 0) {
      contextPrompt += `PHOTOS FROM TODAY (${todaysPhotos.length} photos taken):
`;
      todaysPhotos.forEach((photo, index) => {
        contextPrompt += `Photo ${index + 1}:`;
        if (photo.analysis?.description) {
          contextPrompt += ` ${photo.analysis.description}`;
        }
        if (photo.analysis?.people && photo.analysis.people.length > 0) {
          contextPrompt += ` (People: ${photo.analysis.people.join(', ')})`;
        }
        if (photo.location?.name || photo.analysis?.location?.locationName) {
          const photoLocation = photo.location?.name || photo.analysis?.location?.locationName;
          contextPrompt += ` (Location: ${photoLocation})`;
        }
        if (photo.analysis?.mood) {
          contextPrompt += ` (Mood: ${photo.analysis.mood})`;
        }
        if (photo.analysis?.activity) {
          contextPrompt += ` (Activity: ${photo.analysis.activity})`;
        }
        contextPrompt += `\n`;
      });
      contextPrompt += `\n`;
    }
    
    // Add news context
    if (useNewsData && newsData?.articles?.length > 0) {
      contextPrompt += `CURRENT NEWS TOPICS:
`;
      newsData.articles.slice(0, 3).forEach((article, index) => {
        contextPrompt += `- ${article.title}\n`;
      });
      contextPrompt += `\n`;
    }
    
    contextPrompt += `INSTRUCTIONS:
1. Create a natural, personal blog post that flows smoothly
2. Use an engaging title that reflects the day and main activities (NOT just the date)
3. Weave the weather, photos, and activities into a cohesive narrative
4. Don't just list information - tell the story of the day
5. Use proper HTML structure with h1 for title, h2 for sections, p for paragraphs
6. Make it feel authentic and personal, like a real person's diary entry
7. If photos show activities or people, incorporate those naturally into the story
8. Use the weather information to set the mood and context
9. Keep it engaging but not overly dramatic
10. Write in first person as if you experienced this day

Return only clean HTML content without markdown formatting or code blocks.`;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const blogPost = response.text();
    
    logger.info('Enhanced blog post generated successfully with Gemini');
    return blogPost;
  } catch (error) {
    logger.error('Error generating enhanced blog post with Gemini:', error);
    // Fallback to demo mode if API fails
    return generateDemoEnhancedBlogPost(payload);
  }
}

/**
 * Demo blog post generation (fallback when API is not available)
 */
function generateDemoBlogPost(text) {
  return `
    <h1>Blog Post: ${text}</h1>
    
    <h2>Introduction</h2>
    <p>Welcome to this blog post about "${text}". This is a demonstration of the MCP orchestrator
    with direct handling of blog generation capabilities.</p>
    
    <h2>Main Content</h2>
    <p>The MCP (Multi-Agent Control Plane) architecture allows for seamless communication between
    different components in an AI system. This orchestrator demonstrates how client requests can be
    routed to appropriate capabilities.</p>
    
    <h2>Conclusion</h2>
    <p>With this demonstration, we've shown how the MCP architecture can handle message routing based on
    capabilities, with the blog writing agent being one example.</p>
  `;
}

/**
 * Demo enhanced blog post generation (fallback when API is not available)
 */
function generateDemoEnhancedBlogPost(payload) {
  // ... keep existing code (the large demo implementation from the original file)
  const {
    text = '',
    useDateTitle = true,
    useTodaysPhotos = true,
    usePhotoData = true,
    useSmartLocation = true,
    useWeatherData = true,
    useNewsData = true,
    selectedPhotos = [],
    newsTopics = [],
    locationData = {},
    weatherData = {},
    photoMetadata,
    newsData,
    titleInfo,
    todaysPhotos = selectedPhotos,
  } = payload;

  // Generate current date
  const now = new Date();
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);

  // Build the demo blog post with more natural flow
  let blogContent = `<h1>A Beautiful ${formattedDate}</h1>
  
  <h2>Morning Reflections</h2>
  <p>As I sit down to write about today, I can't help but think about ${text}. `;
  
  if (useWeatherData && weatherData?.temperature) {
    const temp = weatherData.temperature;
    const unit = weatherData.unit === 'Â°C' ? '°C' : (weatherData.unit || '°C');
    const conditions = weatherData.conditions || 'pleasant';
    blogContent += `The weather has been ${conditions.toLowerCase()} today, with temperatures around ${temp}${unit}. `;
  }
  
  if (useSmartLocation && locationData?.name) {
    blogContent += `Here in ${locationData.name}, `;
  }
  
  blogContent += `it's been one of those days that reminds me why I love documenting these moments.</p>
  
  <h2>The Day Unfolded</h2>
  <p>`;
  
  if (useTodaysPhotos && todaysPhotos?.length > 0) {
    blogContent += `I captured ${todaysPhotos.length} photos today, each telling its own story. `;
    
    // Add some details about the photos
    todaysPhotos.slice(0, 2).forEach((photo, index) => {
      if (photo.analysis?.description) {
        blogContent += `One particularly memorable shot shows ${photo.analysis.description.toLowerCase()}. `;
      }
    });
  }
  
  blogContent += `${text} This thought has been with me throughout the day, coloring my experiences and perspective.</p>
  
  <h2>Evening Thoughts</h2>
  <p>As the day winds down, I'm grateful for these moments of reflection. `;
  
  if (useWeatherData && weatherData?.forecast) {
    const tomorrow = weatherData.forecast.find(day => day.day === 'Tomorrow');
    if (tomorrow) {
      blogContent += `Looking ahead to tomorrow, the forecast shows ${tomorrow.conditions.toLowerCase()} weather with temperatures reaching ${tomorrow.high}°. `;
    }
  }
  
  blogContent += `Days like these remind me of the beauty in ordinary moments and the importance of capturing them.</p>`;

  return blogContent;
}

export default {
  generateBlogPost,
  generateEnhancedBlogPost,
  safeGet
};
