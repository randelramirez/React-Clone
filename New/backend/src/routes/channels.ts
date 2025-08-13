import express, { Request, Response } from 'express';
import { Channel } from '../models/Channel.js';
import { User, IUser } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Get all channels for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    const channels = await Channel.find({
      $or: [
        { isPrivate: false },
        { members: userId }
      ]
    })
    .populate('createdBy', 'username avatar')
    .populate('members', 'username avatar isOnline')
    .sort({ createdAt: -1 });

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific channel
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const channel = await Channel.findOne({
      _id: id,
      $or: [
        { isPrivate: false },
        { members: userId }
      ]
    })
    .populate('createdBy', 'username avatar')
    .populate('members', 'username avatar isOnline');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ channel });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create channel
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isPrivate = false } = req.body;
    const userId = req.user?._id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    // Check if channel name already exists (for public channels)
    if (!isPrivate) {
      const existingChannel = await Channel.findOne({ name: name.trim(), isPrivate: false });
      if (existingChannel) {
        return res.status(400).json({ message: 'Channel name already exists' });
      }
    }

    const channel = new Channel({
      name: name.trim(),
      description: description?.trim(),
      isPrivate,
      isDirectMessage: false,
      members: [userId],
      admins: [userId],
      createdBy: userId,
    });

    await channel.save();
    await channel.populate('createdBy', 'username avatar');
    await channel.populate('members', 'username avatar isOnline');

    // Emit channel creation to all users (for public channels)
    const io = req.app.get('io');
    if (!isPrivate) {
      io.emit('channel:created', { channel });
    }

    res.status(201).json({ channel });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join channel
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.isPrivate) {
      return res.status(403).json({ message: 'Cannot join private channel without invitation' });
    }

    if (channel.members.includes(userId!)) {
      return res.status(400).json({ message: 'Already a member of this channel' });
    }

    channel.members.push(userId!);
    await channel.save();

    // Emit user joined
    const io = req.app.get('io');
    io.to(`channel:${id}`).emit('channel:user-joined', {
      channelId: id,
      user: req.user?.toJSON(),
    });

    res.json({ message: 'Joined channel successfully' });
  } catch (error) {
    console.error('Join channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave channel
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (!channel.members.includes(userId!)) {
      return res.status(400).json({ message: 'Not a member of this channel' });
    }

    // Remove from members and admins
    channel.members = channel.members.filter(memberId => !memberId.equals(userId));
    channel.admins = channel.admins.filter(adminId => !adminId.equals(userId));

    await channel.save();

    // Emit user left
    const io = req.app.get('io');
    io.to(`channel:${id}`).emit('channel:user-left', {
      channelId: id,
      userId: userId?.toString(),
    });

    res.json({ message: 'Left channel successfully' });
  } catch (error) {
    console.error('Leave channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get or create direct message channel
router.post('/direct', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.body;
    const currentUserId = req.user?._id;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (targetUserId === currentUserId?.toString()) {
      return res.status(400).json({ message: 'Cannot create DM with yourself' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if DM channel already exists
    const existingChannel = await Channel.findOne({
      isDirectMessage: true,
      members: { $all: [currentUserId, targetUserId] },
    }).populate('members', 'username avatar isOnline');

    if (existingChannel) {
      return res.json({ channel: existingChannel });
    }

    // Create new DM channel
    const channel = new Channel({
      name: `${req.user?.username}, ${targetUser.username}`,
      isPrivate: true,
      isDirectMessage: true,
      members: [currentUserId, targetUserId],
      admins: [currentUserId, targetUserId],
      createdBy: currentUserId!,
    });

    await channel.save();
    await channel.populate('members', 'username avatar isOnline');

    res.status(201).json({ channel });
  } catch (error) {
    console.error('Create DM error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
