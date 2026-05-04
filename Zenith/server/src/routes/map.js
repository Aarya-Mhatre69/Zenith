const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const MOCK_SPOTS = {
  cafes: [
    { id: '1', name: 'The Hidden Cup', category: 'cafe', rating: 4.8, reviews: 234, distance: 0.3, tags: ['WifiFriendly', 'GreatVibes'], open: true, photo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200' },
    { id: '2', name: 'Sunrise Roastery', category: 'cafe', rating: 4.6, reviews: 189, distance: 0.7, tags: ['Specialty', 'Quiet'], open: true, photo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200' },
  ],
  restaurants: [
    { id: '3', name: 'Warung Ibu Made', category: 'restaurant', rating: 4.9, reviews: 512, distance: 1.1, tags: ['Authentic', 'Local'], open: true, photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200' },
    { id: '4', name: 'Nasi Goreng House', category: 'restaurant', rating: 4.5, reviews: 301, distance: 0.5, tags: ['BudgetFriendly'], open: false, photo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200' },
  ],
  activities: [
    { id: '5', name: 'Sacred Temple Grounds', category: 'activity', rating: 4.7, reviews: 892, distance: 2.3, tags: ['Cultural', 'MustSee'], open: true, photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200' },
    { id: '6', name: 'Sunrise Yoga Retreat', category: 'activity', rating: 4.9, reviews: 156, distance: 0.9, tags: ['Wellness', 'Views'], open: true, photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200' },
  ],
};

router.get('/nearby', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    let spots = [];

    if (category === 'all') {
      spots = [...MOCK_SPOTS.cafes, ...MOCK_SPOTS.restaurants, ...MOCK_SPOTS.activities];
    } else if (MOCK_SPOTS[category]) {
      spots = MOCK_SPOTS[category];
    }

    spots.sort((a, b) => a.distance - b.distance);
    res.json(spots);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nearby spots' });
  }
});

router.get('/route', async (req, res) => {
  try {
    const { itineraryId } = req.query;
    if (!itineraryId) return res.status(400).json({ error: 'itineraryId required' });

    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        days_data: {
          include: { activities: { where: { lat: { not: null } } } },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });

    const waypoints = itinerary.days_data.flatMap((day) =>
      day.activities
        .filter((a) => a.lat && a.lng)
        .map((a) => ({ name: a.name, lat: a.lat, lng: a.lng, day: day.dayNumber }))
    );

    res.json({ itineraryId, waypoints });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

module.exports = router;
