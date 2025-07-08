# Instagram Graph API Integration Setup Guide

## Overview
This guide explains how to set up the Instagram Graph API integration for the Conscious Cafe website to display live Instagram posts.

## Prerequisites

### 1. Instagram Business Account
- Convert your Instagram account (@consciouscafe.kavas) to a Business or Creator account
- Go to your Instagram profile → Settings → Account → Switch to Professional Account
- Choose "Business" as account type
- Ensure your account is public

### 2. Facebook Page
- Create a Facebook Page for your business (if you don't have one)
- Connect your Instagram Business account to this Facebook Page
- Go to Instagram Settings → Business → Connected Accounts → Facebook

## Facebook Developer App Setup

### 1. Create Facebook App
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Enter app name (e.g., "Conscious Cafe Website")
5. Enter your email address
6. Click "Create App"

### 2. Add Instagram Graph API
1. In your app dashboard, find "Instagram Graph API"
2. Click "Set up"
3. This adds Instagram Graph API to your app

### 3. Configure Facebook Login for Business
1. Find "Facebook Login for Business" in your app dashboard
2. Click "Set up"
3. Add your website URL to Valid OAuth Redirect URIs
4. Save changes

## Get Access Token

### 1. Generate User Access Token
1. In your app dashboard, go to Tools → Graph API Explorer
2. Select your app from the dropdown
3. Add permissions: `instagram_basic`, `pages_show_list`, `business_management`
4. Click "Generate Access Token"
5. Complete the authentication flow

### 2. Get Instagram User ID
1. In Graph API Explorer, make this request:
   ```
   GET /me/accounts
   ```
2. Find your Facebook Page in the response
3. Copy the `id` field (this is your Page ID)
4. Make another request:
   ```
   GET /{PAGE_ID}?fields=instagram_business_account
   ```
5. Copy the `instagram_business_account.id` (this is your Instagram User ID)

### 3. Generate Long-Lived Access Token
1. Make this request in Graph API Explorer:
   ```
   GET /oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}
   ```
2. Copy the long-lived access token (valid for 60 days)

## Environment Variables Setup

### For Local Development
1. Create a `.env` file in your project root (never commit this file)
2. Add the following variables:
   ```
   INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token_here
   INSTAGRAM_USER_ID=your_instagram_user_id_here
   FACEBOOK_APP_ID=your_facebook_app_id_here
   FACEBOOK_APP_SECRET=your_facebook_app_secret_here
   ```

### For Netlify Deployment
1. Go to your Netlify site dashboard
2. Navigate to Site settings → Environment variables
3. Add the same variables as above
4. Or use Netlify CLI:
   ```bash
   netlify env:set INSTAGRAM_ACCESS_TOKEN "your_token_here"
   netlify env:set INSTAGRAM_USER_ID "your_user_id_here"
   ```

## Local Testing

### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Test Locally
```bash
# Start local development server
netlify dev

# Test the Instagram function
curl http://localhost:8888/.netlify/functions/instagram
```

### 3. Deploy to Netlify
```bash
# Deploy to production
netlify deploy --prod
```

## Important Notes

### Token Expiration
- Long-lived access tokens expire every 60 days
- Set up a calendar reminder to refresh tokens
- Consider implementing automatic token refresh

### Rate Limits
- Instagram Graph API allows 200 requests per user per hour
- Our implementation caches responses for 15 minutes to reduce API calls
- Monitor usage to avoid hitting rate limits

### Error Handling
- The component gracefully falls back to mock data if API fails
- Error messages are user-friendly and inform about configuration issues
- All errors are logged to browser console for debugging

## Troubleshooting

### Common Issues

1. **"Missing Instagram configuration" error**
   - Ensure environment variables are set correctly
   - Check that variable names match exactly

2. **"Instagram token expired" error**
   - Generate a new long-lived access token
   - Update the INSTAGRAM_ACCESS_TOKEN environment variable

3. **"Instagram rate limit exceeded" error**
   - Wait for rate limit to reset (1 hour)
   - Consider increasing cache duration

4. **Empty posts response**
   - Check if Instagram account has public posts
   - Verify the Instagram User ID is correct
   - Ensure account permissions are properly configured

### Debug Steps
1. Check browser console for error messages
2. Test the function directly: `/.netlify/functions/instagram`
3. Verify environment variables in Netlify dashboard
4. Test API calls in Facebook Graph API Explorer

## Maintenance

### Regular Tasks
- [ ] Refresh access token every 60 days
- [ ] Monitor API usage and rate limits
- [ ] Update app permissions if needed
- [ ] Check for Instagram API updates

### Monitoring
- Set up alerts for API failures
- Monitor function execution logs in Netlify
- Track cache hit rates and performance

## Support
For issues with this integration, check the project repository or contact the development team.