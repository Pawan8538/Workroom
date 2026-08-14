import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import goalRoutes from './routes/goal.routes.js';
import agentRoutes from './routes/agent.routes.js';
import chapter2Routes from './routes/chapter2.routes.js';
import doorkeeperRoutes from './routes/doorkeeper.routes.js';
import visitorTracker from './middleware/visitorTracker.js';
import { setupSocket } from './socket/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  }
});

// Connect to Database
connectDB(); 

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());
app.use(visitorTracker);

// Routes
app.use('/api/goal', goalRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chapter2', chapter2Routes);
app.use('/', doorkeeperRoutes);

// Socket.io
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
