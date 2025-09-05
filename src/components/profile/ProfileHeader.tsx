import React, { useMemo } from 'react';
import { Star, MapPin, Calendar, Users, Repeat, Link, X, Smartphone, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileHeaderProps {
  profile: {
    name: string;
    description: string;
    rating: number;
    reviewCount: number;
    memberSince: string;
    avatar_url?: string;
    tradesCompleted?: number;
  };
  onReviewsClick?: () => void;
  onFriendsClick?: () => void;
  friendCount?: number;
  userId?: string; // Add userId prop for shareable profile links
  isOwnProfile?: boolean; // Add prop to determine if this is the user's own profile
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  onReviewsClick, 
  onFriendsClick,
  friendCount = 0,
  userId,
  isOwnProfile = false
}) => {
  const isMobile = useIsMobile();
  console.log('[ProfileHeader] Component rendered with profile:', profile);
  console.log('[ProfileHeader] Profile name:', profile?.name);
  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const isFilled = i < Math.floor(rating);
      const isPartiallyFilled = i === Math.floor(rating) && rating % 1 !== 0;
      
      stars.push(
        <Star
          key={i}
          size={20}
          fill={isFilled || isPartiallyFilled ? "#FFD700" : "none"}
          color={isFilled || isPartiallyFilled ? "#FFD700" : "#D3D3D3"}
          className="inline-block"
        />
      );
    }
    return stars;
  };

  // Only use avatar_url if it exists and is not a placeholder, otherwise show initials
  const avatarSrc = useMemo(() => {
    console.log('[ProfileHeader] avatar_url:', profile.avatar_url);
    // Only use the avatar if it's a real uploaded image (not null/undefined/placeholder)
    return (profile.avatar_url && profile.avatar_url !== "/placeholder.svg") ? profile.avatar_url : undefined;
  }, [profile.avatar_url]);

  const handleCopyProfileLink = async () => {
    try {
      // Always use /other-person-profile?userId=${userId} for shareable links when userId is available
      // This ensures others can view the specific profile when they click the link
      const profileUrl = userId 
        ? `${window.location.origin}/other-person-profile?userId=${userId}`
        : `${window.location.origin}/profile`;
      
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy profile link:', error);
      toast.error('Failed to copy profile link');
    }
  };

  return (
    <div className="bg-white border-b">
      <div className={`flex justify-between items-start p-6 ${!isOwnProfile ? 'pt-20' : ''}`}>
        <div className="flex flex-col md:flex-row w-full">
          <div className="flex-shrink-0 mr-0 md:mr-6 flex justify-center mb-4 md:mb-0">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarImage 
                src={avatarSrc}
                alt={`${profile.name}'s avatar`}
                className="object-cover"
                loading="eager"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold w-full h-full flex items-center justify-center">
                {(() => {
                  console.log('[ProfileHeader] Generating initials for name:', profile.name);
                  const initials = profile.name?.split(" ").map(name => name[0]).join("").substring(0, 2).toUpperCase() || "JD";
                  console.log('[ProfileHeader] Generated initials:', initials);
                  return initials;
                })()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-grow text-center md:text-left">
            <div className="flex items-center justify-center md:justify-between">
              <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
              {/* Action buttons will be rendered here by parent component */}
              <div id="profile-action-buttons" className="hidden md:flex"></div>
            </div>
            <div className="my-2 flex justify-center md:justify-start">
              {renderStars(profile.rating)}
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto text-gray-600 hover:text-primary"
                onClick={onReviewsClick}
              >
                {profile.rating === 0 ? '0.0' : profile.rating} ({profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''})
              </Button>
            </div>
            <div className="text-sm text-gray-500 mb-2 flex justify-center md:justify-start flex-wrap gap-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Member since {profile.memberSince}</span>
              </div>
              {(profile.tradesCompleted || profile.tradesCompleted === 0) && (
                <div className="flex items-center">
                  <Repeat className="h-4 w-4 mr-1" />
                  <span>{profile.tradesCompleted} trade{profile.tradesCompleted !== 1 ? 's' : ''} completed</span>
                </div>
              )}
              {friendCount > 0 && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-gray-500 hover:text-primary"
                  onClick={onFriendsClick}
                >
                  <Users className="h-4 w-4 mr-1" />
                  <span>{friendCount} friends</span>
                </Button>
              )}
            </div>
            <p className="mt-4 text-gray-700 leading-relaxed">{profile.description}</p>
          </div>
        </div>
        {isOwnProfile && !isMobile && (
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyProfileLink}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Copy Profile Link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProfileHeader);