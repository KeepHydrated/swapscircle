
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface LocationFilterProps {
  onLocationChange: (value: string) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ onLocationChange }) => {
  const [location, setLocation] = useState('nationwide');

  const handleLocationChange = (value: string) => {
    setLocation(value);
    onLocationChange(value);
  };

  return (
    <Card className="mb-6 border-none shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5 text-primary" />
          <div className="text-sm font-medium">Location:</div>
          <Select 
            value={location} 
            onValueChange={handleLocationChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select location range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nationwide">All of US</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="10">10 miles</SelectItem>
              <SelectItem value="20">20 miles</SelectItem>
              <SelectItem value="50">50 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationFilter;
