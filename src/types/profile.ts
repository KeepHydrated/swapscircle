
import { FriendRequestStatus } from "@/components/profile/FriendRequestButton";
import { MatchItem } from "@/types/item";

export interface ProfileUser {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: string;
  memberSince: string;
  avatar: string;
  friendStatus: FriendRequestStatus;
}

export interface CompletedTrade {
  id: number;
  name: string;
  tradedFor: string;
  tradedWith: string;
  tradeDate: string;
  image: string;
}

export interface Friend {
  id: string;
  name: string;
  friendCount: number;
  avatar: string;
  items: MatchItem[];
}
