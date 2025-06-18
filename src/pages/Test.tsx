
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const Test = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Page</h1>
          <p className="text-gray-600">This is a test page for development and testing purposes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">Feature Test 1</h2>
            <p className="text-gray-700 mb-4">
              This section can be used to test various features and components.
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Test Button
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-3 text-green-600">Feature Test 2</h2>
            <p className="text-gray-700 mb-4">
              Another test section for experimenting with different layouts.
            </p>
            <div className="flex space-x-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Testing</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-3 text-purple-600">Feature Test 3</h2>
            <p className="text-gray-700 mb-4">
              Use this area to test responsive design and mobile layouts.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Progress: 75%</p>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Development Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>This page is designed for testing new features</li>
            <li>Components can be safely experimented with here</li>
            <li>Layout changes can be tested without affecting main pages</li>
            <li>Feel free to modify this content as needed</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default Test;
