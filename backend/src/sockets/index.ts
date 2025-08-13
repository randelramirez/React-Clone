import { Server, Socket } from 'socket.io';
import { User } from '../models/User.js';
import { Channel } from '../models/Channel.js';

interface AuthSocket extends Socket {
  userId?: string;
}

export const handleConnection = async (socket: AuthSocket, io: Server) => {
  console.log(`User connected: ${socket.userId}`);

  try {
    // Update user status to online
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Get user's channels and join rooms
    const channels = await Channel.find({
      members: socket.userId
    });

    channels.forEach(channel => {
      socket.join(`channel:${channel._id}`);
    });

    // Emit user online status to all channels
    channels.forEach(channel => {
      socket.to(`channel:${channel._id}`).emit('user:online', {
        userId: socket.userId
      });
    });

    // Handle joining a channel room
    socket.on('channel:join', async (data: { channelId: string }) => {
      try {
        const { channelId } = data;
        
        // Verify user has access to the channel
        const channel = await Channel.findOne({
          _id: channelId,
          $or: [
            { isPrivate: false },
            { members: socket.userId }
          ]
        });

        if (channel) {
          socket.join(`channel:${channelId}`);
          console.log(`User ${socket.userId} joined channel: ${channelId}`);
        }
      } catch (error) {
        console.error('Channel join error:', error);
      }
    });

    // Handle leaving a channel room
    socket.on('channel:leave', (data: { channelId: string }) => {
      const { channelId } = data;
      socket.leave(`channel:${channelId}`);
      console.log(`User ${socket.userId} left channel: ${channelId}`);
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { channelId: string }) => {
      socket.to(`channel:${data.channelId}`).emit('typing:start', {
        userId: socket.userId,
        channelId: data.channelId
      });
    });

    socket.on('typing:stop', (data: { channelId: string }) => {
      socket.to(`channel:${data.channelId}`).emit('typing:stop', {
        userId: socket.userId,
        channelId: data.channelId
      });
    });

    // Handle message reactions in real-time
    socket.on('message:reaction', (data: { messageId: string, emoji: string, channelId: string }) => {
      socket.to(`channel:${data.channelId}`).emit('message:reaction', {
        ...data,
        userId: socket.userId
      });
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);

      try {
        // Update user status to offline
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        // Emit user offline status to all channels
        const channels = await Channel.find({
          members: socket.userId
        });

        channels.forEach(channel => {
          socket.to(`channel:${channel._id}`).emit('user:offline', {
            userId: socket.userId
          });
        });
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

  } catch (error) {
    console.error('Connection handler error:', error);
  }
};
