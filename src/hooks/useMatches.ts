
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Item, MatchItem } from '@/types/item';
import { findMatchingItems } from '@/services/matchingService';
import { isItemLiked } from '@/services/authService';

export function useMatches(selectedItem: Item | null) {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, supabaseConfigured } = useAuth();

  useEffect(() => {
    async function fetchMatches() {
      if (!selectedItem || !user || !supabaseConfigured) {
        setMatches([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Debug - Fetching matches for item:', selectedItem.name, 'User:', user.id);
        const matchingItems = await findMatchingItems(selectedItem, user.id);
        
        // Since findMatchingItems already filters out liked items,
        // all returned items should have liked: false
        const matchesWithLikedStatus = matchingItems.map(match => ({
          ...match,
          liked: false
        }));

        console.log('Debug - Final matches with liked status:', matchesWithLikedStatus);
        setMatches(matchesWithLikedStatus);
      } catch (e: any) {
        setError(e.message || "Failed to fetch matches.");
        setMatches([]);
      }
      setLoading(false);
    }

    fetchMatches();
  }, [selectedItem, user, supabaseConfigured]);

  return { matches, loading, error };
}
