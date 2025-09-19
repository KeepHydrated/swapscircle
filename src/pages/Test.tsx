
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import HeaderLocationSelector from '@/components/layout/HeaderLocationSelector';
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';
import { MobileFriendsCarousel } from '@/components/profile/MobileFriendsCarousel';
import SupportChat from '@/components/chat/SupportChat';
import { useIsMobile } from '@/hooks/use-mobile';

import { useDbItems } from '@/hooks/useDbItems';
import { useUserItems } from '@/hooks/useUserItems';
import { useMatches } from '@/hooks/useMatches';
import ItemCard from '@/components/items/ItemCard';
import MyItems from '@/components/items/MyItems';
import Matches from '@/components/items/Matches';
import ExploreItemModal from '@/components/items/ExploreItemModal';
import { ReportItemModal } from '@/components/items/ReportItemModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MatchItem } from '@/types/item';
import { supabase } from '@/integrations/supabase/client';
import { likeItem, unlikeItem } from '@/services/authService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from 'lucide-react';
import { blockingService } from '@/services/blockingService';
import { rejectItem, undoRejectItem, getUserRejectedItems } from '@/services/rejectionService';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Registration form schema
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters long" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Test: React.FC = () => {
  // State for mobile carousel back function
  const [mobileBackFunction, setMobileBackFunction] = useState<(() => void) | null>(null);
  // User's authentication and navigation
  const { user, supabaseConfigured, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Login state
  const [activeAuthTab, setActiveAuthTab] = useState<string>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await signUp(data.email, data.password, data.name);
      setActiveAuthTab("login");
      registerForm.reset();
    } catch (error) {
      console.error("Register error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Friend items - fetch from friends
  const [friendItems, setFriendItems] = useState([]);
  const [friendItemsLoading, setFriendItemsLoading] = useState(false);
  const [rejectedFriendItems, setRejectedFriendItems] = useState<string[]>([]);
  const [pairRejectedFriendIds, setPairRejectedFriendIds] = useState<Set<string>>(new Set());
  const [lastFriendActions, setLastFriendActions] = useState<{ type: 'like' | 'reject'; itemId: string; wasLiked?: boolean; global?: boolean }[]>([]);

  // User's items and matching functionality (moved up to use selectedUserItemId earlier)
  const { items: userItems, loading: userItemsLoading, error: userItemsError } = useUserItems(false); // Don't include drafts on test page
  const [selectedUserItemId, setSelectedUserItemId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('matches');
  const [selectedLocation, setSelectedLocation] = useState('nationwide');
  // Matches undo state - will be set by the Matches component
  const [matchesUndoAvailable, setMatchesUndoAvailable] = useState(false);
  const [matchesUndoFn, setMatchesUndoFn] = useState<(() => void) | null>(null);

  // Modal state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [itemToReport, setItemToReport] = useState<string | null>(null);

  // Fetch friends' items
  const fetchFriendsItems = async () => {
    if (!user) return;
    
    setFriendItemsLoading(true);
    try {
      // Run all initial queries in parallel for better performance
      const [
        blockedUsersResult,
        usersWhoBlockedMeResult,
        friendRequestsResult,
        mutualMatchesResult
      ] = await Promise.all([
        blockingService.getBlockedUsers(),
        blockingService.getUsersWhoBlockedMe(),
        supabase
          .from('friend_requests')
          .select('requester_id, recipient_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`),
        supabase
          .from('mutual_matches')
          .select('user1_item_id, user2_item_id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      ]);

      const allBlockedUserIds = [...blockedUsersResult, ...usersWhoBlockedMeResult];

      if (friendRequestsResult.error) {
        console.error('Error fetching friends:', friendRequestsResult.error);
        return;
      }

      if (!friendRequestsResult.data || friendRequestsResult.data.length === 0) {
        setFriendItems([]);
        return;
      }

      // Get friend user IDs (excluding current user and blocked users)
      const friendIds = friendRequestsResult.data
        .map(req => req.requester_id === user.id ? req.recipient_id : req.requester_id)
        .filter(friendId => !allBlockedUserIds.includes(friendId));

      // If no non-blocked friends, return empty array
      if (friendIds.length === 0) {
        setFriendItems([]);
        return;
      }

      console.log('🔥 FRIENDS DEBUG: Found friend IDs:', friendIds);

      if (mutualMatchesResult.error) {
        console.error('Error fetching mutual matches:', mutualMatchesResult.error);
      }

      // Extract all matched item IDs to filter out
      const matchedItemIds = new Set();
      mutualMatchesResult.data?.forEach(match => {
        matchedItemIds.add(match.user1_item_id);
        matchedItemIds.add(match.user2_item_id);
      });

      console.log('🔥 FRIENDS DEBUG: Matched item IDs to exclude:', Array.from(matchedItemIds));

      // Fetch friend items and profiles in parallel for better performance
      const [friendItemsResult, friendProfilesResult] = await Promise.all([
        supabase
          .from('items')
          .select('*')
          .in('user_id', friendIds)
          .eq('is_available', true)
          .eq('is_hidden', false)
          .eq('status', 'published')
          .is('removed_at', null),
        supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', friendIds)
      ]);

      if (friendItemsResult.error) {
        console.error('Error fetching friend items:', friendItemsResult.error);
        return;
      }

      if (friendProfilesResult.error) {
        console.error('Error fetching friend profiles:', friendProfilesResult.error);
      }

      // Filter out mutual matches from friend items
      const unMatchedFriendItems = friendItemsResult.data?.filter(item => 
        !matchedItemIds.has(item.id)
      ) || [];

      console.log('🔥 FRIENDS DEBUG: Friend items before filtering:', friendItemsResult.data?.length || 0);
      console.log('🔥 FRIENDS DEBUG: Friend items after filtering out matches:', unMatchedFriendItems.length);

      // Create a map of user_id to profile for quick lookup
      const profileMap = (friendProfilesResult.data || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Format items for the carousel (using filtered items)
      const formattedFriendItems = unMatchedFriendItems?.map(item => {
        const ownerProfile = profileMap[item.user_id];
        return {
          id: item.id,
          name: item.name,
          image: item.image_url || (item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'),
          category: item.category,
          condition: item.condition,
          description: item.description,
          price_range_min: item.price_range_min,
          price_range_max: item.price_range_max,
          tags: item.tags,
          liked: false,
          ownerName: ownerProfile?.name || ownerProfile?.username || 'Unknown',
          ownerAvatar: ownerProfile?.avatar_url,
          user_id: item.user_id
        };
      }) || [];

      setFriendItems(formattedFriendItems);
    } catch (error) {
      console.error('Error fetching friends items:', error);
    } finally {
      setFriendItemsLoading(false);
    }
  };

  // Fetch friends' items when user changes or component mounts
  useEffect(() => {
    if (user && supabaseConfigured) {
      fetchFriendsItems();
    } else {
      setFriendItems([]);
    }
}, [user, supabaseConfigured]);

  // Load DB rejections for the currently selected item (pair-specific + global)
  useEffect(() => {
    const loadRejections = async () => {
      if (user && supabaseConfigured && selectedUserItemId) {
        try {
          const ids = await getUserRejectedItems(selectedUserItemId);
          setPairRejectedFriendIds(new Set(ids));
        } catch (e) {
          setPairRejectedFriendIds(new Set());
        }
      } else {
        setPairRejectedFriendIds(new Set());
      }
    };
    loadRejections();
  }, [user, supabaseConfigured, selectedUserItemId]);

  // Define handler for liking friend items with mutual matching
  const handleLikeFriendItem = async (itemId: string, global?: boolean) => {
    if (!user) {
      navigate('/');
      return;
    }

    const currentItem = friendItems.find(item => item.id === itemId);
    if (!currentItem) return;

    // Track the action for undo (keep only last 3 actions)
    setLastFriendActions(prev => {
      const newAction = { type: 'like' as const, itemId, wasLiked: currentItem.liked };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3); // Keep only last 3 actions
    });

    // Optimistically update UI
    setFriendItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );

    try {
      const isCurrentlyLiked = currentItem.liked;
      let result;
      
      if (isCurrentlyLiked) {
        result = await unlikeItem(itemId, global ? undefined : selectedUserItemId);
        const message = global ? 'Item unliked for all your items' : 'Item unliked';
        toast.success(message);
        // Broadcast liked state change to other pages (e.g., profile)
        window.dispatchEvent(new CustomEvent('likedItemsChanged', { detail: { itemId, liked: false } }));
      } else {
        result = await likeItem(itemId, global ? undefined : selectedUserItemId);
        
        // Check for mutual match result
        if (result && typeof result === 'object' && 'success' in result && result.success) {
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
            const message = global ? 'Item liked for all your items' : 'Item liked';
            toast.success(message);
          }
          // Broadcast liked state change to other pages (e.g., profile)
          window.dispatchEvent(new CustomEvent('likedItemsChanged', { detail: { itemId, liked: true } }));
        }
      }
    } catch (error) {
      console.error('Error liking friend item:', error);
      // Revert optimistic update on error
      setFriendItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, liked: currentItem.liked } : item
        )
      );
      toast.error('Failed to update like status');
    }
  };

  // Handle rejecting friend items (pair-specific by default; global via menu)
  const handleRejectFriendItem = async (itemId: string, global?: boolean) => {
    if (!user) {
      navigate('/');
      return;
    }

    // Track the action for undo (keep only last 3 actions)
    setLastFriendActions(prev => {
      const newAction = { type: 'reject' as const, itemId, global: !!global };
      const updated = [newAction, ...prev];
      return updated.slice(0, 3);
    });

    try {
      if (!global && !selectedUserItemId) {
        toast.error('Select one of your items first');
        return;
      }

      const ok = await rejectItem(itemId, global ? undefined : selectedUserItemId);
      if (ok) {
        if (global) {
          setRejectedFriendItems(prev => [...prev, itemId]);
          toast.success('Item rejected for all your items');
        } else {
          setPairRejectedFriendIds(prev => {
            const next = new Set(prev);
            next.add(itemId);
            return next;
          });
          toast.success("Item removed from this item's feed");
        }
      } else {
        toast.error('Failed to reject item');
      }
    } catch (e) {
      console.error('Error rejecting friend item:', e);
      toast.error('Failed to reject item');
    }
  };

  // Handle undo for friend items
  const handleUndoFriendAction = () => {
    if (lastFriendActions.length === 0) return;

    const actionToUndo = lastFriendActions[0]; // Get most recent action

    if (actionToUndo.type === 'like') {
      // Undo like action - revert to previous liked state
      setFriendItems(prev =>
        prev.map(item =>
          item.id === actionToUndo.itemId 
            ? { ...item, liked: actionToUndo.wasLiked || false }
            : item
        )
      );
      toast.success('Like action undone');
    } else if (actionToUndo.type === 'reject') {
      // Undo reject action - restore item to friends' items and DB
      try {
        undoRejectItem(actionToUndo.itemId, actionToUndo.global ? undefined : selectedUserItemId).catch((err) => {
          console.error('Error undoing rejection in database:', err);
        });
      } catch {}
      setRejectedFriendItems(prev => prev.filter(id => id !== actionToUndo.itemId));
      setPairRejectedFriendIds(prev => {
        const next = new Set(prev);
        next.delete(actionToUndo.itemId);
        return next;
      });
      toast.success('Reject action undone');
    }

    // Remove the undone action from the list
    setLastFriendActions(prev => prev.slice(1));
  };

  // ... keep existing code (user items hook and related state moved earlier)
  
  // Auto-select first item when userItems are loaded
  useEffect(() => {
    console.log('🔍 AUTO-SELECT: useEffect triggered', {
      userItemsLength: userItems.length,
      selectedUserItemId,
      firstItemId: userItems[0]?.id,
      firstItemName: userItems[0]?.name
    });
    if (userItems.length > 0 && !selectedUserItemId) {
      console.log('🔍 AUTO-SELECT: Setting selected item to:', userItems[0].id, userItems[0].name);
      setSelectedUserItemId(userItems[0].id);
    }
  }, [userItems, selectedUserItemId]);
  
  // Persist selected item for cross-page matching and notify listeners
  useEffect(() => {
    if (selectedUserItemId) {
      localStorage.setItem('selectedUserItemId', selectedUserItemId);
      window.dispatchEvent(new Event('selectedItemChanged'));
    }
  }, [selectedUserItemId]);

  // Refresh friends' items when the selected user item changes
  useEffect(() => {
    if (user && supabaseConfigured) {
      fetchFriendsItems();
    }
  }, [selectedUserItemId]);

  // Get selected user item
  const selectedUserItem = userItems.find(item => item.id === selectedUserItemId) || null;
  
  console.log('🔍 SELECTION DEBUG:', {
    selectedUserItemId,
    selectedUserItem: selectedUserItem ? { id: selectedUserItem.id, name: selectedUserItem.name } : null,
    userItemsCount: userItems.length,
    firstUserItem: userItems[0] ? { id: userItems[0].id, name: userItems[0].name } : null
  });
  
  // Get matches for selected item (real matches from DB)
  const { matches: dbMatches, loading: matchesLoading, error: matchesError } = useMatches(selectedUserItem, selectedLocation);

  // Use only real matches from database
  const matches = selectedUserItem ? dbMatches : [];

  // Handle selecting a user item
  const handleSelectUserItem = (itemId: string) => {
    setSelectedUserItemId(itemId);
  };

  // Handle opening item modal
  const handleOpenItemModal = (item: any) => {
    console.log('OPENING MODAL with item:', item);
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Handle closing item modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // Handle report functionality
  const handleReport = (itemId: string) => {
    setItemToReport(itemId);
    setReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    setItemToReport(null);
  };

  // Get displayed friends items (excluding rejected ones)
  const displayedFriendItems = friendItems.filter(item => !rejectedFriendItems.includes(item.id) && !pairRejectedFriendIds.has(item.id));
  
  // Find current index in displayed friend items
  const currentFriendItemIndex = selectedItem 
    ? displayedFriendItems.findIndex(item => item.id === selectedItem.id)
    : -1;

  // Navigation functions for friends items
  const navigateToPrevFriendItem = () => {
    if (currentFriendItemIndex > 0) {
      const prevItem = displayedFriendItems[currentFriendItemIndex - 1];
      if (prevItem) {
        setSelectedItem(prevItem);
      }
    }
  };

  const navigateToNextFriendItem = () => {
    if (currentFriendItemIndex < displayedFriendItems.length - 1) {
      const nextItem = displayedFriendItems[currentFriendItemIndex + 1];
      if (nextItem) {
        setSelectedItem(nextItem);
      }
    }
  };

  // Handle matches undo availability callback
  const handleMatchesUndoAvailable = useCallback((available: boolean, undoFn: (() => void) | null) => {
    setMatchesUndoAvailable(available);
    setMatchesUndoFn(() => undoFn);
  }, []);

  // Unified undo handler that works based on active tab
  const handleUndo = () => {
    if (activeTab === 'friends') {
      handleUndoFriendAction();
    } else if (activeTab === 'matches' && matchesUndoFn) {
      matchesUndoFn();
    }
  };

  // Check if undo is available based on active tab
  const isUndoAvailable = () => {
    if (activeTab === 'friends') {
      return lastFriendActions.length > 0;
    } else if (activeTab === 'matches') {
      return matchesUndoAvailable;
    }
    return false;
  };

  // Make the mobile back function available globally for the existing back button
  useEffect(() => {
    if (mobileBackFunction) {
      // Make it available globally
      (window as any).mobileCarouselGoBack = mobileBackFunction;
      console.log('🔙 Mobile carousel back function registered globally');
    }
    return () => {
      (window as any).mobileCarouselGoBack = null;
    };
  }, [mobileBackFunction]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 p-4 md:p-6 flex flex-col h-full">

        {/* Main Two-Column Layout */}
        <div className="flex-1 min-h-0">
          {user && supabaseConfigured ? (
            <div className="grid grid-cols-1 gap-6 h-full">
              {/* Left Column - Your Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                
                {userItemsLoading ? (
                  <div className="flex justify-center items-center min-h-[300px]">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : userItemsError ? (
                  <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg text-sm">{userItemsError}</div>
                ) : userItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-base font-medium mb-1">No items yet</p>
                    <p className="text-sm">Post an item to see matches!</p>
                  </div>
                ) : (
                  <div className="h-auto">
                    <div className="overflow-x-auto overflow-y-hidden p-2">
                      <div className="flex gap-2 min-w-max">
                        {userItems.map((item) => (
                          <div key={item.id} className="flex-shrink-0 w-32 transform transition-all duration-200 hover:scale-105">
                            <ItemCard 
                              id={item.id}
                              name={item.name}
                              image={item.image}
                              isSelected={selectedUserItemId === item.id}
                              onSelect={handleSelectUserItem}
                              onReport={handleReport}
                              compact={true}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Matches and Friends Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <Tabs defaultValue="matches" onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList className="grid grid-cols-2 w-auto">
                      <TabsTrigger value="matches">Matches</TabsTrigger>
                      <TabsTrigger value="friends">Friends' Items</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                      {activeTab === 'matches' && (
                        <HeaderLocationSelector 
                          onLocationChange={(value) => {
                            console.log('Location changed to:', value);
                            setSelectedLocation(value);
                          }}
                          initialValue={selectedLocation}
                          className="hidden md:block"
                        />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndo}
                        disabled={!isUndoAvailable()}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span className="hidden md:inline">Undo</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Location selector below tabs - only shown on mobile for matches tab */}
                  {activeTab === 'matches' && (
                    <div className="mb-4 md:hidden">
                      <HeaderLocationSelector 
                        onLocationChange={(value) => {
                          console.log('Location changed to:', value);
                          setSelectedLocation(value);
                        }}
                        initialValue={selectedLocation}
                      />
                    </div>
                  )}
                  
                  
                 <TabsContent value="matches" className="flex-1 mt-0">
                     {selectedUserItem ? (
                        <Matches
                          matches={matches}
                          selectedItemName={selectedUserItem.name}
                          selectedItemId={selectedUserItem.id}
                          onUndoAvailable={handleMatchesUndoAvailable}
                          loading={matchesLoading}
                        />
                     ) : (
                       <div className="h-full flex flex-col">
                         <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                           <div className="text-4xl mb-3">🔍</div>
                           <p className="text-base font-medium mb-1">No item selected</p>
                           <p className="text-sm">Select an item to see matches</p>
                         </div>
                       </div>
                     )}
                   </TabsContent>
                  
                       <TabsContent value="friends" className="flex-1 mt-0">
                         <div className="h-full flex flex-col">
                         {friendItemsLoading ? (
                           <div className="overflow-x-auto overflow-y-hidden p-2">
                             <div className="flex gap-2 min-w-max">
                               {Array.from({ length: 3 }).map((_, index) => (
                                 <div key={`friend-skeleton-${index}`} className="flex-shrink-0 w-64">
                                   <Card className="overflow-hidden">
                                     <Skeleton className="aspect-[4/3] w-full" />
                                     <div className="p-3">
                                       <Skeleton className="h-4 w-3/4 mx-auto" />
                                     </div>
                                   </Card>
                                 </div>
                               ))}
                             </div>
                           </div>
                         ) : friendItems.length === 0 ? (
                           <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                             <div className="text-4xl mb-3">👥</div>
                             <p className="text-base font-medium mb-1">No friends' items</p>
                             <p className="text-sm">Add friends to see their items here</p>
                           </div>
                         ) : displayedFriendItems.length === 0 ? (
                           <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                             <div className="text-4xl mb-3">🔍</div>
                             <p className="text-base font-medium mb-1">No matches found</p>
                             <p className="text-sm">Try updating your preferences or check back later</p>
                           </div>
                           ) : (() => {
                            console.log('🔥 MOBILE CHECK:', { 
                              isMobile,
                              displayedFriendItemsLength: displayedFriendItems.length,
                              windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'undefined',
                              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'undefined'
                            });
                            
                            if (isMobile) {
                              const formattedItems = displayedFriendItems.map(item => ({
                                id: item.id,
                                title: item.name,
                                image: item.image,
                                description: item.description,
                                condition: item.condition,
                                category: item.category,
                                user: {
                                  id: item.user_id,
                                  name: item.ownerName,
                                  avatar_url: item.ownerAvatar
                                }
                              }));
                              console.log('🔥 MOBILE FRIENDS DEBUG:', {
                                isMobile,
                                displayedFriendItemsCount: displayedFriendItems.length,
                                formattedItemsCount: formattedItems.length,
                                firstItem: formattedItems[0],
                                firstItemDetails: {
                                  id: formattedItems[0]?.id,
                                  title: formattedItems[0]?.title,
                                  image: formattedItems[0]?.image,
                                  description: formattedItems[0]?.description,
                                  condition: formattedItems[0]?.condition,
                                  category: formattedItems[0]?.category,
                                  userName: formattedItems[0]?.user?.name
                                },
                                allItems: formattedItems
                              });
                              console.log('🔥 ABOUT TO RENDER MOBILE CAROUSEL');
                              try {
                                return (
                                   <MobileFriendsCarousel
                                     items={formattedItems}
                                     onLike={(id) => handleLikeFriendItem(id)}
                                     onReject={(id) => handleRejectFriendItem(id)}
                                     onBackButtonRegister={setMobileBackFunction}
                                   />
                                );
                              } catch (error) {
                                console.error('🔥 ERROR RENDERING MOBILE CAROUSEL:', error);
                                return <div>Error rendering mobile carousel</div>;
                              }
                            } else {
                              return (
                                <div className="overflow-x-auto overflow-y-hidden p-2">
                                  <div className="flex gap-2 min-w-max">
                                     {friendItems
                                       .filter(item => !rejectedFriendItems.includes(item.id) && !pairRejectedFriendIds.has(item.id))
                                       .map((item) => (
                                   <div key={item.id} className="flex-shrink-0 w-64 transform transition-all duration-200">
                                     <ItemCard
                                       id={item.id}
                                       name={item.name}
                                       image={item.image}
                                       liked={item.liked}
                                       onSelect={() => handleOpenItemModal(item)}
                                       onLike={(id, global) => handleLikeFriendItem(id, global)}
                                       onReject={(id, global) => handleRejectFriendItem(id, global)}
                                       onReport={handleReport}
                                       showLikeButton={true}
                                     />
                                   </div>
                                 ))}
                               </div>
                             </div>
                              );
                            }
                           })()
                        }
                      </div>
                   </TabsContent>
                 </Tabs>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔐</div>
                <h2 className="text-2xl font-bold mb-2">SwapsCircle</h2>
                <p className="text-gray-600">
                  {activeAuthTab === "login" 
                    ? "Sign in to your account to continue" 
                    : "Create an account to get started"}
                </p>
              </div>
              
              <Tabs
                value={activeAuthTab}
                onValueChange={setActiveAuthTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Explore Item Modal */}
      <ExploreItemModal
        open={modalOpen}
        item={selectedItem}
        onClose={handleCloseModal}
        liked={selectedItem?.liked}
        onLike={() => selectedItem && handleLikeFriendItem(selectedItem.id)}
        onNavigatePrev={navigateToPrevFriendItem}
        onNavigateNext={navigateToNextFriendItem}
        currentIndex={currentFriendItemIndex}
        totalItems={displayedFriendItems.length}
        onReport={(id) => handleReport(id)}
      />
      
      {/* Report Item Modal */}
      <ReportItemModal
        isOpen={reportModalOpen}
        onClose={handleCloseReportModal}
        itemId={itemToReport || ''}
        itemName={
          itemToReport 
            ? (friendItems.find(item => item.id === itemToReport)?.name || 
               userItems.find(item => item.id === itemToReport)?.name || 
               'Unknown Item')
            : ''
        }
      />

      {/* Support Chat */}
      <SupportChat />
    </div>
  );
};

export default Test;
