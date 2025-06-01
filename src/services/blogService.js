
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
- Return clean HTML with h1 for title, h2 for sections, p for paragraphs
- Create engaging titles that capture the day's essence and mood
- Structure as natural story flow, not a list of activities
- No markdown - pure HTML only`;

    // Build the user prompt with comprehensive context
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let userPrompt = `Transform these rough notes into an engaging personal blog story for ${currentDate}:

ROUGH NOTES TO TRANSFORM:
"${topic}"

CRITICAL INSTRUCTIONS: 
- These are rough, disconnected notes. Transform them into a beautiful, flowing personal story
- DO NOT invent specific names, places, or details not mentioned in the notes
- If pets are mentioned without names, refer to them as "my dog", "my cat", etc.
- If locations aren't specified, use general terms
- Work ONLY with the information provided - don't add fictional specifics
- When details are missing, acknowledge this naturally in the narrative

`;

    // Add REAL location context
    if (locationData?.name) {
      userPrompt += `REAL LOCATION CONTEXT:
Location: ${locationData.name}
${locationData.country ? `Country: ${locationData.country}` : ''}
Use this location naturally in your storytelling to set the scene.

`;
    }

    // Add REAL weather context  
    if (weatherData?.temperature !== undefined) {
      userPrompt += `REAL WEATHER CONDITIONS:
Temperature: ${weatherData.temperature}${weatherData.unit || '°C'}
Conditions: ${weatherData.conditions || 'Unknown'}
${weatherData.feelsLike ? `Feels Like: ${weatherData.feelsLike}${weatherData.unit || '°C'}` : ''}
${weatherData.humidity ? `Humidity: ${weatherData.humidity}%` : ''}
Weave these weather details naturally into the story atmosphere and activities.

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
      userPrompt += `Reference these photos naturally in your storytelling if relevant.\n\n`;
    }

    userPrompt += `FINAL REMINDER: Transform the rough notes into a compelling personal story with scenes, emotions, and natural flow. DO NOT invent names, places, or specific details not provided. Work only with what you have been given.`;

    console.log('Sending prompt to Gemini 2.0 Flash with real context data');

    // Generate content with Gemini
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    const blogContent = response.text();

    console.log('Blog post generated successfully with Gemini 2.0 Flash');
    console.log('Generated content preview:', blogContent.substring(0, 200) + '...');
    return blogContent;

  } catch (error) {
    console.error('Error generating blog with Gemini:', error);
    throw error; // Re-throw the error so the UI can handle it
  }
}
