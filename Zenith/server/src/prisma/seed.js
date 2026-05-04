const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const UNSPLASH = (query, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${query}?w=${w}&h=${h}&fit=crop&auto=format`;

const USERS = [
  { username: 'wanderlust_kai', email: 'kai@zenith.travel', bio: 'Slow travel · Mindful adventures · 47 countries', avatarUrl: UNSPLASH('1500648767791-00dcc994a43e', 100, 100), travelScore: 4820 },
  { username: 'mindful_voyager', email: 'maya@zenith.travel', bio: 'Digital nomad · Coffee snob · 32 countries explored', avatarUrl: UNSPLASH('1494790108377-be9c29b29330', 100, 100), travelScore: 3210 },
  { username: 'adventure_alex', email: 'alex@zenith.travel', bio: 'Mountain peaks & ocean swells · Chasing sunrises', avatarUrl: UNSPLASH('1507003211169-0a1dd7228f2d', 100, 100), travelScore: 6540 },
  { username: 'foodie_travels', email: 'priya@zenith.travel', bio: '🍜 Eating my way around the world · Street food fanatic', avatarUrl: UNSPLASH('1438761681033-6461ffad8d80', 100, 100), travelScore: 2890 },
  { username: 'solo_explorer', email: 'sam@zenith.travel', bio: 'Solo since 2019 · Budget backpacker · 28 countries', avatarUrl: UNSPLASH('1472099645785-5658abf4ff4e', 100, 100), travelScore: 5120 },
];

const ITINERARIES = [
  {
    title: 'Bali Adventure – 5 Days',
    destination: 'Bali',
    days: 5,
    budget: 'MID_RANGE',
    estimatedCost: 800,
    rating: 4.8,
    saveCount: 234,
    days_data: [
      {
        dayNumber: 1, theme: 'Ubud & Sacred Temples',
        activities: [
          { timeOfDay: 'MORNING', name: 'Sunrise Trek at Mount Batur', description: 'Wake before dawn for a guided trek up this active volcano. As you reach the summit, watch the sun paint the sky in shades of orange and gold over the caldera lake below — one of Bali\'s most unforgettable experiences.', location: 'Kintamani', duration: '~4hr', estimatedCost: 35, emoji: '☀️', tips: 'Book a guide the night before. Bring warm layers — the summit is surprisingly cold at 4am.' },
          { timeOfDay: 'AFTERNOON', name: 'Sacred Monkey Forest Sanctuary', description: 'Wander through this ancient forest inhabited by over 700 Balinese long-tailed macaques. Three Hindu temples dating to the 14th century are nestled among giant roots and moss-covered statues.', location: 'Ubud', duration: '~2hr', estimatedCost: 5, emoji: '🌿', tips: 'Secure your belongings — the monkeys are thieves. Avoid eye contact if they approach.' },
          { timeOfDay: 'EVENING', name: 'Beachside Dining at Seminyak', description: 'Watch the legendary Bali sunset over a fresh seafood dinner. The beach clubs here turn magical at dusk with live acoustic music, cocktails, and the sound of crashing waves.', location: 'Seminyak', duration: '~3hr', estimatedCost: 30, emoji: '🌅', tips: 'Arrive by 5:30pm to secure a good sunset spot. La Plancha is excellent for budget-friendly beachside vibes.' },
        ],
      },
      {
        dayNumber: 2, theme: 'Rice Terraces & Waterfalls',
        activities: [
          { timeOfDay: 'MORNING', name: 'Tegallalang Rice Terrace Walk', description: 'Stroll through the UNESCO-listed terraces at golden hour when the light is soft and the crowds are thin. The layered green paddies cascading down the hillside are among Bali\'s most iconic sights.', location: 'Tegallalang, Ubud', duration: '~2hr', estimatedCost: 5, emoji: '🌾', tips: 'Go before 8am to beat the tour groups. Small donation requested at the entrance.' },
          { timeOfDay: 'AFTERNOON', name: 'Tegenungan Waterfall', description: 'A powerful waterfall surrounded by lush jungle just 10km from Ubud. You can swim in the natural pool at the base — refreshing after a hot morning of exploring.', location: 'Gianyar', duration: '~2hr', estimatedCost: 3, emoji: '💧', tips: 'Wear water shoes. The rocks are slippery. Best visited weekdays to avoid weekend crowds.' },
          { timeOfDay: 'EVENING', name: 'Kecak Fire Dance at Uluwatu', description: 'Watch 50+ bare-chested men perform this hypnotic chanting dance on a cliff-top temple stage as the sun sets behind them into the Indian Ocean. Genuinely one of the world\'s great performances.', location: 'Uluwatu', duration: '~2hr', estimatedCost: 15, emoji: '🔥', tips: 'Book tickets in advance. The performance starts at sunset — arrive 30 minutes early for a front seat.' },
        ],
      },
    ],
  },
  {
    title: 'Kyoto in Autumn – 4 Days',
    destination: 'Kyoto',
    days: 4,
    budget: 'MID_RANGE',
    estimatedCost: 650,
    rating: 4.9,
    saveCount: 312,
    days_data: [
      {
        dayNumber: 1, theme: 'Arashiyama & Bamboo Grove',
        activities: [
          { timeOfDay: 'MORNING', name: 'Bamboo Grove at Dawn', description: 'Enter the towering bamboo forest before sunrise and experience one of Japan\'s most surreal landscapes in near-silence. The light filtering through the bamboo creates an otherworldly glow.', location: 'Arashiyama', duration: '~1.5hr', estimatedCost: 0, emoji: '🎋', tips: 'Arrive by 6:30am before tour buses. It\'s free and always open.' },
          { timeOfDay: 'AFTERNOON', name: 'Tenryu-ji Zen Garden', description: 'Wander the gardens of this 14th-century zen temple. The carefully raked gravel and moss garden with Mt. Arashiyama as a backdrop is the finest example of shakkei (borrowed scenery) in Japan.', location: 'Arashiyama', duration: '~2hr', estimatedCost: 10, emoji: '🏯', tips: 'Garden-only ticket is ¥500. Main hall adds another ¥300 but is worth it for the dragon ceiling.' },
          { timeOfDay: 'EVENING', name: 'Dinner in Pontocho Alley', description: 'This narrow lantern-lit alley running parallel to the Kamo River is Kyoto\'s most atmospheric dining strip. Dozens of intimate restaurants serve kaiseki, yakitori, and sushi.', location: 'Pontocho', duration: '~2hr', estimatedCost: 35, emoji: '🏮', tips: 'Look for restaurants with hand-written specials boards. Avoid tourist-menu places.' },
        ],
      },
    ],
  },
  {
    title: 'Amalfi Coast Road Trip – 6 Days',
    destination: 'Amalfi Coast',
    days: 6,
    budget: 'LUXURY',
    estimatedCost: 2200,
    rating: 4.9,
    saveCount: 189,
    days_data: [
      {
        dayNumber: 1, theme: 'Positano Arrival',
        activities: [
          { timeOfDay: 'MORNING', name: 'Ferry from Naples to Positano', description: 'Arrive by sea for your first jaw-dropping view of the colorful cliffside village tumbling down to the cobalt Mediterranean. No road arrival compares to this approach.', location: 'Naples → Positano', duration: '~2hr', estimatedCost: 25, emoji: '⛴️', tips: 'Seasonal ferries run April-October. Book tickets the day before.' },
          { timeOfDay: 'AFTERNOON', name: 'Spiaggia Grande Beach', description: 'Settle into Positano\'s main beach with a Spritz in hand. Watch the parade of fishing boats and superyachts while sun-worshippers and locals share the pebbly shore.', location: 'Positano', duration: '~3hr', estimatedCost: 20, emoji: '🏖️', tips: 'The free public area is at the far right. Sun beds are €25/pair. Arrive by noon for the best spots.' },
          { timeOfDay: 'EVENING', name: 'Sunset Dinner at Le Tre Sorelle', description: 'Dine on freshly-caught branzino and handmade pasta at this family-run terrace restaurant, watching the village lights flicker on one by one as dusk falls over the Mediterranean.', location: 'Positano', duration: '~2.5hr', estimatedCost: 80, emoji: '🌊', tips: 'Book at least 2 days in advance. Ask for the terrace table with sea view.' },
        ],
      },
    ],
  },
];

const POSTS = [
  { title: 'Lost in Ubud\'s Forest Canopy', body: 'Spent three days completely off-grid in a treehouse villa above the monkey forest. The mist each morning, the gamelan music drifting up from the valley — I didn\'t open my phone for 72 hours and came back completely reset.', destination: 'Bali', country: 'Indonesia', duration: 3, budget: 'MID_RANGE', travelStyle: ['NATURE', 'RELAXATION'], hashtags: ['BaliAdventure', 'DigitalDetox', 'UbudLife'], photos: [UNSPLASH('1537996194471-e657df975ab4'), UNSPLASH('1604928141-00c3ff03e1ce')] },
  { title: 'Deep Sea Diving the Coral Triangle', body: 'Raja Ampat has the highest marine biodiversity on Earth, and diving here confirms every superlative. Manta rays, pygmy seahorses, 600+ coral species. Arrived as a diver, left as a conservationist.', destination: 'Raja Ampat', country: 'Indonesia', duration: 7, budget: 'LUXURY', travelStyle: ['ADVENTURE', 'NATURE'], hashtags: ['ScubaDiving', 'RajaAmpat', 'OceanLife'], photos: [UNSPLASH('1559827291-72416316e8e7'), UNSPLASH('1544551763-46a013bb70d5')] },
  { title: 'Cultural Immersion in Marrakech', body: 'Got completely lost in the medina for the best 6 hours of my life. A carpet seller invited me for mint tea, I ended up helping his family prepare couscous for a wedding. This is why I travel.', destination: 'Marrakech', country: 'Morocco', duration: 5, budget: 'BUDGET', travelStyle: ['CULTURE', 'FOOD'], hashtags: ['Morocco', 'Marrakech', 'AuthenticTravel'], photos: [UNSPLASH('1539020140153-5a0e2c1fc72e'), UNSPLASH('1548449614-ab30f2a8ff3f')] },
  { title: 'Street Food Tour: Bangkok in 48hrs', body: 'Pad kra pao at 7am. Som tam at noon. Boat noodles at 3pm. Mango sticky rice at midnight from a cart near Khao San. Bangkok will break your diet and your heart in the best possible way.', destination: 'Bangkok', country: 'Thailand', duration: 2, budget: 'BACKPACKER', travelStyle: ['FOOD', 'CULTURE'], hashtags: ['BangkokFood', 'StreetFood', 'ThailandTravel'], photos: [UNSPLASH('1528360983277-13d401cdc186'), UNSPLASH('1563245372-f21724e3856d')] },
  { title: 'Solo Train Journey Across Japan', body: 'Tokyo → Kyoto → Hiroshima → Naoshima island on a 14-day JR Pass. Japan is the only country where I\'ve felt completely safe as a solo traveler from the first moment. Precision, kindness, and the best convenience store food in the world.', destination: 'Japan', country: 'Japan', duration: 14, budget: 'MID_RANGE', travelStyle: ['CULTURE', 'FOOD', 'ADVENTURE'], hashtags: ['SoloJapan', 'JRPass', 'JapanTravel'], photos: [UNSPLASH('1542051841857-5f90071e7483'), UNSPLASH('1493976040374-85c8e12f0c0e')] },
  { title: 'Santorini Without the Instagram Crowds', body: 'The trick is Oia at sunrise (5:30am), Pyrgos for the sunset view (not Oia — fewer people, better angle), and staying in Firostefani instead of Fira. Santorini is still magical if you work for it.', destination: 'Santorini', country: 'Greece', duration: 4, budget: 'LUXURY', travelStyle: ['RELAXATION', 'CULTURE'], hashtags: ['Santorini', 'Greece', 'TravelHacks'], photos: [UNSPLASH('1570077188670-e3a8d69ac5ff'), UNSPLASH('1555400038-63f5ba517a47')] },
  { title: '10 Days on a Budget in Vietnam', body: 'Ha Long Bay overnight boat, Hoi An lanterns, Hue royal tombs, and the best banh mi of my life in Saigon — all for under $40/day including accommodation. Vietnam is the best value destination in Southeast Asia and it isn\'t close.', destination: 'Vietnam', country: 'Vietnam', duration: 10, budget: 'BACKPACKER', travelStyle: ['FOOD', 'CULTURE', 'ADVENTURE'], hashtags: ['BudgetTravel', 'Vietnam', 'SoutheastAsia'], photos: [UNSPLASH('1528360983277-13d401cdc186'), UNSPLASH('1540575467537-786dd4da2f1f')] },
  { title: 'Atlas Mountains Trekking – Morocco', body: 'Three days trekking to Jebel Toubkal, North Africa\'s highest peak (4,167m). The Berber villages en route, the stargazing at altitude, the warm welcome of mountain families — the summit was almost secondary.', destination: 'Atlas Mountains', country: 'Morocco', duration: 4, budget: 'BUDGET', travelStyle: ['ADVENTURE', 'NATURE'], hashtags: ['Trekking', 'Morocco', 'AtlasMountains'], photos: [UNSPLASH('1506905925346-21bda4d32df4'), UNSPLASH('1464822759023-fed622ff2c3b')] },
];

async function main() {
  console.log('🌱 Seeding Zenith Travel database...');

  await prisma.activity.deleteMany();
  await prisma.itineraryDay.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.save.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.post.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.user.deleteMany();

  console.log('  Creating users...');
  const passwordHash = await bcrypt.hash('password123', 12);
  const users = await Promise.all(
    USERS.map((u) => prisma.user.create({ data: { ...u, passwordHash } }))
  );

  console.log('  Creating badges...');
  const BADGE_DATA = [
    { name: 'Explorer', icon: '🧭', desc: 'Posted first itinerary' },
    { name: 'Foodie', icon: '🍜', desc: '3+ food-focused posts' },
    { name: 'Summit', icon: '⛰️', desc: 'Posted a trekking adventure' },
    { name: 'Beach', icon: '🏖️', desc: 'Posted a beach trip' },
    { name: 'Solo', icon: '🎒', desc: 'Solo traveler verified' },
  ];
  for (let i = 0; i < users.length; i++) {
    const badges = BADGE_DATA.slice(0, Math.floor(Math.random() * 4) + 1);
    await Promise.all(
      badges.map((b) => prisma.badge.create({ data: { ...b, userId: users[i].id } }))
    );
  }

  console.log('  Creating itineraries...');
  const itineraries = await Promise.all(
    ITINERARIES.map((itin, idx) =>
      prisma.itinerary.create({
        data: {
          ...itin,
          authorId: users[idx % users.length].id,
          days_data: {
            create: itin.days_data.map((day) => ({
              dayNumber: day.dayNumber,
              theme: day.theme,
              activities: { create: day.activities },
            })),
          },
        },
      })
    )
  );

  console.log('  Creating posts...');
  const posts = await Promise.all(
    POSTS.map((post, idx) =>
      prisma.post.create({
        data: {
          ...post,
          authorId: users[idx % users.length].id,
          itineraryId: idx < itineraries.length ? itineraries[idx].id : undefined,
        },
      })
    )
  );

  console.log('  Creating social connections...');
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i !== j && Math.random() > 0.4) {
        await prisma.follow.create({
          data: { followerId: users[i].id, followingId: users[j].id },
        }).catch(() => {});
      }
    }
  }

  for (const post of posts) {
    const likers = users.filter(() => Math.random() > 0.3);
    for (const user of likers) {
      await prisma.like.create({ data: { userId: user.id, postId: post.id } }).catch(() => {});
    }
  }

  for (const itin of itineraries) {
    const savers = users.filter(() => Math.random() > 0.5);
    for (const user of savers) {
      await prisma.save.create({
        data: { userId: user.id, itineraryId: itin.id },
      }).catch(() => {});
    }
    await prisma.itinerary.update({
      where: { id: itin.id },
      data: { saveCount: { increment: savers.length } },
    });
  }

  console.log('✅ Seed complete!');
  console.log(`   ${users.length} users (password: password123)`);
  console.log(`   ${itineraries.length} itineraries`);
  console.log(`   ${posts.length} posts`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
