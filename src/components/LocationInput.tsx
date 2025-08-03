import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationInputProps {
  onLocationChange?: (location: string) => void;
  placeholder?: string;
  label?: string;
  value?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  onLocationChange,
  placeholder = "Enter location...",
  label = "Location",
  value = ""
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="location-input">{label}</Label>
      <Input
        id="location-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onLocationChange?.(e.target.value)}
      />
    </div>
  );
};

export default LocationInput;