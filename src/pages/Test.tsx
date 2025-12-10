
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, LogIn } from 'lucide-react';
import Header from '@/components/layout/Header';
import HeaderLocationSelector from '@/components/layout/HeaderLocationSelector';
import FriendItemsCarousel from '@/components/profile/FriendItemsCarousel';
import { MobileFriendsCarousel } from '@/components/profile/MobileFriendsCarousel';

import { useIsMobile } from '@/hooks/use-mobile';
import SwipeCards from '@/components/ui/swipe-cards';
import SEOHelmet from '@/components/SEOHelmet';
import { TrendingItems } from '@/components/trending/TrendingItems';

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

  // Handle login redirect
  const handleLogin = () => {
    if (!supabaseConfigured) {
      toast.error("Supabase is not configured. Please add environment variables to enable authentication.", {
        duration: 5000,
      });
      return;
    }
    // Scroll to top to show login/register form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
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
      <SEOHelmet 
        title="Trade & Swap Items Locally - SwapsCircle"
        description="Discover and trade items with friends and local community. Match with other traders, swap items you want for items you have. Join SwapsCircle today!"
        keywords="local trading, swap items, trade marketplace, item exchange, community trading, bartering platform"
      />
      <Header />
      <div className="flex-1 pt-20 px-4 pb-4 md:px-6 md:pb-6 flex flex-col h-full">

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
                    <div 
                      className="overflow-x-auto overflow-y-hidden p-2"
                      style={{ touchAction: 'pan-x' }}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
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

              {/* Right Column - Matches */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Your Matches</h2>
                  <a href="/" className="text-sm text-primary hover:underline">View all</a>
                </div>
                
                {selectedUserItem ? (
                  <Matches
                    matches={matches}
                    selectedItemName={selectedUserItem.name}
                    selectedItemId={selectedUserItem.id}
                    onUndoAvailable={handleMatchesUndoAvailable}
                    loading={matchesLoading}
                    viewMode="slider"
                    location={selectedLocation}
                  />
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground py-8">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-base font-medium mb-1">No item selected</p>
                      <p className="text-sm">Select an item to see matches</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Preview content for non-logged in users - matches logged-in layout
            <div className="grid grid-cols-1 gap-6 h-full">
              {/* Your Items Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="overflow-x-auto overflow-y-hidden p-2">
                  <div className="flex gap-2 min-w-max">
                    {[
                      { name: "Kayak with Paddle", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5" },
                      { name: "Apple MacBook ...", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8" },
                      { name: "Office Desk with...", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2" },
                      { name: "Yamaha Keyboard", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4" },
                      { name: "Abstract Canvas...", image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262" },
                      { name: "Vintage Camera", image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-shrink-0 w-32">
                        <div className={`bg-white rounded-lg border-2 overflow-hidden transition-all ${idx === 0 ? 'border-blue-500' : 'border-gray-200'}`}>
                          <div className="aspect-square relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-2 text-center">
                            <p className="text-xs font-medium truncate">{item.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matches Section */}
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Your Matches</h2>
                  <a href="/" className="text-sm text-primary hover:underline">View all</a>
                </div>
                
                <div className="overflow-x-auto overflow-y-hidden">
                  <div className="flex gap-3 pb-4">
                    {[
                      { name: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91", priceMin: 300, priceMax: 400, condition: "Good" },
                      { name: "Digital Camera - Canon", image: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b", priceMin: 450, priceMax: 600, condition: "Excellent" },
                      { name: "Electric Guitar - Fender", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d", priceMin: 500, priceMax: 700, condition: "Good" },
                      { name: "Standing Desk - Adjustable", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2", priceMin: 200, priceMax: 350, condition: "Like New" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-shrink-0 w-64 sm:w-72 md:w-80">
                        <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                          <div className="relative aspect-[4/3]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                              </button>
                              <button className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110">
                                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                              </button>
                            </div>
                            <div className="absolute bottom-2 right-2">
                              <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden bg-background">
                                <img src="https://images.unsplash.com/photo-1532298229144-0ec0c57515c7" alt="Your item" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-base font-semibold text-foreground mb-1 truncate">{item.name}</h3>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">
                                ${item.priceMin} - ${item.priceMax}
                              </p>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                {item.condition}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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

    </div>
  );
};

export default Test;
