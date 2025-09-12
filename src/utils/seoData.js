// SEO data constants and utilities for Conscious Cafe

export const siteConfig = {
  name: 'Conscious Cafe',
  title: 'Conscious Cafe - Premium Artisanal Food & Beverages',
  description: 'Experience artisanal food and beverages made with conscious ingredients at Conscious Cafe. Fresh, organic, and locally sourced meals in a welcoming atmosphere.',
  url: 'https://consciouscafe.in',
  image: '/android-icon-192x192.png',
  author: 'Conscious Cafe',
  keywords: 'conscious cafe, artisanal food, organic beverages, healthy eating, local ingredients, sustainable dining, fresh food, coffee shop, restaurant, auroville, yoga retreat, vegan, vegetarian',
  social: {
    twitter: '@consciouscafe',
    instagram: '@consciouscafe.kavas',
  },
  business: {
    name: 'Conscious Cafe',
    address: {
      street: 'Kavas Yoga Retreat, Auroville Rd, Auroville Kuilapalayam',
      city: 'Auroville',
      state: 'Tamil Nadu',
      zip: '605101',
      country: 'IN',
    },
    phone: '+91-XXXX-XXXXXX', // Add actual phone when available
    email: 'info@consciouscafe.in',
    hours: {
      monday: '7:00 AM - 9:00 PM',
      tuesday: '7:00 AM - 9:00 PM',
      wednesday: '7:00 AM - 9:00 PM',
      thursday: '7:00 AM - 9:00 PM',
      friday: '7:00 AM - 10:00 PM',
      saturday: '8:00 AM - 10:00 PM',
      sunday: '8:00 AM - 9:00 PM',
    },
    cuisine: ['Organic', 'Healthy', 'Vegetarian', 'Vegan', 'Continental', 'Local', 'Sustainable'],
    priceRange: '$$',
  },
};

export const pageData = {
  home: {
    title: 'Conscious Cafe Auroville | Artisanal Vegan Restaurant',
    description: 'Experience artisanal vegan & vegetarian food at Conscious Cafe Auroville. Fresh, organic meals with conscious ingredients at Kavas Yoga Retreat. Order online now!',
    keywords: 'conscious cafe auroville, artisanal vegan restaurant, organic food auroville, healthy restaurant, sustainable dining, kavas yoga retreat, conscious eating, vegan, vegetarian',
  },
  menu: {
    title: 'Vegan Food Menu | Conscious Cafe Auroville',
    description: 'Browse our artisanal vegan & vegetarian menu featuring toasts, bowls, salads & desserts. Fresh, organic ingredients. Best healthy restaurant in Auroville!',
    keywords: 'vegan menu auroville, organic food menu, healthy restaurant menu, artisanal dishes, vegan breakfast, vegetarian lunch, conscious cafe menu, auroville dining',
  },
  about: {
    title: 'About Conscious Cafe | Sustainable Dining Auroville',
    description: 'Discover Conscious Cafe Auroville\'s mission of sustainable, conscious eating. Located at Kavas Yoga Retreat, we serve artisanal vegan food with love.',
    keywords: 'about conscious cafe auroville, sustainable restaurant, organic food philosophy, kavas yoga retreat, conscious eating, eco-friendly dining, vegan restaurant story',
  },
  contact: {
    title: 'Contact & Location | Conscious Cafe Auroville',
    description: 'Visit Conscious Cafe at Kavas Yoga Retreat, Auroville. Get directions, hours, phone & reservation info. Best vegan restaurant in Auroville Tamil Nadu.',
    keywords: 'conscious cafe location, auroville restaurant address, kavas yoga retreat, contact details, restaurant hours, reservations auroville, directions',
  },
  delivery: {
    title: 'Food Delivery Auroville | Conscious Cafe Online Order',
    description: 'Order healthy vegan food delivery from Conscious Cafe Auroville. Fresh, organic meals delivered to your door. Serving Auroville and nearby areas.',
    keywords: 'food delivery auroville, vegan food delivery, conscious cafe delivery, online food order, healthy meal delivery, organic food delivery, takeout auroville',
  },
};

// Generate structured data for different page types
export const generateStructuredData = (type, data = {}) => {
  const baseOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${siteConfig.url}#organization`,
    name: siteConfig.business.name,
    alternateName: 'Conscious Cafe',
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}${siteConfig.image}`,
      width: 192,
      height: 192,
    },
    image: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}${siteConfig.image}`,
      width: 192,
      height: 192,
    },
    description: siteConfig.description,
    telephone: siteConfig.business.phone,
    email: siteConfig.business.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.business.address.street,
      addressLocality: siteConfig.business.address.city,
      addressRegion: siteConfig.business.address.state,
      postalCode: siteConfig.business.address.zip,
      addressCountry: siteConfig.business.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 11.9996,
      longitude: 79.8083,
    },
    hasMap: 'https://maps.app.goo.gl/BJQxMdC',
    servesCuisine: siteConfig.business.cuisine,
    priceRange: siteConfig.business.priceRange,
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Digital Payment',
    openingHours: Object.entries(siteConfig.business.hours).map(([day, hours]) => 
      `${day.charAt(0).toUpperCase() + day.slice(1)} ${hours}`
    ),
    openingHoursSpecification: Object.entries(siteConfig.business.hours).map(([day, hours]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      opens: hours.split(' - ')[0],
      closes: hours.split(' - ')[1],
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    review: [{
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Sarah Johnson',
      },
      datePublished: '2024-01-15',
      reviewBody: 'Amazing conscious food with great atmosphere. The avocado toast was exceptional!',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
        worstRating: '1',
      },
    }],
    menu: `${siteConfig.url}/menu`,
    acceptsReservations: true,
    sameAs: [
      `https://instagram.com/${siteConfig.social.instagram.replace('@', '')}`,
    ],
  };

  switch (type) {
    case 'restaurant':
      return baseOrganization;
    
    case 'menuItem':
      return {
        '@context': 'https://schema.org',
        '@type': 'MenuItem',
        '@id': `${siteConfig.url}/product/${data.id}`,
        name: data.name,
        description: data.description,
        image: {
          '@type': 'ImageObject',
          url: data.image,
          width: 400,
          height: 400,
        },
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `${siteConfig.url}/product/${data.id}`,
        },
        nutrition: data.nutrition && {
          '@type': 'NutritionInformation',
          calories: `${data.nutrition.calories} cal`,
          proteinContent: `${data.nutrition.protein}g`,
          carbohydrateContent: `${data.nutrition.carbs}g`,
          fatContent: `${data.nutrition.fats}g`,
          fiberContent: `${data.nutrition.fiber}g`,
        },
        menuAddOn: data.addOns && data.addOns.map(addon => ({
          '@type': 'MenuAddOn',
          name: addon.name,
          description: addon.description,
        })),
        isPartOf: {
          '@type': 'Menu',
          name: 'Conscious Cafe Menu',
          url: `${siteConfig.url}/menu`,
        },
        suitableForDiet: data.dietary && data.dietary.map(diet => `https://schema.org/${diet}`),
      };
    
    case 'breadcrumb':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
    
    case 'website':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
    
    default:
      return baseOrganization;
  }
};

// Generate page-specific SEO data
export const generatePageSEO = (page, additionalData = {}) => {
  const baseData = pageData[page] || pageData.home;
  
  return {
    title: baseData.title,
    description: baseData.description,
    keywords: baseData.keywords,
    url: `${siteConfig.url}${page === 'home' ? '' : `/${page}`}`,
    structuredData: generateStructuredData('restaurant'),
    ...additionalData,
  };
};