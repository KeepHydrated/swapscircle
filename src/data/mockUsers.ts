
import { ProfileUser, CompletedTrade } from "@/types/profile";
import { MatchItem } from "@/types/item";

// Mock users data
export const mockUsers: Record<string, ProfileUser> = {
  "user1": {
    id: "user1",
    name: "Jessica Parker",
    description: "Vintage clothing enthusiast and collector of rare books. Always looking for unique fashion pieces from the 70s and 80s, as well as first edition novels.",
    rating: 4,
    reviewCount: 87,
    location: "Seattle, WA",
    memberSince: "2023",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    friendStatus: "none"
  },
  "user2": {
    id: "user2",
    name: "Marcus Thompson",
    description: "Tech gadget collector focusing on retro gaming and audio equipment. Looking to expand my collection of vintage consoles and high-quality headphones.",
    rating: 5,
    reviewCount: 134,
    location: "Austin, TX",
    memberSince: "2021",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    friendStatus: "pending"
  }
};

// Mock items for trade
export const mockUserItems: Record<string, MatchItem[]> = {
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
export const mockUserTrades: Record<string, CompletedTrade[]> = {
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
