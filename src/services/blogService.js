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
 * @returns {Promise<string>} - Generated blog post HTML
 */
export async function generateBlogWithGemini({ topic, locationData, weatherData, selectedPhotos = [] }) {
  try {
    // Check if we have a real API key
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'demo-key') {
      console.warn('No Gemini API key found, using enhanced mock generation with REAL data');
      return generateEnhancedBlogWithRealData({ topic, locationData, weatherData, selectedPhotos });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Create comprehensive system prompt
    const systemPrompt = `You are a personal blog writing assistant that creates authentic, engaging blog posts from daily experiences. 

WRITING STYLE:
- Write in first person as someone who lived this day
- Create flowing narratives that connect activities naturally
- Use vivid, sensory descriptions that paint a picture
- Include emotional reflections and personal insights
- Structure with clear sections but smooth transitions
- Target 400-600 words for substantial but readable content

REAL DATA INTEGRATION:
- The location and weather data provided is REAL, not simulated
- Reference the actual weather conditions to set mood and context
- Mention the real location naturally to provide authentic setting
- Connect weather to activities (e.g., "the crisp 8°C morning made the coffee taste even better")
- Use weather as narrative elements (sunny day = optimistic tone, rainy = cozy/reflective)

AUTHENTICITY MARKERS:
- Reference specific temperatures, conditions, and locations provided
- Make weather feel like it influenced the day's activities and mood
- Use real place names and geographic context when available
- Connect environmental conditions to personal experiences

OUTPUT FORMAT:
- Return clean HTML with h1 for title, h2 for sections, p for paragraphs
- Create engaging titles that reflect the real location/weather when relevant
- Structure: Opening scene-setting, main activities, reflections, conclusion
- No markdown - pure HTML only`;

    // Build the user prompt with REAL context data
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let userPrompt = `Write a personal blog post for ${currentDate} based on these real experiences and conditions:

DAILY NOTES/ACTIVITIES:
${topic}

`;

    // Add REAL location context with source info
    if (locationData?.name) {
      userPrompt += `REAL LOCATION DATA (Source: ${locationData.source || 'unknown'}):
Location: ${locationData.name}
${locationData.country ? `Country: ${locationData.country}` : ''}
${locationData.timezone ? `Timezone: ${locationData.timezone}` : ''}
Coordinates: ${locationData.latitude?.toFixed(4)}, ${locationData.longitude?.toFixed(4)}

`;
    }

    // Add REAL weather context with source info
    if (weatherData?.temperature !== undefined) {
      userPrompt += `REAL WEATHER CONDITIONS (Source: ${weatherData.source || 'unknown'}):
Current Temperature: ${weatherData.temperature}${weatherData.unit || '°C'}
Conditions: ${weatherData.conditions || 'Unknown'}
${weatherData.feelsLike ? `Feels Like: ${weatherData.feelsLike}${weatherData.unit || '°C'}` : ''}
${weatherData.humidity ? `Humidity: ${weatherData.humidity}%` : ''}
${weatherData.windSpeed ? `Wind Speed: ${weatherData.windSpeed} km/h` : ''}

`;

      // Add forecast if available
      if (weatherData.forecast?.length > 0) {
        userPrompt += `WEATHER FORECAST:
`;
        weatherData.forecast.slice(0, 3).forEach(day => {
          userPrompt += `${day.day}: ${day.conditions}, High ${day.high}°, Low ${day.low}°
`;
        });
        userPrompt += `
`;
      }
    }

    // Add photo context
    if (selectedPhotos.length > 0) {
      userPrompt += `PHOTOS FROM TODAY (${selectedPhotos.length} photos):
`;
      selectedPhotos.forEach((photo, index) => {
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
        userPrompt += `
`;
      });
    }

    userPrompt += `
IMPORTANT: Use this REAL location and weather data to create an authentic blog post. The weather and location information is actual data from today, not fictional. Make the environmental conditions feel like they genuinely influenced the day's experiences and mood.

Transform these real details into an engaging, personal narrative that captures both the activities and the authentic environmental context of this specific day and location.`;

    console.log('Sending request to Gemini 2.5 Flash with REAL data:', { 
      topic: topic.substring(0, 50) + '...',
      location: locationData?.name,
      weather: `${weatherData?.temperature}°C, ${weatherData?.conditions}`,
      weatherSource: weatherData?.source,
      locationSource: locationData?.source
    });

    // Generate content with Gemini
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    const blogContent = response.text();

    console.log('Blog post generated successfully with REAL data using Gemini 2.5 Flash');
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
  console.log('Generating enhanced blog with REAL data:', {
    location: locationData?.name,
    locationSource: locationData?.source,
    weather: weatherData ? `${weatherData.temperature}°C, ${weatherData.conditions}` : 'No weather',
    weatherSource: weatherData?.source
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

<p>What a wonderful ${currentDate}! `;

  // Use REAL weather data in opening
  if (weatherData?.temperature !== undefined) {
    const temp = weatherData.temperature;
    const unit = weatherData.unit || '°C';
    const conditions = weatherData.conditions || 'pleasant conditions';
    const source = weatherData.source ? ` (via ${weatherData.source})` : '';
    
    blogContent += `The day began with ${conditions} and a ${temp < 10 ? 'crisp' : temp > 25 ? 'warm' : 'comfortable'} ${temp}${unit}. `;
    
    if (weatherData.feelsLike && Math.abs(weatherData.feelsLike - temp) > 3) {
      blogContent += `Though it felt more like ${weatherData.feelsLike}${unit}. `;
    }
  }

  // Use REAL location data
  if (locationData?.name) {
    const source = locationData.source ? ` (detected via ${locationData.source})` : '';
    blogContent += `Here in ${locationData.name}, `;
    
    if (locationData.country && !locationData.name.includes(locationData.country)) {
      blogContent += `${locationData.country}, `;
    }
  }

  blogContent += `it's been one of those days that reminds me why I love documenting these moments.</p>

<h2>The Day Unfolds</h2>
<p>${createNarrativeFromNotes(topic, weatherData, locationData)}</p>
`;

  // Add photo section if photos exist
  if (selectedPhotos.length > 0) {
    blogContent += `
<h2>Captured Moments</h2>
<p>Today I was fortunate to capture ${selectedPhotos.length} beautiful moments. `;
    
    selectedPhotos.slice(0, 2).forEach((photo, index) => {
      if (photo.aiAnalysis?.description) {
        blogContent += `${index === 0 ? 'The first image shows' : 'Another shot captures'} ${photo.aiAnalysis.description.toLowerCase()}. `;
      }
    });
    
    blogContent += `Each photograph tells part of today's story, preserved against the backdrop of ${weatherData?.conditions || 'today\'s conditions'}.</p>
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

  blogContent += `, I'm filled with gratitude for these experiences. `;

  // Use REAL forecast if available
  if (weatherData?.forecast?.length > 0) {
    const tomorrow = weatherData.forecast[0];
    blogContent += `Looking ahead to tomorrow's ${tomorrow.conditions} weather (expecting ${tomorrow.high}°C), `;
  }

  blogContent += `days like these remind us to appreciate both the grand moments and the simple pleasures that make life meaningful.</p>

<div style="margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; font-size: 0.9em; color: #666;">
<strong>Today's Real Data:</strong><br>
${locationData ? `📍 Location: ${locationData.name} (via ${locationData.source})` : '📍 Location: Not available'}<br>
${weatherData ? `🌤️ Weather: ${weatherData.temperature}°C, ${weatherData.conditions} (via ${weatherData.source})` : '🌤️ Weather: Not available'}
</div>`;

  return blogContent;
}

// Helper functions
function parseActivities(notes) {
  const activities = [];
  const activityMap = {
    'gym': 'energizing workout session',
    'bicycle': 'refreshing bicycle ride',
    'motorcycle': 'exhilarating motorcycle journey',
    'lawn': 'therapeutic lawn maintenance',
    'mow': 'satisfying lawn care',
    'coffee': 'delightful coffee moments',
    'lunch': 'wonderful lunch experience',
    'walk': 'peaceful walk',
    'dog': 'quality time with furry companion',
    'beer': 'relaxing social time'
  };

  Object.entries(activityMap).forEach(([keyword, description]) => {
    if (notes.toLowerCase().includes(keyword)) {
      activities.push(description);
    }
  });

  return activities.length > 0 ? activities : ['wonderful day'];
}

function getWeatherAdjective(conditions) {
  const condition = conditions?.toLowerCase() || '';
  if (condition.includes('sunny') || condition.includes('clear')) return 'Sun-Kissed';
  if (condition.includes('cloudy')) return 'Thoughtful';
  if (condition.includes('rain')) return 'Refreshing';
  if (condition.includes('snow')) return 'Serene';
  return 'Beautiful';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createNarrativeFromNotes(notes, weatherData, locationData) {
  let narrative = notes;
  
  // Add real weather context to narrative
  if (weatherData?.conditions && weatherData?.temperature !== undefined) {
    const temp = weatherData.temperature;
    const conditions = weatherData.conditions.toLowerCase();
    
    if (temp < 5) {
      narrative += ` The cold ${temp}°C weather with ${conditions} made every warm moment inside feel extra cozy.`;
    } else if (temp > 25) {
      narrative += ` The warm ${temp}°C day with ${conditions} provided perfect conditions for outdoor activities.`;
    } else {
      narrative += ` The pleasant ${temp}°C weather and ${conditions} made it an ideal day to be out and about.`;
    }
  }
  
  // Add real location context
  if (locationData?.name) {
    narrative += ` Being in ${locationData.name} added a special dimension to these experiences.`;
  }
  
  return narrative;
}
