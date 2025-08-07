import { Item } from '@/types/item';

// Mock user for demo mode
export const mockDemoUser = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  name: 'Demo User',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
};

// Mock items for demo mode
export const mockItems: Item[] = [
  {
    id: '1',
    name: 'iPhone 13 Pro',
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=400&fit=crop',
    category: 'Electronics',
    condition: 'Like New',
    description: 'Barely used iPhone 13 Pro in excellent condition',
    tags: ['Apple', 'Smartphone', 'iOS'],
    image_urls: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1580522154071-c6ca47aae43c?w=400&h=400&fit=crop'
    ]
  },
  {
    id: '2',
    name: 'Nike Air Jordan 1',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'Fashion',
    condition: 'Good',
    description: 'Classic Air Jordan 1 sneakers, size 10',
    tags: ['Nike', 'Sneakers', 'Basketball'],
    image_urls: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
    ]
  },
  {
    id: '3',
    name: 'MacBook Pro 14"',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
    category: 'Electronics',
    condition: 'Brand New',
    description: 'Brand new MacBook Pro with M2 chip',
    tags: ['Apple', 'Laptop', 'M2']
  },
  {
    id: '4',
    name: 'Vintage Camera',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop',
    category: 'Electronics',
    condition: 'Fair',
    description: 'Classic film camera from the 80s',
    tags: ['Camera', 'Vintage', 'Film']
  }
];

// Mock user items (subset of items that belong to demo user)
export const mockUserItems: Item[] = [
  {
    id: '5',
    name: 'Gaming Headset',
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop',
    category: 'Electronics',
    condition: 'Like New',
    description: 'High-quality gaming headset with mic',
    tags: ['Gaming', 'Audio', 'Headset'],
    image_url: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop',
    image_urls: [],
    lookingForCategories: ['Electronics'],
    lookingForConditions: ['Like New', 'Brand New'],
    lookingForDescription: 'Looking for gaming accessories',
    priceRangeMin: 50,
    priceRangeMax: 200
  },
  {
    id: '6',
    name: 'Designer Watch',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
    category: 'Fashion',
    condition: 'Good',
    description: 'Elegant designer watch, barely worn',
    tags: ['Watch', 'Fashion', 'Luxury'],
    image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
    image_urls: [],
    lookingForCategories: ['Fashion', 'Electronics'],
    lookingForConditions: ['Good', 'Like New'],
    lookingForDescription: 'Looking for accessories or gadgets',
    priceRangeMin: 100,
    priceRangeMax: 500
  }
];

// Mock notifications for demo mode
export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'trade' as const,
    title: 'New Match!',
    content: 'Someone is interested in your Gaming Headset',
    isRead: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    relatedId: '5'
  },
  {
    id: 'notif-2',
    type: 'friend' as const,
    title: 'Friend Request',
    content: 'John Doe sent you a friend request',
    isRead: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    relatedId: 'user-123'
  },
  {
    id: 'notif-3',
    type: 'message' as const,
    title: 'New Message',
    content: 'You have a new message about the Designer Watch',
    isRead: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    relatedId: '6'
  }
];