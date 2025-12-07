
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ReviewsTab from '@/components/profile/ReviewsTab';
import ItemCard from '@/components/items/ItemCard';
import { MatchItem, Item } from '@/types/item';
import TradeItemSelectionModal from '@/components/trade/TradeItemSelectionModal';

interface OtherProfileTabContentProps {
  activeTab: string;
  items: MatchItem[];
  reviews: any[];
  setPopupItem: (item: MatchItem | null) => void;
  onLikeItem: (id: string) => void;
  onRejectItem: (id: string) => void;
  isFriend: boolean;
  profileUserId?: string;
}

const OtherProfileTabContent: React.FC<OtherProfileTabContentProps> = ({ 
  activeTab, 
  items,
  reviews,
  setPopupItem,
  onLikeItem,
  onRejectItem,
  isFriend,
  profileUserId
}) => {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedTradeItem, setSelectedTradeItem] = useState<Item | null>(null);

  // Handle item click to show popup
  const handleItemClick = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setPopupItem(item);
    }
  };

  // Handle trade button click
  const handleTradeClick = (e: React.MouseEvent, item: MatchItem) => {
    e.stopPropagation();
    setSelectedTradeItem({
      id: item.id,
      name: item.name,
      image: item.image,
      user_id: profileUserId || ''
    } as Item);
    setTradeModalOpen(true);
  };

  // Only render the content for the active tab
  return (
    <>
      {/* Available Items Tab Content */}
      {activeTab === 'available' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="space-y-2">
                {isFriend ? (
                  // Friends see the match buttons
                  <ItemCard
                    id={item.id}
                    name={item.name}
                    image={item.image}
                    isMatch={true}
                    liked={item.liked}
                    onSelect={handleItemClick}
                    onLike={onLikeItem}
                    onReject={(id) => onRejectItem(id)}
                    disableLike={false}
                    status={item.status}
                  />
                ) : (
                  // Non-friends see the trade button
                  <div 
                    className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Suggest Trade button */}
                      <button 
                        className="absolute top-2 right-2 w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                        onClick={(e) => handleTradeClick(e, item)}
                        title="Suggest a Trade"
                      >
                        <RefreshCw className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-foreground mb-1">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {item.priceRangeMin && item.priceRangeMax 
                            ? `$${item.priceRangeMin} - $${item.priceRangeMax}`
                            : item.priceRange 
                              ? `Up to $${item.priceRange}`
                              : 'Price not set'}
                        </p>
                        {item.condition && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {item.condition}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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

      {/* Trade Item Selection Modal */}
      <TradeItemSelectionModal
        isOpen={tradeModalOpen}
        onClose={() => {
          setTradeModalOpen(false);
          setSelectedTradeItem(null);
        }}
        targetItem={selectedTradeItem}
        targetItemOwnerId={profileUserId}
      />
    </>
  );
};

export default OtherProfileTabContent;
