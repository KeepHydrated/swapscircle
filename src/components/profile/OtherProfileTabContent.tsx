
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="space-y-2">
                <ItemCard
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
                {/* Mobile-only description and details */}
                <div className="md:hidden space-y-2">
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.category && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{item.category}</span>
                    )}
                    {item.tags && item.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{tag}</span>
                    ))}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    {item.condition && <span>{item.condition}</span>}
                    {item.priceRange && <span>Up to ${item.priceRange}</span>}
                  </div>
                </div>
              </div>
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
