
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Clock } from 'lucide-react';

const Test = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-left">
          <p className="text-sm text-gray-500 mb-4">6/15/2025</p>
          
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/lovable-uploads/6326c61e-753c-4972-9f13-6c9f3b171144.png" alt="Emma Wilson" />
              <AvatarFallback className="bg-purple-100 text-purple-800">
                EW
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">Emma Wilson</h2>
              <div className="flex items-center text-yellow-400">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i}>★</span>
                ))}
                <span className="ml-1 text-gray-600 text-sm font-medium">(42)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Since 2023</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>2.3 mi away</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>~1 hour</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Test;
