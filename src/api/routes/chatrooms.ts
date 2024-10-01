import express, { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ChatRoom from '../../db/ChatRoom';
import User from '../../db/User';

const router = express.Router();

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatRooms = await ChatRoom.findAll({
      include: [{ model: User, as: 'owner' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chatrooms:', error);
    res.status(500).json({ error: 'Failed to fetch chatrooms' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatRoom = await ChatRoom.findByPk(req.params.id, { include: [{ model: User, as: 'owner' }] });
    if (chatRoom) {
      res.json(chatRoom);
    } else {
      res.status(404).json({ error: 'Chatroom not found' });
    }
  } catch (error) {
    console.error('Error fetching chatroom:', error);
    res.status(500).json({ error: 'Failed to fetch chatroom' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const ownerId = req.supabaseUser?.id;

    if (!ownerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chatRoom = await ChatRoom.create({ name, ownerId });
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating chatroom:', error);
    res.status(400).json({ error: 'Failed to create chatroom' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatRoom = await ChatRoom.findByPk(req.params.id);

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    // Check if the authenticated user is the owner
    if (chatRoom.ownerId !== req.supabaseUser?.id) {
      return res.status(403).json({ error: 'You are not authorized to update this chatroom' });
    }

    const updated = await chatRoom.update(req.body);
    res.json(updated);
  } catch (error) {
    console.error('Error updating chatroom:', error);
    res.status(400).json({ error: 'Failed to update chatroom' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatRoom = await ChatRoom.findByPk(req.params.id);

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    // Check if the authenticated user is the owner
    if (chatRoom.ownerId !== req.supabaseUser?.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this chatroom' });
    }

    await chatRoom.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting chatroom:', error);
    res.status(500).json({ error: 'Failed to delete chatroom' });
  }
});

export default router;