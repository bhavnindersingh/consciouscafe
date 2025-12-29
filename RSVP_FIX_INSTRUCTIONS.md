# Fix RSVP 403 Permission Errors

## The Issue

You're seeing these errors:
```
403 Forbidden on rsvps table
permission denied for table users
```

**Root Cause**: One of the RLS policies was trying to query `auth.users.email`, which users don't have permission to access in Supabase.

## Quick Fix (2 minutes)

### Step 1: Go to Supabase SQL Editor

1. Open [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the Fix

Copy and paste this SQL:

```sql
-- Drop the broken policy
DROP POLICY IF EXISTS "Users can view their own RSVPs" ON public.rsvps;

-- Recreate it without the problematic auth.users query
CREATE POLICY "Users can view their own RSVPs"
  ON public.rsvps FOR SELECT
  USING (
    auth.uid() = user_id
  );
```

Click **Run** ▶️

### Step 3: Verify

You should see:
- Success message
- No errors

### Step 4: Test Your Dashboard

1. Go back to your dashboard (`http://localhost:3000/dashboard`)
2. Press **F5** to refresh
3. All 403 errors should be gone!
4. RSVPs section should load
5. Dashboard stats should show correctly

## What We Fixed

### Before (Broken):
```sql
CREATE POLICY "Users can view their own RSVPs"
  USING (
    auth.uid() = user_id
    OR
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())  -- ❌ This causes permission denied
  );
```

### After (Fixed):
```sql
CREATE POLICY "Users can view their own RSVPs"
  USING (
    auth.uid() = user_id  -- ✅ Simple and works!
  );
```

## Why This Works

- The policy no longer tries to query the `auth.users` table
- It simply checks if the authenticated user's ID matches the `user_id` in the RSVP
- The "Instructors can view RSVPs for their offerings" policy still works perfectly
- Instructors can see all RSVPs for their workshops/events/retreats

## Expected Results After Fix

✅ No more 403 errors on RSVP queries
✅ Dashboard home loads correctly
✅ RSVP list displays all RSVPs for your offerings
✅ Dashboard stats show correct pending RSVP count
✅ Recent RSVPs appear in dashboard home

## Troubleshooting

### Still seeing 403 errors?

1. Make sure you clicked **Run** in the SQL Editor
2. Check for any error messages in the SQL Editor output
3. Try refreshing your dashboard with **Ctrl+Shift+R** (hard refresh)

### Policy didn't update?

Run this to verify the policy exists:
```sql
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'rsvps'
AND policyname = 'Users can view their own RSVPs';
```

You should see the policy listed with the simpler USING clause.

### React Router warnings?

Those yellow warnings about `v7_startTransition` and `v7_relativeSplatPath` are just deprecation warnings from React Router. They're not errors and won't affect functionality. You can safely ignore them for now.

## Alternative: Re-run Complete Setup

If you prefer, you can re-run the entire `SUPABASE_SETUP_COMPLETE.sql` file (which now has the fix included). It's safe to re-run - the script is idempotent.

---

**That's it!** Your dashboard should now work perfectly with full RSVP functionality. 🎉
