import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface HeaderLocationSelectorProps {
  onLocationChange?: (value: string) => void;
  initialValue?: string;
  className?: string;
}

const HeaderLocationSelector: React.FC<HeaderLocationSelectorProps> = ({
  onLocationChange,
  initialValue = 'nationwide',
  className
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  

  // Fetch user's saved location
  useEffect(() => {
    const fetchUserLocation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('location')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.location) {
          setUserLocation(profile.location);
        }
      }
    };
    fetchUserLocation();
  }, []);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    if (onLocationChange) {
      onLocationChange(location);
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);


  const getDisplayText = () => {
    if (selectedLocation === 'nationwide') return 'All of US';
    if (['5', '10', '20', '50'].includes(selectedLocation)) return `${selectedLocation} miles`;
    return selectedLocation;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors"
      >
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground">
          {getDisplayText()}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="py-1">
            <button
              onClick={() => handleLocationSelect('nationwide')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                selectedLocation === 'nationwide' ? 'bg-muted text-primary font-medium' : 'text-foreground'
              }`}
            >
              All of US
            </button>
            
            <div className="border-t border-border my-1" />
            
            <button
              onClick={() => handleLocationSelect('5')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                selectedLocation === '5' ? 'bg-muted text-primary font-medium' : 'text-foreground'
              }`}
            >
              5 miles
            </button>
            
            <button
              onClick={() => handleLocationSelect('10')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                selectedLocation === '10' ? 'bg-muted text-primary font-medium' : 'text-foreground'
              }`}
            >
              10 miles
            </button>
            
            <button
              onClick={() => handleLocationSelect('20')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                selectedLocation === '20' ? 'bg-muted text-primary font-medium' : 'text-foreground'
              }`}
            >
              20 miles
            </button>
            
            <button
              onClick={() => handleLocationSelect('50')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                selectedLocation === '50' ? 'bg-muted text-primary font-medium' : 'text-foreground'
              }`}
            >
              50 miles
            </button>

            {userLocation && (
              <>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => handleLocationSelect(userLocation)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                    selectedLocation === userLocation ? 'bg-muted text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  {userLocation}
                </button>
              </>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderLocationSelector;