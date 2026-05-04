// Fully offline fallback — generates realistic itineraries without any API

const STYLE_ACTIVITIES = {
  ADVENTURE: {
    MORNING: [
      { name: 'Sunrise Hike to the Summit', emoji: '⛰️', base: 15, duration: '~4hr', loc: 'Mountain trailhead' },
      { name: 'White-Water Rafting', emoji: '🚣', base: 45, duration: '~3hr', loc: 'River canyon' },
      { name: 'Cliff Jumping at Secret Waterfall', emoji: '💦', base: 20, duration: '~2hr', loc: 'Hidden falls' },
    ],
    AFTERNOON: [
      { name: 'Mountain Bike Trail Ride', emoji: '🚵', base: 30, duration: '~3hr', loc: 'Forest trail' },
      { name: 'Rock Climbing Session', emoji: '🧗', base: 40, duration: '~3hr', loc: 'Limestone cliffs' },
      { name: 'Jungle Canopy Zipline', emoji: '🌿', base: 35, duration: '~2hr', loc: 'Rainforest' },
    ],
    EVENING: [
      { name: 'Sunset Bonfire on the Ridge', emoji: '🔥', base: 5, duration: '~2hr', loc: 'Mountain ridge' },
      { name: 'Stargazing at High Altitude', emoji: '🌟', base: 0, duration: '~2hr', loc: 'Open plateau' },
      { name: 'Campfire Dinner with Guides', emoji: '🍖', base: 25, duration: '~2hr', loc: 'Base camp' },
    ],
  },
  CULTURE: {
    MORNING: [
      { name: 'Ancient Temple at Dawn', emoji: '🏛️', base: 8, duration: '~2hr', loc: 'Old town' },
      { name: 'Local History Museum', emoji: '🏺', base: 12, duration: '~2hr', loc: 'City center' },
      { name: 'Traditional Market Walk', emoji: '🛒', base: 3, duration: '~2hr', loc: 'Medina / bazaar' },
    ],
    AFTERNOON: [
      { name: 'Artisan Workshop Visit', emoji: '🎨', base: 20, duration: '~2.5hr', loc: 'Craft quarter' },
      { name: 'Historical Walking Tour', emoji: '🚶', base: 15, duration: '~3hr', loc: 'Old quarter' },
      { name: 'Palace & Gardens Tour', emoji: '🏯', base: 18, duration: '~2hr', loc: 'Royal district' },
    ],
    EVENING: [
      { name: 'Traditional Dance Performance', emoji: '💃', base: 20, duration: '~2hr', loc: 'Cultural center' },
      { name: 'Night Market & Street Food', emoji: '🏮', base: 12, duration: '~2hr', loc: 'Night bazaar' },
      { name: 'Rooftop Bar with City Views', emoji: '🌆', base: 25, duration: '~2hr', loc: 'City rooftop' },
    ],
  },
  FOOD: {
    MORNING: [
      { name: 'Local Breakfast at Hole-in-the-Wall', emoji: '🍳', base: 6, duration: '~1.5hr', loc: 'Local neighborhood' },
      { name: 'Farmers Market Tasting', emoji: '🥑', base: 10, duration: '~2hr', loc: 'Weekend market' },
      { name: 'Coffee Plantation Visit', emoji: '☕', base: 15, duration: '~2hr', loc: 'Highlands' },
    ],
    AFTERNOON: [
      { name: 'Cooking Class with Local Chef', emoji: '👨‍🍳', base: 45, duration: '~3hr', loc: 'Cooking school' },
      { name: 'Street Food Tour on Foot', emoji: '🌮', base: 20, duration: '~2.5hr', loc: 'Food district' },
      { name: 'Spice Market & Food Stalls', emoji: '🌶️', base: 10, duration: '~2hr', loc: 'Spice quarter' },
    ],
    EVENING: [
      { name: 'Farm-to-Table Dinner', emoji: '🌿', base: 55, duration: '~2.5hr', loc: 'Restaurant district' },
      { name: 'Beachside Seafood Feast', emoji: '🦞', base: 35, duration: '~2hr', loc: 'Harbor front' },
      { name: 'Rooftop Fine Dining', emoji: '🍷', base: 80, duration: '~2hr', loc: 'Rooftop terrace' },
    ],
  },
  RELAXATION: {
    MORNING: [
      { name: 'Sunrise Yoga on the Beach', emoji: '🧘', base: 15, duration: '~1.5hr', loc: 'Beach' },
      { name: 'Gentle Nature Walk', emoji: '🌸', base: 0, duration: '~1.5hr', loc: 'Botanical garden' },
      { name: 'Spa Morning Treatment', emoji: '💆', base: 60, duration: '~2hr', loc: 'Resort spa' },
    ],
    AFTERNOON: [
      { name: 'Hammock Afternoon at the Pool', emoji: '🌴', base: 0, duration: '~3hr', loc: 'Pool terrace' },
      { name: 'Beachside Reading & Swim', emoji: '🏖️', base: 0, duration: '~3hr', loc: 'Quiet beach cove' },
      { name: 'Traditional Massage', emoji: '🌺', base: 30, duration: '~1.5hr', loc: 'Wellness center' },
    ],
    EVENING: [
      { name: 'Sunset Meditation', emoji: '🌅', base: 0, duration: '~1hr', loc: 'Clifftop' },
      { name: 'Quiet Dinner at Resort Restaurant', emoji: '🍽️', base: 45, duration: '~2hr', loc: 'Resort' },
      { name: 'Rooftop Cocktails & Stars', emoji: '🍹', base: 20, duration: '~2hr', loc: 'Rooftop bar' },
    ],
  },
  NATURE: {
    MORNING: [
      { name: 'Wildlife Safari Drive', emoji: '🦁', base: 60, duration: '~3hr', loc: 'National park' },
      { name: 'Birdwatching at Dawn', emoji: '🦜', base: 15, duration: '~2hr', loc: 'Nature reserve' },
      { name: 'Snorkeling in Coral Reef', emoji: '🤿', base: 25, duration: '~2hr', loc: 'Reef bay' },
    ],
    AFTERNOON: [
      { name: 'Rainforest Trekking', emoji: '🌳', base: 20, duration: '~3hr', loc: 'Jungle trail' },
      { name: 'Kayaking Through Mangroves', emoji: '🚣', base: 30, duration: '~2.5hr', loc: 'Mangrove lagoon' },
      { name: 'Volcano Crater Rim Walk', emoji: '🌋', base: 25, duration: '~3hr', loc: 'Volcano' },
    ],
    EVENING: [
      { name: 'Firefly Watching Tour', emoji: '✨', base: 20, duration: '~2hr', loc: 'Forest edge' },
      { name: 'Open-Air Dinner in the Wild', emoji: '🦒', base: 35, duration: '~2hr', loc: 'Bush camp' },
      { name: 'Night Sky Photography Spot', emoji: '🔭', base: 0, duration: '~2hr', loc: 'Dark sky reserve' },
    ],
  },
  NIGHTLIFE: {
    MORNING: [
      { name: 'Late Breakfast at Trendy Café', emoji: '🥐', base: 15, duration: '~1.5hr', loc: 'Hip neighborhood' },
      { name: 'Rooftop Brunch', emoji: '🥂', base: 35, duration: '~2hr', loc: 'Hotel rooftop' },
      { name: 'Craft Coffee & Art Gallery', emoji: '🖼️', base: 10, duration: '~2hr', loc: 'Arts quarter' },
    ],
    AFTERNOON: [
      { name: 'City Beach Club', emoji: '🏊', base: 30, duration: '~3hr', loc: 'Beach club' },
      { name: 'Shopping & Exploring', emoji: '🛍️', base: 40, duration: '~3hr', loc: 'Fashion district' },
      { name: 'Pre-Party Bar Crawl', emoji: '🍸', base: 25, duration: '~2hr', loc: 'Bar street' },
    ],
    EVENING: [
      { name: 'World-Class Club Night', emoji: '🎵', base: 30, duration: '~4hr', loc: 'Club district' },
      { name: 'Live Music at Jazz Bar', emoji: '🎷', base: 20, duration: '~3hr', loc: 'Jazz quarter' },
      { name: 'Sunset Rooftop Party', emoji: '🌇', base: 40, duration: '~3hr', loc: 'Rooftop venue' },
    ],
  },
};

const DEFAULT_STYLE = 'CULTURE';

const DAY_THEMES = [
  'Arrival & First Impressions',
  'Hidden Gems & Local Life',
  'Icons & Highlights',
  'Off the Beaten Path',
  'Culture & Cuisine',
  'Nature & Exploration',
  'Rest, Reflect & Wander',
  'Adventure Day',
  'Art & Architecture',
  'Final Day & Farewells',
];

const TIPS = [
  'Go early in the morning to avoid crowds and get the best light for photos.',
  'Hire a local guide for deeper context — they know stories no guidebook covers.',
  'Bring cash — many of the best spots don\'t take cards.',
  'Book 24 hours ahead during peak season to avoid disappointment.',
  'Wear comfortable shoes — you\'ll walk more than expected.',
  'Ask the guesthouse owner for their personal recommendations.',
  'Try the thing on the menu you can\'t pronounce — it\'s usually the specialty.',
  'Visit on a weekday for a more authentic, crowd-free experience.',
];

const COST_MULTIPLIERS = { BACKPACKER: 0.4, BUDGET: 0.7, MID_RANGE: 1.0, LUXURY: 2.2 };

function pickActivities(styles) {
  const primary = (styles[0] || DEFAULT_STYLE).toUpperCase();
  const pool = STYLE_ACTIVITIES[primary] || STYLE_ACTIVITIES[DEFAULT_STYLE];
  return pool;
}

function generateTemplateItinerary({ destination, days, budget, travelStyle, companions }) {
  const normalizedStyles = (Array.isArray(travelStyle) ? travelStyle : [travelStyle])
    .map((s) => s.toUpperCase());
  const activities = pickActivities(normalizedStyles);
  const mult = COST_MULTIPLIERS[budget] || 1.0;

  const days_data = Array.from({ length: days }, (_, i) => {
    const dayNumber = i + 1;
    const morning = activities.MORNING[i % activities.MORNING.length];
    const afternoon = activities.AFTERNOON[i % activities.AFTERNOON.length];
    const evening = activities.EVENING[i % activities.EVENING.length];

    const makeActivity = (act, timeOfDay) => ({
      timeOfDay,
      name: act.name,
      description: `${act.name} is one of the unmissable experiences in ${destination}. ${companions !== 'Solo' ? `Perfect for ${companions.toLowerCase()} — ` : ''}expect to spend ${act.duration} fully immersed in what makes this place special.`,
      location: `${act.loc}, ${destination}`,
      duration: act.duration,
      estimatedCost: Math.round(act.base * mult),
      emoji: act.emoji,
      tips: TIPS[(i * 3 + Object.values({ MORNING: 0, AFTERNOON: 1, EVENING: 2 })[['MORNING','AFTERNOON','EVENING'].indexOf(timeOfDay)]) % TIPS.length],
    });

    return {
      dayNumber,
      theme: DAY_THEMES[(i) % DAY_THEMES.length],
      activities: [
        makeActivity(morning, 'MORNING'),
        makeActivity(afternoon, 'AFTERNOON'),
        makeActivity(evening, 'EVENING'),
      ],
    };
  });

  const dailyCost = days_data[0].activities.reduce((s, a) => s + a.estimatedCost, 0);
  const estimatedCost = Math.round(dailyCost * days * 1.3); // +30% for accommodation/transport

  return {
    title: `${destination}: ${days}-Day ${normalizedStyles[0] === 'ADVENTURE' ? 'Adventure' : normalizedStyles[0] === 'FOOD' ? 'Culinary Journey' : 'Discovery'}`,
    destination,
    days,
    estimatedCost,
    highlights: [
      days_data[0].activities[0].name,
      days_data[Math.floor(days / 2)]?.activities[1]?.name || days_data[0].activities[1].name,
      days_data[days - 1].activities[2].name,
    ],
    days_data,
  };
}

module.exports = { generateTemplateItinerary };
