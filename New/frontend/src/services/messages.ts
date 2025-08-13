import { api } from '../lib/api';
import type { Message } from '../types';

interface MessagePagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface MessagesResponse {
  messages: Message[];
  pagination: MessagePagination;
}

interface SendMessageData {
  content?: string;
  channelId: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  replyTo?: string;
}

export const messageService = {
  getMessages: async (channelId: string, page = 1, limit = 50): Promise<MessagesResponse> => {
    const response = await api.get<MessagesResponse>(`/messages/channel/${channelId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (data: SendMessageData): Promise<Message> => {
    const response = await api.post<{ message: Message }>('/messages', data);
    return response.data.message;
  },

  editMessage: async (id: string, content: string): Promise<Message> => {
    const response = await api.put<{ message: Message }>(`/messages/${id}`, { content });
    return response.data.message;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/messages/${id}`);
  },

  addReaction: async (messageId: string, emoji: string): Promise<void> => {
    await api.post(`/messages/${messageId}/reactions`, { emoji });
  },
};
