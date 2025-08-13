import express, { Request, Response } from 'express';
import { User, IUser } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Get all users (for direct message)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      'username avatar isOnline lastSeen'
    ).sort({ username: 1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id, 'username avatar isOnline lastSeen createdAt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { username, avatar } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      username: username.trim(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username.trim();
    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/:query', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.params;
    const currentUserId = req.user?._id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find(
      {
        _id: { $ne: currentUserId },
        username: { $regex: query.trim(), $options: 'i' }
      },
      'username avatar isOnline'
    ).limit(20).sort({ username: 1 });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
