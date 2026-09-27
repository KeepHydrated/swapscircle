-- 1. discussion_likes: split the ALL USING(true) policy into per-command policies
DROP POLICY "Users can like discussions" ON public.discussion_likes;
CREATE POLICY "Anyone can view discussion likes" ON public.discussion_likes FOR SELECT USING (true);
CREATE POLICY "Users can add their own discussion likes" ON public.discussion_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own discussion likes" ON public.discussion_likes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own discussion likes" ON public.discussion_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. liked_items: stop exposing like activity to anonymous visitors (matching still works for signed-in users)
REVOKE SELECT ON public.liked_items FROM anon;
DROP POLICY "Allow reading liked items for mutual matching" ON public.liked_items;
CREATE POLICY "Signed-in users can read liked items for mutual matching" ON public.liked_items FOR SELECT TO authenticated USING (true);

-- 3. markets: contact info only visible to admins/moderators (frontend never reads this table directly)
DROP POLICY "Authenticated users can view markets" ON public.markets;
CREATE POLICY "Admins and moderators can view markets" ON public.markets FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

-- 4. notifications: direct inserts only for yourself; cross-user notifications go through notify_user()
DROP POLICY "Users can create notifications" ON public.notifications;
CREATE POLICY "Users can create their own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.notify_user(p_user_id uuid, p_type notification_type, p_reference_id uuid, p_message text, p_action_taken text DEFAULT 'none')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_notification_id uuid;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Must be signed in to send notifications';
    END IF;

    INSERT INTO notifications (user_id, type, reference_id, message, action_taken, action_by)
    VALUES (p_user_id, p_type, p_reference_id, p_message, p_action_taken, auth.uid())
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.notify_user(uuid, notification_type, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.notify_user(uuid, notification_type, uuid, text, text) TO authenticated;

-- 5. support tables: replace hardcoded admin email with role check
DROP POLICY "Support admin can update conversations" ON public.support_conversations;
CREATE POLICY "Support admin can update conversations" ON public.support_conversations FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
DROP POLICY "Users can create their own conversations" ON public.support_conversations;
CREATE POLICY "Users can create their own conversations" ON public.support_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
DROP POLICY "Users can view their own conversations" ON public.support_conversations;
CREATE POLICY "Users can view their own conversations" ON public.support_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
DROP POLICY "Support admin can update messages" ON public.support_messages;
CREATE POLICY "Support admin can update messages" ON public.support_messages FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
DROP POLICY "Users can create their own messages" ON public.support_messages;
CREATE POLICY "Users can create their own messages" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
DROP POLICY "Users can view their conversation messages" ON public.support_messages;
CREATE POLICY "Users can view their conversation messages" ON public.support_messages FOR SELECT TO authenticated USING (auth.uid() IN (SELECT support_conversations.user_id FROM support_conversations WHERE support_conversations.id = support_messages.conversation_id) OR public.is_admin(auth.uid()));