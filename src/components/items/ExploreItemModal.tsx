
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, ArrowLeft, ArrowRight, Heart, Tag, Shield, DollarSign, Camera, Repeat, MoreVertical, Check, ExternalLink, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { rejectItem } from "@/services/rejectionService";
import { Item } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useNavigate } from "react-router-dom";
import TradeItemSelectionModal from "@/components/trade/TradeItemSelectionModal";
import { toast } from "@/hooks/use-toast";

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
  onLikeAll?: (id: string) => void;
  onRejectAll?: (id: string) => void;
  onReport?: (id: string) => void;
  matchedItemImage?: string; // Image of user's matched item to display
  matchedItemId?: string; // ID of user's matched item to pre-select in trade modal
  onHideItem?: (id: string) => void; // Callback when user hides an item
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
  onLikeAll,
  onRejectAll,
  onReport,
  matchedItemImage,
  matchedItemId,
  onHideItem,
}) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fullItem, setFullItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [tradesCompleted, setTradesCompleted] = useState<number>(0);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [isLiked, setIsLiked] = useState(liked ?? false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [creatingTrade, setCreatingTrade] = useState(false);

  // Sync isLiked with liked prop from parent
  useEffect(() => {
    if (liked !== undefined) {
      setIsLiked(liked);
    }
  }, [liked]);

  // Fetch current user and liked status (only if liked prop not provided)
  useEffect(() => {
    const fetchLikedStatus = async () => {
      if (!item?.id || !open) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCurrentUserId(null);
        setIsLiked(false);
        return;
      }
      
      setCurrentUserId(user.id);

      // Only fetch from DB if liked prop is not provided
      if (liked === undefined) {
        const { data: likedData } = await supabase
          .from('liked_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', item.id)
          .maybeSingle();

        setIsLiked(!!likedData);
      }
    };

    fetchLikedStatus();
  }, [item?.id, open, liked]);

  // Handle like/unlike
  const handleLikeClick = async () => {
    if (!item?.id || !currentUserId) {
      navigate('/auth');
      return;
    }

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from('liked_items')
        .delete()
        .eq('user_id', currentUserId)
        .eq('item_id', item.id);

      if (!error) {
        setIsLiked(false);
        if (onLike) onLike(); // Notify parent if callback exists
      }
    } else {
      // Like
      const { error } = await supabase
        .from('liked_items')
        .insert({ user_id: currentUserId, item_id: item.id });

      if (!error) {
        setIsLiked(true);
        if (onLike) onLike(); // Notify parent if callback exists
      }
    }
  };

  // Handle direct trade with matched item
  const handleQuickTrade = async () => {
    if (!matchedItemId || !fullItem?.user_id || creatingTrade) return;
    
    // Check if this is a demo/mock item (non-UUID IDs)
    const isMockItem = 
      (fullItem.id && (fullItem.id.startsWith('local-match-') || fullItem.id.startsWith('demo-'))) ||
      (fullItem.user_id && fullItem.user_id.startsWith('demo-')) ||
      (matchedItemId && (matchedItemId.startsWith('my-local-') || matchedItemId.startsWith('demo-')));
    
    if (isMockItem) {
      // Use demo trade flow for mock items
      onClose();
      navigate('/messages', { 
        state: { 
          demoTrade: true,
          theirItem: {
            id: fullItem.id || item?.id,
            name: fullItem.name || item?.name,
            image: fullItem.image_url || fullItem.image || item?.image,
            category: fullItem.category || item?.category,
            condition: fullItem.condition || item?.condition,
            price_range_min: fullItem.price_range_min,
            price_range_max: fullItem.price_range_max,
          },
          myItem: {
            id: matchedItemId,
            name: (fullItem as any)?.myItemName || 'Your Item',
            image: (fullItem as any)?.myItemImage || '',
          },
          partnerProfile: {
            username: 'Demo User',
            avatar_url: '',
          }
        }
      });
      return;
    }
    
    setCreatingTrade(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        navigate('/auth');
        onClose();
        return;
      }

      // Create trade conversation directly with the matched item
      const { data: tradeConversation, error: tradeError } = await supabase
        .from('trade_conversations')
        .insert({
          requester_id: session.session.user.id,
          owner_id: fullItem.user_id,
          requester_item_id: matchedItemId,
          requester_item_ids: [matchedItemId],
          owner_item_id: fullItem.id || item?.id,
          status: 'pending'
        })
        .select('*')
        .single();

      if (tradeError) {
        console.error('Error creating trade conversation:', tradeError);
        toast({
          title: "Error",
          description: "Failed to create trade request.",
        });
        return;
      }

      // Create initial message
      const targetItemName = fullItem?.name || item?.name || 'your item';
      const messageContent = `Hi! I'm interested in trading for your ${targetItemName}. Let me know if you're interested!`;

      await supabase
        .from('trade_messages')
        .insert({
          conversation_id: tradeConversation.id,
          sender_id: session.session.user.id,
          message: messageContent
        });

      toast({
        title: "Trade suggestion sent!",
        description: "Your trade suggestion has been sent successfully.",
      });

      onClose();
      navigate(`/messages?conversation=${tradeConversation.id}`);

    } catch (error) {
      console.error('Error creating trade:', error);
      toast({
        title: "Error",
        description: "Failed to create trade request.",
      });
    } finally {
      setCreatingTrade(false);
    }
  };
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
          
          // Get current user ID for own items
          const { data: { user } } = await supabase.auth.getUser();
          const currentUserId = user?.id;
          
          setFullItem({
            ...item,
            user_id: currentUserId, // Add the user_id for own items
            image: item.image || (item as any)?.image_url,
            image_url: item.image || (item as any)?.image_url,
            image_urls: (item as any)?.image_urls || [],
            // Ensure price range fields are available under database field names
            price_range_min: (item as any)?.price_range_min || (item as any)?.priceRangeMin,
            price_range_max: (item as any)?.price_range_max || (item as any)?.priceRangeMax
          });
          setUserProfile(preloadedUserProfile);
          // For preloaded profiles (own items), fetch reviews to calculate rating
          if (currentUserId) {
            const { data: reviewsData, error: reviewsError } = await supabase
              .from('reviews')
              .select('rating')
              .eq('reviewee_id', currentUserId);

            if (!reviewsError && reviewsData && reviewsData.length > 0) {
              const averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
              setUserRating(Math.round(averageRating * 10) / 10);
            } else {
              setUserRating(0);
            }

            // Fetch completed trades count for current user
            console.log('MODAL DEBUG: Fetching trades for current user:', currentUserId);
            const { data: tradesData, error: tradesError } = await supabase
              .from('trade_conversations')
              .select('id')
              .eq('status', 'completed')
              .or(`requester_id.eq.${currentUserId},owner_id.eq.${currentUserId}`);

            console.log('MODAL DEBUG: Own trades data:', tradesData);
            console.log('MODAL DEBUG: Own trades error:', tradesError);

            if (!tradesError && tradesData) {
              console.log('MODAL DEBUG: Setting own trades completed to:', tradesData.length);
              setTradesCompleted(tradesData.length);
            } else {
              console.log('MODAL DEBUG: Setting own trades completed to 0');
              setTradesCompleted(0);
            }
          }
          setLoading(false);
          return;
        }

        // Fetch complete item details
        console.log('MODAL DEBUG: Fetching item details for ID:', item.id);
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('*')
          .eq('id', item.id)
          .maybeSingle();

        console.log('MODAL DEBUG: Item data received:', itemData);
        console.log('MODAL DEBUG: Item error:', itemError);

        if (itemError || !itemData) {
          console.error('Error fetching item or item not found:', itemError);
          // For mock items not in DB, use the item directly with its user_id
          setFullItem({
            ...item,
            user_id: (item as any)?.user_id,
            image: item.image || (item as any)?.image_url,
            price_range_min: (item as any)?.price_range_min || (item as any)?.priceRangeMin,
            price_range_max: (item as any)?.price_range_max || (item as any)?.priceRangeMax
          });
        } else {
          setFullItem({
            ...itemData,
            image: itemData.image_url || item.image
          });
        }

        // Fetch user profile - check multiple sources for user_id
        const userIdToFetch = itemData?.user_id || (item as any)?.user_id;
        console.log('MODAL DEBUG: User ID to fetch:', userIdToFetch);
        console.log('MODAL DEBUG: From itemData.user_id:', itemData?.user_id);
        console.log('MODAL DEBUG: From item.user_id:', (item as any)?.user_id);
        
        // If we have a user_id, try to fetch profile
        
        if (userIdToFetch) {
          console.log('MODAL DEBUG: Fetching profile for user:', userIdToFetch);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, avatar_url, username, created_at')
            .eq('id', userIdToFetch)
            .maybeSingle();

          console.log('MODAL DEBUG: Profile data received:', profileData);
          console.log('MODAL DEBUG: Profile error:', profileError);
          console.log('MODAL DEBUG: userIdToFetch was:', userIdToFetch);

          if (profileError || !profileData) {
            console.error('Error fetching user profile:', profileError);
            console.log('MODAL DEBUG: No profile data, creating fallback for user:', userIdToFetch);
            // Create a better fallback profile using the user_id
            setUserProfile({
              name: "User", // Generic fallback name
              username: userIdToFetch.substring(0, 8), // Use first 8 chars of user ID as username
              avatar_url: "",
              created_at: new Date().toISOString()
            });
            setUserRating(0);
          } else {
            console.log('MODAL DEBUG: Setting profile data:', profileData);
            setUserProfile(profileData);
          }

          // Fetch user reviews to calculate rating
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', userIdToFetch);

          if (!reviewsError && reviewsData && reviewsData.length > 0) {
            const averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
            setUserRating(Math.round(averageRating * 10) / 10);
          } else {
            setUserRating(0);
          }

          // Fetch completed trades count
          console.log('MODAL DEBUG: Fetching trades for user:', userIdToFetch);
          const { data: tradesData, error: tradesError } = await supabase
            .from('trade_conversations')
            .select('id')
            .eq('status', 'completed')
            .or(`requester_id.eq.${userIdToFetch},owner_id.eq.${userIdToFetch}`);

          console.log('MODAL DEBUG: Trades data:', tradesData);
          console.log('MODAL DEBUG: Trades error:', tradesError);
          
          if (!tradesError && tradesData) {
            console.log('MODAL DEBUG: Setting trades completed to:', tradesData.length);
            setTradesCompleted(tradesData.length);
          } else {
            console.log('MODAL DEBUG: Setting trades completed to 0');
            setTradesCompleted(0);
          }
        } else {
          console.log('MODAL DEBUG: No user_id found for profile fetch');
          setUserProfile(null);
          setUserRating(0);
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent
        className="max-w-4xl w-full md:w-[97vw] h-full md:h-auto p-0 border-0 rounded-none md:rounded-xl bg-transparent shadow-none top-0 translate-y-0 md:top-[50%] md:translate-y-[-50%]"
        onPointerDownOutside={(e) => {
          // Only allow closing when clicking the dark overlay, not during scrolling
          const target = e.target as HTMLElement;
          if (target.closest('.overflow-x-auto, .overflow-y-auto, [data-radix-dialog-content]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing when interacting with scrollable content
          const target = e.target as HTMLElement;
          if (target.closest('.overflow-x-auto, .overflow-y-auto')) {
            e.preventDefault();
          }
        }}
      >
        <VisuallyHidden>
          <DialogTitle>{displayItem?.name || 'Item Details'}</DialogTitle>
          <DialogDescription>View details for this item including description and owner information</DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col md:flex-row w-full h-full md:h-[520px] overflow-y-auto md:overflow-hidden bg-white rounded-none md:rounded-2xl relative touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          
          {/* Navigation arrows positioned outside the modal on dark overlay */}
          {(onNavigatePrev || onNavigateNext) && totalItems && totalItems > 1 && (
            <>
              {currentIndex !== undefined && currentIndex > 0 && onNavigatePrev && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigatePrev();
                  }}
                  className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-3 hover:scale-110 transition z-[60]"
                  aria-label="Previous item"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              )}
              {currentIndex !== undefined && currentIndex < totalItems - 1 && onNavigateNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateNext();
                  }}
                  className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-3 hover:scale-110 transition z-[60]"
                  aria-label="Next item"
                >
                  <ArrowRight className="w-6 h-6 text-gray-700" />
                </button>
              )}
            </>
          )}

          {/* Carousel */}
          <div className="relative w-full md:w-1/2 h-[280px] md:h-full flex-shrink-0 bg-black/10">
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

            {/* Matched item thumbnail */}
            {matchedItemImage && (
              <div className="absolute top-4 left-4 z-20">
                <div className="w-14 h-14 rounded-full border-2 border-white shadow-lg overflow-hidden bg-background">
                  <img src={matchedItemImage} alt="Your matched item" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Top-right buttons positioned over the image */}
            {!hideActions && (
              <div className="absolute top-4 right-4 flex gap-3 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center transition-colors hover:bg-gray-50 cursor-pointer"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background z-50">
                    <DropdownMenuItem
                      onClick={() => {
                        // Check if this is a valid UUID (real item) or a demo item
                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                        const isValidUUID = uuidRegex.test(item.id);
                        
                        if (!isValidUUID) {
                          toast({
                            title: "Demo item",
                            description: "This is a demo item and doesn't have a detail page.",
                          });
                          return;
                        }
                        
                        // Save modal state to sessionStorage so we can restore it on back navigation
                        sessionStorage.setItem('returnToModal', JSON.stringify({
                          itemId: item.id,
                          returnUrl: window.location.pathname + window.location.search
                        }));
                        navigate(`/item/${item.id}`);
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go to item page
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        if (item?.id) {
                          await rejectItem(item.id);
                          onHideItem?.(item.id);
                          onClose();
                          toast({
                            title: "Item hidden",
                            description: "You won't see this item again.",
                          });
                        }
                      }}
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Don't show this item again
                    </DropdownMenuItem>
                    {/* Trade for another item - only show when it's a match */}
                    {matchedItemId && (
                      <DropdownMenuItem onClick={() => setShowTradeModal(true)}>
                        <Repeat className="w-4 h-4 mr-2" />
                        Trade for another item
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Quick Accept button - only show if there's a matched item */}
                {!disableActions && fullItem?.user_id && matchedItemId && (
                  <button
                    onClick={handleQuickTrade}
                    disabled={creatingTrade}
                    className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
                      creatingTrade ? 'cursor-wait opacity-70' : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                    aria-label="Suggest trade with matched item"
                    title="Suggest trade with matched item"
                  >
                    <Check className="w-5 h-5 text-green-500" />
                  </button>
                )}
                {/* Suggest Trade button - only show if not own item AND not a match */}
                {!disableActions && fullItem?.user_id && !matchedItemId && (
                  <button
                    onClick={() => setShowTradeModal(true)}
                    className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center transition-colors hover:bg-gray-50 cursor-pointer"
                    aria-label="Suggest a Trade"
                    title="Suggest a Trade"
                  >
                    <Repeat className="w-5 h-5 text-green-500" />
                  </button>
                )}
                <button
                  className={`w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
                    disableActions 
                      ? 'cursor-not-allowed' 
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={disableActions ? undefined : handleLikeClick}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  disabled={disableActions}
                >
                  <Heart
                    className="w-5 h-5 text-red-500"
                    fill={isLiked ? "red" : "none"}
                  />
                </button>
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="flex-1 flex flex-col px-4 pt-6 pb-6 md:px-8 md:py-7 justify-start md:overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {/* Item details without thumbnail */}
                <div className="mb-4">
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
                      <div className="font-medium text-gray-900">{displayItem.tags?.[0]?.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "Cameras"}</div>
                      <div className="font-medium text-gray-900">{displayItem.condition || "Brand New"}</div>
                      <div className="font-medium text-gray-900">
                        {displayItem.price_range_min && displayItem.price_range_max
                          ? `$${displayItem.price_range_min} - $${displayItem.price_range_max}`
                          : displayItem.price_range_min
                            ? `From $${displayItem.price_range_min}`
                            : displayItem.price_range_max
                              ? `Up to $${displayItem.price_range_max}`
                              : "Up to $50"
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                
                {/* User profile info */}
                {console.log('MODAL DEBUG: About to render profile section, userProfile:', userProfile, 'loading:', loading)}
                {console.log('MODAL DEBUG: userProfile exists?', !!userProfile, 'loading:', loading)}
                {userProfile && !loading ? (
                  <div className="flex gap-3 items-center mt-auto pt-6 border-t border-gray-200 bg-gray-50 p-4 -mx-4 md:-mx-8 md:-mb-7">
                    <div
                      className="w-11 h-11 rounded-full border cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                      onClick={handleProfileClick}
                    >
                      {userProfile.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt={userProfile.name || userProfile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center">
                          {(userProfile.name || userProfile.username || "U").substring(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer"
                          onClick={handleProfileClick}
                        >
                          {userProfile.username || userProfile.name || "Unknown User"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600">
                            {userRating > 0 ? userRating.toFixed(1) : "No reviews"}
                          </span>
                        </div>
                      </div>
                      {memberSince && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>Since {memberSince}</span>
                          <div className="flex items-center gap-1">
                            <Repeat className="h-3 w-3" />
                            <span>{tradesCompleted} trade{tradesCompleted !== 1 ? 's' : ''} completed</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Trade Item Selection Modal */}
      <TradeItemSelectionModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        targetItem={fullItem || item}
        targetItemOwnerId={fullItem?.user_id}
      />
    </Dialog>
  );
};

export default ExploreItemModal;
