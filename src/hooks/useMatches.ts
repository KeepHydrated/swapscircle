import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Item, MatchItem } from '@/types/item';
import { findMatchingItems } from '@/services/matchingService';
import { isItemLiked } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

export function useMatches(selectedItem: Item | null, location: string = 'nationwide', perspectiveUserId?: string) {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, supabaseConfigured } = useAuth();

  const refreshMatches = () => {
    setMatches([]); // Clear existing matches
    setRefreshTrigger(prev => prev + 1);
  };

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

      setLoading(true);
      setError(null);

      try {
        const matchingItems = await findMatchingItems(selectedItem, user.id, location, perspectiveUserId);
        setMatches(matchingItems);
      } catch (e: any) {
        setError(e.message || "Failed to fetch matches.");
        setMatches([]);
      }
      setLoading(false);
    }

    fetchMatches();
  }, [selectedItem?.id, user?.id, supabaseConfigured, location, refreshTrigger, perspectiveUserId]);

  return { matches, loading, error, refreshMatches };
}