
// Mock profile data

export interface ProfileData {
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: string;
  memberSince: string;
}

export const mockProfileData: ProfileData = {
  name: "Alex Morgan",
  description: "Vintage collector and trading enthusiast based in Portland. I specialize in retro gaming items, vinyl records, and collectible figurines. Always looking for fair trades and new additions to my collection!",
  rating: 5,
  reviewCount: 127,
  location: "Portland, OR",
  memberSince: "2022"
};
