const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:username', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, username: true, bio: true, avatarUrl: true,
        travelScore: true, createdAt: true,
        badges: true,
        _count: { select: { posts: true, following: true, followers: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/:id/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: req.params.id },
      include: { _count: { select: { likes: true, comments: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/:id/itineraries', async (req, res) => {
  try {
    const itineraries = await prisma.itinerary.findMany({
      where: { authorId: req.params.id },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { saves: true } },
        days_data: {
          include: { activities: { take: 1, orderBy: { timeOfDay: 'asc' } } },
          orderBy: { dayNumber: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(itineraries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});

router.get('/:id/saved', async (req, res) => {
  try {
    const saves = await prisma.save.findMany({
      where: { userId: req.params.id },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { likes: true } },
          },
        },
        itinerary: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { saves: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });
    res.json(saves);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.userId, followingId: req.params.id } },
    });

    if (existing) {
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId: req.userId, followingId: req.params.id } },
      });
    } else {
      await prisma.follow.create({ data: { followerId: req.userId, followingId: req.params.id } });
      await prisma.user.update({ where: { id: req.params.id }, data: { travelScore: { increment: 25 } } });
    }
    res.json({ following: !existing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

module.exports = router;
