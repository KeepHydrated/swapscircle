
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
  // Helper function to determine if we should insert details after this card
  const shouldInsertDetailsAfter = (index: number) => {
    if (!selectedMatchId) return false;
    
    // Get the selected item's index
    const selectedIndex = matches.findIndex(match => match.id === selectedMatchId);
    
    // Calculate if this is the last item in its row
    const itemsPerRow = window.innerWidth >= 768 ? 3 : 2; // 3 columns on md screens, 2 on small
    return index === selectedIndex && (index % itemsPerRow === itemsPerRow - 1 || index === matches.length - 1);
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
            {selectedMatchId === match.id && (
              <div className="col-span-2 md:col-span-3">
                <Card className="overflow-hidden mt-2 mb-4">
                  <ItemDetails name={match.name} />
                </Card>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Matches;
