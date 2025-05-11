
import React from 'react';
import { Button } from '@/components/ui/button';

const DetailsPanel = () => {
  return (
    <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Details</h2>
      </div>
      <div className="p-4">
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
