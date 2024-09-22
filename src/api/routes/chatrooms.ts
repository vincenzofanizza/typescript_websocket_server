import express, { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ChatRoom from '../../db/ChatRoom';

const router = express.Router();

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatRoom = await ChatRoom.create(req.body);
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(400).json({ error: 'Failed to create chat room', details: (error as Error).message });
  }
});

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatRooms = await ChatRoom.findAll();
    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chatRoom = await ChatRoom.findByPk(req.params.id);
    if (chatRoom) {
      res.json(chatRoom);
    } else {
      res.status(404).json({ error: 'Chat room not found' });
    }
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({ error: 'Failed to fetch chat room' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
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
    console.error('Error updating chat room:', error);
    res.status(400).json({ error: 'Failed to update chat room' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
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
    console.error('Error deleting chat room:', error);
    res.status(500).json({ error: 'Failed to delete chat room' });
  }
});

export default router;