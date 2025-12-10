UPDATE items 
SET image_urls = ARRAY[
  'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
  'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800'
]
WHERE id = 'c5d82e36-ec10-4094-a694-c0e02891e2e6';