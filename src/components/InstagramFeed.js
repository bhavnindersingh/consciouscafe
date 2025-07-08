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
      
      // Note: This is a simplified approach. In production, you'll need:
      // 1. Instagram Basic Display API with proper authentication
      // 2. A backend server to handle API keys securely
      // 3. Regular token refresh mechanism
      
      // For now, we'll create a mock data structure that matches Instagram's format
      // and provide fallback to static images
      
      // Attempt to fetch from Instagram (this will require proper API setup)
      // const response = await fetch(`/api/instagram/${instagramUsername}`);
      
      // For demonstration, using mock data with realistic Instagram post structure
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

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPosts(mockPosts);
      setError(null);
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