import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import FriendRequestButton from '@/components/profile/FriendRequestButton';
import { ReportButton } from '@/components/profile/ReportButton';
import BlockUserButton from '@/components/profile/BlockUserButton';
import { Star, UserX, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MatchItem } from '@/types/item';
import { useIsMobile } from '@/hooks/use-mobile';
import ItemDetailsModal from '@/components/profile/carousel/ItemDetailsModal';
import { otherPersonProfileData, getOtherPersonItems } from '@/data/otherPersonProfileData';
import OtherProfileTabContent from '@/components/profile/OtherProfileTabContent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { likeItem, unlikeItem, isItemLiked, fetchUserReviews } from '@/services/authService';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { blockingService } from '@/services/blockingService';
import { ReportItemModal } from '@/components/items/ReportItemModal';
import { ReportModal } from '@/components/profile/ReportModal';
import { rejectItem, getUserRejectedItems } from '@/services/rejectionService';

const OtherPersonProfile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const userId = searchParams.get('userId');
  
  // State for profile data and loading
  const [profileData, setProfileData] = useState({
    ...otherPersonProfileData,
    avatar_url: undefined as string | undefined
  });
  const [isLoading, setIsLoading] = useState(!!userId); // Only show loading if we have a userId to fetch
  const [userItems, setUserItems] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  
  // Convert items to MatchItems and add liked property
  const itemsAsMatchItems: MatchItem[] = userItems.map(item => ({
    ...item, 
    image: (Array.isArray(item.image_urls) && item.image_urls.length > 0 ? item.image_urls[0] : (item.image_url || item.image)), // Prefer first image_url from array, then single url, then legacy image
    liked: false
  }));
  
  // Fetch profile data if userId is provided
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      if (!user) {
        return; // Wait for auth to load
      }

      try {
        // Check if the user has blocked us (but allow viewing users we've blocked)
        const isBlockedByUser = await blockingService.isCurrentUserBlockedBy(userId);
        
        if (isBlockedByUser) {
          // Redirect back if they blocked us
          toast.error("This profile is not accessible");
          navigate(-1);
          return;
        }
        
        // Fetch profile data after blocking check passes
        setIsLoading(true);
        console.log('Fetching profile for userId:', userId);
        
        // Use auth context instead of direct supabase call
        const currentUser = user;
        setCurrentUserId(currentUser?.id || null);

        // Check friend status if user is logged in
        if (currentUser) {
          // Check blocking status
          const userIsBlocked = await blockingService.isUserBlocked(userId);
          setIsUserBlocked(userIsBlocked);

          const { data: friendRequests } = await supabase
            .from('friend_requests')
            .select('*')
            .or(`and(requester_id.eq.${currentUser.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${currentUser.id})`)
            .eq('status', 'accepted');
          
          const areFriends = friendRequests && friendRequests.length > 0;
          setIsFriend(areFriends);
          console.log('Friend status:', areFriends);
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .eq('is_hidden', false) // Only show non-hidden items
          .eq('status', 'published') // Only show published items, exclude removed
          .eq('is_available', true) // Hide items traded away
          .is('removed_at', null); // Only show non-removed items
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setIsLoading(false);
          return;
        }
        
        if (itemsError) {
          console.error('Error fetching items:', itemsError);
        }
        
        if (profileData) {
          console.log('Fetched profile data:', profileData);
          
          // Fetch reviews for this user
          const reviews = await fetchUserReviews(userId);
          console.log('Fetched reviews:', reviews);
          setUserReviews(reviews);
          
          // Calculate average rating from reviews
          let averageRating = 0;
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
          }
          
          setProfileData({
            name: profileData.username || profileData.name || 'Unknown User',
            description: profileData.bio || 'No bio available',
            rating: averageRating,
            reviewCount: reviews.length,
            location: profileData.location || '',
            memberSince: new Date(profileData.created_at).getFullYear().toString(),
            friendCount: 0, // Show 0 friends until we implement real friends
            avatar_url: profileData.avatar_url
          });
        }
        
        if (itemsData) {
          console.log('🔍 JOHN2 PROFILE: Fetched items data:', itemsData);
          console.log('🔍 JOHN2 PROFILE: Items with removed status:', itemsData.filter(item => item.status === 'removed'));
          setUserItems(itemsData);
          
          // Load liked status for each item if user is logged in
          if (currentUser) {
            const likedStatus: Record<string, boolean> = {};
            const selectedId = localStorage.getItem('selectedUserItemId') || undefined;
            for (const item of itemsData) {
              try {
                const liked = await isItemLiked(item.id, selectedId as string | undefined);
                likedStatus[item.id] = liked;
              } catch (e) {
                likedStatus[item.id] = false;
              }
            }
            setLikedItems(likedStatus);
          }
        }
      } catch (error) {
        console.error('Error fetching profile or checking blocking:', error);
        toast.error("Unable to access profile");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId, authLoading, user]);

  // State for active tab
  const [activeTab, setActiveTab] = useState('available');
  
  // Reset tab to 'available' when userId changes
  useEffect(() => {
    setActiveTab('available');
  }, [userId]);
  // State for popup
  const [popupItem, setPopupItem] = useState<MatchItem | null>(null);
  const [reportModal, setReportModal] = useState<{ id: string; name: string } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  // Track index of the popup item among visible items for navigation arrows
  const [currentPopupIndex, setCurrentPopupIndex] = useState<number>(0);

  
  // State to track liked items
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [rejectedForSelected, setRejectedForSelected] = useState<Set<string>>(new Set());
  // Listen for like updates from other pages (e.g., Home) and update UI
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ itemId: string; liked: boolean }>;
      const detail: any = ce.detail || {};
      const itemId = detail.itemId as string | undefined;
      const liked = !!detail.liked;
      if (!itemId) return;
      // Only update if the item belongs to this profile
      if (userItems.some(item => item.id === itemId)) {
        setLikedItems(prev => ({ ...prev, [itemId]: liked }));
      }
    };
    window.addEventListener('likedItemsChanged', handler as EventListener);
    return () => window.removeEventListener('likedItemsChanged', handler as EventListener);
  }, [userItems]);
  // State for friendship status - defaulting to false (not friends)
  const [isFriend, setIsFriend] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const isMobile = useIsMobile();

  // Function to navigate to specific tab
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Handle popup close
  const handlePopupClose = () => {
    setPopupItem(null);
  };
  
  // Handle like item in popup
  const handlePopupLikeClick = (item: MatchItem) => {
    handleLikeItem(item.id);
    setPopupItem(null);
  };

  // State for selected item from homepage
  const [selectedItemIdFromHomepage, setSelectedItemIdFromHomepage] = useState<string | null>(null);

  // Fetch the selected item from localStorage and keep it updated
  useEffect(() => {
    const updateSelectedItem = () => {
      const storedSelectedItem = localStorage.getItem('selectedUserItemId');
      console.log('🔍 OtherPersonProfile - Retrieved selectedUserItemId from localStorage:', storedSelectedItem);
      if (storedSelectedItem) {
        setSelectedItemIdFromHomepage(storedSelectedItem);
      }
    };

    // Update initially
    updateSelectedItem();

    // Listen for storage changes (when user selects different item on homepage)
    window.addEventListener('storage', updateSelectedItem);

    // Also listen for a custom event in case the change happens in the same tab
    window.addEventListener('selectedItemChanged', updateSelectedItem);

    return () => {
      window.removeEventListener('storage', updateSelectedItem);
      window.removeEventListener('selectedItemChanged', updateSelectedItem);
    };
  }, []);

  // Recompute liked status and rejected list when selected item or items change
  useEffect(() => {
    const refresh = async () => {
      if (!userItems || userItems.length === 0) {
        setRejectedForSelected(new Set());
        return;
      }
      const map: Record<string, boolean> = {};
      for (const item of userItems) {
        try {
          const liked = await isItemLiked(item.id, selectedItemIdFromHomepage || undefined);
          map[item.id] = liked;
        } catch (e) {
          map[item.id] = false;
        }
      }
      setLikedItems(map);

      // Load pair-specific rejections for the currently selected item
      if (selectedItemIdFromHomepage) {
        try {
          const rejected = await getUserRejectedItems(selectedItemIdFromHomepage);
          setRejectedForSelected(new Set(rejected));
        } catch (e) {
          setRejectedForSelected(new Set());
        }
      } else {
        setRejectedForSelected(new Set());
      }
    };
    refresh();
  }, [userItems, selectedItemIdFromHomepage]);

  // Handle liking an item - now with real backend calls and homepage context
  const handleLikeItem = async (id: string) => {
    if (!currentUserId) {
      navigate('/auth');
      return;
    }

    const currentLikedStatus = likedItems[id] || false;

    try {
      // Optimistically update UI
      setLikedItems(prev => ({
        ...prev,
        [id]: !currentLikedStatus
      }));

      if (currentLikedStatus) {
        // Unlike the item
        const success = await unlikeItem(id);
        if (!success) {
          // Revert on failure
          setLikedItems(prev => ({
            ...prev,
            [id]: currentLikedStatus
          }));
        }
      } else {
        // Get the most current selectedUserItemId from localStorage at the moment of liking
        const currentSelectedItemId = localStorage.getItem('selectedUserItemId');
        console.log('🔍 OtherPersonProfile - Liking item with FRESH context:', { 
          itemId: id, 
          currentSelectedItemId,
          staleSelectedItemIdFromHomepage: selectedItemIdFromHomepage,
          willUseForMatching: currentSelectedItemId || 'NO CONTEXT - will use all items'
        });
        const result = await likeItem(id, currentSelectedItemId || undefined);
        if (!result || !result.success) {
          // Revert on failure
          setLikedItems(prev => ({
            ...prev,
            [id]: currentLikedStatus
          }));
        } else {
          // Check for mutual match result and navigate to messages
          if ('isMatch' in result && result.isMatch && 'matchData' in result && result.matchData) {
            // Keep single match toast handled in authService; just navigate
            // Navigate to messages after a delay
            setTimeout(() => {
              navigate('/messages', {
                state: {
                  newMatch: true,
                  matchData: result.matchData,
                },
              });
            }, 2000);
          } else {
            toast.success("Item liked");
          }
        }
      }
    } catch (error) {
      console.error('Error liking/unliking item:', error);
      // Revert optimistic update
      setLikedItems(prev => ({
        ...prev,
        [id]: currentLikedStatus
      }));
    }
  };

  // Reject an item only for the currently selected item (pair-specific)
  const handleRejectItemForSelected = async (id: string) => {
    if (!currentUserId) {
      navigate('/auth');
      return;
    }
    const currentSelectedItemId = localStorage.getItem('selectedUserItemId');
    if (!currentSelectedItemId) {
      toast.error('Select one of your items first to reject for that item');
      return;
    }
    try {
      const success = await rejectItem(id, currentSelectedItemId);
      if (success) {
        setRejectedForSelected(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        toast.success('Item removed from this item’s feed');
      } else {
        toast.error('Failed to reject item');
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Failed to reject item');
    }
  };
  // Update items with liked status
  const itemsWithLikedStatus = itemsAsMatchItems.map(item => ({
    ...item,
    liked: likedItems[item.id] || false
  }));

  // Hide items rejected for the currently selected item only
  const visibleItems = itemsWithLikedStatus.filter(item => !rejectedForSelected.has(item.id));

  // Keep track of the index of the current popup item among this profile's items
  useEffect(() => {
    if (!popupItem) return;
    const idx = itemsWithLikedStatus.findIndex(i => i.id === popupItem.id);
    if (idx >= 0) setCurrentPopupIndex(idx);
  }, [popupItem?.id, itemsWithLikedStatus]);

  // Handlers for navigating between this user's items in the modal
  const handleNavigatePrev = () => {
    if (currentPopupIndex > 0) {
      setPopupItem(itemsWithLikedStatus[currentPopupIndex - 1]);
    }
  };

  const handleNavigateNext = () => {
    if (currentPopupIndex < itemsWithLikedStatus.length - 1) {
      setPopupItem(itemsWithLikedStatus[currentPopupIndex + 1]);
    }
  };

  // Handle reporting an item from the popup
  const handleReport = (id: string) => {
    const item = itemsWithLikedStatus.find(i => i.id === id) || popupItem;
    setReportModal({ id, name: item?.name || 'Item' });
  };
  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header with Friend Request Button */}
        <div className="relative">
          <ProfileHeader 
            profile={profileData} 
            friendCount={profileData.friendCount}
            onReviewsClick={() => navigateToTab('reviews')}
            userId={userId || undefined}
            isOwnProfile={false}
            menuItems={[
              { 
                label: 'Copy Profile Link', 
                onClick: async () => {
                  try {
                    const profileUrl = `${window.location.origin}/other-person-profile?userId=${userId}`;
                    await navigator.clipboard.writeText(profileUrl);
                    toast.success('Profile link copied to clipboard!');
                  } catch (error) {
                    toast.error('Failed to copy profile link');
                  }
                }
              },
              { 
                label: isUserBlocked ? 'Unblock User' : 'Block User', 
                onClick: () => setShowBlockDialog(true),
                variant: 'destructive' as const
              },
              { 
                label: 'Report User', 
                onClick: () => setShowReportModal(true),
                variant: 'destructive' as const
              }
            ]}
          />
          
          {/* Action buttons positioned differently for mobile vs desktop */}
          {isMobile ? (
            /* Mobile: Center positioned as before */
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
              {/* Blocked status indicator */}
              {isUserBlocked && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  You blocked this user
                </div>
              )}
              
              {/* 3-dot menu and Friend Request button together */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="bg-background border shadow-md z-50">
                    <DropdownMenuItem onClick={async () => {
                      try {
                        const profileUrl = `${window.location.origin}/other-person-profile?userId=${userId}`;
                        await navigator.clipboard.writeText(profileUrl);
                        toast.success('Profile link copied to clipboard!');
                      } catch (error) {
                        toast.error('Failed to copy profile link');
                      }
                    }}>
                      Copy Profile Link
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowBlockDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      {isUserBlocked ? 'Unblock User' : 'Block User'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowReportModal(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      Report User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <FriendRequestButton 
                  userId={userId || "profile1"} 
                  initialStatus="none" 
                  onStatusChange={(status) => setIsFriend(status === 'accepted')}
                />
              </div>
            </div>
          ) : (
            /* Desktop/Tablet: Portal to profile header */
            typeof document !== 'undefined' && document.getElementById('profile-action-buttons') &&
            createPortal(
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow-md z-50">
                    <DropdownMenuItem onClick={async () => {
                      try {
                        const profileUrl = `${window.location.origin}/other-person-profile?userId=${userId}`;
                        await navigator.clipboard.writeText(profileUrl);
                        toast.success('Profile link copied to clipboard!');
                      } catch (error) {
                        toast.error('Failed to copy profile link');
                      }
                    }}>
                      Copy Profile Link
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowBlockDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      {isUserBlocked ? 'Unblock User' : 'Block User'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowReportModal(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      Report User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <FriendRequestButton 
                  userId={userId || "profile1"} 
                  initialStatus="none" 
                  onStatusChange={(status) => setIsFriend(status === 'accepted')}
                />
              </div>,
              document.getElementById('profile-action-buttons')!
            )
          )}
        </div>

        {/* Tabs with sticky header */}
        <div className="bg-white">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full flex rounded-none h-12 bg-white border-b justify-start">
              <TabsTrigger 
                value="available" 
                className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
              >
                Items For Trade
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
              >
                <Star className="mr-2 h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>
            
            {/* We're moving the tab content inside the Tabs component */}
            <OtherProfileTabContent 
              activeTab={activeTab}
              items={visibleItems}
              reviews={userReviews}
              setPopupItem={setPopupItem}
              onLikeItem={handleLikeItem}
              onRejectItem={handleRejectItemForSelected}
              isFriend={isFriend}
              profileUserId={userId || undefined}
            />
          </Tabs>
        </div>
      </div>

      {/* Item Details Popup - with profile info for other person's items */}
      {popupItem && (
        <ItemDetailsModal 
          item={popupItem}
          isOpen={!!popupItem}
          onClose={handlePopupClose}
          onLikeClick={handlePopupLikeClick}
          onNavigatePrev={handleNavigatePrev}
          onNavigateNext={handleNavigateNext}
          currentIndex={currentPopupIndex}
          totalItems={itemsWithLikedStatus.length}
          showProfileInfo={true}
          preloadedUserProfile={{
            name: profileData.name,
            avatar_url: profileData.avatar_url || '',
            username: profileData.name,
            created_at: `${profileData.memberSince}-01-01T00:00:00.000Z`
          }}
          skipDataFetch={true}
          onReport={handleReport}
        />
      )}

      {reportModal && (
        <ReportItemModal
          isOpen={true}
          onClose={() => setReportModal(null)}
          itemId={reportModal.id}
          itemName={reportModal.name}
        />
      )}

      {/* Report Modal triggered from 3-dots menu */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={userId || ""}
        reportedUsername={profileData.name}
      />

      {/* Block Dialog triggered from 3-dots menu */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isUserBlocked ? `Unblock ${profileData.name}?` : `Block ${profileData.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isUserBlocked ? (
                <>
                  This user will be able to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Send you friend requests again</li>
                    <li>See your items and profile</li>
                    <li>Contact you through the app</li>
                  </ul>
                </>
              ) : (
                <>
                  This user will no longer be able to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Send you friend requests</li>
                    <li>See your items or profile</li>
                    <li>Contact you through the app</li>
                  </ul>
                  <div className="mt-3 text-sm text-muted-foreground">
                    You can unblock them later from your settings.
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                try {
                  const { data: { user: currentUser } } = await supabase.auth.getUser();
                  if (!currentUser) {
                    toast.error('You must be logged in');
                    return;
                  }

                  if (isUserBlocked) {
                    // Unblock
                    const { error } = await supabase
                      .from('blocked_users')
                      .delete()
                      .eq('blocker_id', currentUser.id)
                      .eq('blocked_id', userId);
                    if (error) throw error;
                    setIsUserBlocked(false);
                    toast.success(`${profileData.name} has been unblocked`);
                  } else {
                    // Block
                    const { error } = await supabase
                      .from('blocked_users')
                      .insert({
                        blocker_id: currentUser.id,
                        blocked_id: userId
                      });
                    if (error) throw error;
                    setIsUserBlocked(true);
                    toast.success(`${profileData.name} has been blocked`);
                  }
                } catch (error) {
                  console.error('Error toggling block status:', error);
                  toast.error('Failed to update block status');
                }
              }}
              className={isUserBlocked ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}
            >
              {isUserBlocked ? 'Unblock User' : 'Block User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default OtherPersonProfile;
