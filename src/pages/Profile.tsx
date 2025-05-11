
import React, { useState } from 'react';
import { Star, MapPin, Calendar } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const Profile: React.FC = () => {
  // Profile data
  const profile = {
    name: "Alex Morgan",
    description: "Vintage collector and trading enthusiast based in Portland. I specialize in retro gaming items, vinyl records, and collectible figurines. Always looking for fair trades and new additions to my collection!",
    rating: 5,
    reviewCount: 127,
    location: "Portland, OR",
    memberSince: "2022"
  };

  // Items for trade
  const availableItems = [
    {
      id: 1,
      name: "Super Nintendo Entertainment System (SNES)",
      description: "Original SNES console in excellent condition. Includes two controllers, power adapter, and AV cable. Some minor cosmetic wear but works perfectly.",
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952"
    },
    {
      id: 2,
      name: "Vintage Led Zeppelin Vinyl Collection",
      description: "Complete set of first pressing Led Zeppelin vinyl records. All sleeves in near-mint condition. A must-have for any serious collector.",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc"
    },
    {
      id: 3,
      name: "Limited Edition Gundam Figurine",
      description: "Rare 1995 limited edition Gundam Wing Zero Custom figurine, still in original packaging. Only minor wear on the box corners.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
    },
    {
      id: 4,
      name: "Polaroid SX-70 Camera",
      description: "Vintage Polaroid SX-70 instant camera from the 1970s. Recently serviced and in full working condition. Includes original leather case.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
    },
    {
      id: 5,
      name: "Antique Brass Compass",
      description: "19th century maritime brass compass with original wooden case. Beautiful patina and fully functional. A true collector's piece.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
    }
  ];

  // Completed trades
  const completedTrades = [
    {
      id: 101,
      name: "Vintage Typewriter",
      tradedFor: "Retro Gaming Console",
      tradedWith: "Jessica L.",
      tradeDate: "March 15, 2025",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
    },
    {
      id: 102,
      name: "1970s Record Player",
      tradedFor: "Comic Book Collection",
      tradedWith: "Marcus T.",
      tradeDate: "February 20, 2025",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
    },
    {
      id: 103,
      name: "Antique Pocket Watch",
      tradedFor: "Vintage Camera Lenses",
      tradedWith: "Sophia R.",
      tradeDate: "January 8, 2025",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
    },
    {
      id: 104,
      name: "Classic Film Camera",
      tradedFor: "Vinyl Record Collection",
      tradedWith: "Daniel M.",
      tradeDate: "December 5, 2024",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc"
    }
  ];

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
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and trading items</p>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
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
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                  </div>
                </Card>
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
                      <div className="text-center mb-1 text-sm text-gray-600 font-medium">I traded:</div>
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

export default Profile;
