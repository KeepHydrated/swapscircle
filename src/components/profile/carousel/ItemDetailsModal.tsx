import React, { useEffect, useState } from 'react';
import { X, Heart, ArrowLeft, ArrowRight, Tag, Camera, Shield, DollarSign, Repeat } from "lucide-react";
import { MatchItem } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from "react-router-dom";
import MatchActionSelector from "@/components/items/matches/MatchActionSelector";

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
  onLikeAll?: (id: string) => void;
  onRejectAll?: (id: string) => void;
  onReport?: (id: string) => void;
  transitionClassName?: string;
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
  onLikeAll,
  onRejectAll,
  onReport,
  transitionClassName,
}) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fullItem, setFullItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [tradesCompleted, setTradesCompleted] = useState<number>(0);

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

          // Fetch user reviews to calculate rating
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', itemData.user_id);

          if (!reviewsError && reviewsData && reviewsData.length > 0) {
            const averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
            setUserRating(Math.round(averageRating * 10) / 10);
          } else {
            setUserRating(0);
          }
        } else if (preloadedUserProfile) {
          setUserProfile(preloadedUserProfile);
          setUserRating(0); // Default when using preloaded profile without reviews
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
  
  // Add refresh functionality for when reviews are updated
  const refreshUserRating = async () => {
    const userId = skipDataFetch ? (item as any)?.user_id : fullItem?.user_id;
    if (userId) {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', userId);

      if (!reviewsError && reviewsData && reviewsData.length > 0) {
        const averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
        setUserRating(Math.round(averageRating * 10) / 10);
      } else {
        setUserRating(0);
      }
    }
  };
  
  const refreshTradesCount = async () => {
    const userId = skipDataFetch ? (item as any)?.user_id : fullItem?.user_id;
    if (userId) {
      const { data: tradesData, error: tradesError } = await supabase
        .from('trade_conversations')
        .select('id')
        .eq('status', 'completed')
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`);
      if (!tradesError && tradesData) {
        setTradesCompleted(tradesData.length);
      } else {
        setTradesCompleted(0);
      }
    } else {
      setTradesCompleted(0);
    }
  };
  
  // Listen for when modal opens to refresh rating and trades
  useEffect(() => {
    if (isOpen && (fullItem || item)) {
      refreshUserRating();
      refreshTradesCount();
    }
  }, [isOpen]);

  // Calculate user stats - only show if we have actual data
  const memberSince = userProfile?.created_at 
    ? new Date(userProfile.created_at).getFullYear()
    : null;

  // Handle navigation to user profile
  const handleProfileClick = async () => {
    console.log('ITEM DETAILS MODAL DEBUG: handleProfileClick called');
    const userId = skipDataFetch ? (item as any)?.user_id : fullItem?.user_id;
    console.log('ITEM DETAILS MODAL DEBUG: userId:', userId);
    console.log('ITEM DETAILS MODAL DEBUG: skipDataFetch:', skipDataFetch);
    console.log('ITEM DETAILS MODAL DEBUG: item user_id:', (item as any)?.user_id);
    console.log('ITEM DETAILS MODAL DEBUG: fullItem user_id:', fullItem?.user_id);
    
    if (userId) {
      // Get current user ID to check if this is their own profile
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      console.log('ITEM DETAILS MODAL DEBUG: currentUserId:', currentUserId);
      console.log('ITEM DETAILS MODAL DEBUG: userId:', userId);
      console.log('ITEM DETAILS MODAL DEBUG: Is own profile?', currentUserId === userId);
      
      onClose(); // Close the modal first
      
      if (currentUserId === userId) {
        // It's their own profile - navigate to regular profile page
        console.log('ITEM DETAILS MODAL DEBUG: Navigating to /profile');
        // Force navigation even if already on profile page
        navigate('/profile', { replace: true });
        // Scroll to top to give navigation feel
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else {
        // It's someone else's profile - navigate to other person profile
        console.log('ITEM DETAILS MODAL DEBUG: Navigating to other-person-profile');
        navigate(`/other-person-profile?userId=${userId}`);
      }
    } else {
      console.log('ITEM DETAILS MODAL DEBUG: No userId found, cannot navigate');
    }
  };

  if (!item || !isReady || !isOpen) return null;

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
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col pt-16">
      {/* Close button - positioned in top right corner */}
      <button
        onClick={onClose}
        className="absolute top-20 right-4 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full shadow-md flex items-center justify-center transition-colors z-50"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <div className={`flex flex-col w-full h-full bg-white overflow-hidden relative ${transitionClassName || 'animate-fade-in'}`}>
        {/* Image Row */}
        <div className="relative w-full h-1/2 flex-shrink-0 bg-black/10 overflow-auto">
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
                  className="w-full h-auto min-h-full object-contain"
                  key={`${item?.id}-${currentSlide}`}
                />
                
                {/* Bottom center navigation arrows for multiple images */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
                    <button
                      onClick={() =>
                        setCurrentSlide(s => (s > 0 ? s - 1 : allImages.length - 1))
                      }
                      className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                      aria-label="Previous image"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    
                    {/* Dots indicator */}
                    <div className="flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                            currentSlide === i
                              ? "bg-white shadow-sm scale-110"
                              : "bg-white/70 hover:bg-white/90"
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
                      className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                      aria-label="Next image"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-800" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
          
          {/* 3 dots menu - positioned on the left */}
          {(onLikeAll || onRejectAll || onReport) && item?.id && (
            <div className="absolute top-4 left-4 z-20">
              <MatchActionSelector
                itemId={item.id}
                onLikeAll={onLikeAll || (() => {})}
                onRejectAll={onRejectAll || (() => {})}
                onReport={onReport || (() => {})}
                compact={false}
              />
            </div>
          )}
          
          {/* Heart button - positioned over the image */}
          <div className="absolute top-4 right-20 flex gap-3 z-20">
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
        
        {/* Details Row */}
        <div className="flex-1 flex flex-col px-8 py-7 justify-start overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Item details without thumbnail */}
              <div className="mb-8">
                {/* Title and Description */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {displayItem.name}
                  </h2>
                  <p className="text-gray-700 text-base leading-relaxed mb-4">
                    {displayItem.description || "No description provided."}
                  </p>
                  
                  {/* Item Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-medium text-gray-900">{displayItem.category || "Electronics"}</div>
                    <div className="font-medium text-gray-900">{displayItem.tags?.[0] || "Cameras"}</div>
                    <div className="font-medium text-gray-900">{displayItem.condition || "Brand New"}</div>
                    <div className="font-medium text-gray-900">
                      {((displayItem.price_range_min || displayItem.priceRangeMin) && (displayItem.price_range_max || displayItem.priceRangeMax))
                        ? `$${displayItem.price_range_min || displayItem.priceRangeMin} - $${displayItem.price_range_max || displayItem.priceRangeMax}`
                        : (displayItem.price_range_min || displayItem.priceRangeMin)
                          ? `From $${displayItem.price_range_min || displayItem.priceRangeMin}`
                          : (displayItem.price_range_max || displayItem.priceRangeMax)
                            ? `Up to $${displayItem.price_range_max || displayItem.priceRangeMax}`
                            : "Up to $50"
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              {/* User profile info - only show if showProfileInfo is true */}
              {showProfileInfo && userProfile && (
                <div className="flex gap-3 items-center mt-auto pt-6 border-t border-gray-200 bg-gray-50 p-4 -mx-8 -mb-7">
                  <div className="w-11 h-11 rounded-full border cursor-pointer hover:opacity-80 transition-opacity overflow-hidden" onClick={handleProfileClick}>
                    {userProfile.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {userProfile.name?.substring(0, 1).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1" onClick={handleProfileClick}>
                    <div className="flex items-center gap-2 mb-1 cursor-pointer hover:underline">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {userProfile.username || userProfile.name}
                      </h3>
                      {userRating > 0 && (
                        <>
                          <span className="text-yellow-500 text-xs">★</span>
                          <span className="text-gray-600 text-xs">{userRating.toFixed(1)}</span>
                        </>
                      )}
                      {userRating === 0 && (
                        <>
                          <span className="text-gray-400 text-xs">★</span>
                          <span className="text-gray-500 text-xs">No reviews</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {memberSince && (
                        <div>Since {memberSince}</div>
                      )}
                      {tradesCompleted >= 0 && (
                        <div className="flex items-center gap-1">
                          <span>🔄</span>
                          <span>{tradesCompleted} trade{tradesCompleted !== 1 ? 's' : ''} completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;