-- Delete all liked items for current user
DELETE FROM liked_items WHERE user_id = 'cf464ad5-6679-42de-9387-356601437986';

-- Delete all matches involving this user  
DELETE FROM matches WHERE user1_id = 'cf464ad5-6679-42de-9387-356601437986' OR user2_id = 'cf464ad5-6679-42de-9387-356601437986';

-- Delete all trade conversations involving this user
DELETE FROM trade_conversations WHERE requester_id = 'cf464ad5-6679-42de-9387-356601437986' OR owner_id = 'cf464ad5-6679-42de-9387-356601437986';