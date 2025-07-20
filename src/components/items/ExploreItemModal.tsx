
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Item } from "@/types/item";
import { supabase } from "@/integrations/supabase/client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ExploreItemModalProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  images?: string[];
  liked?: boolean;
  onLike?: () => void;
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
}) => {
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
        if (itemData?.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, avatar_url, username, created_at')
            .eq('id', itemData.user_id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Fallback to default profile
            setUserProfile({
              name: "User",
              avatar_url: "https://randomuser.me/api/portraits/women/44.jpg",
              created_at: new Date().toISOString()
            });
          } else {
            console.log('Profile data fetched:', JSON.stringify(profileData, null, 2));
            setUserProfile(profileData);
          }
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

  // Calculate user stats
  const memberSince = userProfile?.created_at 
    ? new Date(userProfile.created_at).getFullYear()
    : 2023;

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
          {/* Close button - top right, smaller size */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

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
            {/* Like button positioned on the right side of the image */}
            <button
              className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
              onClick={onLike}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart
                className={`w-6 h-6 ${liked ? "text-red-500" : "text-gray-400"}`}
                fill={liked ? "red" : "none"}
              />
            </button>
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
                  {displayItem.description ||
                    "Beautiful vintage 35mm film camera in excellent working condition. Perfect for photography enthusiasts."}
                </p>
                
                {/* Tags in 2x2 grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-lg">🏷️</span>
                    <span className="text-sm">{displayItem.category || "Electronics"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-lg">📷</span>
                    <span className="text-sm">{displayItem.tags?.[0] || "Cameras"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-lg">⭐</span>
                    <span className="text-sm">{displayItem.condition || "Excellent"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-lg">💰</span>
                    <span className="text-sm">150 - 200</span>
                  </div>
                </div>
                
                {/* User profile info */}
                {userProfile && (
                  <div className="flex gap-3 items-center mt-auto pt-6">
                    <img
                      src={userProfile.avatar_url || "https://randomuser.me/api/portraits/women/44.jpg"}
                      alt={userProfile.name}
                      className="w-11 h-11 rounded-full border object-cover"
                    />
                    <div>
                      <span className="font-semibold text-gray-900">
                        {userProfile.name || userProfile.username || "Unknown User"}
                      </span>
                      <div className="flex text-xs text-gray-500 mt-1 gap-4">
                        <span>Since {memberSince}</span>
                        <span>· 1.8 mi away</span>
                        <span>· ~30 min response</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 mt-2">
                    Debug: Profile - {userProfile ? JSON.stringify(userProfile) : 'No profile'}
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
