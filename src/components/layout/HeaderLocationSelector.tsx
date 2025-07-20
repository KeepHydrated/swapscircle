import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectionType, setSelectionType] = useState(initialValue === 'nationwide' ? 'all' : 'range');
  const [rangeValue, setRangeValue] = useState(initialValue === 'nationwide' ? 25 : parseInt(initialValue, 10));
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelectionChange = (type: 'all' | 'range', value?: number) => {
    setSelectionType(type);
    if (type === 'all') {
      onLocationChange?.('nationwide');
    } else if (value) {
      setRangeValue(value);
      onLocationChange?.(value.toString());
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

  const ranges = [5, 10, 25, 50];

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors"
      >
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground">
          {selectionType === 'all' ? 'All of US' : `${rangeValue}mi`}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => handleSelectionChange('all')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                selectionType === 'all' ? 'bg-muted text-primary font-medium' : 'text-foreground'
              }`}
            >
              All of US
            </button>
            
            <div className="border-t border-border my-1" />
            
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => handleSelectionChange('range', range)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                  selectionType === 'range' && rangeValue === range ? 'bg-muted text-primary font-medium' : 'text-foreground'
                }`}
              >
                Within {range} miles
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderLocationSelector;