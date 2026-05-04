const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = req.query.filter || 'recent';
    const skip = (page - 1) * limit;

    const orderBy = filter === 'trending'
      ? { likes: { _count: 'desc' } }
      : { createdAt: 'desc' };

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true, saves: true } },
      },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/hashtag/:tag', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { hashtags: { has: req.params.tag } },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        itinerary: { include: { days_data: { include: { activities: true } } } },
        comments: {
          include: { author: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { likes: true, saves: true } },
      },
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/', authMiddleware, upload.array('photos', 10), async (req, res) => {
  try {
    const { title, body, destination, country, duration, budget, travelStyle, hashtags, itineraryId } = req.body;
    const photos = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : JSON.parse(req.body.photoUrls || '[]');

    const post = await prisma.post.create({
      data: {
        title,
        body,
        photos,
        destination,
        country,
        duration: parseInt(duration) || 1,
        budget: budget || 'MID_RANGE',
        travelStyle: travelStyle ? JSON.parse(travelStyle) : [],
        hashtags: hashtags ? JSON.parse(hashtags) : [],
        authorId: req.userId,
        itineraryId: itineraryId || undefined,
      },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { travelScore: { increment: 100 } },
    });

    const io = req.app.get('io');
    if (io) io.emit('feed:new_post', { postId: post.id });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: req.userId, postId: req.params.id } },
    });

    if (existing) {
      await prisma.like.delete({
        where: { userId_postId: { userId: req.userId, postId: req.params.id } },
      });
    } else {
      await prisma.like.create({ data: { userId: req.userId, postId: req.params.id } });
      const post = await prisma.post.findUnique({ where: { id: req.params.id }, select: { authorId: true } });
      if (post && post.authorId !== req.userId) {
        await prisma.user.update({ where: { id: post.authorId }, data: { travelScore: { increment: 10 } } });
      }
    }

    const count = await prisma.like.count({ where: { postId: req.params.id } });
    const io = req.app.get('io');
    if (io) io.to(`post:${req.params.id}`).emit('post:liked', { postId: req.params.id, likeCount: count });

    res.json({ liked: !existing, likeCount: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.save.findUnique({
      where: { userId_postId: { userId: req.userId, postId: req.params.id } },
    });

    if (existing) {
      await prisma.save.delete({ where: { id: existing.id } });
    } else {
      await prisma.save.create({ data: { userId: req.userId, postId: req.params.id } });
    }
    res.json({ saved: !existing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comment = await prisma.comment.create({
      data: { body: req.body.body, authorId: req.userId, postId: req.params.id },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

module.exports = router;
