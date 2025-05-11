
import React from 'react';
import { Star, MapPin, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  profile: {
    name: string;
    description: string;
    rating: number;
    reviewCount: number;
    location: string;
    memberSince: string;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={20}
          fill={i < rating ? "#FFD700" : "none"}
          color={i < rating ? "#FFD700" : "#D3D3D3"}
          className="inline-block"
        />
      );
    }
    return stars;
  };

  return (
    <div className="flex flex-col md:flex-row p-6 bg-white border-b">
      <div className="flex-shrink-0 mr-6 flex justify-center md:justify-start mb-4 md:mb-0">
        <Avatar className="w-32 h-32 border-4 border-primary">
          <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&auto=format&fit=crop" />
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow">
        <h1 className="text-2xl font-bold text-gray-800 text-center md:text-left">{profile.name}</h1>
        <div className="my-2 flex justify-center md:justify-start">
          {renderStars(profile.rating)}
          <span className="ml-2 text-gray-600">{profile.rating}.0 ({profile.reviewCount} reviews)</span>
        </div>
        <div className="text-sm text-gray-500 mb-2 flex justify-center md:justify-start flex-wrap gap-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{profile.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Member since {profile.memberSince}</span>
          </div>
        </div>
        <p className="mt-4 text-gray-700 leading-relaxed text-center md:text-left">{profile.description}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
