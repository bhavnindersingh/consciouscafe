import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData,
  canonical,
  noIndex = false,
}) => {
  const siteTitle = 'Conscious Cafe - Food & Beverages';
  const siteDescription = 'Experience conscious food and beverages at Conscious Cafe. Fresh, organic, and locally sourced meals in a welcoming atmosphere.';
  const siteImage = '/android-icon-192x192.png';
  const siteUrl = 'https://consciouscafe.com'; // Replace with actual domain
  
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const pageDescription = description || siteDescription;
  const pageImage = image || siteImage;
  const pageUrl = url || siteUrl;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || pageUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:alt" content={title || 'Conscious Cafe'} />
      <meta property="og:site_name" content="Conscious Cafe" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:site" content="@consciouscafe" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Conscious Cafe" />
      <meta name="theme-color" content="#26532B" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;