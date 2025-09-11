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
    title: 'Home',
    description: 'Welcome to Conscious Cafe in Auroville - where every dish tells a story of quality and care. Experience our artisanal vegan and vegetarian food made with conscious ingredients.',
    keywords: 'conscious cafe, artisanal food, organic beverages, healthy restaurant, local ingredients, sustainable dining, fresh food, coffee shop, auroville, yoga retreat, vegan, vegetarian',
  },
  menu: {
    title: 'Food Menu',
    description: 'Explore our carefully crafted vegan and vegetarian food menu at Conscious Cafe Auroville. Artisanal dishes made with conscious, organic ingredients.',
    keywords: 'food menu, artisanal dishes, organic food, healthy meals, breakfast, lunch, dinner, conscious eating, local ingredients, vegan, vegetarian, auroville',
  },
  drinks: {
    title: 'Drinks Menu',
    description: 'Discover our premium beverage selection at Conscious Cafe Auroville including artisanal coffee, organic teas, fresh juices, and specialty drinks made with conscious ingredients.',
    keywords: 'drinks menu, artisanal coffee, organic tea, fresh juices, specialty beverages, conscious drinks, premium coffee, auroville',
  },
  about: {
    title: 'About Us',
    description: 'Learn about Conscious Cafe Auroville\'s commitment to quality, sustainability, and conscious eating. Our story of bringing artisanal vegan and vegetarian food to the Auroville community.',
    keywords: 'about conscious cafe, sustainable restaurant, organic food philosophy, local sourcing, conscious eating, community cafe, auroville, yoga retreat, vegan, vegetarian',
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Conscious Cafe Auroville. Find our location at Kavas Yoga Retreat, hours, contact information, and learn how to make reservations for your next visit.',
    keywords: 'contact conscious cafe, restaurant location, hours, reservations, phone number, address, directions, auroville, kavas yoga retreat',
  },
  delivery: {
    title: 'Delivery Information',
    description: 'Learn about Conscious Cafe Auroville\'s delivery options, areas served, and ordering process. Enjoy our artisanal vegan and vegetarian food from the comfort of your home.',
    keywords: 'food delivery, conscious cafe delivery, online ordering, delivery areas, takeout, food delivery service, auroville, vegan, vegetarian',
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