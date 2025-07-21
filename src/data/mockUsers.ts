import { ProfileUser } from "@/types/profile";
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
  },
  // Add profiles for friends in the myFriends list
  "friend1": {
    id: "friend1",
    name: "Jessica L.",
    description: "Vintage collector and trading enthusiast. I specialize in antique jewelry and rare books.",
    rating: 4.5,
    reviewCount: 56,
    location: "Portland, OR",
    memberSince: "2022",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    friendStatus: "accepted"
  },
  "friend2": {
    id: "friend2",
    name: "Marcus T.",
    description: "Tech enthusiast and collector of rare electronics. Always looking for vintage audio equipment.",
    rating: 4.8,
    reviewCount: 42,
    location: "San Francisco, CA",
    memberSince: "2023",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    friendStatus: "accepted"
  },
  "friend3": {
    id: "friend3",
    name: "Sophia R.",
    description: "Art collector and vintage fashion enthusiast. I love trading unique pieces and discovering new artists.",
    rating: 4.9,
    reviewCount: 78,
    location: "New York, NY",
    memberSince: "2021",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    friendStatus: "accepted"
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
  ],
  // Add items for friends
  "friend1": [
    {
      id: "item7",
      name: "Antique Pearl Necklace",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
      liked: false
    },
    {
      id: "item8",
      name: "Vintage Romance Novel Collection",
      image: "https://images.unsplash.com/photo-1490633874781-1c63cc424610",
      liked: true
    }
  ],
  "friend2": [
    {
      id: "item9",
      name: "Retro Walkman",
      image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc",
      liked: false
    },
    {
      id: "item10",
      name: "Vintage Turntable",
      image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1",
      liked: true
    }
  ],
  "friend3": [
    {
      id: "item11",
      name: "60s Designer Dress",
      image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956",
      liked: false
    },
    {
      id: "item12",
      name: "Rare Art Print",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119",
      liked: true
    }
  ]
};

