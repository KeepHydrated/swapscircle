
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
  return (
    <div className="lg:w-1/2">
      <h2 className="text-2xl font-bold mb-4">
        Matches for {selectedItemName || 'Selected Item'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {matches.map((match) => (
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
        ))}
      </div>

      {/* Item Details for selected match */}
      {selectedMatchId && (
        <div className="mt-4">
          <Card className="overflow-hidden">
            <ItemDetails name={matches.find(match => match.id === selectedMatchId)?.name || ""} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Matches;
