
import { Item } from '@/types/item';

export const myAvailableItems: Item[] = [
  {
    id: "1",
    name: "Super Nintendo Entertainment System (SNES)",
    description: "Original SNES console in excellent condition. Includes two controllers, power adapter, and AV cable. Some minor cosmetic wear but works perfectly.",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    condition: "Excellent",
    category: "Gaming",
    priceRange: "$100-$150"
  },
  {
    id: "2",
    name: "Vintage Led Zeppelin Vinyl Collection",
    description: "Complete set of first pressing Led Zeppelin vinyl records. All sleeves in near-mint condition. A must-have for any serious collector.",
    image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc",
    condition: "Near Mint",
    category: "Music",
    priceRange: "$200-$300"
  },
  {
    id: "3",
    name: "Limited Edition Gundam Figurine",
    description: "Rare 1995 limited edition Gundam Wing Zero Custom figurine, still in original packaging. Only minor wear on the box corners.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    condition: "Good",
    category: "Collectibles",
    priceRange: "$75-$125"
  },
  {
    id: "4",
    name: "Polaroid SX-70 Camera",
    description: "Vintage Polaroid SX-70 instant camera from the 1970s. Recently serviced and in full working condition. Includes original leather case.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    condition: "Good",
    category: "Photography",
    priceRange: "$120-$180"
  },
  {
    id: "5",
    name: "Antique Brass Compass",
    description: "19th century maritime brass compass with original wooden case. Beautiful patina and fully functional. A true collector's piece.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    condition: "Antique",
    category: "Collectibles",
    priceRange: "$250-$350"
  }
];
