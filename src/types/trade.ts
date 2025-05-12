
export interface TradeReview {
  rating: number;
  comment: string;
  date: string;
}

export interface CompletedTrade {
  id: number;
  name: string;
  tradedFor: string;
  tradedWith: string;
  tradeDate: string;
  image: string;
  myReview?: TradeReview;
  theirReview?: TradeReview;
}
