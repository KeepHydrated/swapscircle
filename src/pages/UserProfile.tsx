
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
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Profile Page Loading Test</h1>
        <p>If you can see this, the route is working</p>
      </div>
    </MainLayout>
  );
};

export default UserProfile;

