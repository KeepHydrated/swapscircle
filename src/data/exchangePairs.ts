
// Types and mock data for item exchange pairs
export type ExchangePair = {
  id: number;
  partnerId: string;
  item1: { name: string; image: string };
  item2: { name: string; image: string };
};

export const exchangePairs: ExchangePair[] = [
  {
    id: 1,
    partnerId: "1",
    item1: { name: "Vintage Camera", image: "/placeholder.svg" },
    item2: { name: "Film Projector", image: "/placeholder.svg" }
  },
  {
    id: 2,
    partnerId: "6", // Added a new match that's not in conversations yet
    item1: { name: "Mountain Bike", image: "/placeholder.svg" },
    item2: { name: "Electric Scooter", image: "/placeholder.svg" }
  },
  {
    id: 3,
    partnerId: "7", // Added a new match that's not in conversations yet
    item1: { name: "Acoustic Guitar", image: "/placeholder.svg" },
    item2: { name: "Synthesizer", image: "/placeholder.svg" }
  },
  {
    id: 4,
    partnerId: "13", // New one
    item1: { name: "Gaming Laptop", image: "/placeholder.svg" },
    item2: { name: "Gaming Console", image: "/placeholder.svg" }
  },
  {
    id: 5,
    partnerId: "14", // New one
    item1: { name: "Drone", image: "/placeholder.svg" },
    item2: { name: "DSLR Camera", image: "/placeholder.svg" }
  }
];
