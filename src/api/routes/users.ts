import express, { Response } from 'express';
import User from '../../db/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../../utils/supabase';

const router = express.Router();

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.supabaseUser?.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found in local database' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found in local database' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.id;

  try {
    // Fetch requesting user using supabaseId
    const user = await User.findByPk(req.supabaseUser?.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found in local database' });
    }
    
    // Ensure the authenticated user can only delete their own account
    if (user.supabaseId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own account' });
    }

    // Delete user from your database
    const deleted = await User.destroy({
      where: { supabaseId: userId }
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

export default router;