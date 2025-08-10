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
    console.log('🔥 FORCING MATCHES REFRESH');
    setMatches([]); // Clear existing matches
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    console.error('🚨🚨🚨 USE MATCHES EFFECT TRIGGERED 🚨🚨🚨');
    console.error('Dependencies:', { 
      selectedItemId: selectedItem?.id, 
      userId: user?.id, 
      supabaseConfigured, 
      location, 
      refreshTrigger, 
      perspectiveUserId 
    });
    
    async function fetchMatches() {
      console.error('🚨🚨🚨 FETCH MATCHES FUNCTION CALLED 🚨🚨🚨');
      
      console.error('🚨 DETAILED CONDITIONS CHECK:');
      console.error('🚨 selectedItem:', selectedItem);
      console.error('🚨 selectedItem?.id:', selectedItem?.id);
      console.error('🚨 selectedItem?.name:', selectedItem?.name);
      console.error('🚨 user:', user);
      console.error('🚨 user?.id:', user?.id);
      console.error('🚨 supabaseConfigured:', supabaseConfigured);
      
      if (!selectedItem) {
        console.error('🚨 EARLY RETURN: selectedItem is null/undefined');
        setMatches([]);
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.error('🚨 EARLY RETURN: user is null/undefined');  
        setMatches([]);
        setLoading(false);
        return;
      }
      
      if (!supabaseConfigured) {
        console.error('🚨 EARLY RETURN: supabaseConfigured is false');
        setMatches([]);
        setLoading(false);
        return;
      }

      console.error('🎉 ALL CONDITIONS PASSED - CALLING MATCHING SERVICE!');
      console.log('Debug - Fetching matches for item:', selectedItem.name, 'User:', user.id, 'Location:', location);
      
      setLoading(true);
      setError(null);

      try {
        const matchingItems = await findMatchingItems(selectedItem, user.id, location, perspectiveUserId);
        
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
  }, [selectedItem?.id, user?.id, supabaseConfigured, location, refreshTrigger, perspectiveUserId]);

  return { matches, loading, error, refreshMatches };
}