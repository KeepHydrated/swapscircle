
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import CompletedTradesTab from '@/components/profile/CompletedTradesTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import ItemCard from '@/components/items/ItemCard';
import { MatchItem } from '@/types/item';

// Import mock data
import { myCompletedTrades } from '@/data/mockMyTrades';
import { myReviews } from '@/data/mockMyReviews';

interface OtherProfileTabContentProps {
  activeTab: string;
  items: MatchItem[];
  setPopupItem: (item: MatchItem | null) => void;
  onLikeItem: (id: string) => void;
}

const OtherProfileTabContent: React.FC<OtherProfileTabContentProps> = ({ 
  activeTab, 
  items,
  setPopupItem,
  onLikeItem
}) => {
  // Handle item click to show popup
  const handleItemClick = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setPopupItem(item);
    }
  };

  // Only render the content for the active tab
  return (
    <>
      {/* Available Items Tab Content */}
      {activeTab === 'available' && (
        <div className="p-6 space-y-6">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  isMatch={true}
                  liked={item.liked}
                  onSelect={handleItemClick}
                  onLike={onLikeItem}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Completed Trades Tab Content */}
      {activeTab === 'completed' && (
        <div className="p-6">
          <CompletedTradesTab trades={myCompletedTrades} />
        </div>
      )}
      
      {/* Reviews Tab Content */}
      {activeTab === 'reviews' && (
        <div className="p-6">
          <ReviewsTab reviews={myReviews} />
        </div>
      )}
    </>
  );
};

export default OtherProfileTabContent;
