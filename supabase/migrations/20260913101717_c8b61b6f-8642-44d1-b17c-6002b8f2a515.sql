-- 1. Remove redundant public SELECT policies
DROP POLICY IF EXISTS select_policy ON public.chapter_reactions;
DROP POLICY IF EXISTS select_policy ON public.chapter_views;

-- 2. mutual_matches: only participants can create matches
DROP POLICY IF EXISTS "System can create matches" ON public.mutual_matches;
CREATE POLICY "Participants can create matches" ON public.mutual_matches
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 3. notifications: creator must be the actor (or self)
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;
CREATE POLICY "Users can create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR action_by = auth.uid());

-- 4. Remove open INSERT policies (writes happen via service_role / edge functions, which bypass RLS)
DROP POLICY IF EXISTS "System can insert transactions" ON public.earnings_transactions;
DROP POLICY IF EXISTS "System can insert earnings" ON public.user_earnings;
DROP POLICY IF EXISTS "System can insert clicks" ON public.sponsored_product_clicks;

-- 5. subscribers: scope INSERT/UPDATE to the owner
DROP POLICY IF EXISTS insert_subscription ON public.subscribers;
CREATE POLICY insert_subscription ON public.subscribers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR email = auth.email());
DROP POLICY IF EXISTS update_own_subscription ON public.subscribers;
CREATE POLICY update_own_subscription ON public.subscribers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR email = auth.email())
  WITH CHECK (user_id = auth.uid() OR email = auth.email());