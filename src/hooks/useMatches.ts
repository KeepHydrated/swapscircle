
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Item, MatchItem } from '@/types/item';
import { findMatchingItems } from '@/services/matchingService';
import { isItemLiked } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

export function useMatches(selectedItem: Item | null, location: string = 'nationwide') {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, supabaseConfigured } = useAuth();

  useEffect(() => {
    async function fetchMatches() {
      console.log('Debug - fetchMatches called with:', { selectedItem: selectedItem?.name, user: user?.id, location });
      if (!selectedItem || !user || !supabaseConfigured) {
        setMatches([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Debug - Fetching matches for item:', selectedItem.name, 'User:', user.id, 'Location:', location);
        const matchingItems = await findMatchingItems(selectedItem, user.id, location);
        
        // Since findMatchingItems already filters out liked items,
        // all returned items should have liked: false
        const matchesWithLikedStatus = matchingItems.map(match => ({
          ...match,
          liked: false
        }));

        console.log('Debug - Final matches with liked status:', matchesWithLikedStatus);
        // Only update matches after all data is ready
        setMatches(matchesWithLikedStatus);
      } catch (e: any) {
        setError(e.message || "Failed to fetch matches.");
        setMatches([]);
      }
      setLoading(false);
    }

    fetchMatches();
    
    // Set up real-time subscription to refresh when any items change
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        (payload) => {
          console.log('Items table changed, refetching matches...', payload);
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedItem, user, supabaseConfigured, location]);

  return { matches, loading, error };
}
