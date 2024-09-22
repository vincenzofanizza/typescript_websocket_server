import express from 'express';
import cors from 'cors';
import { authenticateUser } from './middleware/auth';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chatRoomRoutes from './routes/chatrooms';

import dotenv from 'dotenv';

dotenv.config();

// TODO: Add authorization to all endpoints
export const createApi = () => {
  const app = express();

  // Configure CORS options
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  };

  // Enable CORS with the specified options
  app.use(cors(corsOptions));

  // Handle preflight requests for OPTIONS method
  app.options('*', cors(corsOptions));  // Allow all preflight requests

  app.use(express.json());

  // Auth routes (no authentication required)
  app.use('/auth', authRoutes);

  // Apply authentication middleware to all routes below
  app.use(authenticateUser);

  // User routes
  app.use('/users', userRoutes);

  // ChatRoom routes
  app.use('/chatrooms', chatRoomRoutes);

  return app;
};