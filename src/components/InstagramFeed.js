import React, { useState, useEffect } from 'react';

const InstagramFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Instagram username
  const instagramUsername = 'consciouscafe.kavas';

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  // Function to fetch Instagram posts
  const fetchInstagramPosts = async () => {
    try {
      setLoading(true);
      
      // Check cache first (cache for 15 minutes)
      const cacheKey = 'instagram_posts_cache';
      const cacheTimeKey = 'instagram_posts_cache_time';
      const cacheTime = localStorage.getItem(cacheTimeKey);
      const now = new Date().getTime();
      const cacheExpiry = 15 * 60 * 1000; // 15 minutes in milliseconds
      
      if (cacheTime && (now - parseInt(cacheTime)) < cacheExpiry) {
        const cachedPosts = localStorage.getItem(cacheKey);
        if (cachedPosts) {
          setPosts(JSON.parse(cachedPosts));
          setError(null);
          setLoading(false);
          return;
        }
      }
      
      // First try to fetch from our serverless function
      const response = await fetch('/.netlify/functions/instagram');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPosts(data.data);
          setError(null);
          
          // Cache the successful response
          localStorage.setItem(cacheKey, JSON.stringify(data.data));
          localStorage.setItem(cacheTimeKey, now.toString());
          return;
        }
      }
      
      // If serverless function fails, log the error and use fallback
      const errorData = await response.json().catch(() => ({}));
      console.warn('Instagram API failed:', errorData);
      
      // Set appropriate error message based on response
      if (response.status === 401) {
        setError('Instagram token expired - Please update configuration');
      } else if (response.status === 429) {
        setError('Instagram rate limit exceeded - Please try again later');
      } else if (response.status === 500 && errorData.error?.includes('Missing Instagram configuration')) {
        setError('Instagram not configured - Add API credentials to enable live posts');
      } else {
        setError('Instagram API temporarily unavailable');
      }
      
      // Use fallback mock data with realistic Instagram post structure
      const mockPosts = [
        {
          id: '1',
          media_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
          media_type: 'IMAGE',
          caption: 'Fresh organic ingredients make all the difference! 🌱 #ConsciousEating #OrganicFood',
          permalink: 'https://instagram.com/p/example1',
          timestamp: '2024-01-15T10:30:00+0000'
        },
        {
          id: '2',
          media_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
          media_type: 'IMAGE',
          caption: 'Beautiful breakfast bowl to start your day right ☀️ #HealthyBreakfast #MindfulEating',
          permalink: 'https://instagram.com/p/example2',
          timestamp: '2024-01-14T08:15:00+0000'
        },
        {
          id: '3',
          media_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
          media_type: 'IMAGE',
          caption: 'Behind the scenes at Conscious Cafe 👨‍🍳 #BehindTheScenes #CafeLife',
          permalink: 'https://instagram.com/p/example3',
          timestamp: '2024-01-13T16:45:00+0000'
        },
        {
          id: '4',
          media_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop',
          media_type: 'IMAGE',
          caption: 'Colorful salad bursting with nutrients 🥗 #SaladLove #HealthyEating',
          permalink: 'https://instagram.com/p/example4',
          timestamp: '2024-01-12T12:20:00+0000'
        },
        {
          id: '5',
          media_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763ed1?w=400&h=400&fit=crop',
          media_type: 'IMAGE',
          caption: 'Perfect afternoon coffee moment ☕ #CoffeeTime #AfternoonBreak',
          permalink: 'https://instagram.com/p/example5',
          timestamp: '2024-01-11T14:30:00+0000'
        },
        {
          id: '6',
          media_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
          media_type: 'IMAGE',
          caption: 'Homemade pasta with love 🍝 #PastaLove #Homemade',
          permalink: 'https://instagram.com/p/example6',
          timestamp: '2024-01-10T19:00:00+0000'
        },
        {
          id: '7',
          media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
          media_type: 'IMAGE',
          caption: 'Mindful moments with yoga and healthy food 🧘‍♀️ #Mindfulness #Yoga',
          permalink: 'https://instagram.com/p/example7',
          timestamp: '2024-01-09T07:00:00+0000'
        },
        {
          id: '8',
          media_url: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=400&h=400&fit=crop',
          media_type: 'IMAGE',
          caption: 'Smoothie bowl perfection 🥣 #SmoothieBowl #HealthyTreats',
          permalink: 'https://instagram.com/p/example8',
          timestamp: '2024-01-08T09:30:00+0000'
        }
      ];

      // Simulate API delay for fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPosts(mockPosts);
      setError('Using demo content - Configure Instagram API for live posts');
    } catch (err) {
      console.error('Error fetching Instagram posts:', err);
      setError('Unable to load Instagram posts');
      
      // Fallback to static images if API fails
      const fallbackPosts = [
        {
          id: 'fallback1',
          media_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
          caption: 'Follow us @consciouscafe.kavas for daily inspiration!',
          permalink: `https://instagram.com/${instagramUsername}`
        },
        {
          id: 'fallback2',
          media_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
          caption: 'Fresh, conscious food daily',
          permalink: `https://instagram.com/${instagramUsername}`
        },
        {
          id: 'fallback3',
          media_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
          caption: 'Behind the scenes at our cafe',
          permalink: `https://instagram.com/${instagramUsername}`
        }
      ];
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  // Function to truncate caption
  const truncateCaption = (caption, maxLength = 100) => {
    if (!caption) return '';
    return caption.length > maxLength 
      ? caption.substring(0, maxLength) + '...' 
      : caption;
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="instagram-feed-loading">
        <div className="loading-spinner"></div>
        <p>Loading Instagram posts...</p>
      </div>
    );
  }

  return (
    <div className="instagram-feed">
      <div className="instagram-header">
        <div className="instagram-profile">
          <span className="instagram-icon">📸</span>
          <div className="profile-info">
            <h3>@{instagramUsername}</h3>
            <p>Latest from our Instagram</p>
          </div>
        </div>
        <a 
          href={`https://instagram.com/${instagramUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="follow-button"
        >
          Follow
        </a>
      </div>

      {error && (
        <div className="instagram-error">
          <p>{error}</p>
        </div>
      )}

      <div className="instagram-posts-container">
        <div className="instagram-posts-scroll">
          {posts.map((post, index) => (
            <div key={post.id} className="instagram-post-card">
              <a 
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="post-link"
              >
                <div className="post-image">
                  <img 
                    src={post.media_url} 
                    alt={truncateCaption(post.caption, 50)}
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                  <div className="post-overlay">
                    <span className="post-overlay-icon">👁️</span>
                  </div>
                </div>
                <div className="post-info">
                  <p className="post-caption">
                    {truncateCaption(post.caption)}
                  </p>
                  {post.timestamp && (
                    <span className="post-date">
                      {formatTimestamp(post.timestamp)}
                    </span>
                  )}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="instagram-footer">
        <a 
          href={`https://instagram.com/${instagramUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="view-all-posts"
        >
          View All Posts on Instagram
        </a>
      </div>
    </div>
  );
};

export default InstagramFeed;