-- ============================================================================
-- FIX: RSVP Permission Denied Error
-- ============================================================================
-- This fixes the "permission denied for table users" error
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Drop the broken policy
DROP POLICY IF EXISTS "Users can view their own RSVPs" ON public.rsvps;

-- Recreate it without the problematic auth.users query
CREATE POLICY "Users can view their own RSVPs"
  ON public.rsvps FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Verify the policy was created
SELECT
    schemaname,
    tablename,
    policyname,
    qual
FROM pg_policies
WHERE tablename = 'rsvps'
AND policyname = 'Users can view their own RSVPs';

-- Success message
SELECT 'RSVP permissions fixed! Refresh your dashboard.' as status;
