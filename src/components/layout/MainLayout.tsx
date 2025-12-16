
import React from 'react';
import { useAutoLocationDetection } from '@/hooks/useAutoLocationDetection';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Auto-detect user location for analytics
  useAutoLocationDetection();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16">{/* Add top padding for fixed header */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
