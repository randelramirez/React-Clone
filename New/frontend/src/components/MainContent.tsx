import React from 'react';
import { MessageSquare } from 'lucide-react';

export const MainContent: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <MessageSquare className="w-6 h-6 text-gray-600 mr-2" />
          <h1 className="text-lg font-semibold text-gray-900"># general</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          This is the beginning of the #general channel.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Slack Clone!
            </h2>
            <p className="text-gray-600">
              This is your workspace. You can start by sending a message below.
            </p>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="border border-gray-300 rounded-lg">
              <textarea
                placeholder="Type a message..."
                rows={3}
                className="w-full px-4 py-3 border-0 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <button className="bg-primary-600 text-white px-4 py-1 rounded text-sm hover:bg-primary-700">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
