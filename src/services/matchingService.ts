import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Item, MatchItem } from '@/types/item';

export const findMatchingItems = async (selectedItem: Item, currentUserId: string): Promise<MatchItem[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Get all items from other users
    const { data: allItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .neq('user_id', currentUserId);

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return [];
    }

    if (!allItems || allItems.length === 0) {
      return [];
    }

    const matches: Array<MatchItem & { matchScore: number }> = [];

    for (const otherItem of allItems) {
      let matchScore = 0;
      let isMatch = false;

      // Check if this other item matches what the current user is looking for
      if (selectedItem.lookingForCategories && selectedItem.lookingForCategories.length > 0) {
        if (selectedItem.lookingForCategories.includes(otherItem.category)) {
          matchScore += 3; // High score for category match
          isMatch = true;
        }
      }

      if (selectedItem.lookingForConditions && selectedItem.lookingForConditions.length > 0) {
        if (selectedItem.lookingForConditions.includes(otherItem.condition)) {
          matchScore += 2; // Medium score for condition match
          isMatch = true;
        }
      }

      // Check keyword matching in description
      if (selectedItem.lookingForDescription && otherItem.name) {
        const lookingForKeywords = selectedItem.lookingForDescription.toLowerCase().split(' ');
        const itemName = otherItem.name.toLowerCase();
        const itemDescription = (otherItem.description || '').toLowerCase();
        
        for (const keyword of lookingForKeywords) {
          if (keyword.length > 2 && (itemName.includes(keyword) || itemDescription.includes(keyword))) {
            matchScore += 1; // Lower score for keyword matches
            isMatch = true;
            break;
          }
        }
      }

      // For mutual matching: Check if the other user is looking for what we're offering
      if (otherItem.looking_for_categories && otherItem.looking_for_categories.length > 0) {
        if (otherItem.looking_for_categories.includes(selectedItem.category)) {
          matchScore += 5; // Very high score for mutual interest
          isMatch = true;
        }
      }

      if (otherItem.looking_for_conditions && otherItem.looking_for_conditions.length > 0) {
        if (otherItem.looking_for_conditions.includes(selectedItem.condition)) {
          matchScore += 3; // High score for mutual condition interest
          isMatch = true;
        }
      }

      // Check if other user's looking for description matches our item
      if (otherItem.looking_for_description && selectedItem.name) {
        const otherLookingForKeywords = otherItem.looking_for_description.toLowerCase().split(' ');
        const ourItemName = selectedItem.name.toLowerCase();
        const ourItemDescription = (selectedItem.description || '').toLowerCase();
        
        for (const keyword of otherLookingForKeywords) {
          if (keyword.length > 2 && (ourItemName.includes(keyword) || ourItemDescription.includes(keyword))) {
            matchScore += 2; // Medium score for mutual keyword interest
            isMatch = true;
            break;
          }
        }
      }

      // If there's any match, add to results
      if (isMatch) {
        matches.push({
          id: otherItem.id,
          name: otherItem.name,
          image: otherItem.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
          category: otherItem.category,
          condition: otherItem.condition,
          description: otherItem.description,
          tags: otherItem.tags,
          liked: false, // Will be determined by like status
          matchScore // Add match score for potential sorting
        });
      }
    }

    // Sort by match score (highest first) and limit results
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20)
      .map(({ matchScore, ...item }) => item); // Remove matchScore from final result

  } catch (error) {
    console.error('Error in findMatchingItems:', error);
    return [];
  }
};