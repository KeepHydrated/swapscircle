import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  trade_conversation_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export const createReview = async (
  tradeConversationId: string,
  revieweeId: string,
  rating: number,
  comment?: string
) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        trade_conversation_id: tradeConversationId,
        reviewer_id: session.session.user.id,
        reviewee_id: revieweeId,
        rating,
        comment
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getReviewsForTrade = async (tradeConversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('trade_conversation_id', tradeConversationId);

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const checkReviewEligibility = async (tradeConversationId: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { canReview: false, daysLeft: 0 };
    }

    const { data: trade, error } = await supabase
      .from('trade_conversations')
      .select('status, completed_at, requester_id, owner_id')
      .eq('id', tradeConversationId)
      .single();

    if (error || !trade) {
      return { canReview: false, daysLeft: 0 };
    }

    if (trade.status !== 'completed' || !trade.completed_at) {
      return { canReview: false, daysLeft: 0 };
    }

    const completedAt = new Date(trade.completed_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 30 - daysDiff);

    // Check if user already reviewed
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('trade_conversation_id', tradeConversationId)
      .eq('reviewer_id', session.session.user.id)
      .maybeSingle();

    const canReview = daysLeft > 0 && !existingReview && 
      (trade.requester_id === session.session.user.id || trade.owner_id === session.session.user.id);

    return { canReview, daysLeft };
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return { canReview: false, daysLeft: 0 };
  }
};