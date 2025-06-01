
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || 'demo-key');

/**
 * Generate a blog post using Gemini 2.5 Flash with location and weather context
 * @param {Object} params - Blog generation parameters
 * @param {string} params.topic - The main blog topic/notes
 * @param {Object} params.locationData - Location information
 * @param {Object} params.weatherData - Weather information
 * @param {Array} params.selectedPhotos - Selected photos with metadata
 * @returns {Promise<string>} - Generated blog post HTML
 */
export async function generateBlogWithGemini({ topic, locationData, weatherData, selectedPhotos = [] }) {
  try {
    // Check if we have a real API key
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'demo-key') {
      console.warn('No Gemini API key found, using enhanced mock generation');
      return generateEnhancedMockBlog({ topic, locationData, weatherData, selectedPhotos });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Create comprehensive system prompt
    const systemPrompt = `You are a personal blog writing assistant. Your role is to transform daily notes and experiences into engaging, narrative-driven blog posts that feel authentic and personal.

WRITING STYLE:
- Write in first person as if the user experienced this day
- Create flowing, natural narratives that connect different activities
- Use descriptive language that paints a picture of the day
- Include sensory details and emotional reflections
- Structure with clear sections but natural transitions
- Aim for 400-600 words for a substantial but readable post

CONTENT INTEGRATION:
- Seamlessly weave weather conditions into the narrative mood and activities
- Reference location naturally to provide context and atmosphere
- Connect photos to the story when available, describing what they capture
- Transform simple notes into engaging storytelling
- Add thoughtful reflections on the day's experiences

OUTPUT FORMAT:
- Return clean HTML with h1 for title, h2 for sections, p for paragraphs
- Create an engaging title that reflects the day's main theme
- Structure: Opening reflection, main activities, photo moments (if any), closing thoughts
- No markdown formatting - pure HTML only`;

    // Build the user prompt with all context
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let userPrompt = `Write a personal blog post for ${currentDate} based on these details:

DAILY NOTES/ACTIVITIES:
${topic}

`;

    // Add location context
    if (locationData?.name) {
      userPrompt += `LOCATION:
Currently in ${locationData.name}
${locationData.country ? `Country: ${locationData.country}` : ''}
${locationData.timezone ? `Timezone: ${locationData.timezone}` : ''}

`;
    }

    // Add weather context
    if (weatherData?.temperature) {
      userPrompt += `WEATHER CONDITIONS:
Temperature: ${weatherData.temperature}${weatherData.unit || '°C'}
Conditions: ${weatherData.conditions || 'Pleasant'}
${weatherData.feelsLike ? `Feels like: ${weatherData.feelsLike}${weatherData.unit || '°C'}` : ''}
${weatherData.humidity ? `Humidity: ${weatherData.humidity}%` : ''}
${weatherData.windSpeed ? `Wind: ${weatherData.windSpeed} km/h` : ''}

`;

      // Add forecast if available
      if (weatherData.forecast?.length > 0) {
        userPrompt += `FORECAST:
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
      userPrompt += `PHOTOS TAKEN TODAY (${selectedPhotos.length} photos):
`;
      selectedPhotos.forEach((photo, index) => {
        userPrompt += `Photo ${index + 1}:`;
        if (photo.aiAnalysis?.description) {
          userPrompt += ` ${photo.aiAnalysis.description}`;
        }
        if (photo.aiAnalysis?.mood) {
          userPrompt += ` (Mood: ${photo.aiAnalysis.mood})`;
        }
        if (photo.aiAnalysis?.activity) {
          userPrompt += ` (Activity: ${photo.aiAnalysis.activity})`;
        }
        if (photo.location?.name) {
          userPrompt += ` (Location: ${photo.location.name})`;
        }
        userPrompt += `
`;
      });
      userPrompt += `
`;
    }

    userPrompt += `Transform these details into an engaging, personal blog post that tells the story of this day. Make it feel authentic and reflective, as if written by someone who truly experienced these moments.`;

    console.log('Sending request to Gemini 2.5 Flash:', { topic: topic.substring(0, 50) + '...' });

    // Generate content with Gemini
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    const blogContent = response.text();

    console.log('Blog post generated successfully with Gemini 2.5 Flash');
    return blogContent;

  } catch (error) {
    console.error('Error generating blog with Gemini:', error);
    // Fallback to enhanced mock generation
    return generateEnhancedMockBlog({ topic, locationData, weatherData, selectedPhotos });
  }
}

/**
 * Enhanced mock blog generation (fallback)
 */
function generateEnhancedMockBlog({ topic, locationData, weatherData, selectedPhotos = [] }) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Create smart title based on content
  const activities = parseActivities(topic);
  const mainActivity = activities.length > 0 ? activities[0] : 'day';
  const weatherAdj = weatherData?.conditions ? getWeatherAdjective(weatherData.conditions) : 'Beautiful';
  const title = `${weatherAdj} ${currentDate.split(',')[0]}: ${capitalizeFirst(mainActivity)}`;

  let blogContent = `<h1>${title}</h1>

<p>What a wonderful ${currentDate}! `;

  // Weather opening
  if (weatherData?.temperature) {
    const temp = weatherData.temperature;
    const unit = weatherData.unit || '°C';
    const conditions = weatherData.conditions || 'pleasant';
    blogContent += `The day began with ${conditions.toLowerCase()} skies and a comfortable ${temp}${unit}. `;
  }

  if (locationData?.name) {
    blogContent += `Here in ${locationData.name}, `;
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
    
    blogContent += `Each photograph tells part of today's story.</p>
`;
  }

  // Closing reflection
  blogContent += `
<h2>Evening Reflections</h2>
<p>As ${currentDate} draws to a close, I'm filled with gratitude for these simple yet meaningful experiences. `;

  if (weatherData?.forecast?.length > 0) {
    const tomorrow = weatherData.forecast[0];
    blogContent += `Looking ahead to tomorrow's ${tomorrow.conditions.toLowerCase()} weather, `;
  }

  blogContent += `days like these remind us to appreciate the beauty in routine and the importance of being present in each moment.</p>`;

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
  if (condition.includes('sunny')) return 'Sun-Kissed';
  if (condition.includes('cloudy')) return 'Thoughtful';
  if (condition.includes('rain')) return 'Refreshing';
  if (condition.includes('clear')) return 'Crystal Clear';
  return 'Beautiful';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createNarrativeFromNotes(notes, weatherData, locationData) {
  // Transform simple notes into flowing narrative
  let narrative = notes;
  
  // Add weather context
  if (weatherData?.conditions) {
    narrative += ` The ${weatherData.conditions.toLowerCase()} weather provided the perfect backdrop for the day's activities.`;
  }
  
  // Add location context
  if (locationData?.name) {
    narrative += ` Being in ${locationData.name} added an extra dimension to these experiences.`;
  }
  
  return narrative;
}
