import React, { useState, useEffect } from 'react';
import ItemCard from './ItemCard';
import ItemDetails from '@/components/messages/details/ItemDetails';
import { Card } from '@/components/ui/card';

interface MatchItem {
  id: string;
  name: string;
  image: string;
  liked?: boolean;
  category?: string;
}

interface MatchesProps {
  matches: MatchItem[];
  selectedItemName: string;
  selectedMatchId: string | null;
  onSelectMatch: (id: string) => void;
}

const Matches: React.FC<MatchesProps> = ({ 
  matches, 
  selectedItemName, 
  selectedMatchId, 
  onSelectMatch 
}) => {
  // State to keep track of viewport size
  const [itemsPerRow, setItemsPerRow] = useState(3);
  
  // Update itemsPerRow based on window size
  useEffect(() => {
    const handleResize = () => {
      setItemsPerRow(window.innerWidth >= 768 ? 3 : 2);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate the row index for an item
  const getRowIndex = (index: number) => {
    return Math.floor(index / itemsPerRow);
  };

  // Find the index of the selected match
  const selectedIndex = selectedMatchId 
    ? matches.findIndex(match => match.id === selectedMatchId) 
    : -1;
  
  // Calculate which row has the selected item
  const selectedRowIndex = selectedIndex !== -1 
    ? getRowIndex(selectedIndex) 
    : -1;

  // Render function to create the grid with details injected after the selected row
  const renderGrid = () => {
    let result = [];
    let currentRow = -1;
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const rowIndex = getRowIndex(i);
      
      // Check if we're starting a new row
      if (rowIndex !== currentRow) {
        currentRow = rowIndex;
      }
      
      // Add the current item
      result.push(
        <ItemCard
          key={match.id}
          id={match.id}
          name={match.name}
          image={match.image}
          isMatch={true}
          liked={match.liked}
          isSelected={selectedMatchId === match.id}
          onSelect={onSelectMatch}
        />
      );
      
      // If this is the last item in a row AND it's the selected row, add details
      if (selectedRowIndex === rowIndex && 
          ((i + 1) % itemsPerRow === 0 || i === matches.length - 1)) {
        // Add details component spanning the full width
        result.push(
          <div key={`details-${selectedMatchId}`} className="col-span-2 md:col-span-3">
            <Card className="overflow-hidden mt-2 mb-4">
              <ItemDetails name={matches[selectedIndex]?.name || ''} />
            </Card>
          </div>
        );
      }
    }
    
    return result;
  };

  return (
    <div className="lg:w-1/2">
      <h2 className="text-2xl font-bold mb-4">
        Matches for {selectedItemName || 'Selected Item'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {renderGrid()}
      </div>
    </div>
  );
};

export default Matches;
