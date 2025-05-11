
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Markets: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Markets</h1>
        <p className="text-muted-foreground mt-1">Explore global markets and assets</p>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm p-12 text-center">
        <h2 className="text-xl font-medium text-muted-foreground">Markets section coming soon</h2>
      </div>
    </MainLayout>
  );
};

export default Markets;
