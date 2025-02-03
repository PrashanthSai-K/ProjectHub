const express = require('express');
const projectRoutes = require('./src/routes/project.routes');
const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
const chatRoutes = require('./src/routes/chat.routes');
const calendarRoutes = require('./src/routes/calendar.routes')
// const authRoutes  = require('./src/routes/auth.routes');
const exploreRoutes = require('./src/routes/explore.routes')
const sequelize = require('./config/database');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const http = require('http');

const app = express();
const PORT = process.env.PORT || 4500;
require('dotenv').config();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://projecthub-sai.vercel.app', 'https://w2tpzms2-3000.inc1.devtunnels.ms'], // Update to include your React app domain or the actual domain of your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/calendar', calendarRoutes)
app.use('/api/explore', exploreRoutes);

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // Update to include your React app domain or the actual domain of your frontend
    methods: ['GET', 'POST'],
  },
});


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (projectId) => {
    socket.join(projectId);
  });

  socket.on('sendMessage', (message) => {
    io.to(message.projectId).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    //console.log('User disconnected:', socket.id); No need to log this to the console
  });
});

app.set('io', io);

// Test DB connection and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synced');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

module.exports = app; 