// Sitemap generator for Conscious Cafe
import { siteConfig } from './seoData';

// Generate sitemap.xml content
export const generateSitemap = (products = []) => {
  const currentDate = new Date().toISOString();
  
  const staticPages = [
    {
      url: '',
      changefreq: 'weekly',
      priority: '1.0',
      lastmod: currentDate,
    },
    {
      url: 'menu',
      changefreq: 'weekly',
      priority: '0.9',
      lastmod: currentDate,
    },
    {
      url: 'about',
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: currentDate,
    },
    {
      url: 'contact',
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: currentDate,
    },
    {
      url: 'delivery',
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: currentDate,
    },
  ];

  const productPages = products.map(product => ({
    url: `product/${product.id}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: currentDate,
  }));

  const allPages = [...staticPages, ...productPages];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteConfig.url}${page.url ? `/${page.url}` : ''}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemapXml;
};

// Generate robots.txt content
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

Sitemap: ${siteConfig.url}/sitemap.xml`;
};

// SEO-friendly URL slug generator
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Generate OpenGraph image URL
export const generateOGImage = (title, description) => {
  // This would generate a dynamic OpenGraph image
  // For now, return the default image
  return `${siteConfig.url}${siteConfig.image}`;
};

// Validate structured data
export const validateStructuredData = (data) => {
  try {
    JSON.parse(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Invalid structured data:', error);
    return false;
  }
};

// Generate social media meta tags
export const generateSocialTags = (title, description, image, url) => {
  return [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteConfig.name },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:site', content: siteConfig.social.twitter },
  ];
};

// Generate meta keywords based on content
export const generateKeywords = (baseKeywords, additionalTerms = []) => {
  const allKeywords = [
    ...baseKeywords.split(', '),
    ...additionalTerms,
    'conscious cafe',
    'artisanal food',
    'organic ingredients',
    'healthy eating',
    'sustainable dining',
  ];
  
  return [...new Set(allKeywords)].join(', ');
};

// SEO analysis helper
export const analyzeSEO = (title, description, keywords) => {
  const analysis = {
    title: {
      length: title.length,
      optimal: title.length >= 30 && title.length <= 60,
      warning: title.length > 60 ? 'Title too long' : title.length < 30 ? 'Title too short' : null,
    },
    description: {
      length: description.length,
      optimal: description.length >= 120 && description.length <= 160,
      warning: description.length > 160 ? 'Description too long' : description.length < 120 ? 'Description too short' : null,
    },
    keywords: {
      count: keywords.split(', ').length,
      optimal: keywords.split(', ').length >= 5 && keywords.split(', ').length <= 10,
      warning: keywords.split(', ').length > 10 ? 'Too many keywords' : keywords.split(', ').length < 5 ? 'Too few keywords' : null,
    },
  };
  
  return analysis;
};