import React from 'react';
import SupportChat from '@/components/chat/SupportChat';
import MainLayout from '@/components/layout/MainLayout';

const CustomerSupport = () => {
  return (
    <MainLayout>
      <div className="bg-background min-h-full">
        <div className="p-4">
          <SupportChat embedded={true} />
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerSupport;