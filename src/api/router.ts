import express from 'express';
import { authenticateUser } from './middleware/auth';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chatRoomRoutes from './routes/chatrooms';

export const createApi = () => {
  const app = express();
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