import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { User } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  typingUsers: { [channelId: string]: User[] };
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  typingUsers: {},
  onlineUsers: [],
});

export { SocketContext };

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
  token: string | null;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [channelId: string]: User[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const handleUserOnline = useCallback(({ userId }: { userId: string }) => {
    setOnlineUsers(prev => {
      const filtered = prev.filter(id => id !== userId);
      return [...filtered, userId];
    });
  }, []);

  const handleUserOffline = useCallback(({ userId }: { userId: string }) => {
    setOnlineUsers(prev => prev.filter(id => id !== userId));
  }, []);

  const handleTypingStart = useCallback(({ userId, channelId }: { userId: string; channelId: string }) => {
    setTypingUsers(prev => {
      const channelUsers = prev[channelId] || [];
      const filtered = channelUsers.filter(u => u._id !== userId);
      return {
        ...prev,
        [channelId]: filtered,
      };
    });
  }, []);

  const handleTypingStop = useCallback(({ userId, channelId }: { userId: string; channelId: string }) => {
    setTypingUsers(prev => {
      const channelUsers = prev[channelId] || [];
      const filtered = channelUsers.filter(u => u._id !== userId);
      return {
        ...prev,
        [channelId]: filtered,
      };
    });
  }, []);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setTypingUsers({});
        setOnlineUsers([]);
      }
      return;
    }

    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token },
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('user:online', handleUserOnline);
    socketInstance.on('user:offline', handleUserOffline);
    socketInstance.on('typing:start', handleTypingStart);
    socketInstance.on('typing:stop', handleTypingStop);

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, socket, handleUserOnline, handleUserOffline, handleTypingStart, handleTypingStop]);

  const value = useMemo(() => ({
    socket,
    isConnected,
    typingUsers,
    onlineUsers,
  }), [socket, isConnected, typingUsers, onlineUsers]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
