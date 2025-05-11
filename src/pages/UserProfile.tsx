
import React, { useState } from 'react';
import { Star, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ItemCard from '@/components/items/ItemCard';
import { MatchItem } from '@/types/item';

// Mock user data - in a real app this would come from an API call using the userId
const mockUsers = {
  "user1": {
    id: "user1",
    name: "Jessica Parker",
    description: "Vintage clothing enthusiast and collector of rare books. Always looking for unique fashion pieces from the 70s and 80s, as well as first edition novels.",
    rating: 4,
    reviewCount: 87,
    location: "Seattle, WA",
    memberSince: "2023",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  "user2": {
    id: "user2",
    name: "Marcus Thompson",
    description: "Tech gadget collector focusing on retro gaming and audio equipment. Looking to expand my collection of vintage consoles and high-quality headphones.",
    rating: 5,
    reviewCount: 134,
    location: "Austin, TX",
    memberSince: "2021",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
  }
};

// Mock items for trade
const mockUserItems = {
  "user1": [
    {
      id: "item1",
      name: "Vintage Leather Jacket",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5",
      liked: false
    },
    {
      id: "item2",
      name: "First Edition Hemingway",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      liked: false
    },
    {
      id: "item3",
      name: "80s Sequin Dress",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae",
      liked: true
    }
  ],
  "user2": [
    {
      id: "item4",
      name: "SEGA Genesis Console",
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
      liked: false
    },
    {
      id: "item5",
      name: "Vintage Headphones",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      liked: true
    },
    {
      id: "item6",
      name: "Retro Game Collection",
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8",
      liked: false
    }
  ]
};

// Mock completed trades
const mockUserTrades = {
  "user1": [
    {
      id: 101,
      name: "Designer Handbag",
      tradedFor: "Vintage Camera",
      tradedWith: "Michael R.",
      tradeDate: "April 10, 2025",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3"
    },
    {
      id: 102,
      name: "Antique Brooch",
      tradedFor: "First Edition Book",
      tradedWith: "Sophia T.",
      tradeDate: "March 22, 2025",
      image: "https://images.unsplash.com/photo-1586878341523-7c1ef1a0e9c0"
    }
  ],
  "user2": [
    {
      id: 103,
      name: "Nintendo 64 Console",
      tradedFor: "Bluetooth Speaker",
      tradedWith: "Alex P.",
      tradeDate: "May 5, 2025",
      image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e"
    },
    {
      id: 104,
      name: "Record Player",
      tradedFor: "Gaming Headset",
      tradedWith: "Emma L.",
      tradeDate: "April 17, 2025",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc"
    }
  ]
};

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  // Default to user1 if no userId is provided
  const safeUserId = userId || "user1";
  
  // Get user data
  const profile = mockUsers[safeUserId as keyof typeof mockUsers];
  
  // Get user's items for trade
  const [availableItems, setAvailableItems] = useState<MatchItem[]>(
    mockUserItems[safeUserId as keyof typeof mockUserItems] || []
  );
  
  // Get user's completed trades
  const completedTrades = mockUserTrades[safeUserId as keyof typeof mockUserTrades] || [];

  const handleGoBack = () => {
    navigate(-1);
  };

  // Handle liking an item
  const handleLikeItem = (itemId: string) => {
    setAvailableItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );
    
    // Show a toast notification when liking an item
    const item = availableItems.find(item => item.id === itemId);
    if (item) {
      const action = item.liked ? "unliked" : "liked";
      toast(`You ${action} ${item.name}`);
    }
  };
  
  // Handle selecting an item (no action for now, just for the ItemCard props)
  const handleSelectItem = (itemId: string) => {
    // In a real app, this could navigate to an item detail page
    console.log(`Selected item: ${itemId}`);
  };

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

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-6">
          <h1>User not found</h1>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={handleGoBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{profile.name}'s Profile</h1>
          <p className="text-muted-foreground mt-1">View their items and trade history</p>
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row p-6 bg-white border-b">
          <div className="flex-shrink-0 mr-6 flex justify-center md:justify-start mb-4 md:mb-0">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
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

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="w-full flex rounded-none h-12 bg-white border-b justify-start">
            <TabsTrigger 
              value="available" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Items For Trade
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="flex-1 md:flex-none md:min-w-[180px] data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none data-[state=active]:shadow-none"
            >
              Completed Trades
            </TabsTrigger>
          </TabsList>

          {/* Available Items Tab Content */}
          <TabsContent value="available" className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {availableItems.map(item => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  isMatch={true}
                  liked={item.liked}
                  onSelect={handleSelectItem}
                  onLike={handleLikeItem}
                />
              ))}
            </div>
          </TabsContent>

          {/* Completed Trades Tab Content */}
          <TabsContent value="completed" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedTrades.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.tradedWith}</h3>
                        <p className="text-xs text-gray-500">{item.tradeDate}</p>
                      </div>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Completed
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row p-4">
                    <div className="w-full sm:w-1/2 pb-4 sm:pb-0 sm:pr-2 border-b sm:border-b-0 sm:border-r">
                      <div className="text-center mb-1 text-sm text-gray-600 font-medium">They traded:</div>
                      <div className="h-40 overflow-hidden mb-2">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm">{item.name}</p>
                    </div>
                    <div className="w-full sm:w-1/2 pt-4 sm:pt-0 sm:pl-2">
                      <div className="text-center mb-1 text-sm text-gray-600 font-medium">For:</div>
                      <div className="h-40 overflow-hidden mb-2">
                        <img 
                          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f" 
                          alt={item.tradedFor} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm">{item.tradedFor}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
