import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

interface AuthSocket extends Socket {
  userId?: string;
}

export const authenticateSocket = async (socket: AuthSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};
