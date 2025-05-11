
import React from 'react';
import Header from '@/components/layout/Header';

const PostItem: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Post New Item</h1>
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Post item form will go here</p>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
