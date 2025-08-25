import { useQuery } from '@tanstack/react-query';
import { channelService } from '../services/channels';
import { useSocket } from './useSocket';
import { useEffect, useState } from 'react';
import type { Channel } from '../types';

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const { socket } = useSocket();

  const { data: channelsData, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: channelService.getChannels,
  });

  useEffect(() => {
    if (channelsData) {
      setChannels(channelsData);
    }
  }, [channelsData]);

  // Listen for real-time channel updates
  useEffect(() => {
    if (!socket) return;

    const handleChannelCreated = (data: { channel: Channel }) => {
      setChannels(prev => [...prev, data.channel]);
    };

    socket.on('channel:created', handleChannelCreated);

    return () => {
      socket.off('channel:created', handleChannelCreated);
    };
  }, [socket]);

  return {
    channels,
    isLoading,
  };
};
