
import React, { useState } from 'react';
import LocationRangeSelector from './LocationRangeSelector';

interface HomeWithLocationFilterProps {
  children: React.ReactNode;
}

const HomeWithLocationFilter: React.FC<HomeWithLocationFilterProps> = ({ children }) => {
  const [locationFilter, setLocationFilter] = useState('nationwide');
  
  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    console.log(`Location filter changed to: ${value}`);
    // In a real implementation, this would filter the items displayed
  };
  
  return (
    <div className="px-4 md:px-6">
      <LocationRangeSelector onLocationChange={handleLocationChange} initialValue={locationFilter} />
      {children}
    </div>
  );
};

export default HomeWithLocationFilter;
