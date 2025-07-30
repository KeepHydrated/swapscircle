
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
  const [isReady, setIsReady] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0); // Add currentSlide state at component level

  // Reset slide when item changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [item?.id]);

  // Immediately mark as ready when we have the item and skipDataFetch is true
  useEffect(() => {
    if (item && skipDataFetch) {
      setIsReady(true);
      setFullItem(null); // Clear any previous fullItem data
      setUserProfile(preloadedUserProfile || null);
      setLoading(false);
    } else if (item && !skipDataFetch) {
      setIsReady(false); // Will be set to true after data fetch
    }
  }, [item?.id, skipDataFetch, preloadedUserProfile]);

  // Fetch complete item details and user profile from database
  useEffect(() => {
    if (!item?.id || !isOpen) return;
    
    // Skip all data fetching if we should use existing data
    if (skipDataFetch) {
      return; // Don't do anything - states are handled in the reset effect above
    }

    const fetchItemDetails = async () => {

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
        setIsReady(true);
      }
    };

    if (!skipDataFetch) {
      fetchItemDetails();
    }
  }, [item?.id, isOpen, skipDataFetch]);

  // Calculate user stats - only show if we have actual data
  const memberSince = userProfile?.created_at 
    ? new Date(userProfile.created_at).getFullYear()
    : null;

  // Handle navigation to user profile
  const handleProfileClick = async () => {
    const userId = skipDataFetch ? (item as any)?.user_id : fullItem?.user_id;
    if (userId) {
      // Get current user ID to check if this is their own profile
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      onClose(); // Close the modal first
      
      if (currentUserId === userId) {
        // It's their own profile - navigate to regular profile page
        navigate('/profile');
      } else {
        // It's someone else's profile - navigate to other person profile
        navigate(`/other-person-profile?userId=${userId}`);
      }
    }
  };

  if (!item || !isReady) return null;

  // Use fullItem or fallback to item - but when skipDataFetch is true, always use item
  const displayItem = skipDataFetch ? item : (fullItem || item);
  
  // Ensure consistent image source to prevent flashing
  // Try multiple image property names to handle different data sources
  const imageSource = displayItem?.image_url || displayItem?.image || (displayItem as any)?.image;

  const handleLikeClick = () => {
    onLikeClick(item);
  };

  const canNavigatePrev = onNavigatePrev && typeof currentIndex === 'number' && currentIndex > 0;
  const canNavigateNext = onNavigateNext && typeof currentIndex === 'number' && typeof totalItems === 'number' && currentIndex < totalItems - 1;

  return (
    <Dialog key={item?.id} open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            {/* Get all available images */}
            {(() => {
              const imageUrls = displayItem?.image_urls || [];
              const mainImage = imageSource;
              const allImages = imageUrls.length > 0 ? imageUrls : (mainImage ? [mainImage] : []);
              
              return (
                <>
                  <img
                    src={allImages[currentSlide] || mainImage}
                    alt={displayItem.name}
                    className="object-cover w-full h-full"
                    key={`${item?.id}-${currentSlide}`}
                  />
                  
                  {/* Bottom center navigation arrows for multiple images */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                      <button
                        onClick={() =>
                          setCurrentSlide(s => (s > 0 ? s - 1 : allImages.length - 1))
                        }
                        className="w-8 h-8 bg-white/90 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
                        aria-label="Previous image"
                      >
                        <ArrowLeft className="w-4 h-4 text-gray-700" />
                      </button>
                      
                      {/* Dots indicator */}
                      <div className="flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              currentSlide === i
                                ? "bg-white"
                                : "bg-white/60"
                            }`}
                            onClick={() => setCurrentSlide(i)}
                            aria-label={`Go to image ${i + 1}`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={() =>
                          setCurrentSlide(s => (s < allImages.length - 1 ? s + 1 : 0))
                        }
                        className="w-8 h-8 bg-white/90 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
                        aria-label="Next image"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
            
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
                
                {/* Item details in 2x2 grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-gray-600">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-400 uppercase">Category</span>
                      <span className="text-sm">{displayItem.category || "No category"}</span>
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-400 uppercase">Subcategory</span>
                      <span className="text-sm">{displayItem.tags?.[0] || "No subcategory"}</span>
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-400 uppercase">Condition</span>
                      <span className="text-sm">{displayItem.condition || "Not specified"}</span>
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-400 uppercase">Price Range</span>
                      <span className="text-sm">
                        {((displayItem.price_range_min || displayItem.priceRangeMin) && (displayItem.price_range_max || displayItem.priceRangeMax))
                          ? `$${displayItem.price_range_min || displayItem.priceRangeMin} - $${displayItem.price_range_max || displayItem.priceRangeMax}`
                          : (displayItem.price_range_min || displayItem.priceRangeMin)
                            ? `From $${displayItem.price_range_min || displayItem.priceRangeMin}`
                            : (displayItem.price_range_max || displayItem.priceRangeMax)
                              ? `Up to $${displayItem.price_range_max || displayItem.priceRangeMax}`
                              : "Not specified"
                        }
                      </span>
                    </div>
                  </div>
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
