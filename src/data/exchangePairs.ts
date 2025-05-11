
export interface ExchangePair {
  id: number;
  item1: { name: string; image: string };
  item2: { name: string; image: string };
  partnerId: string;
}

export const exchangePairs: ExchangePair[] = [
  { 
    id: 1, 
    item1: { name: "Acoustic Guitar", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" },
    item2: { name: "Keyboard", image: "/placeholder.svg" },
    partnerId: "1"
  },
  { 
    id: 2, 
    item1: { name: "Laptop", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f" },
    item2: { name: "Tablet", image: "/placeholder.svg" },
    partnerId: "2"
  },
  { 
    id: 3, 
    item1: { name: "Drone", image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc" },
    item2: { name: "Camera", image: "/placeholder.svg" },
    partnerId: "3"
  },
  { 
    id: 4, 
    item1: { name: "Smart Watch", image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26" },
    item2: { name: "Fitness Tracker", image: "/placeholder.svg" },
    partnerId: "4"
  },
  { 
    id: 5, 
    item1: { name: "Gaming Console", image: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42" },
    item2: { name: "VR Headset", image: "/placeholder.svg" },
    partnerId: "5"
  },
  { 
    id: 6, 
    item1: { name: "Turntable", image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334" },
    item2: { name: "Speakers", image: "/placeholder.svg" },
    partnerId: "3"
  },
  { 
    id: 7, 
    item1: { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" },
    item2: { name: "Earbuds", image: "/placeholder.svg" },
    partnerId: "1"
  },
  { 
    id: 8, 
    item1: { name: "DSLR Camera", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32" },
    item2: { name: "Camera Lens", image: "/placeholder.svg" },
    partnerId: "2"
  },
  { 
    id: 9, 
    item1: { name: "Vintage Radio", image: "https://images.unsplash.com/photo-1583452924150-ea5a6fc8a6a0" },
    item2: { name: "Bluetooth Speaker", image: "/placeholder.svg" },
    partnerId: "5"
  },
  { 
    id: 10, 
    item1: { name: "Record Player", image: "https://images.unsplash.com/photo-1593078166039-c9878df5c520" },
    item2: { name: "Vinyl Records", image: "/placeholder.svg" },
    partnerId: "4"
  },
  { 
    id: 11, 
    item1: { name: "Gaming Mouse", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7" },
    item2: { name: "Gaming Keyboard", image: "/placeholder.svg" },
    partnerId: "2"
  },
  { 
    id: 12, 
    item1: { name: "Projector", image: "https://images.unsplash.com/photo-1626337920103-ae3bccd889fb" },
    item2: { name: "Projection Screen", image: "/placeholder.svg" },
    partnerId: "3"
  }
];
