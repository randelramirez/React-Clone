import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { Channel } from '../models/Channel.js';
import { IUser } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Get messages for a channel
router.get('/channel/:channelId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?._id;

    // Handle the case where channelId is not a valid ObjectId (like 'general')
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      // Return empty messages for non-ObjectId channel IDs (like the default 'general')
      return res.json({
        messages: [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: 0,
          hasMore: false
        }
      });
    }

    // Check if user has access to the channel
    const channel = await Channel.findOne({
      _id: channelId,
      $or: [
        { isPrivate: false },
        { members: userId }
      ]
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found or no access' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const messages = await Message.find({ channel: channelId })
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Reverse to show oldest first
    messages.reverse();

    const total = await Message.countDocuments({ channel: channelId });
    const hasMore = skip + messages.length < total;

    res.json({
      messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content, channelId, imageUrl, fileUrl, fileName, replyTo } = req.body;
    const userId = req.user?._id;

    if (!channelId) {
      return res.status(400).json({ message: 'Channel ID is required' });
    }

    // Handle the case where channelId is not a valid ObjectId (like 'general')
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Invalid channel ID. Please select a valid channel.' });
    }

    // Check if user has access to the channel
    const channel = await Channel.findOne({
      _id: channelId,
      $or: [
        { isPrivate: false },
        { members: userId }
      ]
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found or no access' });
    }

    // Validate message content
    if (!content && !imageUrl && !fileUrl) {
      return res.status(400).json({ message: 'Message must have content, image, or file' });
    }

    const message = new Message({
      content: content?.trim(),
      imageUrl,
      fileUrl,
      fileName,
      sender: userId,
      channel: channelId,
      replyTo: replyTo || undefined,
    });

    await message.save();
    await message.populate('sender', 'username avatar');
    
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    // Emit message to channel subscribers
    const io = req.app.get('io');
    io.to(`channel:${channelId}`).emit('message:new', { message });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit message
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    const message = await Message.findById(id).populate('sender', 'username avatar');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user owns the message
    if (message.sender._id.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    // Check if message is older than 15 minutes (optional restriction)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return res.status(403).json({ message: 'Cannot edit messages older than 15 minutes' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    
    await message.save();

    // Emit message update to channel subscribers
    const io = req.app.get('io');
    io.to(`channel:${message.channel}`).emit('message:edited', { message });

    res.json({ message });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user owns the message or is channel admin
    const channel = await Channel.findById(message.channel);
    const isOwner = message.sender.toString() === userId?.toString();
    const isAdmin = channel?.admins.some(adminId => adminId.toString() === userId?.toString());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(id);

    // Emit message deletion to channel subscribers
    const io = req.app.get('io');
    io.to(`channel:${message.channel}`).emit('message:deleted', { messageId: id });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction to message
router.post('/:id/reactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user?._id;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user has access to the channel
    const channel = await Channel.findOne({
      _id: message.channel,
      $or: [
        { isPrivate: false },
        { members: userId }
      ]
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found or no access' });
    }

    // Find or create reaction
    let reaction = message.reactions.find(r => r.emoji === emoji);
    
    if (reaction) {
      // Toggle reaction
      const userIndex = reaction.users.indexOf(userId!);
      if (userIndex > -1) {
        reaction.users.splice(userIndex, 1);
        // Remove reaction if no users left
        if (reaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        reaction.users.push(userId!);
      }
    } else {
      // Add new reaction
      message.reactions.push({
        emoji,
        users: [userId!]
      });
    }

    await message.save();

    // Emit reaction update to channel subscribers
    const io = req.app.get('io');
    io.to(`channel:${message.channel}`).emit('message:reaction', {
      messageId: id,
      emoji,
      userId: userId?.toString(),
      reactions: message.reactions
    });

    res.json({ reactions: message.reactions });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
