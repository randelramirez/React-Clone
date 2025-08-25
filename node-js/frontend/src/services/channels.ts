import { api } from '../lib/api';
import type { Channel } from '../types';

export const channelService = {
  getChannels: async (): Promise<Channel[]> => {
    const response = await api.get<{ channels: Channel[] }>('/channels');
    return response.data.channels;
  },

  getChannel: async (id: string): Promise<Channel> => {
    const response = await api.get<{ channel: Channel }>(`/channels/${id}`);
    return response.data.channel;
  },

  createChannel: async (data: { name: string; description?: string; isPrivate?: boolean }): Promise<Channel> => {
    const response = await api.post<{ channel: Channel }>('/channels', data);
    return response.data.channel;
  },

  joinChannel: async (id: string): Promise<void> => {
    await api.post(`/channels/${id}/join`);
  },

  leaveChannel: async (id: string): Promise<void> => {
    await api.post(`/channels/${id}/leave`);
  },

  createDirectMessage: async (userId: string): Promise<Channel> => {
    const response = await api.post<{ channel: Channel }>('/channels/direct', { userId });
    return response.data.channel;
  },
};
