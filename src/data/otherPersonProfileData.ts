
import { Item } from '@/types/item';
import { myAvailableItems } from '@/data/mockMyItems';
import { mockUserItems } from '@/data/mockUsers';
import { myFriends } from '@/data/mockMyFriends';

// Create a different profile for this page
export const otherPersonProfileData = {
  name: "Jordan Taylor",
  description: "Tech gadget enthusiast with a passion for photography. I collect vintage cameras and modern tech accessories. Looking to trade with fellow collectors who appreciate quality items!",
  rating: 4.8,
  reviewCount: 92,
  location: "Seattle, WA",
  memberSince: "2023",
  friendCount: myFriends.length
};

// Additional dummy items to show more items
const additionalItems: Item[] = [
  { 
    id: 'add1', 
    name: 'Vintage Record Collection', 
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04',
    category: 'music'
  },
  { 
    id: 'add2', 
    name: 'Smart Home Hub', 
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827',
    category: 'electronics'
  },
  { 
    id: 'add3', 
    name: 'Gaming Console', 
    image: 'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42',
    category: 'gaming'
  },
  { 
    id: 'add4', 
    name: 'Polaroid Camera', 
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
    category: 'photography'
  },
  { 
    id: 'add5', 
    name: 'Designer Watch', 
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3',
    category: 'fashion'
  },
  { 
    id: 'add6', 
    name: 'Film Camera', 
    image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848',
    category: 'photography'
  },
];

// Combine items from multiple sources
export const getOtherPersonItems = (): Item[] => {
  // Combine items from myAvailableItems, mockUserItems, and additionalItems to get more items
  return [...myAvailableItems, ...Object.values(mockUserItems).flat(), ...additionalItems].slice(0, 16);
};
