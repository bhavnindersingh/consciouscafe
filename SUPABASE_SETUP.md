# Supabase Database Setup Guide

This guide will walk you through setting up the complete database schema for Conscious Sanctuary in Supabase.

## Prerequisites

- A Supabase account (free tier works fine)
- Your Supabase project already created
- The `SUPABASE_SETUP_COMPLETE.sql` file from this repository

## Setup Steps

### Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Select your project from the dashboard
3. You should see your project overview

### Step 2: Open the SQL Editor

1. In the left sidebar, click on **"SQL Editor"** (icon looks like `</>`)
2. Click **"New query"** button in the top right
3. You'll see a blank SQL editor window

### Step 3: Copy the Setup Script

1. Open the `SUPABASE_SETUP_COMPLETE.sql` file from this repository
2. Copy the **entire contents** of the file (Ctrl+A, Ctrl+C or Cmd+A, Cmd+C)

### Step 4: Paste and Run the Script

1. Paste the entire SQL script into the SQL Editor
2. Click the **"Run"** button (or press F5)
3. Wait for the script to execute (should take 2-5 seconds)

### Step 5: Verify Success

You should see a success message at the bottom of the editor. Look for:
- ✅ "Success. No rows returned"
- Or a green success indicator

If you see errors, don't worry! Some common errors are:

- **"relation already exists"** - This is OK, it means tables already exist
- **"policy already exists"** - This is OK, the script handles this

The script is designed to be **idempotent** (safe to run multiple times).

### Step 6: Verify Tables Were Created

1. In the left sidebar, click on **"Table Editor"**
2. You should now see two new tables:
   - **offerings** - Stores workshops, events, and retreats
   - **rsvps** - Stores participant registrations

3. Click on each table to see the column structure

#### Expected Tables

**offerings table columns:**
- `id` - Auto-incrementing ID
- `created_at` - Timestamp
- `title` - Text (required)
- `description` - Text
- `date` - Timestamp (required)
- `duration_minutes` - Integer (default: 60)
- `price` - Numeric (default: 0)
- `image_url` - Text
- `location` - Text
- `type` - Text (workshop/event/retreat)
- `status` - Text (draft/published/cancelled)
- `max_participants` - Integer
- `instructor_id` - UUID (links to auth.users)

**rsvps table columns:**
- `id` - Auto-incrementing ID
- `created_at` - Timestamp
- `offering_id` - Integer (links to offerings)
- `user_name` - Text (required)
- `user_email` - Text (required)
- `user_phone` - Text
- `message` - Text
- `user_id` - UUID (optional link to auth.users)
- `status` - Text (pending/approved/declined)

### Step 7: Verify Row Level Security (RLS)

1. Click on one of your tables in the Table Editor
2. Click on the **"RLS"** tab at the top
3. You should see **"Row Level Security is enabled"**
4. You should see several policies listed:
   - For **offerings**: 5 policies (view published, view own, create, update own, delete own)
   - For **rsvps**: 5 policies (create, view own, instructors view, instructors update, instructors delete)

### Step 8: Check Helper Views (Optional)

1. In the SQL Editor, run this query to test the views:

```sql
SELECT * FROM public.upcoming_offerings LIMIT 5;
```

2. You should get a successful query (no results is OK, it just means no data yet)

## Testing Your Setup

Now that the database is ready, test the application:

### 1. Register a New User

1. Start your React app (`npm start`)
2. Navigate to `http://localhost:3000/register`
3. Register with your email and password
4. Check your email for verification (if email verification is enabled)

### 2. Login

1. Navigate to `http://localhost:3000/login`
2. Login with your credentials
3. You should be redirected to the dashboard

### 3. Create Your First Workshop

1. In the dashboard, click **"Workshops"** in the topbar
2. Click **"Create New Workshop"** button
3. Fill in the form:
   - Title (e.g., "Morning Meditation")
   - Description
   - Date and time
   - Duration (minutes)
   - Price
   - Location
   - Max participants (optional)
4. Click **"Create Workshop"**
5. Your workshop should appear in the list!

### 4. Test Public RSVP Form

1. Note the ID of your created workshop
2. Create a public RSVP form (or test the RSVP functionality)
3. Fill out the form with guest information
4. Submit the RSVP
5. Go back to dashboard → RSVPs
6. You should see the new RSVP with status "Pending"

### 5. Manage RSVPs

1. In the dashboard, go to **"RSVPs"**
2. You should see all RSVPs for your offerings
3. Try approving or declining an RSVP
4. The status should update successfully

## Troubleshooting

### Error: "relation does not exist"

**Problem**: Tables weren't created

**Solution**:
1. Go back to SQL Editor
2. Re-run the entire `SUPABASE_SETUP_COMPLETE.sql` script
3. Check for any red error messages
4. If you see permission errors, make sure you're using the SQL Editor (not the Table Editor)

### Error: "permission denied for table"

**Problem**: RLS policies not set up correctly

**Solution**:
1. Check that RLS is enabled on both tables
2. Re-run the `SUPABASE_SETUP_COMPLETE.sql` script
3. The script will drop and recreate all policies

### Can't Login / Registration Fails

**Problem**: Authentication not configured

**Solution**:
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Ensure **Email authentication** is enabled
3. Configure email templates if needed
4. Check that your `.env.local` has correct Supabase URL and anon key

### Dashboard Shows "No workshops found" After Creating One

**Problem**: Might be a filter or query issue

**Solution**:
1. Check that the workshop was actually created:
   - Go to Supabase → Table Editor → offerings
   - You should see your workshop row
2. Check that `instructor_id` matches your user ID:
   - Go to Supabase → Authentication → Users
   - Find your user ID
   - It should match the `instructor_id` in the offerings table
3. Check that `status` is set to "published" (not "draft")

### RSVP Creation Fails

**Problem**: RLS policy might be blocking it

**Solution**:
1. Check the browser console for errors
2. Verify the "Anyone can create RSVPs" policy exists:
   - Go to offerings table → RLS tab
   - Should see policy with `WITH CHECK (true)`
3. Re-run the setup script to recreate policies

## What This Setup Includes

✅ **Complete Database Schema**
- Two main tables (offerings, rsvps)
- All necessary constraints and validations
- Foreign key relationships

✅ **Security**
- Row Level Security (RLS) enabled
- Fine-grained access control policies
- Public can view published offerings
- Instructors can only manage their own content

✅ **Performance**
- Indexes on commonly queried columns
- Optimized for filtering by type, status, date
- Fast RSVP lookups

✅ **Analytics**
- Helper views for upcoming offerings
- Views with RSVP statistics
- Ready for dashboard reporting

## Database Schema Overview

```
┌─────────────┐         ┌──────────────┐
│   auth.users│         │   offerings  │
│  (Supabase) │◄────────┤ instructor_id│
└─────────────┘         │   type       │
                        │   status     │
                        │   date       │
                        └──────┬───────┘
                               │
                               │ 1:N
                               │
                        ┌──────▼───────┐
                        │    rsvps     │
                        │ offering_id  │
                        │ user_email   │
                        │ status       │
                        └──────────────┘
```

### Table Relationships

- **auth.users** → **offerings**: One instructor can create many offerings
- **offerings** → **rsvps**: One offering can have many RSVPs
- **auth.users** → **rsvps**: Optional link for registered users

## Next Steps

Once your database is set up and working:

1. **Customize the Forms**: Update the create/edit forms with your specific fields
2. **Add Email Notifications**: Set up Supabase Edge Functions to send confirmation emails
3. **Public Pages**: Create public-facing pages to display upcoming workshops/events
4. **Payment Integration**: Add Stripe or other payment processing for paid offerings
5. **Calendar Integration**: Export offerings to Google Calendar or iCal format

## Need Help?

If you encounter issues not covered here:

1. Check the Supabase logs:
   - Dashboard → Logs → Check for database errors
2. Check browser console for JavaScript errors
3. Verify environment variables in `.env.local`
4. Re-run the setup script (it's safe to run multiple times)

## Database Maintenance

### Backup Your Data

Regularly backup your data:
1. Supabase Dashboard → Database → Backups
2. Enable automatic daily backups (recommended)

### Monitoring

Keep an eye on:
- Database size (free tier has limits)
- Number of rows in tables
- Query performance in Supabase dashboard

---

**Setup Complete!** 🎉

Your Conscious Sanctuary platform is now ready to manage workshops, events, retreats, and RSVPs!
