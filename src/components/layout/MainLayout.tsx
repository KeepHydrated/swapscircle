
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAutoLocationDetection } from '@/hooks/useAutoLocationDetection';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const usesWindowScroll = pathname === '/other-person-profile';

  // Auto-detect user location for analytics
  useAutoLocationDetection();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16">{/* Add top padding for fixed header */}
        <main className={`flex-1 p-4 md:p-6 ${usesWindowScroll ? 'overflow-visible' : 'overflow-y-auto'}`}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
