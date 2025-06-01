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
    
    // Build context for the AI
    let contextPrompt = `Create an engaging, personal blog post based on the following information:\n\n`;
    contextPrompt += `Main topic or thoughts: "${text}"\n\n`;
    
    // Add location context
    if (useSmartLocation && locationData?.name) {
      contextPrompt += `Current location: ${locationData.name}\n`;
    }
    
    // Add weather context
    if (useWeatherData && weatherData?.temperature) {
      const temp = weatherData.temperature;
      const unit = weatherData.unit === 'Â°C' ? '°C' : (weatherData.unit || '°C');
      const conditions = weatherData.conditions || '';
      contextPrompt += `Current weather: ${temp}${unit}, ${conditions}\n`;
    }
    
    // Add photo context
    if (useTodaysPhotos && todaysPhotos?.length > 0) {
      contextPrompt += `Today's photos: ${todaysPhotos.length} photos were taken\n`;
    }
    
    // Add news context
    if (useNewsData && newsData?.articles?.length > 0) {
      contextPrompt += `Current news topics: ${newsData.articles.slice(0, 2).map(a => a.title).join(', ')}\n`;
    }
    
    contextPrompt += `\nPlease create a personal, engaging blog post that:
    - Uses an appropriate HTML structure with h1, h2, and p tags
    - Incorporates the contextual information naturally
    - Feels personal and authentic
    - Is well-structured with 3-4 sections
    - Includes a compelling introduction and conclusion
    - Maintains a conversational but polished tone
    
    Return only the HTML content without any markdown formatting.`;

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

  // Build the demo blog post with context
  const sections = [];
  
  sections.push(`<h1>Blog Post: ${text || 'My Day'}</h1>`);
  
  let intro = `<h2>Introduction</h2><p>As I sit down to write this blog${text ? ` about "${text}"` : ''}`;
  
  if (useSmartLocation && locationData?.name) {
    intro += `, I'm writing from ${locationData.name}. `;
  }
  
  if (useWeatherData && weatherData?.temperature) {
    const temp = weatherData.temperature;
    const unit = weatherData.unit === 'Â°C' ? '°C' : (weatherData.unit || '°C');
    const conditions = weatherData.conditions || '';
    intro += `The weather is currently ${temp}${unit} and ${conditions.toLowerCase()}. `;
  }
  
  intro += 'This is a demonstration using demo data.</p>';
  sections.push(intro);
  
  sections.push(`
    <h2>My Thoughts</h2>
    <p>${text || 'Today has been an interesting day.'}</p>
    
    <h2>Conclusion</h2>
    <p>As I reflect on ${text ? 'this topic' : 'the day'}, I'm reminded of how technology continues to shape our experiences and perspectives in meaningful ways.</p>
  `);
  
  return sections.join('\n\n');
}

export default {
  generateBlogPost,
  generateEnhancedBlogPost,
  safeGet
};
