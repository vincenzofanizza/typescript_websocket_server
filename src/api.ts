import express, { Request, Response } from 'express';
import User from './db/User';
import ChatRoom from './db/ChatRoom';

export const createApi = () => {
  const app = express();
  app.use(express.json());

  // User endpoints
  app.post('/users', async (req: Request, res: Response) => {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create user' });
    }
  });

  app.get('/users', async (req: Request, res: Response) => {
    const users = await User.findAll();
    res.json(users);
  });

  app.get('/users/:id', async (req: Request, res: Response) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.put('/users/:id', async (req: Request, res: Response) => {
    try {
      const [updated] = await User.update(req.body, {
        where: { id: req.params.id }
      });
      if (updated) {
        const updatedUser = await User.findByPk(req.params.id);
        res.json(updatedUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ error: 'Failed to update user' });
    }
  });

  app.delete('/users/:id', async (req: Request, res: Response) => {
    const deleted = await User.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // ChatRoom endpoints
  app.post('/chatrooms', async (req: Request, res: Response) => {
    try {
      const chatRoom = await ChatRoom.create(req.body);
      res.status(201).json(chatRoom);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create chat room' });
    }
  });

  app.get('/chatrooms', async (req: Request, res: Response) => {
    const chatRooms = await ChatRoom.findAll();
    res.json(chatRooms);
  });

  app.get('/chatrooms/:id', async (req: Request, res: Response) => {
    const chatRoom = await ChatRoom.findByPk(req.params.id);
    if (chatRoom) {
      res.json(chatRoom);
    } else {
      res.status(404).json({ error: 'Chat room not found' });
    }
  });

  app.put('/chatrooms/:id', async (req: Request, res: Response) => {
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
      res.status(400).json({ error: 'Failed to update chat room' });
    }
  });

  app.delete('/chatrooms/:id', async (req: Request, res: Response) => {
    const deleted = await ChatRoom.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Chat room not found' });
    }
  });

  return app;
};