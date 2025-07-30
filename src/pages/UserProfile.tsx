
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Star, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; 
import { fetchUserReviews } from '@/services/authService';
import ItemsForTradeTab from '@/components/profile/ItemsForTradeTab';

import ReviewsTab from '@/components/profile/ReviewsTab';
import FriendsTab from '@/components/profile/FriendsTab';
import ProfileItemsManager from '@/components/profile/ProfileItemsManager';
import { MatchItem } from '@/types/item';

import { toast } from 'sonner';

const UserProfile: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: auth } = await supabase.auth.getSession();
        const user_id = auth?.session?.user?.id;
        
        console.log("Auth session:", auth?.session);
        console.log("User ID:", user_id);
        
        if (!user_id) {
          setDebugInfo({ error: "No user session found" });
          return;
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user_id)
          .maybeSingle();
          
        console.log("Profile query result:", { profile, profileError });
        
        setDebugInfo({
          userId: user_id,
          profile,
          profileError: profileError?.message,
          hasProfile: !!profile
        });
      } catch (e) {
        console.error("Error in checkAuth:", e);
        setDebugInfo({ error: e.message });
      }
    };
    
    checkAuth();
  }, []);

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profile Debug Info</h1>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Check the browser console for additional debug information.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;

