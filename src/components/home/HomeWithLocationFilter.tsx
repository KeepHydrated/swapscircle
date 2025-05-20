
import React, { useState } from 'react';
import LocationFilter from './LocationFilter';

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
    <div>
      <LocationFilter onLocationChange={handleLocationChange} />
      {children}
    </div>
  );
};

export default HomeWithLocationFilter;
