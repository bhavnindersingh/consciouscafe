import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig, OG_IMAGE } from '../../../utils/seoData';

const SEO = ({
  title,
  description,
  keywords,
  image,
  imageWidth,
  imageHeight,
  url,
  type = 'website',
  structuredData,
  canonical,
  noIndex = false,
}) => {
  const siteTitle = siteConfig.title;
  const siteDescription = siteConfig.description;
  const siteUrl = siteConfig.url;

  // Resolve a possibly-relative path to an absolute URL.
  const absolute = (path) => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;
    return `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Page titles are supplied complete (they already include the brand), so we
  // use them verbatim and only fall back to the site title when absent.
  const pageTitle = title || siteTitle;
  const pageDescription = description || siteDescription;
  const pageImage = absolute(image) || OG_IMAGE;
  const pageUrl = absolute(url) || siteUrl;
  const canonicalUrl = absolute(canonical) || pageUrl;

  // Only declare dimensions for the default 1200×630 share image; custom
  // (e.g. portrait product) images shouldn't claim landscape dimensions.
  const usingDefaultImage = pageImage === OG_IMAGE;
  const ogWidth = imageWidth || (usingDefaultImage ? 1200 : undefined);
  const ogHeight = imageHeight || (usingDefaultImage ? 630 : undefined);

  const schemas = !structuredData
    ? []
    : Array.isArray(structuredData)
      ? structuredData
      : [structuredData];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:alt" content={title || siteConfig.name} />
      {ogWidth && <meta property="og:image:width" content={String(ogWidth)} />}
      {ogHeight && <meta property="og:image:height" content={String(ogHeight)} />}
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:image:alt" content={title || siteConfig.name} />
      <meta name="twitter:site" content={siteConfig.social.twitter} />
      <meta name="twitter:creator" content={siteConfig.social.twitter} />

      {/* Additional Meta Tags */}
      <meta name="author" content={siteConfig.author} />
      <meta name="theme-color" content="#26532B" />

      {/* Structured Data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
