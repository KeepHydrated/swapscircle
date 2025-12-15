import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Item, MatchItem } from '@/types/item';
import { findMatchingItems } from '@/services/matchingService';
import { isItemLiked } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { useItemsInActiveTrades } from '@/hooks/useItemsInActiveTrades';

export function useMatches(selectedItem: Item | null, location: string = 'nationwide', perspectiveUserId?: string) {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, supabaseConfigured } = useAuth();
  const { itemsInActiveTrades } = useItemsInActiveTrades();

  const refreshMatches = () => {
    setMatches([]); // Clear existing matches
    setRefreshTrigger(prev => prev + 1);
  };

  // Add debouncing to prevent rapid consecutive calls
  const [lastFetchKey, setLastFetchKey] = useState<string>('');

  useEffect(() => {
    async function fetchMatches() {
      if (!selectedItem) {
        setMatches([]);
        setLoading(false);
        return;
      }
      
      if (!user) {
        setMatches([]);
        setLoading(false);
        return;
      }
      
      if (!supabaseConfigured) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // Create a unique key for this fetch to avoid duplicate calls
      const fetchKey = `${selectedItem.id}-${user.id}-${location}-${perspectiveUserId || ''}-${refreshTrigger}`;
      if (fetchKey === lastFetchKey) {
        return; // Skip if we just made this exact call
      }
      
      setLastFetchKey(fetchKey);
      setLoading(true);
      setError(null);

      try {
        const matchingItems = await findMatchingItems(selectedItem, user.id, location, perspectiveUserId);
        // Filter out items that are in active trades
        const filteredMatches = matchingItems.filter(item => !itemsInActiveTrades.has(item.id));
        console.log('🎯 useMatches: Received matches:', filteredMatches.length, filteredMatches.slice(0, 3).map(m => m.name));
        setMatches(filteredMatches);
        console.log('🎯 useMatches: State updated with matches');
      } catch (e: any) {
        console.error('❌ useMatches: Error fetching matches:', e);
        setError(e.message || "Failed to fetch matches.");
        setMatches([]);
      }
      setLoading(false);
    }

    fetchMatches();
  }, [selectedItem?.id, user?.id, supabaseConfigured, location, refreshTrigger, perspectiveUserId, lastFetchKey]);

  return { matches, loading, error, refreshMatches };
}