import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import type { Message } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://localhost:5018'}/api`;

export function useMessages(channelId: string) {
  const { connection } = useSocket();
  const queryClient = useQueryClient();

  // Query for fetching messages
  const messagesQuery = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async (): Promise<Message[]> => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/channel/${channelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return data.messages || [];
    },
    enabled: !!channelId,
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { channelId: string; content: string }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content: data.content,
          channelId: data.channelId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

  // Socket event handlers
  const handleNewMessage = useCallback((data: { message: Message }) => {
    if (data.message.channel === channelId) {
      queryClient.setQueryData(['messages', channelId], (oldMessages: Message[] | undefined) => {
        const messages = oldMessages || [];
        const messageExists = messages.some(msg => msg.id === data.message.id);
        if (messageExists) return messages;
        return [...messages, data.message];
      });
    }
  }, [channelId, queryClient]);

  const handleMessageEdited = useCallback((data: { message: Message }) => {
    if (data.message.channel === channelId) {
      queryClient.setQueryData(['messages', channelId], (oldMessages: Message[] | undefined) => {
        const messages = oldMessages || [];
        return messages.map(msg => {
          if (msg.id === data.message.id) return data.message;
          return msg;
        });
      });
    }
  }, [channelId, queryClient]);

  const handleMessageDeleted = useCallback((data: { messageId: string; channelId: string }) => {
    if (data.channelId === channelId) {
      queryClient.setQueryData(['messages', channelId], (oldMessages: Message[] | undefined) => {
        const messages = oldMessages || [];
        return messages.filter(msg => msg.id !== data.messageId);
      });
    }
  }, [channelId, queryClient]);

  // Set up SignalR listeners
  useEffect(() => {
    if (!connection || !channelId) return;

    // Join channel room
    connection.invoke('JoinChannel', channelId);

    connection.on('message:new', handleNewMessage);
    connection.on('message:edited', handleMessageEdited);
    connection.on('message:deleted', handleMessageDeleted);

    return () => {
      connection.off('message:new', handleNewMessage);
      connection.off('message:edited', handleMessageEdited);
      connection.off('message:deleted', handleMessageDeleted);
      connection.invoke('LeaveChannel', channelId);
    };
  }, [connection, channelId, handleNewMessage, handleMessageEdited, handleMessageDeleted]);

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage: sendMessageMutation,
  };
}
