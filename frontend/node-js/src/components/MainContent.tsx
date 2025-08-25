import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useMessages } from '../hooks/useMessages';
import { useChannels } from '../hooks/useChannels';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const MainContent: React.FC = () => {
  // For now, we'll use the first channel or create a default channel ID
  const [currentChannelId, setCurrentChannelId] = useState<string>('general');
  const { channels } = useChannels();
  const { messages, isLoading } = useMessages(currentChannelId);

  // Use the first available channel if it exists
  React.useEffect(() => {
    if (channels.length > 0 && currentChannelId === 'general') {
      setCurrentChannelId(channels[0]._id);
    }
  }, [channels, currentChannelId]);

  const currentChannel = channels.find(ch => ch._id === currentChannelId) || {
    _id: currentChannelId,
    name: 'general',
    description: 'This is the beginning of the #general channel.',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <MessageSquare className="w-6 h-6 text-gray-600 mr-2" />
          <h1 className="text-lg font-semibold text-gray-900"># {currentChannel.name}</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {currentChannel.description || `This is the beginning of the #${currentChannel.name} channel.`}
        </p>
      </div>

      {/* Messages Area */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Message Input */}
      <MessageInput channelId={currentChannelId} />
    </div>
  );
};
