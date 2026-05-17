import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import goalRoutes from './routes/goal.routes.js';
import agentRoutes from './routes/agent.routes.js';
import chapterRoutes from './routes/chapter.routes.js';
import doorkeeperRoutes from './routes/doorkeeper.routes.js';
import visitorTracker from './middleware/visitorTracker.js';
import { setupSocket } from './socket/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  }
});

// Connect to Database
connectDB(); 

// Middleware
app.use(cors());
app.use(express.json());
app.use(visitorTracker);

// Routes
app.use('/api/goal', goalRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chapter2', chapterRoutes);
app.use('/api/doorkeeper', doorkeeperRoutes);

// Socket.io
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
