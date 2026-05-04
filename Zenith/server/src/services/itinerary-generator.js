const Groq = require('groq-sdk');
const { generateTemplateItinerary } = require('./template-generator');

let groqClient = null;
try {
  if (process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
} catch {}

async function generateWithGroq({ destination, days, budget, travelStyle, companions, dates }) {
  const styleList = Array.isArray(travelStyle) ? travelStyle.join(', ') : travelStyle;

  const prompt = `You are an expert travel planner. Generate a detailed ${days}-day itinerary for ${destination}.

Preferences: Budget=${budget}, Style=${styleList}, Traveling as=${companions}${dates ? `, Dates=${dates}` : ''}.

Return ONLY valid JSON (no markdown, no extra text):
{
  "title": "Evocative trip title",
  "destination": "${destination}",
  "days": ${days},
  "estimatedCost": <total USD>,
  "highlights": ["highlight1","highlight2","highlight3"],
  "days_data": [
    {
      "dayNumber": 1,
      "theme": "Day theme",
      "activities": [
        {"timeOfDay":"MORNING","name":"Activity","description":"2-3 vivid sentences.","location":"Specific area","duration":"~2hr","estimatedCost":15,"emoji":"☀️","tips":"One practical tip"},
        {"timeOfDay":"AFTERNOON","name":"Activity","description":"Description","location":"Location","duration":"~3hr","estimatedCost":25,"emoji":"🌿","tips":"Tip"},
        {"timeOfDay":"EVENING","name":"Activity","description":"Description","location":"Location","duration":"~2hr","estimatedCost":40,"emoji":"🌅","tips":"Tip"}
      ]
    }
  ]
}

Rules: exactly 3 activities/day (MORNING/AFTERNOON/EVENING), realistic costs matching ${budget} budget, mix famous spots with hidden gems, make descriptions vivid and inspiring.`;

  const completion = await groqClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096,
    temperature: 0.7,
  });

  const text = completion.choices[0]?.message?.content || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response from AI');
  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.days_data?.length) throw new Error('Missing days_data in AI response');
  return parsed;
}

async function generateItinerary(params) {
  if (groqClient) {
    try {
      return await generateWithGroq(params);
    } catch (err) {
      console.warn('Groq API failed, falling back to template generator:', err.message);
    }
  } else {
    console.info('No GROQ_API_KEY set — using template generator (set key in server/.env for AI generation)');
  }
  return generateTemplateItinerary(params);
}

module.exports = { generateItinerary };
