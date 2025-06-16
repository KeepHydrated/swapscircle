
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
        const matchingItems = await findMatchingItems(selectedItem, user.id);
        
        // Check liked status for each match
        const matchesWithLikedStatus = await Promise.all(
          matchingItems.map(async (match) => {
            const liked = await isItemLiked(match.id);
            return { ...match, liked };
          })
        );

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
