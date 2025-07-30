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
  
  console.log('DEBUG: HeaderLocationSelector onLocationChange prop:', onLocationChange);

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
    console.log('Location changed to:', location);
    setSelectedLocation(location);
    console.log('DEBUG: onLocationChange exists?', !!onLocationChange);
    console.log('DEBUG: onLocationChange type:', typeof onLocationChange);
    if (onLocationChange) {
      console.log('DEBUG: About to call onLocationChange with:', location);
      onLocationChange(location);
      console.log('DEBUG: Called onLocationChange successfully');
    } else {
      console.log('DEBUG: onLocationChange is null/undefined');
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const getDisplayText = () => {
    if (selectedLocation === 'nationwide') return 'All of US';
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
            
            {userLocation && (
              <>
                <button
                  onClick={() => handleLocationSelect(userLocation)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                    selectedLocation === userLocation ? 'bg-muted text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  {userLocation}
                </button>
                <div className="border-t border-border my-1" />
              </>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderLocationSelector;