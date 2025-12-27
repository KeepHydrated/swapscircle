-- First delete related data for the test items, then delete the items
-- Items: 599f17c0-6bd7-4ad6-bde3-496168847eba (Test), 875575f1-e67f-4ddb-a01c-799895f9257b (uuuu)
--        3f1b0d9d-ecde-4d2f-aaa3-323f36674967 (vv), 147d62cd-25ba-4e38-810f-b07f80919e0e (vv)

-- Delete messages from trade conversations involving these items
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM trade_conversations 
  WHERE requester_item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e')
     OR owner_item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e')
);

-- Delete trade conversations involving these items
DELETE FROM trade_conversations 
WHERE requester_item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e')
   OR owner_item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e');

-- Delete mutual matches involving these items
DELETE FROM mutual_matches 
WHERE user1_item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e')
   OR user2_item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e');

-- Delete liked items involving these items
DELETE FROM liked_items 
WHERE item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e')
   OR my_item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e');

-- Delete rejections involving these items
DELETE FROM rejections 
WHERE item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e')
   OR my_item_id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e');

-- Finally delete the items
DELETE FROM items 
WHERE id IN ('599f17c0-6bd7-4ad6-bde3-496168847eba', '875575f1-e67f-4ddb-a01c-799895f9257b', '3f1b0d9d-ecde-4d2f-aaa3-323f36674967', '147d62cd-25ba-4e38-810f-b07f80919e0e');