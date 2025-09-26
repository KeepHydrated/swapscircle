
import React from 'react';
import Header from './Header';
import SupportChat from '../chat/SupportChat';
import { useAutoLocationDetection } from '@/hooks/useAutoLocationDetection';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Auto-detect user location for analytics
  useAutoLocationDetection();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-16">{/* Add top padding for fixed header */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
      <SupportChat />
    </div>
  );
};

export default MainLayout;
