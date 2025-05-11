
import React from 'react';
import Header from '@/components/layout/Header';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        {/* Empty content area */}
      </div>
    </div>
  );
};

export default Home;
