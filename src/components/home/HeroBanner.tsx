import React from 'react';

const HeroBanner = () => {
  return (
    <div className="w-full bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-6 p-6 md:p-8">
        {/* Left side - Text */}
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
            Skip Shopping — Trade With Friends, Your Local Community, Or People Across The US
          </h1>
        </div>
        
        {/* Right side - Image */}
        <div className="hidden md:block w-64 h-48 flex-shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
            alt="Trading community"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
