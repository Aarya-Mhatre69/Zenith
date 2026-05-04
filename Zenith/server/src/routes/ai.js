const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { generateItinerary } = require('../services/itinerary-generator');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/generate-itinerary', authMiddleware, async (req, res) => {
  try {
    const { destination, days, budget, travelStyle, companions, dates } = req.body;

    if (!destination || !days) {
      return res.status(400).json({ error: 'Destination and days are required' });
    }

    const generated = await generateItinerary({
      destination,
      days: parseInt(days),
      budget: budget || 'MID_RANGE',
      travelStyle: travelStyle || ['CULTURE'],
      companions: companions || 'Solo',
      dates,
    });

    const itinerary = await prisma.itinerary.create({
      data: {
        title: generated.title,
        destination: generated.destination,
        days: generated.days,
        budget: generated.budget || budget || 'MID_RANGE',
        estimatedCost: generated.estimatedCost,
        authorId: req.userId,
        isAiGenerated: true,
        days_data: {
          create: generated.days_data.map((day) => ({
            dayNumber: day.dayNumber,
            theme: day.theme || '',
            activities: {
              create: day.activities.map((act) => ({
                timeOfDay: act.timeOfDay,
                name: act.name,
                description: act.description,
                location: act.location,
                duration: act.duration,
                estimatedCost: act.estimatedCost || 0,
                emoji: act.emoji || '📍',
                tips: act.tips || '',
              })),
            },
          })),
        },
      },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        days_data: {
          include: { activities: { orderBy: { timeOfDay: 'asc' } } },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { travelScore: { increment: 200 } },
    });

    res.status(201).json(itinerary);
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate itinerary' });
  }
});

module.exports = router;
