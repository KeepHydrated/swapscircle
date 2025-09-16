
import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface UserInfoSectionProps {
  profileData?: {
    username: string;
    avatar_url?: string;
    created_at: string;
    location?: string;
    id?: string;
  };
  reviewData?: {
    rating: number;
    reviewCount: number;
  };
}

const UserInfoSection: React.FC<UserInfoSectionProps> = ({ profileData, reviewData = { rating: 0, reviewCount: 0 } }) => {
  const stars = reviewData.rating === 0 ? '☆☆☆☆☆' : '★'.repeat(Math.floor(reviewData.rating)) + '☆'.repeat(5 - Math.floor(reviewData.rating));
  
  return (
    <div className="mt-4">
      <div className="flex flex-col">
        {/* Profile image and name/rating in the same row */}
        <div className="flex items-center mb-3">
          <img 
            src={profileData?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop"}
            alt="Owner" 
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          
          {/* Name and rating to the right of image */}
          <div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-sm font-semibold">{profileData?.username || 'Emma Wilson'}</h3>
              {profileData?.location && (
                (() => {
                  // Check if it's coordinates (contains both comma and periods)
                  const isCoordinates = profileData.location.includes(',') && profileData.location.includes('.');
                  if (isCoordinates) return null;
                  
                  // Check if location contains letters (city name)
                  const hasLetters = /[a-zA-Z]/.test(profileData.location);
                  if (hasLetters) {
                    // For "City, State" format, show both
                    const parts = profileData.location.split(',');
                    if (parts.length >= 2) {
                      const city = parts[0].trim();
                      const state = parts[1].trim();
                      return (
                        <span className="text-xs text-gray-500 leading-none">
                          {city}, {state}
                        </span>
                      );
                    } else {
                      // Just city name
                      return (
                        <span className="text-xs text-gray-500 leading-none">
                          {profileData.location.trim()}
                        </span>
                      );
                    }
                  }
                  
                  // For zipcode-only, map common ones to cities and states
                  const zipcodeToLocation: Record<string, string> = {
                    '78212': 'San Antonio, TX',
                    '10001': 'New York, NY',
                    '90210': 'Beverly Hills, CA',
                    '60601': 'Chicago, IL',
                    '94102': 'San Francisco, CA'
                  };
                  
                  const cityState = zipcodeToLocation[profileData.location.trim()];
                  if (cityState) {
                    return (
                      <span className="text-xs text-gray-500 leading-none">
                        {cityState}
                      </span>
                    );
                  }
                  
                  return null;
                })()
              )}
            </div>
            <div className="flex text-amber-400 text-xs">{stars} <span className="text-gray-500 ml-1">({reviewData.reviewCount})</span></div>
          </div>
        </div>
        
        {/* User details under the profile, left-aligned */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 pl-0">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>Since {profileData?.created_at ? new Date(profileData.created_at).getFullYear() : '2023'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>~1 hour</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoSection;
