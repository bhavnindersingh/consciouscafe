/**
 * Gumlet Image and Video Optimization Utility
 * 
 * This utility provides helper functions to generate optimized URLs for images
 * and videos using Gumlet's custom origin CDN.
 * 
 * @see https://docs.gumlet.com/
 */

// Get Gumlet base URL from environment variables
// Falls back to local images if not configured
const GUMLET_BASE_URL = process.env.REACT_APP_GUMLET_BASE_URL || '';
const USE_GUMLET = process.env.REACT_APP_USE_GUMLET !== 'false';

/**
 * Generate a Gumlet-optimized URL for images or videos
 * 
 * @param {string} assetPath - Path to the asset (e.g., "images/food/toast.jpg")
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.height - Target height in pixels
 * @param {number} options.quality - Quality (1-100, default: 85)
 * @param {string} options.format - Output format ('auto', 'webp', 'avif', 'jpg', 'png') - maps to 'fm' parameter
 * @param {string} options.mode - Resize mode ('crop', 'stretch', 'fit')
 * @param {number} options.dpr - Device pixel ratio (1, 2, 3)
 * @param {boolean} options.thumbnail - Generate video thumbnail (video only)
 * @param {string} type - Asset type: 'image' or 'video'
 * @returns {string} Optimized Gumlet URL or original path if Gumlet is disabled
 */
export const getGumletUrl = (assetPath, options = {}, type = 'image') => {
  // If Gumlet is disabled or no base URL, return original path
  if (!USE_GUMLET || !GUMLET_BASE_URL) {
    return assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  }

  // Clean the path - remove leading slash if present
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

  // Build query parameters for Gumlet transformations
  const params = new URLSearchParams();

  if (type === 'image') {
    // Image-specific transformations
    if (options.width) params.append('w', options.width);
    if (options.height) params.append('h', options.height);
    if (options.quality) params.append('q', options.quality);
    if (options.format) params.append('fm', options.format);
    if (options.mode) params.append('mode', options.mode);
    if (options.dpr) params.append('dpr', options.dpr);

    // Always use auto format for best optimization if not specified
    if (!options.format) params.append('fm', 'auto');
  } else if (type === 'video') {
    // Video-specific transformations
    if (options.quality) params.append('quality', options.quality);
    if (options.format) params.append('fm', options.format);
    if (options.thumbnail) params.append('thumbnail', 'true');
    if (options.width) params.append('w', options.width);
    if (options.height) params.append('h', options.height);
  }

  // URL encode the path to handle spaces and special characters
  // Split path into segments, encode each, then rejoin
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  // Construct final URL
  const queryString = params.toString();
  const baseUrl = `${GUMLET_BASE_URL}/${encodedPath}`;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Preset configurations for common use cases
 * Use these presets for consistent optimization across your app
 */
export const gumletPresets = {
  // Product/Food Images
  productCard: {
    width: 600,
    height: 600,
    mode: 'crop',
    quality: 85,
    format: 'auto'
  },

  productThumbnail: {
    width: 400,
    height: 400,
    mode: 'crop',
    quality: 80,
    format: 'auto'
  },

  productDetail: {
    width: 1200,
    height: 1200,
    mode: 'crop',
    quality: 90,
    format: 'auto'
  },

  // Hero/Banner Images
  hero: {
    width: 1920,
    quality: 90,
    format: 'auto'
  },

  heroBanner: {
    width: 1600,
    height: 600,
    mode: 'crop',
    quality: 85,
    format: 'auto'
  },

  // Profile/Founder Images
  founder: {
    width: 300,
    height: 300,
    mode: 'crop',
    quality: 85,
    format: 'auto'
  },

  founderLarge: {
    width: 600,
    height: 600,
    mode: 'crop',
    quality: 90,
    format: 'auto'
  },

  // Story/About Images
  storyImage: {
    width: 1200,
    quality: 90,
    format: 'auto'
  },

  // Mobile-optimized versions
  mobile: {
    width: 800,
    quality: 80,
    format: 'auto'
  },

  // Retina/High DPI displays
  retina: {
    dpr: 2,
    quality: 85,
    format: 'auto'
  },

  // Video presets
  videoHD: {
    quality: 'high',
    format: 'mp4'
  },

  videoSD: {
    quality: 'medium',
    format: 'mp4'
  },

  videoThumbnail: {
    thumbnail: true,
    width: 1280,
    height: 720
  }
};

/**
 * Helper function to get images with srcset for responsive loading
 * 
 * @param {string} assetPath - Path to the image
 * @param {Array<number>} widths - Array of widths for srcset (e.g., [400, 800, 1200])
 * @param {Object} baseOptions - Base options to apply to all sizes
 * @returns {Object} Object with src and srcset strings
 */
export const getResponsiveImageSet = (assetPath, widths = [400, 800, 1200], baseOptions = {}) => {
  const src = getGumletUrl(assetPath, { ...baseOptions, width: widths[widths.length - 1] });

  const srcset = widths
    .map(width => {
      const url = getGumletUrl(assetPath, { ...baseOptions, width });
      return `${url} ${width}w`;
    })
    .join(', ');

  return { src, srcset };
};

/**
 * Check if Gumlet is enabled
 * @returns {boolean}
 */
export const isGumletEnabled = () => USE_GUMLET && Boolean(GUMLET_BASE_URL);

export default {
  getGumletUrl,
  gumletPresets,
  getResponsiveImageSet,
  isGumletEnabled
};
