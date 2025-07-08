const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID } = process.env;

    if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Missing Instagram configuration. Please set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID environment variables.' 
        }),
      };
    }

    // Fetch Instagram media
    const instagramApiUrl = `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media`;
    const params = new URLSearchParams({
      fields: 'id,media_type,media_url,thumbnail_url,caption,permalink,timestamp',
      limit: '12',
      access_token: INSTAGRAM_ACCESS_TOKEN,
    });

    const response = await fetch(`${instagramApiUrl}?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API Error:', errorData);
      
      // Handle specific error cases
      if (response.status === 401) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Instagram access token is invalid or expired. Please refresh your token.' 
          }),
        };
      }
      
      if (response.status === 429) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ 
            error: 'Instagram API rate limit exceeded. Please try again later.' 
          }),
        };
      }

      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to fetch Instagram data',
          details: errorData.error?.message || 'Unknown error'
        }),
      };
    }

    const data = await response.json();
    
    // Transform the data to match the expected format
    const transformedPosts = data.data.map(post => ({
      id: post.id,
      media_url: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
      media_type: post.media_type,
      caption: post.caption || '',
      permalink: post.permalink,
      timestamp: post.timestamp,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: transformedPosts,
        success: true,
        timestamp: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};