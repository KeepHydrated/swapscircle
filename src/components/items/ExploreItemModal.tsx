
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, ArrowLeft, ArrowRight, Heart, Tag, Shield, DollarSign, Camera } from "lucide-react";
import { Item } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useNavigate } from "react-router-dom";

interface ExploreItemModalProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  images?: string[];
  liked?: boolean;
  onLike?: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  currentIndex?: number;
  totalItems?: number;
  hideActions?: boolean; // New prop to hide X and heart buttons
  disableActions?: boolean; // New prop to show but disable X and heart buttons
  userProfile?: UserProfile; // Optional pre-loaded user profile to skip API call
}

interface UserProfile {
  name: string;
  avatar_url: string;
  username?: string;
  created_at: string;
}

const ExploreItemModal: React.FC<ExploreItemModalProps> = ({
  open,
  item,
  onClose,
  images = [],
  liked,
  onLike,
  onNavigatePrev,
  onNavigateNext,
  currentIndex,
  totalItems,
  hideActions = false,
  disableActions = false,
  userProfile: preloadedUserProfile,
}) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fullItem, setFullItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch complete item details and user profile from database
  useEffect(() => {
    if (!item?.id || !open) {
      console.log('MODAL DEBUG: Skipping fetch - item.id:', item?.id, 'open:', open);
      return;
    }

    console.log('MODAL DEBUG: Starting fetch for item:', item);

    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        // If we have pre-loaded user profile (own items), skip API calls
        if (preloadedUserProfile && disableActions) {
          console.log('MODAL DEBUG: Using preloaded data for own item');
          console.log('MODAL DEBUG: Original item data:', item);
          console.log('MODAL DEBUG: Item image_urls before processing:', (item as any)?.image_urls);
          setFullItem({
            ...item,
            image: item.image || (item as any)?.image_url,
            image_url: item.image || (item as any)?.image_url,
            image_urls: (item as any)?.image_urls || [],
            // Ensure price range fields are available under database field names
            price_range_min: (item as any)?.price_range_min || (item as any)?.priceRangeMin,
            price_range_max: (item as any)?.price_range_max || (item as any)?.priceRangeMax
          });
          setUserProfile(preloadedUserProfile);
          setLoading(false);
          return;
        }

        // Fetch complete item details
        console.log('MODAL DEBUG: Fetching item details for ID:', item.id);
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('*')
          .eq('id', item.id)
          .single();

        console.log('MODAL DEBUG: Item data received:', itemData);
        console.log('MODAL DEBUG: Item error:', itemError);

        if (itemError) {
          console.error('Error fetching item:', itemError);
          setFullItem(item);
        } else {
          setFullItem({
            ...itemData,
            image: itemData.image_url || item.image
          });
        }

        // Fetch user profile
        const userIdToFetch = itemData?.user_id || (item as any)?.user_id;
        console.log('MODAL DEBUG: User ID to fetch:', userIdToFetch);
        console.log('MODAL DEBUG: From itemData.user_id:', itemData?.user_id);
        console.log('MODAL DEBUG: From item.user_id:', (item as any)?.user_id);
        
        if (userIdToFetch) {
          console.log('MODAL DEBUG: Fetching profile for user:', userIdToFetch);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, avatar_url, username, created_at')
            .eq('id', userIdToFetch)
            .single();

          console.log('MODAL DEBUG: Profile data received:', profileData);
          console.log('MODAL DEBUG: Profile error:', profileError);

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Use minimal fallback without hardcoded data
            setUserProfile({
              name: "Unknown User",
              avatar_url: "",
              created_at: new Date().toISOString()
            });
          } else {
            setUserProfile(profileData);
          }
        } else {
          console.log('MODAL DEBUG: No user_id found for profile fetch');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error fetching modal data:', error);
        setFullItem(item);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [item?.id, open]);

  // Handle multiple images properly
  const displayItem = fullItem || item;
  const imageUrls = displayItem?.image_urls || [];
  const mainImage = displayItem?.image || displayItem?.image_url || "";
  const allImages = imageUrls.length > 0 ? imageUrls : (mainImage ? [mainImage] : []);
  
  console.log('MODAL DEBUG: Image data - imageUrls:', imageUrls);
  console.log('MODAL DEBUG: Image data - mainImage:', mainImage);
  console.log('MODAL DEBUG: Image data - allImages:', allImages);
  console.log('MODAL DEBUG: Image data - allImagesLength:', allImages.length);
  console.log('MODAL DEBUG: Image data - displayItem.image_urls:', displayItem?.image_urls);
  console.log('MODAL DEBUG: Image data - displayItem.image:', displayItem?.image);
  console.log('MODAL DEBUG: Image data - displayItem.image_url:', displayItem?.image_url);
  console.log('MODAL DEBUG: Price range - displayItem.price_range_min:', displayItem?.price_range_min);
  console.log('MODAL DEBUG: Price range - displayItem.price_range_max:', displayItem?.price_range_max);

  const [slide, setSlide] = React.useState(0);

  React.useEffect(() => {
    setSlide(0);
  }, [item]);

  // Calculate user stats - only show if we have actual data
  const memberSince = userProfile?.created_at 
    ? new Date(userProfile.created_at).getFullYear()
    : null;

  // Handle navigation to user profile
  const handleProfileClick = async () => {
    console.log('MODAL DEBUG: handleProfileClick called');
    console.log('MODAL DEBUG: fullItem?.user_id:', fullItem?.user_id);
    
    if (fullItem?.user_id) {
      // Get current user ID to check if this is their own profile
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      console.log('MODAL DEBUG: currentUserId:', currentUserId);
      console.log('MODAL DEBUG: fullItem.user_id:', fullItem.user_id);
      console.log('MODAL DEBUG: Is own profile?', currentUserId === fullItem.user_id);
      
      onClose(); // Close the modal first
      
      if (currentUserId === fullItem.user_id) {
        // It's their own profile - navigate to regular profile page
        console.log('MODAL DEBUG: Navigating to /profile');
        // Force navigation even if already on profile page
        navigate('/profile', { replace: true });
        // Scroll to top to give navigation feel
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else {
        // It's someone else's profile - navigate to other person profile
        console.log('MODAL DEBUG: Navigating to other-person-profile');
        navigate(`/other-person-profile?userId=${fullItem.user_id}`);
      }
    } else {
      console.log('MODAL DEBUG: No user_id found, cannot navigate');
    }
  };

  // --- Hook declarations END, now return null if item missing
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent
        className="max-w-4xl w-[97vw] p-0 border-0 rounded-xl bg-transparent shadow-none"
      >
        <VisuallyHidden>
          <DialogTitle>{displayItem?.name || 'Item Details'}</DialogTitle>
          <DialogDescription>View details for this item including description and owner information</DialogDescription>
        </VisuallyHidden>
        <div className="flex w-full max-h-[92vh] h-[540px] md:h-[520px] bg-white rounded-2xl overflow-hidden relative animate-fade-in">
          
          {/* Navigation arrows positioned on sides of entire modal */}
          {(onNavigatePrev || onNavigateNext) && totalItems && totalItems > 1 && (
            <>
              {currentIndex !== undefined && currentIndex > 0 && onNavigatePrev && (
                <button
                  onClick={onNavigatePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow-lg p-3 hover:scale-105 transition z-30"
                  aria-label="Previous item"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              {currentIndex !== undefined && currentIndex < totalItems - 1 && onNavigateNext && (
                <button
                  onClick={onNavigateNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow-lg p-3 hover:scale-105 transition z-30"
                  aria-label="Next item"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </>
          )}

          {/* Carousel */}
          <div className="relative w-1/2 h-full flex-shrink-0 bg-black/10">
            {allImages.length > 0 ? (
              <img
                src={allImages[slide]}
                alt={displayItem.name}
                className="object-cover w-full h-full"
                style={{ minHeight: 320 }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400 text-lg">
                No image uploaded.
              </div>
            )}
            {/* Bottom navigation with arrows and dots for multiple images */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                <button
                  onClick={() =>
                    setSlide(s => (s > 0 ? s - 1 : allImages.length - 1))
                  }
                  className="bg-white bg-opacity-90 rounded-full shadow p-2 hover:scale-105 transition"
                  aria-label="Previous"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        slide === i
                          ? "bg-white"
                          : "bg-white/60"
                      }`}
                      onClick={() => setSlide(i)}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() =>
                    setSlide(s => (s < allImages.length - 1 ? s + 1 : 0))
                  }
                  className="bg-white bg-opacity-90 rounded-full shadow p-2 hover:scale-105 transition"
                  aria-label="Next"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* Top-right buttons positioned over the image */}
            {!hideActions && (
              <div className="absolute top-4 right-4 flex gap-3 z-20">
                <button
                  onClick={disableActions ? undefined : onClose}
                  className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
                    disableActions 
                      ? 'cursor-not-allowed' 
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  aria-label="Close"
                  disabled={disableActions}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
                    disableActions 
                      ? 'cursor-not-allowed' 
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={disableActions ? undefined : onLike}
                  aria-label={liked ? "Unlike" : "Like"}
                  disabled={disableActions}
                >
                  <Heart
                    className={`w-5 h-5 ${liked ? "text-red-500" : "text-gray-400"}`}
                    fill={liked ? "red" : "none"}
                  />
                </button>
              </div>
            )}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
                        {displayItem.price_range_min && displayItem.price_range_max 
                          ? `$${displayItem.price_range_min} - $${displayItem.price_range_max}`
                          : displayItem.price_range_min 
                            ? `From $${displayItem.price_range_min}`
                            : displayItem.price_range_max
                              ? `Up to $${displayItem.price_range_max}`
                              : "Not specified"
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* User profile info */}
                {userProfile && (
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

export default ExploreItemModal;
