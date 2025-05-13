
import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

const UserInfoSection: React.FC = () => {
  return (
    <div className="mt-4">
      <div className="flex flex-col">
        {/* Profile image at the top */}
        <div className="flex justify-center mb-3">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop"
            alt="Owner" 
            className="w-14 h-14 rounded-full object-cover"
          />
        </div>
        
        {/* User information below */}
        <div className="flex flex-col items-center">
          {/* Name and rating */}
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-semibold mr-2">Emma Wilson</h3>
            <div className="flex text-amber-400 text-xs">★★★★★ <span className="text-gray-500 ml-1">(42)</span></div>
          </div>
          
          {/* User details in a horizontal row, starting at the same position */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>Since 2023</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>2.3 mi away</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>~1 hour</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoSection;
