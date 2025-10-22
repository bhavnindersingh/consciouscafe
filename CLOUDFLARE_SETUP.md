# Cloudflare Setup Guide for Conscious Cafe

This guide provides step-by-step instructions to configure Cloudflare for optimal image delivery, caching, and security for your Netlify-hosted site.

## Prerequisites

- Active Cloudflare account (free tier works fine)
- Domain registered with Cloudflare or DNS pointed to Cloudflare nameservers
- Netlify site deployed and accessible

---

## Part 1: DNS Configuration

### Step 1: Add Your Site to Cloudflare

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Add a Site" (if not already added)
3. Enter your domain name (e.g., `consciouscafe.in`)
4. Select the Free plan (or any paid plan)
5. Cloudflare will scan your existing DNS records

### Step 2: Configure DNS Records for Netlify

1. Go to **DNS** > **Records** in Cloudflare dashboard
2. Add/Update the following records:

**For Root Domain:**
```
Type: A
Name: @
Content: 75.2.60.5
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**For www Subdomain:**
```
Type: CNAME
Name: www
Content: your-site-name.netlify.app
Proxy status: Proxied (orange cloud)
TTL: Auto
```

3. **Important:** Click the orange cloud icon to ensure it shows "Proxied" (not "DNS only")
4. Remove any conflicting DNS records

### Step 3: Update Nameservers (if not already done)

1. Cloudflare will provide you with 2 nameservers (e.g., `ns1.cloudflare.com`, `ns2.cloudflare.com`)
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Replace existing nameservers with Cloudflare's nameservers
4. Wait 24-48 hours for DNS propagation (usually much faster)

---

## Part 2: SSL/TLS Configuration

### Step 1: Configure SSL/TLS Mode

1. Go to **SSL/TLS** > **Overview**
2. Set encryption mode to: **Full (strict)**
3. This ensures end-to-end encryption between Cloudflare and Netlify

### Step 2: Enable Always Use HTTPS

1. Go to **SSL/TLS** > **Edge Certificates**
2. Turn ON: **Always Use HTTPS**
3. This redirects all HTTP traffic to HTTPS

### Step 3: Enable Automatic HTTPS Rewrites

1. In the same section (**Edge Certificates**)
2. Turn ON: **Automatic HTTPS Rewrites**

---

## Part 3: Performance Optimization

### Step 1: Enable Auto Minify

1. Go to **Speed** > **Optimization**
2. Under **Auto Minify**, enable:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

### Step 2: Enable Brotli Compression

1. In **Speed** > **Optimization**
2. Turn ON: **Brotli**

### Step 3: Configure Caching Level

1. Go to **Caching** > **Configuration**
2. Set **Caching Level** to: **Standard**
3. Set **Browser Cache TTL** to: **1 year** (for maximum caching)

---

## Part 4: Image Optimization (Critical for Your Use Case)

### Step 1: Enable Image Optimization Features

1. Go to **Speed** > **Optimization**
2. Under **Image Optimization**:
   - Turn ON: **Polish** (Lossless or Lossy - recommend Lossy for better compression)
   - Turn ON: **WebP** (automatic WebP conversion for supported browsers)
   - Turn ON: **Mirage** (lazy loading and adaptive image loading)

**Note:** Polish and Mirage require a Pro plan ($20/month) or higher. For free tier, skip this step and rely on Netlify's image optimization.

### Step 2: Create Page Rules for Image Caching (FREE TIER)

1. Go to **Rules** > **Page Rules**
2. Click **Create Page Rule**

**Rule 1: Cache Everything for Images**
```
URL Pattern: *consciouscafe.in/images/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year
```

**Rule 2: Bypass Cache for Dynamic Content**
```
URL Pattern: *consciouscafe.in/api/*
Settings:
  - Cache Level: Bypass
```

3. Click **Save and Deploy**

**Note:** Free tier allows 3 Page Rules

---

## Part 5: Security Configuration

### Step 1: Configure Security Level

1. Go to **Security** > **Settings**
2. Set **Security Level** to: **Medium** (or High if you experience attacks)

### Step 2: Enable Bot Fight Mode (Free Tier)

1. In **Security** > **Bots**
2. Turn ON: **Bot Fight Mode**
3. This blocks bad bots automatically

### Step 3: Enable Hotlink Protection

1. Go to **Scrape Shield**
2. Turn ON: **Hotlink Protection**
3. This prevents other sites from directly linking to your images

### Step 4: Configure Firewall Rules (Optional)

1. Go to **Security** > **WAF**
2. Create custom rules if needed (e.g., block specific countries, rate limiting)

**Example Rate Limiting Rule (Requires paid plan):**
- If requests from same IP > 100 requests/10 minutes
- Then: Challenge or Block

---

## Part 6: Additional Performance Settings

### Step 1: Enable HTTP/2 and HTTP/3

1. Go to **Network**
2. Turn ON:
   - ✅ HTTP/2
   - ✅ HTTP/3 (with QUIC)
   - ✅ 0-RTT Connection Resumption

### Step 2: Enable Rocket Loader (Optional - Test First)

1. Go to **Speed** > **Optimization**
2. Turn ON: **Rocket Loader** (this defers JavaScript loading)
3. **Warning:** Test thoroughly as it can break some React apps

---

## Part 7: Cloudflare Cache Purge

### When to Purge Cache

After deploying new images or updating existing ones, purge the cache:

1. Go to **Caching** > **Configuration**
2. Click **Purge Everything** (or **Custom Purge** for specific files)
3. Confirm the purge

**Best Practice:** Use Custom Purge to only clear updated files

---

## Part 8: Monitoring and Analytics

### Step 1: Enable Analytics

1. Go to **Analytics & Logs** > **Web Analytics**
2. Review:
   - Traffic patterns
   - Cache hit ratio (aim for >80%)
   - Bandwidth savings
   - Threat analytics

### Step 2: Check Cache Performance

1. Go to **Caching** > **Configuration** > **Caching Analytics**
2. Monitor:
   - Cache hit ratio
   - Bandwidth saved
   - Requests cached

**Target Metrics:**
- Cache Hit Ratio: >80%
- Bandwidth Saved: >50%

---

## Part 9: Testing Your Setup

### Test 1: Check DNS Propagation

```bash
dig consciouscafe.in
```

Should show Cloudflare IP addresses (not Netlify's)

### Test 2: Check SSL Certificate

Visit: `https://www.ssllabs.com/ssltest/`
Enter your domain - should get A or A+ rating

### Test 3: Check Image Caching

1. Open browser DevTools (F12)
2. Go to Network tab
3. Load your site
4. Check image response headers:
   - `CF-Cache-Status: HIT` (after first load)
   - `Cache-Control: public, max-age=31536000, immutable`

### Test 4: Check Performance

Visit: `https://www.webpagetest.org/`
- Enter your URL
- Should show improved load times and cached resources

---

## Part 10: Recommended Cloudflare Settings Summary

| Setting | Value | Location |
|---------|-------|----------|
| SSL/TLS Mode | Full (strict) | SSL/TLS > Overview |
| Always Use HTTPS | ON | SSL/TLS > Edge Certificates |
| Auto Minify | JS, CSS, HTML ON | Speed > Optimization |
| Brotli | ON | Speed > Optimization |
| Caching Level | Standard | Caching > Configuration |
| Browser Cache TTL | 1 year | Caching > Configuration |
| Hotlink Protection | ON | Scrape Shield |
| Bot Fight Mode | ON | Security > Bots |
| HTTP/2 | ON | Network |
| HTTP/3 (QUIC) | ON | Network |

---

## Troubleshooting

### Images Not Loading

1. Check DNS is properly configured and proxied
2. Verify image paths are correct in code
3. Check Cloudflare cache status in DevTools
4. Purge Cloudflare cache
5. Verify Netlify deployment is successful

### Cache Not Working

1. Check Page Rules are active
2. Verify Cache-Control headers in Netlify config
3. Check CF-Cache-Status header (should be HIT, not MISS)
4. Ensure Browser Cache TTL is set correctly

### SSL Errors

1. Verify SSL mode is "Full (strict)"
2. Check Netlify has valid SSL certificate
3. Ensure all resources load via HTTPS
4. Clear browser cache and test in incognito

### Performance Issues

1. Check cache hit ratio in Cloudflare Analytics
2. Verify Auto Minify is enabled
3. Test with and without Rocket Loader
4. Consider upgrading to Pro for Polish/Mirage

---

## Advanced: Custom Caching Rules (Transform Rules)

For finer control, use Cloudflare's Transform Rules:

1. Go to **Rules** > **Transform Rules** > **Modify Response Header**
2. Create a rule:

```
Rule Name: Cache Images Aggressively
When incoming requests match:
  - URI Path contains "/images/"

Then:
  - Set Static > Cache-Control > public, max-age=31536000, immutable
```

---

## Cost Considerations

**Free Tier Includes:**
- Unlimited bandwidth (with fair use policy)
- DDoS protection
- SSL certificate
- Basic caching
- 3 Page Rules
- Basic firewall rules

**Pro Tier ($20/month) Adds:**
- Image optimization (Polish, Mirage)
- Better compression
- More Page Rules
- Advanced caching

**For your use case:** Free tier should be sufficient initially. Upgrade to Pro if you need automatic image optimization.

---

## Final Checklist

- [ ] DNS records configured and proxied (orange cloud)
- [ ] SSL/TLS mode set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] Auto Minify enabled for JS/CSS/HTML
- [ ] Brotli compression enabled
- [ ] Page Rule created for /images/* caching
- [ ] Hotlink Protection enabled
- [ ] Bot Fight Mode enabled
- [ ] HTTP/2 and HTTP/3 enabled
- [ ] Cache tested and working (CF-Cache-Status: HIT)
- [ ] Performance tested on WebPageTest

---

## Support Resources

- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Status Page](https://www.cloudflarestatus.com/)

---

**Migration Complete!** Your images are now served through Netlify and protected/accelerated by Cloudflare's global CDN.
