
import React from 'react';
import { Check, Home, Utensils, DollarSign, MapPin, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

interface ItemDetailsProps {
  name: string;
  showProfileInfo?: boolean;
  profileData?: {
    username: string;
    avatar_url?: string;
    created_at: string;
    location?: string;
  };
}

const ItemDetails = ({ name, showProfileInfo = true, profileData }: ItemDetailsProps) => {
  // Map usernames to their consistent profile review data
  const getUserReviewData = (username?: string) => {
    console.log('Getting review data for username:', username);
    
    if (!username) {
      return { rating: 4.0, reviewCount: 5 };
    }
    
    // Define consistent review data for known users
    const userReviewMap: { [key: string]: { rating: number; reviewCount: number } } = {
      "Jack": { rating: 0.0, reviewCount: 0 },
      "hhhhhh": { rating: 4.2, reviewCount: 18 },
      "Jordan Taylor": { rating: 4.8, reviewCount: 92 },
      "Alex Morgan": { rating: 4.7, reviewCount: 56 },
      "Sam Wilson": { rating: 4.5, reviewCount: 23 },
      "Casey Brown": { rating: 4.8, reviewCount: 41 },
      "Morgan Lee": { rating: 4.6, reviewCount: 29 },
      "Taylor Smith": { rating: 4.9, reviewCount: 67 }
    };
    
    // Return mapped data or generate consistent fallback
    const result = userReviewMap[username] || {
      rating: 4.0 + (username.length % 10) * 0.1,
      reviewCount: 10 + (username.length * 3) % 50
    };
    
    console.log('Review data for', username, ':', result);
    return result;
  };

  const reviewData = getUserReviewData(profileData?.username);
  
  // Create star display
  const fullStars = Math.floor(reviewData.rating);
  const hasHalfStar = reviewData.rating % 1 >= 0.5;
  const stars = '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '');
  
  console.log('ItemDetails - profileData:', profileData);
  console.log('ItemDetails - final stars:', stars, 'reviewCount:', reviewData.reviewCount);
  
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
