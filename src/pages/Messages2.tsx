
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Messages2 = () => {
  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left sidebar */}
        <div className="w-full md:w-96 border-r border-gray-200 bg-white p-4">
          <h1 className="text-xl font-bold mb-4">Messages 2</h1>
          <p>Left sidebar content would go here.</p>
        </div>
        
        {/* Main content area */}
        <div className="hidden md:block flex-1 p-6 bg-white">
          <p>Main content area.</p>
        </div>
        
        {/* Right column */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50 p-4">
          <h2 className="font-semibold text-lg mb-4">Details</h2>
          <p>Right column content would go here.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages2;
