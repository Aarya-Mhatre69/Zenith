const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Update a single activity
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { day: { include: { itinerary: true } } },
    });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    if (activity.day.itinerary.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, description, location, duration, estimatedCost, emoji, tips, timeOfDay } = req.body;
    const updated = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(duration !== undefined && { duration }),
        ...(estimatedCost !== undefined && { estimatedCost: parseFloat(estimatedCost) }),
        ...(emoji !== undefined && { emoji }),
        ...(tips !== undefined && { tips }),
        ...(timeOfDay !== undefined && { timeOfDay }),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete a single activity
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { day: { include: { itinerary: true } } },
    });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    if (activity.day.itinerary.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.activity.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Add activity to a day
router.post('/day/:dayId', authMiddleware, async (req, res) => {
  try {
    const day = await prisma.itineraryDay.findUnique({
      where: { id: req.params.dayId },
      include: { itinerary: true },
    });
    if (!day) return res.status(404).json({ error: 'Day not found' });
    if (day.itinerary.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, description, location, duration, estimatedCost, emoji, tips, timeOfDay } = req.body;
    const activity = await prisma.activity.create({
      data: {
        dayId: req.params.dayId,
        name: name || 'New Activity',
        description: description || '',
        location: location || '',
        duration: duration || '~2hr',
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        emoji: emoji || '📍',
        tips: tips || '',
        timeOfDay: timeOfDay || 'MORNING',
      },
    });
    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

module.exports = router;
