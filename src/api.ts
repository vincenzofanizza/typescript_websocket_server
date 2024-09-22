import express, { Request, Response } from 'express';
import User from './db/User';
import ChatRoom from './db/ChatRoom';
import { authenticateUser, AuthenticatedRequest } from './middleware/auth';
import { supabase, supabaseAdmin } from './utils/supabaseClient';

export const createApi = () => {
  const app = express();
  app.use(express.json());

  // Signup endpoint
  app.post('/signup', async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
  
      if (error) throw error;

      if (data.user) {
        // Create a corresponding user in your database
        await User.create({
          supabaseId: data.user.id,
          firstName,
          lastName,
          email
        });

        res.status(201).json({
          message: 'User created successfully',
          user: data.user,
        });
      } else {
        // This case happens when email confirmation is required
        res.status(200).json({
          message: 'Signup successful. Please check your email for confirmation.',
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ error: 'Failed to create user' });
    }
  });

  // Login endpoint
  app.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('User not found in Supabase');
      }

      res.json({
        message: 'Login successful',
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // Apply authentication middleware to all routes below
  app.use(authenticateUser);

  // User endpoints
  app.get('/users', async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.findAll();
    res.json(users);
  });

  app.get('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.params.id;

    // Fetch requesting user using supabaseId
    const user = await User.findOne({ where: { supabaseId: req.supabaseUser?.id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found in local database' });
    }
    
    // Ensure the authenticated user can only delete their own account
    if (user.id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own account' });
    }

    try {
      // Delete user from your database
      const deleted = await User.destroy({
        where: { id: userId }
      });

      if (!deleted) {
        return res.status(404).json({ error: 'User not found in local database' });
      }

      // Delete user from Supabase
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // ChatRoom endpoints
  app.post('/chatrooms', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const chatRoom = await ChatRoom.create(req.body);
      res.status(201).json(chatRoom);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create chat room', details: (error as Error).message });
    }
  });

  app.get('/chatrooms', async (req: AuthenticatedRequest, res: Response) => {
    const chatRooms = await ChatRoom.findAll();
    res.json(chatRooms);
  });

  app.get('/chatrooms/:id', async (req: AuthenticatedRequest, res: Response) => {
    const chatRoom = await ChatRoom.findByPk(req.params.id);
    if (chatRoom) {
      res.json(chatRoom);
    } else {
      res.status(404).json({ error: 'Chat room not found' });
    }
  });

  app.put('/chatrooms/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [updated] = await ChatRoom.update(req.body, {
        where: { id: req.params.id }
      });
      if (updated) {
        const updatedChatRoom = await ChatRoom.findByPk(req.params.id);
        res.json(updatedChatRoom);
      } else {
        res.status(404).json({ error: 'Chat room not found' });
      }
    } catch (error) {
      res.status(400).json({ error: 'Failed to update chat room', details: (error as Error).message });
    }
  });

  app.delete('/chatrooms/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = await ChatRoom.destroy({
        where: { id: req.params.id }
      });
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Chat room not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete chat room', details: (error as Error).message });
    }
  });

  return app;
};