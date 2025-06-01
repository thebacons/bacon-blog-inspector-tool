import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get API key from localStorage (API Key Manager) or environment
 */
function getGoogleAPIKey() {
  // First check localStorage for API keys from API Key Manager
  try {
    const storedKeys = localStorage.getItem('api_keys');
    if (storedKeys) {
      const apiKeys = JSON.parse(storedKeys);
      const googleKey = apiKeys.find(key => key.provider === 'google' && key.isActive && key.value);
      if (googleKey && googleKey.value && googleKey.value !== 'demo-key') {
        console.log('Using Google API key from API Key Manager');
        return googleKey.value;
      }
    }
  } catch (error) {
    console.error('Error reading API keys from localStorage:', error);
  }

  // Fallback to environment variable
  const envKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (envKey && envKey !== 'demo-key') {
    console.log('Using Google API key from environment');
    return envKey;
  }

  return null;
}

/**
 * Format date in European format with ordinal suffix
 */
function formatEuropeanDate() {
  const now = new Date();
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const weekday = weekdays[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  
  // Add ordinal suffix
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${weekday} ${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
}

/**
 * Get weather emoji for title
 */
function getWeatherEmoji(weatherData) {
  if (!weatherData?.current?.conditions) return '';
  
  const conditions = weatherData.current.conditions.toLowerCase();
  if (conditions.includes('sun') || conditions.includes('clear')) return '☀️';
  if (conditions.includes('cloud') || conditions.includes('overcast')) return '⛅';
  if (conditions.includes('rain')) return '🌧️';
  if (conditions.includes('snow')) return '❄️';
  if (conditions.includes('storm') || conditions.includes('thunder')) return '⛈️';
  if (conditions.includes('fog') || conditions.includes('mist')) return '🌫️';
  return '🌤️';
}

/**
 * Format location data for title
 */
function formatLocationForTitle(locationData) {
  if (!locationData) return '';
  
  console.log('Formatting location for title:', locationData);
  
  // Try different location properties in order of preference
  if (locationData.name) return locationData.name;
  if (locationData.city) return locationData.city;
  if (locationData.address) return locationData.address;
  if (locationData.locality) return locationData.locality;
  
  // If we have coordinates, format them
  if (locationData.latitude && locationData.longitude) {
    return `${locationData.latitude.toFixed(2)}, ${locationData.longitude.toFixed(2)}`;
  }
  
  return '';
}

/**
 * Generate a blog post using Gemini 2.0 Flash with REAL location and weather context
 * @param {Object} params - Blog generation parameters
 * @param {string} params.topic - The main blog topic/notes
 * @param {Object} params.locationData - REAL location information from GPS/IP
 * @param {Object} params.weatherData - REAL weather information from weather APIs
 * @param {Array} params.selectedPhotos - Selected photos with metadata
 * @param {boolean} params.includeNews - Whether to include news
 * @param {boolean} params.useEnhanced - Whether to use enhanced blog generation
 * @returns {Promise<string>} - Generated blog post HTML
 */
export async function generateBlogWithGemini({ 
  topic, 
  locationData, 
  weatherData, 
  selectedPhotos = [], 
  includeNews = false, 
  useEnhanced = true 
}) {
  try {
    console.log('=== BLOG GENERATION DEBUG ===');
    console.log('Topic:', topic);
    console.log('Location Data:', locationData);
    console.log('Weather Data:', weatherData);
    console.log('Selected Photos:', selectedPhotos?.length || 0);
    console.log('Include News:', includeNews);
    console.log('Use Enhanced:', useEnhanced);

    // Get API key from API Key Manager or environment
    const apiKey = getGoogleAPIKey();
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    
    if (!apiKey) {
      throw new Error('Google Gemini API key not found. Please add your Google API key in Settings → API Key Management.');
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Create conservative system prompt that doesn't hallucinate details
    const systemPrompt = `You are a skilled personal storyteller who transforms rough daily notes into engaging, authentic blog posts. 

CRITICAL RULES - DO NOT BREAK THESE:
1. NEVER invent specific names, places, or details not provided in the user's notes
2. If the user mentions "dog" or "cat" without names, refer to them as "my dog" or "my cat" 
3. If location isn't provided, use general terms like "here" or "in my area"
4. When key details are missing, acknowledge this naturally in the story
5. Work ONLY with the information provided - don't add fictional specifics

WRITING STYLE:
- Write in first person as someone who actually lived this day
- Transform rough notes into smooth, connected storytelling 
- Add emotional depth and personal meaning to simple events
- Use vivid, sensory descriptions that paint a picture
- Include personal reflections and insights that make the story relatable
- Create natural transitions between different activities/thoughts
- Target 400-600 words for substantial but readable content
- Make it feel like a real person's authentic diary entry with personality

STORY TRANSFORMATION RULES:
- NEVER just repeat the user's rough notes verbatim
- Expand brief mentions into full scenes with context
- Connect seemingly unrelated events into a cohesive day's story
- Add details about thoughts, feelings, and observations
- Use the weather and location to enhance the storytelling atmosphere
- Transform fragments into full narrative scenes WITHOUT adding fictional names or places

REAL DATA INTEGRATION:
- Weave actual weather conditions naturally into the narrative mood and activities
- Reference the real location to provide authentic setting details  
- Use environmental details to enhance the story's atmosphere
- Connect weather to emotions and activities organically

MISSING INFORMATION HANDLING:
- If specific details are missing, acknowledge this naturally in the story
- Use phrases like "I wish I could remember the name of..." or "somewhere nearby"
- Don't invent names, places, or specific details not provided

OUTPUT FORMAT:
- Return ONLY clean HTML with h1 for title, h2 for sections, p for paragraphs
- NO markdown code blocks or formatting - pure HTML only
- Create engaging titles that capture the day's essence and mood
- Structure as natural story flow, not a list of activities
- DO NOT wrap the output in \`\`\`html or any other markdown formatting

TITLE FORMAT:
- Include ONLY the formatted date and story title
- Format: [European Date] - [Story Title]
- Example: "Sunday 1st June, 2025 - A Wonderful Day"
- DO NOT include location or weather emoji in the title`;

    // Build the user prompt with comprehensive context
    const europeanDate = formatEuropeanDate();
    
    console.log('Title date formatted:', europeanDate);

    let userPrompt = `Transform these rough notes into an engaging personal blog story for ${europeanDate}:

ROUGH NOTES TO TRANSFORM:
"${topic}"

TITLE REQUIREMENTS:
- Start the title with: "${europeanDate}"
- Format: "${europeanDate} - [Your Story Title]"
- DO NOT include location or weather information in the title

CRITICAL INSTRUCTIONS: 
- These are rough, disconnected notes. Transform them into a beautiful, flowing personal story
- DO NOT invent specific names, places, or details not mentioned in the notes
- If pets are mentioned without names, refer to them as "my dog", "my cat", etc.
- If locations aren't specified, use general terms
- Work ONLY with the information provided - don't add fictional specifics
- When details are missing, acknowledge this naturally in the narrative
- Return ONLY clean HTML - NO markdown code blocks or formatting

`;

    // Add REAL location context with more detail
    if (locationData) {
      const titleLocation = formatLocationForTitle(locationData);
      userPrompt += `REAL LOCATION CONTEXT:
Location: ${titleLocation}
${locationData.country ? `Country: ${locationData.country}` : ''}
${locationData.region ? `Region: ${locationData.region}` : ''}
${locationData.state ? `State: ${locationData.state}` : ''}
${locationData.address ? `Address: ${locationData.address}` : ''}
Use this location naturally in your storytelling to set the scene and provide authentic geographic context.

`;
    }

    // Add REAL weather context with comprehensive details
    if (weatherData?.current) {
      const weather = weatherData.current;
      userPrompt += `REAL WEATHER CONDITIONS FOR TODAY:
Temperature: ${weather.temperature}°C
Conditions: ${weather.conditions || 'Unknown'}
${weather.feelsLike ? `Feels Like: ${weather.feelsLike}°C` : ''}
${weather.humidity ? `Humidity: ${weather.humidity}%` : ''}
${weather.windSpeed ? `Wind Speed: ${weather.windSpeed} km/h` : ''}

WEATHER SOURCE: ${weatherData.source || 'Real weather data'}
${weatherData.astronomy?.sunrise ? `Sunrise: ${weatherData.astronomy.sunrise}` : ''}
${weatherData.astronomy?.sunset ? `Sunset: ${weatherData.astronomy.sunset}` : ''}

Weave these real weather details naturally into the story atmosphere, activities, and mood. Use the actual temperature and conditions to inform how the day felt and what activities were possible or enjoyable.

`;
    }

    // Add photo context
    if (selectedPhotos.length > 0) {
      userPrompt += `PHOTOS FROM TODAY (${selectedPhotos.length} photos):
`;
      selectedPhotos.slice(0, 3).forEach((photo, index) => {
        userPrompt += `Photo ${index + 1}:`;
        if (photo.aiAnalysis?.description) {
          userPrompt += ` ${photo.aiAnalysis.description}`;
        }
        if (photo.aiAnalysis?.mood) {
          userPrompt += ` (Mood: ${photo.aiAnalysis.mood})`;
        }
        userPrompt += `\n`;
      });
      userPrompt += `Reference these photos naturally in your storytelling if relevant to the day's events.\n\n`;
    }

    userPrompt += `FINAL REMINDER: Transform the rough notes into a compelling personal story with scenes, emotions, and natural flow. DO NOT invent names, places, or specific details not provided. Work only with what you have been given. Use the real weather and location data to enhance the authenticity and atmosphere of the story. Return ONLY clean HTML without any markdown formatting.`;

    console.log('Sending prompt to Gemini 2.0 Flash with real context data');

    // Generate content with Gemini
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    let blogContent = response.text();
    
    // Clean up any potential markdown formatting that might slip through
    blogContent = blogContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Blog post generated successfully with Gemini 2.0 Flash');
    console.log('Generated content preview:', blogContent.substring(0, 200) + '...');
    return blogContent;

  } catch (error) {
    console.error('Error generating blog with Gemini:', error);
    throw error; // Re-throw the error so the UI can handle it
  }
}
