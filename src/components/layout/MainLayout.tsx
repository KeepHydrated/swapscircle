
import React from 'react';
import Header from './Header';
import SupportChat from '../chat/SupportChat';
import { NativePreviewToggle } from '../NativePreviewToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
      <SupportChat />
      <NativePreviewToggle />
    </div>
  );
};

export default MainLayout;
