import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Plus, Hash, MessageCircle, Settings, User } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Slack Clone</h1>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:bg-gray-700 rounded px-2 py-1"
            >
              <img
                src={user?.avatar || ''}
                alt={user?.username || ''}
                className="w-6 h-6 rounded bg-gray-600"
              />
              <span className="text-sm">{user?.username}</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-red-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-300 uppercase">Channels</h2>
            <button className="text-gray-400 hover:text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <button className="flex items-center w-full text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded px-2 py-1">
              <Hash className="w-4 h-4 mr-2" />
              general
            </button>
            <button className="flex items-center w-full text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded px-2 py-1">
              <Hash className="w-4 h-4 mr-2" />
              random
            </button>
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-300 uppercase">Direct Messages</h2>
            <button className="text-gray-400 hover:text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <button className="flex items-center w-full text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded px-2 py-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                john_doe
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
