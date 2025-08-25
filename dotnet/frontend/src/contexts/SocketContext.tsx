import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { User } from '../types';

interface SocketContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  typingUsers: { [channelId: string]: User[] };
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  connection: null,
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
  const [connection, setConnection] = useState<HubConnection | null>(null);
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
      const filtered = channelUsers.filter(u => u.id !== userId);
      return {
        ...prev,
        [channelId]: filtered,
      };
    });
  }, []);

  const handleTypingStop = useCallback(({ userId, channelId }: { userId: string; channelId: string }) => {
    setTypingUsers(prev => {
      const channelUsers = prev[channelId] || [];
      const filtered = channelUsers.filter(u => u.id !== userId);
      return {
        ...prev,
        [channelId]: filtered,
      };
    });
  }, []);

  useEffect(() => {
    if (!token) {
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
        setTypingUsers({});
        setOnlineUsers([]);
      }
      return;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl((import.meta.env.VITE_API_URL || 'https://localhost:5018') + '/chatHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log('Connected to SignalR hub');
        setIsConnected(true);
      } catch (err) {
        console.error('Error connecting to SignalR hub:', err);
        setIsConnected(false);
      }
    };

    newConnection.onclose(async () => {
      console.log('Disconnected from SignalR hub');
      setIsConnected(false);
    });

    newConnection.onreconnecting(() => {
      console.log('Reconnecting to SignalR hub...');
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      console.log('Reconnected to SignalR hub');
      setIsConnected(true);
    });

    // Set up event handlers
    newConnection.on('user:online', handleUserOnline);
    newConnection.on('user:offline', handleUserOffline);
    newConnection.on('typing:start', handleTypingStart);
    newConnection.on('typing:stop', handleTypingStop);

    setConnection(newConnection);
    startConnection();

    return () => {
      newConnection.stop();
    };
  }, [token, handleUserOnline, handleUserOffline, handleTypingStart, handleTypingStop]);

  const value = useMemo(() => ({
    connection,
    isConnected,
    typingUsers,
    onlineUsers,
  }), [connection, isConnected, typingUsers, onlineUsers]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
