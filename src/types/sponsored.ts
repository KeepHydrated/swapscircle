export interface SponsoredProduct {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  external_url: string;
  category: string | null;
  cost_per_click: number;
  is_active: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'paused';
  created_at: string;
}
