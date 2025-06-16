
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Item, MatchItem } from '@/types/item';

export const findMatchingItems = async (selectedItem: Item, currentUserId: string): Promise<MatchItem[]> => {
  if (!isSupabaseConfigured() || !selectedItem.lookingForCategories) {
    return [];
  }

  try {
    // Build the query to find matching items
    let query = supabase
      .from('items')
      .select('*')
      .neq('user_id', currentUserId); // Exclude current user's items

    // Filter by categories if specified
    if (selectedItem.lookingForCategories && selectedItem.lookingForCategories.length > 0) {
      query = query.overlaps('category', selectedItem.lookingForCategories);
    }

    // Filter by conditions if specified
    if (selectedItem.lookingForConditions && selectedItem.lookingForConditions.length > 0) {
      query = query.in('condition', selectedItem.lookingForConditions);
    }

    // Filter by price range if specified
    if (selectedItem.priceRangeMin !== undefined && selectedItem.priceRangeMin !== null) {
      // For now, we'll use a simple approach - in a real app you'd have price fields on items
      // This is a placeholder for when price data is added to items
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error finding matches:', error);
      return [];
    }

    // Map DB items to MatchItem shape
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      image: item.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      category: item.category,
      condition: item.condition,
      description: item.description,
      tags: item.tags,
      liked: false, // Will be determined by like status
    }));

  } catch (error) {
    console.error('Error in findMatchingItems:', error);
    return [];
  }
};
