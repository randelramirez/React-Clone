import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });

  return (
    <div className="group flex items-start space-x-3 py-2 px-4 hover:bg-gray-50 message-enter">
      <img
        src={message.sender.avatar}
        alt={message.sender.username}
        className="w-10 h-10 rounded-full bg-gray-300"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline space-x-2">
          <span className="text-sm font-semibold text-gray-900">
            {message.sender.username}
          </span>
          <time className="text-xs text-gray-500" dateTime={message.createdAt}>
            {timeAgo}
          </time>
          {message.isEdited && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>
        <div className="mt-1">
          {message.content && (
            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
          {message.imageUrl && (
            <div className="mt-2">
              <img
                src={message.imageUrl}
                alt="Shared file"
                className="max-w-md rounded-lg shadow-md"
              />
            </div>
          )}
          {message.fileUrl && (
            <div className="mt-2">
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                {message.fileName || 'Download file'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
