
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
}) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fullItem, setFullItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch complete item details and user profile from database
  useEffect(() => {
    if (!item?.id || !open) return;

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

        // Fetch user profile
        const userIdToFetch = itemData?.user_id || (item as any)?.user_id;
        if (userIdToFetch) {
          console.log('Fetching profile for user:', userIdToFetch);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, avatar_url, username, created_at')
            .eq('id', userIdToFetch)
            .single();

          console.log('Profile data received:', profileData);
          console.log('Profile error:', profileError);

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
          console.log('No user_id found for profile fetch. Item data:', itemData, 'Original item:', item);
        }
      } catch (error) {
        console.error('Error fetching modal data:', error);
        setFullItem(item);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [item?.id, open]);

  // Only show the one image from the uploaded item, no fallbacks.
  const displayItem = fullItem || item;
  const mainImage = displayItem?.image || displayItem?.image_url || "";
  const allImages = mainImage ? [mainImage] : [];

  const [slide, setSlide] = React.useState(0);

  React.useEffect(() => {
    setSlide(0);
  }, [item]);

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
          {onNavigatePrev && onNavigateNext && totalItems && totalItems > 1 && (
            <>
              {currentIndex !== undefined && currentIndex > 0 && (
                <button
                  onClick={onNavigatePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow-lg p-3 hover:scale-105 transition z-30"
                  aria-label="Previous item"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              {currentIndex !== undefined && currentIndex < totalItems - 1 && (
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
            {/* Carousel Nav (hidden if 0 or 1 images) */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSlide(s => (s > 0 ? s - 1 : allImages.length - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow p-2 hover:scale-105 transition z-10"
                  aria-label="Previous"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() =>
                    setSlide(s => (s < allImages.length - 1 ? s + 1 : 0))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow p-2 hover:scale-105 transition z-10"
                  aria-label="Next"
                >
                  <ArrowRight />
                </button>
              </>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-10">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      slide === i
                        ? "bg-white border-primary border-2"
                        : "bg-white/60"
                    }`}
                    style={{ borderWidth: slide === i ? 2 : 0 }}
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
            )}
            {/* Top-right buttons positioned over the image */}
            <div className="absolute top-4 right-4 flex gap-3 z-20">
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <button
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={onLike}
                aria-label={liked ? "Unlike" : "Like"}
              >
                <Heart
                  className={`w-5 h-5 ${liked ? "text-red-500" : "text-gray-400"}`}
                  fill={liked ? "red" : "none"}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
                        {userProfile.name || userProfile.username || "Unknown User"}
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
