const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join:post', (postId) => socket.join(`post:${postId}`));
  socket.on('leave:post', (postId) => socket.leave(`post:${postId}`));
  socket.on('join:destination', (dest) => socket.join(`dest:${dest}`));

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 Zenith server running on port ${PORT}`);
});

module.exports = { server, io };
