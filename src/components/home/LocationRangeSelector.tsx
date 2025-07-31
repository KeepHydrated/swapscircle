import React, { useState, useRef, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { MapPin } from 'lucide-react';
interface LocationRangeSelectorProps {
  onLocationChange: (value: string) => void;
  initialValue?: string;
}
const LocationRangeSelector: React.FC<LocationRangeSelectorProps> = ({
  onLocationChange,
  initialValue = 'nationwide'
}) => {
  // State for tracking selection type, range value, and dropdown state
  const [selectionType, setSelectionType] = useState(initialValue === 'nationwide' ? 'all' : 'range');
  const [rangeValue, setRangeValue] = useState(initialValue === 'nationwide' ? 25 : parseInt(initialValue, 10));
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle range slider change
  const handleRangeChange = (value: number[]) => {
    const newValue = value[0];
    setRangeValue(newValue);
    onLocationChange(newValue.toString());
  };

  // Handle selection change
  const handleSelectionChange = (type: 'all' | 'range') => {
    setSelectionType(type);
    if (type === 'all') {
      onLocationChange('nationwide');
      setIsOpen(false);
    } else {
      onLocationChange(rangeValue.toString());
    }
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
  return <div className="mb-6 bg-card border border-border rounded-xl p-4 shadow-lg backdrop-blur-sm px-[16px] my-[8px]">
      <div className="flex items-center flex-wrap gap-3">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-primary mr-2" />
          <span className="font-medium text-foreground text-sm mr-2">Location:</span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          {/* Dropdown button */}
          <button onClick={() => setIsOpen(!isOpen)} className="bg-muted border border-border rounded-md px-3 py-1.5 w-48 text-left flex items-center justify-between text-sm text-foreground hover:bg-muted/80 transition-colors">
            <span>{selectionType === 'all' ? 'All of US' : `Within ${rangeValue} miles`}</span>
            <svg className="w-4 h-4 ml-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          {/* Dropdown menu */}
          {isOpen && <div className="absolute z-10 mt-1 w-48 bg-popover border border-border rounded-md shadow-xl">
              <ul>
                <li className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center text-foreground" onClick={() => handleSelectionChange('all')}>
                  {selectionType === 'all' && <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>}
                  <span className={`${selectionType === 'all' ? 'font-medium text-primary' : ''} text-sm`}>All of US</span>
                </li>
                <li className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center text-foreground" onClick={() => handleSelectionChange('range')}>
                  {selectionType === 'range' && <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>}
                  <span className={`${selectionType === 'range' ? 'font-medium text-primary' : ''} text-sm`}>Specific range</span>
                </li>
              </ul>
            </div>}
        </div>
        
        {/* Range slider (appears when "Specific range" is selected) */}
        {selectionType === 'range' && <div className="ml-2 flex items-center flex-1">
            <div className="w-full max-w-[200px]">
              <Slider defaultValue={[rangeValue]} min={1} max={50} step={1} onValueChange={handleRangeChange} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                <span>1</span>
                <span>25</span>
                <span>50 mi</span>
              </div>
            </div>
          </div>}
      </div>
    </div>;
};
export default LocationRangeSelector;