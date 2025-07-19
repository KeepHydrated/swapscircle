
import React, { useState, useEffect } from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ItemDetailsProps {
  name: string;
  showProfileInfo?: boolean;
  profileData?: {
    username: string;
    avatar_url?: string;
    created_at: string;
    location?: string;
    id?: string;
  };
}

const ItemDetails = ({ name, showProfileInfo = true, profileData }: ItemDetailsProps) => {
  console.log('ItemDetails rendered with:', { name, showProfileInfo, profileData });
  const [reviewData, setReviewData] = useState({ rating: 0.0, reviewCount: 0 });

  // Fetch reviews for the specific user when profile data changes
  useEffect(() => {
  const fetchUserReviews = async () => {
      console.log('fetchUserReviews called with profileData:', profileData);
      if (!profileData?.id) {
        console.log('No profile ID found, setting default review data');
        setReviewData({ rating: 0.0, reviewCount: 0 });
        return;
      }

      try {
        console.log('Fetching reviews for user ID:', profileData.id);
        // For now, we'll use placeholder data since reviews aren't implemented yet
        // Once you have a reviews table, you can fetch real reviews here:
        // const { data: reviews } = await supabase
        //   .from('reviews')
        //   .select('rating')
        //   .eq('reviewed_user_id', profileData.id);
        
        // For now, set to 0 until reviews are implemented
        setReviewData({ rating: 0.0, reviewCount: 0 });
        console.log('Set review data to 0 for user:', profileData.username);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviewData({ rating: 0.0, reviewCount: 0 });
      }
    };

    fetchUserReviews();
  }, [profileData?.id]);
  
  // Create star display - handle 0 rating case
  const fullStars = Math.floor(reviewData.rating);
  const hasHalfStar = reviewData.rating % 1 >= 0.5;
  const stars = reviewData.rating === 0 ? '☆☆☆☆☆' : '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  
  return (
    <div className="p-3">
      <h2 className="text-lg font-bold text-gray-900 mb-2 truncate">
        {name || "Selected Item"}
      </h2>
      
      <div className="mb-3">
        <p className="text-gray-700 text-xs mt-1 bg-gray-50 p-2 rounded-md">
          Like new condition. This item has been gently used and well maintained. Perfect for anyone looking for a high-quality {name?.toLowerCase() || "item"} at a great value.
        </p>
      </div>
      
      <hr className="mb-2" />
      
      {/* Feature badges with price badge moved to the right */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
            <Check className="w-2 h-2 text-green-600" />
          </div>
          <span className="text-gray-800 text-xs">Brand New</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-1">
            <DollarSign className="w-2 h-2 text-green-600" />
          </div>
          <span className="text-gray-800 text-xs">100 - 250</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-1">
            <Home className="w-2 h-2 text-blue-600" />
          </div>
          <span className="text-gray-800 text-xs">Home & Garden</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mr-1">
            <Utensils className="w-2 h-2 text-purple-600" />
          </div>
          <span className="text-gray-800 text-xs">Kitchen Appliances</span>
        </div>
      </div>
      
      {/* Owner Profile Information - Only show if showProfileInfo is true */}
      {showProfileInfo && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <Link to="/other-person-profile" className="block">
            <div className="flex flex-col">
              {/* Avatar and name/rating in the same row */}
              <div className="flex items-center mb-2">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={profileData?.avatar_url || undefined} />
                  <AvatarFallback>{profileData?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                
                {/* Name and rating to the right of avatar */}
                <div>
                  <h3 className="text-xs font-semibold">{profileData?.username || 'Unknown User'}</h3>
                  <div className="flex text-amber-400 text-xs">{stars} <span className="text-gray-500 ml-1">({reviewData.reviewCount})</span></div>
                </div>
              </div>
            </div>
          </Link>
            
          {/* User details under the profile, left-aligned */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 pl-0">
            <div className="flex items-center">
              <Calendar className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
              <span>Since {profileData?.created_at ? new Date(profileData.created_at).getFullYear() : '2023'}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
              <span>{profileData?.location || '2.3 mi away'}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
              <span>~1 hour</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
