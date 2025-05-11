
import React from 'react';
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
  // Calculate row indices for proper item detail placement
  const getRowIndex = (index: number) => {
    const itemsPerRow = window.innerWidth >= 768 ? 3 : 2; // 3 columns on md screens, 2 on small
    return Math.floor(index / itemsPerRow);
  };

  const renderItems = () => {
    let result = [];
    let currentRow = -1;
    
    // Process all matches and inject details at appropriate positions
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const rowIndex = getRowIndex(i);
      
      // Start a new row if needed
      if (rowIndex !== currentRow) {
        currentRow = rowIndex;
      }
      
      // Add the current item card
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
      
      // If this is the selected item and we've reached the end of the row or it's the last item,
      // add the details card that spans the full width
      if (match.id === selectedMatchId && 
          (i === matches.length - 1 || getRowIndex(i + 1) !== currentRow)) {
        result.push(
          <div key={`details-${match.id}`} className="col-span-2 md:col-span-3">
            <Card className="overflow-hidden mt-2 mb-4">
              <ItemDetails name={match.name} />
            </Card>
          </div>
        );
      }
      // If this is the selected item but not at the end of a row, we need to remember to add details at row end
      else if (match.id === selectedMatchId) {
        const detailsElement = (
          <div key={`details-${match.id}`} className="col-span-2 md:col-span-3">
            <Card className="overflow-hidden mt-2 mb-4">
              <ItemDetails name={match.name} />
            </Card>
          </div>
        );
        
        // Find the last item in this row
        const itemsPerRow = window.innerWidth >= 768 ? 3 : 2;
        const endOfRowIndex = Math.min(
          matches.length - 1, 
          (currentRow + 1) * itemsPerRow - 1
        );
        
        // We'll add the details after the last item in the row
        if (i === endOfRowIndex) {
          result.push(detailsElement);
        } else {
          // Store the details to add after the row is complete
          const nextItem = matches[endOfRowIndex];
          const nextItemKey = nextItem ? nextItem.id : `row-end-${currentRow}`;
          result[result.length - 1] = (
            <React.Fragment key={`fragment-${nextItemKey}`}>
              {result[result.length - 1]}
              {i === endOfRowIndex && detailsElement}
            </React.Fragment>
          );
        }
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
        {matches.map((match, index) => (
          <React.Fragment key={match.id}>
            <ItemCard
              id={match.id}
              name={match.name}
              image={match.image}
              isMatch={true}
              liked={match.liked}
              isSelected={selectedMatchId === match.id}
              onSelect={onSelectMatch}
            />
            {selectedMatchId === match.id && 
             ((index % 3 === 2) || // For the third item in a row on md screens
              (index % 2 === 1 && window.innerWidth < 768) || // For the second item in a row on small screens
              (index === matches.length - 1)) && // For the last item 
              (
                <div className="col-span-2 md:col-span-3">
                  <Card className="overflow-hidden mt-2 mb-4">
                    <ItemDetails name={match.name} />
                  </Card>
                </div>
              )
            }
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Matches;
