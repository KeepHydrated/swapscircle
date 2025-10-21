import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  const [hasUserLocation, setHasUserLocation] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  

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
          setHasUserLocation(true);
        } else {
          setHasUserLocation(false);
        }
      }
    };
    fetchUserLocation();
  }, []);

  const handleLocationSelect = (location: string) => {
    // Check if user is selecting a location-based option and doesn't have location set
    if (['local', '10', '20', '50'].includes(location) && !hasUserLocation) {
      toast.error('Please set your location in settings to use location-based search');
      navigate('/settings');
      setIsOpen(false);
      return;
    }
    
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
    if (selectedLocation === 'local') return 'Local';
    if (['10', '20', '50'].includes(selectedLocation)) return `${selectedLocation} miles`;
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
              onClick={() => handleLocationSelect('local')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                selectedLocation === 'local' ? 'bg-muted text-primary font-medium' : 'text-foreground'
              }`}
            >
              Local
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

            
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderLocationSelector;