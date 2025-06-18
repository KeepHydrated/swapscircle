
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Clock, Tag, Layers, Shield, DollarSign } from 'lucide-react';

const Test = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-left">
          <p className="text-sm text-gray-500 mb-4">6/15/2025</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* First Profile with Item */}
            <div className="space-y-4">
              {/* Profile Section */}
              <div>
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

              {/* Item Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-100 w-32 h-32">
                  <img 
                    src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&auto=format&fit=crop" 
                    alt="Vintage Camera" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Vintage Film Camera</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Beautiful vintage 35mm film camera in excellent working condition. Perfect for photography enthusiasts.
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span>Electronics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-500" />
                      <span>Cameras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span>Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>$150 - $200</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Profile with Item */}
            <div className="space-y-4">
              {/* Profile Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/lovable-uploads/6de02767-04e3-4b51-93af-053033a1c111.png" alt="Marcus Chen" />
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      MC
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-lg">Marcus Chen</h2>
                    <div className="flex items-center text-yellow-400">
                      {Array(4).fill(0).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      <span className="text-gray-300">★</span>
                      <span className="ml-1 text-gray-600 text-sm font-medium">(28)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Since 2024</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>1.8 mi away</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>~45 min</span>
                  </div>
                </div>
              </div>

              {/* Item Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-100 w-32 h-32">
                  <img 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&auto=format&fit=crop" 
                    alt="MacBook Pro" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">MacBook Pro 13-inch</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    2020 MacBook Pro in great condition. Fast performance for work and creative projects.
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span>Electronics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-500" />
                      <span>Laptops</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span>Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>$800 - $1000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Test;
