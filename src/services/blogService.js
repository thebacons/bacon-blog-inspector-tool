
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || 'demo-key');

/**
 * Generate a blog post using Gemini 2.5 Flash with REAL location and weather context
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
    
    if (!apiKey || apiKey === 'demo-key') {
      console.warn('No Gemini API key found, using enhanced mock generation with REAL data');
      return generateEnhancedBlogWithRealData({ 
        topic, 
        locationData, 
        weatherData, 
        selectedPhotos 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Create comprehensive system prompt for authentic blog writing
    const systemPrompt = `You are a skilled personal blog writer who creates engaging, authentic blog posts from daily experiences and rough notes. 

WRITING STYLE:
- Write in first person as someone who actually lived this day
- Create a flowing narrative that naturally connects activities and observations
- Use vivid, sensory descriptions that paint a picture of the experience
- Include personal reflections and insights
- Structure with clear sections but smooth transitions between them
- Target 400-600 words for substantial but readable content
- Make it feel like a real person's authentic diary entry

REAL DATA INTEGRATION:
- The location and weather data provided is REAL, not simulated
- Reference actual weather conditions to set mood and atmosphere
- Mention the real location naturally to provide authentic setting
- Connect weather to activities and mood (e.g., "the crisp 8°C morning made the coffee taste even better")
- Use weather as narrative elements throughout the story

CONTENT TRANSFORMATION:
- Transform rough bullet points into smooth, connected narrative
- Don't just list activities - weave them into a cohesive story of the day
- Add emotional context and personal meaning to simple activities
- Use the environment (weather/location) to enhance the storytelling

OUTPUT FORMAT:
- Return clean HTML with h1 for title, h2 for sections, p for paragraphs
- Create engaging titles that reflect the actual experience and location
- Structure: Scene-setting opening, main activities/experiences, personal reflections
- No markdown - pure HTML only`;

    // Build the user prompt with comprehensive context
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let userPrompt = `Transform these rough notes into an engaging personal blog post for ${currentDate}:

ROUGH NOTES/BULLET POINTS:
${topic}

`;

    // Add REAL location context
    if (locationData?.name) {
      userPrompt += `REAL LOCATION DATA:
Location: ${locationData.name}
${locationData.country ? `Country: ${locationData.country}` : ''}
${locationData.timezone ? `Timezone: ${locationData.timezone}` : ''}
Coordinates: ${locationData.latitude?.toFixed(4)}, ${locationData.longitude?.toFixed(4)}

`;
    }

    // Add REAL weather context
    if (weatherData?.temperature !== undefined) {
      userPrompt += `REAL WEATHER CONDITIONS:
Current Temperature: ${weatherData.temperature}${weatherData.unit || '°C'}
Conditions: ${weatherData.conditions || 'Unknown'}
${weatherData.feelsLike ? `Feels Like: ${weatherData.feelsLike}${weatherData.unit || '°C'}` : ''}
${weatherData.humidity ? `Humidity: ${weatherData.humidity}%` : ''}
${weatherData.windSpeed ? `Wind Speed: ${weatherData.windSpeed} km/h` : ''}

`;
    }

    // Add photo context
    if (selectedPhotos.length > 0) {
      userPrompt += `PHOTOS TAKEN TODAY (${selectedPhotos.length} photos):
`;
      selectedPhotos.slice(0, 3).forEach((photo, index) => {
        userPrompt += `Photo ${index + 1}:`;
        if (photo.aiAnalysis?.description) {
          userPrompt += ` ${photo.aiAnalysis.description}`;
        }
        if (photo.aiAnalysis?.mood) {
          userPrompt += ` (Mood: ${photo.aiAnalysis.mood})`;
        }
        if (photo.location?.name) {
          userPrompt += ` (Location: ${photo.location.name})`;
        }
        userPrompt += `\n`;
      });
      userPrompt += `\n`;
    }

    userPrompt += `INSTRUCTIONS:
Transform these rough notes into a beautiful, flowing personal blog post. Don't just copy the notes - use them as inspiration to tell the story of this day. Weave in the weather conditions and location naturally. Make it feel like someone actually experienced this day in these specific conditions at this specific place.

Create an engaging title that captures the essence of the day and location. Structure the content as a natural narrative, not a list of activities. Add personal insights and emotional context that makes the simple moments meaningful.

The goal is to turn basic notes into a compelling story that feels authentic and engaging.`;

    console.log('Sending enhanced prompt to Gemini with real context data');

    // Generate content with Gemini
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    const blogContent = response.text();

    console.log('Blog post generated successfully with Gemini 2.0 Flash');
    return blogContent;

  } catch (error) {
    console.error('Error generating blog with Gemini:', error);
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
