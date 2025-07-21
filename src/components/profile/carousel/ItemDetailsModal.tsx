
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Heart, ArrowLeft, ArrowRight, Tag, Camera, Shield, DollarSign } from "lucide-react";
import { MatchItem } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  avatar_url: string;
  username?: string;
  created_at: string;
}

interface ItemDetailsModalProps {
  item: MatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeClick: (item: MatchItem) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  currentIndex?: number;
  totalItems?: number;
  showProfileInfo?: boolean;
  preloadedUserProfile?: UserProfile; // Optional pre-loaded user profile to skip API call
  skipDataFetch?: boolean; // Skip all API calls if we already have the data
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onLikeClick,
  onNavigatePrev,
  onNavigateNext,
  currentIndex,
  totalItems,
  showProfileInfo = true,
  preloadedUserProfile,
  skipDataFetch = false,
}) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fullItem, setFullItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch complete item details and user profile from database
  useEffect(() => {
    if (!item?.id || !isOpen) return;

    const fetchItemDetails = async () => {
      // If we should skip data fetch, use the item as-is
      if (skipDataFetch) {
        setFullItem(item);
        if (preloadedUserProfile) {
          setUserProfile(preloadedUserProfile);
        }
        return;
      }

      setLoading(true);
      try {
        // Fetch complete item details
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('*')
          .eq('id', item.id)
          .single();

        if (itemError) {
          console.error('Error fetching item:', itemError);
          setFullItem(item);
        } else {
          setFullItem({
            ...itemData,
            image: itemData.image_url || item.image
          });
        }

        // Fetch user profile if not preloaded
        if (!preloadedUserProfile && itemData?.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, avatar_url, username, created_at')
            .eq('id', itemData.user_id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setUserProfile({
              name: "Unknown User",
              avatar_url: "",
              created_at: new Date().toISOString()
            });
          } else {
            setUserProfile(profileData);
          }
        } else if (preloadedUserProfile) {
          setUserProfile(preloadedUserProfile);
        }
      } catch (error) {
        console.error('Error fetching modal data:', error);
        setFullItem(item);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [item?.id, isOpen]);

  // Calculate user stats - only show if we have actual data
  const memberSince = userProfile?.created_at 
    ? new Date(userProfile.created_at).getFullYear()
    : null;

  // Handle navigation to user profile
  const handleProfileClick = () => {
    if (fullItem?.user_id) {
      onClose(); // Close the modal first
      navigate(`/other-person-profile?userId=${fullItem.user_id}`);
    }
  };

  if (!item) return null;

  // Use fullItem or fallback to item
  const displayItem = fullItem || item;

  const handleLikeClick = () => {
    onLikeClick(item);
  };

  const canNavigatePrev = onNavigatePrev && typeof currentIndex === 'number' && currentIndex > 0;
  const canNavigateNext = onNavigateNext && typeof currentIndex === 'number' && typeof totalItems === 'number' && currentIndex < totalItems - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className="max-w-4xl w-[97vw] p-0 border-0 rounded-xl bg-transparent shadow-none">
        <DialogTitle className="sr-only">Item Details</DialogTitle>
        <DialogDescription className="sr-only">View item details and information</DialogDescription>
        
        {/* Navigation buttons - positioned outside the content box */}
        {canNavigatePrev && (
          <button
            onClick={onNavigatePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors z-30"
            aria-label="Previous item"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {canNavigateNext && (
          <button
            onClick={onNavigateNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors z-30"
            aria-label="Next item"
          >
            <ArrowRight className="w-6 h-6 text-gray-700" />
          </button>
        )}

        <div className="flex w-full max-h-[92vh] h-[540px] md:h-[520px] bg-white rounded-2xl overflow-hidden relative animate-fade-in">
          {/* Image */}
          <div className="relative w-1/2 h-full flex-shrink-0 bg-black/10">
            <img
              src={displayItem.image || displayItem.image_url}
              alt={displayItem.name}
              className="object-cover w-full h-full"
            />
            
            {/* Heart and Close buttons - positioned over the image */}
            <div className="absolute top-4 right-4 flex gap-3 z-20">
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={handleLikeClick}
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label={item.liked ? "Unlike" : "Like"}
              >
                <Heart
                  className={`w-5 h-5 ${item.liked ? "text-red-500" : "text-gray-400"}`}
                  fill={item.liked ? "red" : "none"}
                />
              </button>
            </div>
          </div>
          
          {/* Details */}
          <div className="flex-1 flex flex-col px-8 py-7 justify-start overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-4">
                  {displayItem.name}
                </h2>
                
                {/* Description */}
                <p className="text-gray-700 text-base mb-6 leading-relaxed">
                  {displayItem.description || "No description provided."}
                </p>
                
                {/* Tags in 2x2 grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">{displayItem.category || "No category"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">{displayItem.tags?.[0] || "No tags"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">{displayItem.condition || "Not specified"}</span>
                  </div>
                  {(displayItem.price_range_min || displayItem.price_range_max) && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">
                        {displayItem.price_range_min && displayItem.price_range_max 
                          ? `$${displayItem.price_range_min} - $${displayItem.price_range_max}`
                          : displayItem.price_range_min 
                            ? `From $${displayItem.price_range_min}`
                            : `Up to $${displayItem.price_range_max}`
                        }
                      </span>
                    </div>
                  )}
                </div>
                
                {/* User profile info - only show if showProfileInfo is true */}
                {showProfileInfo && userProfile && (
                  <div className="flex gap-3 items-center mt-auto pt-6">
                    {userProfile.avatar_url && (
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.name || userProfile.username}
                        className="w-11 h-11 rounded-full border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleProfileClick}
                      />
                    )}
                    <div>
                      <span 
                        className="font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer"
                        onClick={handleProfileClick}
                      >
                        {userProfile.username || userProfile.name || "Unknown User"}
                      </span>
                      {memberSince && (
                        <div className="flex text-xs text-gray-500 mt-1">
                          <span>Since {memberSince}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsModal;
