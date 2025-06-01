
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || 'demo-key');

/**
 * Generate a blog post using Gemini 2.5 Pro Preview with REAL location and weather context
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

    // Check if we have a real API key
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    console.log('API Key exists:', !!apiKey && apiKey !== 'demo-key');
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    
    if (!apiKey || apiKey === 'demo-key') {
      console.warn('No Gemini API key found, using enhanced mock generation with REAL data');
      return generateEnhancedBlogWithRealData({ 
        topic, 
        locationData, 
        weatherData, 
        selectedPhotos 
      });
    }

    // Use Gemini 2.5 Pro Preview 05-06 model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Create comprehensive system prompt for authentic blog writing
    const systemPrompt = `You are a skilled personal storyteller who transforms rough daily notes into engaging, authentic blog posts. 

CRITICAL TASK: Transform disconnected bullet points and rough notes into a flowing, compelling personal narrative.

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
- Transform fragments like "dog ran away, took cat for a walk instead" into full narrative scenes

REAL DATA INTEGRATION:
- Weave actual weather conditions naturally into the narrative mood and activities
- Reference the real location to provide authentic setting details  
- Use environmental details to enhance the story's atmosphere
- Connect weather to emotions and activities organically

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

INSTRUCTIONS: These are rough, disconnected notes. Your job is to transform them into a beautiful, flowing personal story. Don't just repeat the words - create scenes, add emotions, build connections between events. Make this feel like a real person telling the story of their day.

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

    userPrompt += `FINAL REMINDER: Transform the rough notes into a compelling personal story with scenes, emotions, and natural flow. Make the reader feel like they experienced this day with you.`;

    console.log('Sending enhanced prompt to Gemini 2.5 Pro Preview with real context data');

    // Generate content with Gemini
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    const blogContent = response.text();

    console.log('Blog post generated successfully with Gemini 2.5 Pro Preview');
    console.log('Generated content preview:', blogContent.substring(0, 200) + '...');
    return blogContent;

  } catch (error) {
    console.error('Error generating blog with Gemini:', error);
    console.error('Error details:', error.message);
    // Fallback to enhanced generation with real data
    return generateEnhancedBlogWithRealData({ topic, locationData, weatherData, selectedPhotos });
  }
}

/**
 * Enhanced blog generation using REAL location and weather data (fallback)
 */
function generateEnhancedBlogWithRealData({ topic, locationData, weatherData, selectedPhotos = [] }) {
  console.log('Generating enhanced fallback blog with REAL data:', {
    location: locationData?.name,
    weather: weatherData ? `${weatherData.temperature}°C, ${weatherData.conditions}` : 'No weather',
    photos: selectedPhotos.length
  });

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Create smart title using REAL data
  const locationPart = locationData?.name ? ` in ${locationData.name.split(',')[0]}` : '';
  const weatherAdj = weatherData?.conditions ? getWeatherAdjective(weatherData.conditions) : 'Beautiful';
  const title = `${weatherAdj} ${currentDate.split(',')[0]}${locationPart}`;

  let blogContent = `<h1>${title}</h1>

<p>What a memorable ${currentDate}! `;

  // Use REAL weather data in opening
  if (weatherData?.temperature !== undefined) {
    const temp = weatherData.temperature;
    const unit = weatherData.unit || '°C';
    const conditions = weatherData.conditions || 'pleasant conditions';
    
    blogContent += `The day began with ${conditions} and a ${temp < 10 ? 'crisp' : temp > 25 ? 'warm' : 'comfortable'} ${temp}${unit}. `;
    
    if (weatherData.feelsLike && Math.abs(weatherData.feelsLike - temp) > 3) {
      blogContent += `Though it felt more like ${weatherData.feelsLike}${unit}. `;
    }
  }

  // Use REAL location data
  if (locationData?.name) {
    blogContent += `Here in ${locationData.name}, it's been one of those days that reminds me why I love documenting these moments. `;
  }

  blogContent += `</p>

<h2>The Day's Journey</h2>
<p>${createNarrativeFromNotes(topic, weatherData, locationData)}</p>
`;

  // Add photo section
  if (selectedPhotos.length > 0) {
    blogContent += `
<h2>Captured Moments</h2>
<p>Today I was fortunate to capture ${selectedPhotos.length} beautiful moments. `;
    
    selectedPhotos.slice(0, 2).forEach((photo, index) => {
      if (photo.aiAnalysis?.description) {
        const photoIntro = index === 0 ? 'One image shows' : 'Another shot captures';
        blogContent += `${photoIntro} ${photo.aiAnalysis.description.toLowerCase()}. `;
      }
    });
    
    blogContent += `Each photograph tells part of today's story.</p>
`;
  }

  // Weather-informed closing reflection
  blogContent += `
<h2>Evening Reflections</h2>
<p>As ${currentDate} draws to a close`;

  if (weatherData?.temperature !== undefined) {
    const evening = weatherData.temperature > 20 ? ', with the warm evening air still holding the day\'s warmth' : 
                   weatherData.temperature < 5 ? ', as the cool air settles in' : 
                   ', with the pleasant temperature making for a perfect evening';
    blogContent += evening;
  }

  blogContent += `, I'm filled with gratitude for these experiences. Days like these remind us to appreciate both the grand moments and the simple pleasures that make life meaningful.</p>`;

  return blogContent;
}

// Helper functions
function getWeatherAdjective(conditions) {
  const condition = conditions?.toLowerCase() || '';
  if (condition.includes('sunny') || condition.includes('clear')) return 'Sun-Kissed';
  if (condition.includes('cloudy')) return 'Thoughtful';
  if (condition.includes('rain')) return 'Refreshing';
  if (condition.includes('snow')) return 'Serene';
  return 'Beautiful';
}

function createNarrativeFromNotes(notes, weatherData, locationData) {
  let narrative = `The day unfolded with ${notes}. `;
  
  // Add real weather context to narrative
  if (weatherData?.conditions && weatherData?.temperature !== undefined) {
    const temp = weatherData.temperature;
    const conditions = weatherData.conditions.toLowerCase();
    
    if (temp < 5) {
      narrative += `The cold ${temp}°C weather with ${conditions} made every warm moment inside feel extra special. `;
    } else if (temp > 25) {
      narrative += `The warm ${temp}°C day with ${conditions} provided perfect conditions for being outdoors. `;
    } else {
      narrative += `The pleasant ${temp}°C weather and ${conditions} made it an ideal day for these activities. `;
    }
  }
  
  // Add real location context
  if (locationData?.name) {
    narrative += `Being in ${locationData.name} added a special dimension to these experiences. `;
  }
  
  return narrative;
}
