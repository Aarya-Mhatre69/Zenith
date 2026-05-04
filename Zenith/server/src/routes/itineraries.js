const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const ITINERARY_INCLUDE = {
  author: { select: { id: true, username: true, avatarUrl: true } },
  days_data: {
    include: { activities: { orderBy: { timeOfDay: 'asc' } } },
    orderBy: { dayNumber: 'asc' },
  },
  _count: { select: { saves: true } },
};

router.get('/', async (req, res) => {
  try {
    const { destination, days, budget } = req.query;
    const where = {};
    if (destination) where.destination = { contains: destination, mode: 'insensitive' };
    if (days) where.days = parseInt(days);
    if (budget) where.budget = budget;

    const itineraries = await prisma.itinerary.findMany({
      where,
      include: ITINERARY_INCLUDE,
      orderBy: { saveCount: 'desc' },
      take: 20,
    });
    res.json(itineraries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
      include: ITINERARY_INCLUDE,
    });
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    res.json(itinerary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.save.findUnique({
      where: { userId_itineraryId: { userId: req.userId, itineraryId: req.params.id } },
    });

    if (existing) {
      await prisma.save.delete({ where: { id: existing.id } });
      await prisma.itinerary.update({
        where: { id: req.params.id },
        data: { saveCount: { decrement: 1 } },
      });
    } else {
      await prisma.save.create({ data: { userId: req.userId, itineraryId: req.params.id } });
      await prisma.itinerary.update({
        where: { id: req.params.id },
        data: { saveCount: { increment: 1 } },
      });
      const itinerary = await prisma.itinerary.findUnique({ where: { id: req.params.id }, select: { authorId: true } });
      if (itinerary && itinerary.authorId !== req.userId) {
        await prisma.user.update({ where: { id: itinerary.authorId }, data: { travelScore: { increment: 50 } } });
        const io = req.app.get('io');
        if (io) io.to(`user:${itinerary.authorId}`).emit('notification', {
          type: 'save',
          message: 'Someone saved your itinerary!',
        });
      }
    }
    res.json({ saved: !existing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

router.post('/:id/clone', authMiddleware, async (req, res) => {
  try {
    const source = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
      include: { days_data: { include: { activities: true } } },
    });
    if (!source) return res.status(404).json({ error: 'Itinerary not found' });

    const clone = await prisma.itinerary.create({
      data: {
        title: `${source.title} (My Version)`,
        destination: source.destination,
        days: source.days,
        budget: source.budget,
        estimatedCost: source.estimatedCost,
        authorId: req.userId,
        isAiGenerated: false,
        days_data: {
          create: source.days_data.map((day) => ({
            dayNumber: day.dayNumber,
            theme: day.theme,
            activities: {
              create: day.activities.map((act) => ({
                timeOfDay: act.timeOfDay,
                name: act.name,
                description: act.description,
                location: act.location,
                duration: act.duration,
                estimatedCost: act.estimatedCost,
                emoji: act.emoji,
                tips: act.tips,
                lat: act.lat,
                lng: act.lng,
              })),
            },
          })),
        },
      },
      include: ITINERARY_INCLUDE,
    });
    res.status(201).json(clone);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clone itinerary' });
  }
});

// Add a day to an itinerary
router.post('/:id/days', authMiddleware, async (req, res) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
      include: { days_data: true },
    });
    if (!itinerary || itinerary.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const nextDay = (itinerary.days_data.length || 0) + 1;
    const day = await prisma.itineraryDay.create({
      data: {
        itineraryId: req.params.id,
        dayNumber: nextDay,
        theme: req.body.theme || `Day ${nextDay}`,
        activities: {
          create: [
            { timeOfDay: 'MORNING', name: 'Morning activity', description: 'Describe your morning', location: itinerary.destination, duration: '~2hr', estimatedCost: 0, emoji: '☀️' },
            { timeOfDay: 'AFTERNOON', name: 'Afternoon activity', description: 'Describe your afternoon', location: itinerary.destination, duration: '~3hr', estimatedCost: 0, emoji: '🌿' },
            { timeOfDay: 'EVENING', name: 'Evening activity', description: 'Describe your evening', location: itinerary.destination, duration: '~2hr', estimatedCost: 0, emoji: '🌅' },
          ],
        },
      },
      include: { activities: true },
    });
    await prisma.itinerary.update({
      where: { id: req.params.id },
      data: { days: { increment: 1 } },
    });
    res.status(201).json(day);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add day' });
  }
});

// Delete a day
router.delete('/:id/days/:dayId', authMiddleware, async (req, res) => {
  try {
    const day = await prisma.itineraryDay.findUnique({
      where: { id: req.params.dayId },
      include: { itinerary: true },
    });
    if (!day || day.itinerary.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.activity.deleteMany({ where: { dayId: req.params.dayId } });
    await prisma.itineraryDay.delete({ where: { id: req.params.dayId } });
    await prisma.itinerary.update({
      where: { id: req.params.id },
      data: { days: { decrement: 1 } },
    });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete day' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({ where: { id: req.params.id } });
    if (!itinerary || itinerary.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await prisma.itinerary.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        estimatedCost: req.body.estimatedCost,
        budget: req.body.budget,
      },
      include: ITINERARY_INCLUDE,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update itinerary' });
  }
});

module.exports = router;
