import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';

export const Workspace: React.FC = () => {
  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/channel/:channelId" element={<MainContent />} />
          <Route path="/dm/:userId" element={<MainContent />} />
        </Routes>
      </div>
    </div>
  );
};
