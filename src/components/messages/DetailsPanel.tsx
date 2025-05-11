
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockConversations } from '@/data/conversations';

const DetailsPanel = () => {
  // Check if the active conversation is the first one with the Blender
  const isBlenderMatch = mockConversations[0].id === "1";

  return (
    <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Details</h2>
      </div>
      <div className="p-4">
        {isBlenderMatch && (
          <Card className="mb-4 p-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Blender</h3>
            </div>
            <div className="bg-gray-100 rounded-md h-48 mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-lg">Product Image</span>
            </div>
            <p className="text-gray-700">
              This is the item you'll be trading away. It's currently listed for exchange with your trading partner.
            </p>
          </Card>
        )}
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
            <p className="text-sm">
              Additional information about the conversation or user could appear here.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Shared Files</h3>
            <div className="bg-white p-3 rounded-md border border-gray-200">
              <p className="text-sm text-gray-500">No files shared yet</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm">
                View Profile
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                Block User
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm text-red-500 hover:text-red-600">
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
