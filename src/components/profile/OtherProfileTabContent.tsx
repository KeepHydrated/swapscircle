
import React from 'react';


import ReviewsTab from '@/components/profile/ReviewsTab';
import ItemCard from '@/components/items/ItemCard';
import { MatchItem } from '@/types/item';

interface OtherProfileTabContentProps {
  activeTab: string;
  items: MatchItem[];
  reviews: any[];
  setPopupItem: (item: MatchItem | null) => void;
  onLikeItem: (id: string) => void;
  onRejectItem: (id: string) => void;
  isFriend: boolean;
}

const OtherProfileTabContent: React.FC<OtherProfileTabContentProps> = ({ 
  activeTab, 
  items,
  reviews,
  setPopupItem,
  onLikeItem,
  onRejectItem,
  isFriend
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
          {!isFriend && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">You must be friends to like items from this profile</p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                onReject={(id) => onRejectItem(id)}
                disableLike={!isFriend}
                status={item.status}
              />
            ))}
          </div>
        </div>
      )}

      
      {/* Reviews Tab Content */}
      {activeTab === 'reviews' && (
        <div className="p-6">
          <ReviewsTab reviews={reviews} />
        </div>
      )}
    </>
  );
};

export default OtherProfileTabContent;
