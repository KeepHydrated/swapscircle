
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, supabaseConfigured } = useAuth();

  const refreshMatches = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    async function fetchMatches() {
      console.log('🔍 CURRENT USER DEBUG:', {
        userId: user?.id,
        userEmail: user?.email,
        userObject: user,
        selectedItemName: selectedItem?.name,
        location
      });
      
      if (!selectedItem || !user || !supabaseConfigured) {
        console.log('DEBUG: Early return from fetchMatches - missing required data', {
          hasSelectedItem: !!selectedItem,
          selectedItemName: selectedItem?.name,
          hasUser: !!user,
          userId: user?.id,
          supabaseConfigured
        });
        setMatches([]);
        setLoading(false);
        return;
      }

      console.log('DEBUG: Starting fetchMatches...');
      setLoading(true);
      setError(null);

      try {
        console.log('Debug - Fetching matches for item:', selectedItem.name, 'User:', user.id, 'Location:', location);
        const matchingItems = await findMatchingItems(selectedItem, user.id, location);
        
        // Return matches as-is, let useMatchActions handle the liked status
        console.log('Debug - Final matches:', matchingItems);
        setMatches(matchingItems);
      } catch (e: any) {
        setError(e.message || "Failed to fetch matches.");
        setMatches([]);
      }
      setLoading(false);
    }

    fetchMatches();
  }, [selectedItem, user, supabaseConfigured, location, refreshTrigger]);

  return { matches, loading, error, refreshMatches };
}
