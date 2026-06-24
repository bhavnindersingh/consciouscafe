// SEO data constants and utilities for Conscious Cafe

// Canonical 1200×630 social-share image. Gumlet mirrors the site's /images
// directory, so we transform the 4K hero poster down to the ideal OG ratio.
export const OG_IMAGE =
  'https://consciouscafe.gumlet.io/images/hero-poster.jpg?w=1200&h=630&fm=jpg&q=80&mode=crop';

export const siteConfig = {
  name: 'Conscious Cafe',
  // Default document title used when a page doesn't supply its own.
  title: 'Conscious Cafe Auroville | Vegetarian & Vegan Restaurant',
  description:
    'Conscious Cafe Auroville serves artisanal vegetarian & vegan food and beverages made with consciously sourced, non-processed ingredients — at Kavas Yoga Retreat. Order online or visit us.',
  url: 'https://consciouscafe.in',
  // Square logo, used for the Organization/Restaurant logo in structured data.
  logo: '/android-icon-192x192.png',
  image: OG_IMAGE,
  author: 'Conscious Cafe',
  keywords:
    'conscious cafe auroville, vegetarian vegan restaurant auroville, consciously sourced food, healthy eating, sustainable dining, plant-based, kavas yoga retreat, coffee shop auroville',
  social: {
    twitter: '@consciouscafe',
    instagram: '@consciouscafe.sanctuary',
  },
  business: {
    name: 'Conscious Cafe',
    address: {
      street: 'Kuilapalayam Main Road, Auroville Road',
      city: 'Auroville',
      state: 'Tamil Nadu',
      zip: '605101',
      country: 'IN',
    },
    phone: '+91 87545 61269',
    email: 'hello@consciouscafe.in',
    hours: {
      monday: '9:30 AM - 9:00 PM',
      tuesday: 'closed',
      wednesday: '9:30 AM - 9:00 PM',
      thursday: '9:30 AM - 9:00 PM',
      friday: '9:30 AM - 9:00 PM',
      saturday: '9:30 AM - 9:00 PM',
      sunday: '9:30 AM - 9:00 PM',
    },
    cuisine: ['Organic', 'Healthy', 'Vegetarian', 'Vegan', 'Continental', 'Local', 'Sustainable'],
    priceRange: '₹₹',
  },
};

export const pageData = {
  home: {
    title: 'Conscious Cafe Auroville | Best Vegetarian & Vegan Restaurant with Ice Bath, Sauna, Yogashala',
    description: 'Experience artisanal vegetarian & vegan food at Conscious Cafe Auroville. Fresh, consciously sourced non-processed meals with conscious ingredients at Kavas Yoga Retreat. Order online now!',
    keywords: 'conscious cafe auroville, artisanal vegetarian vegan restaurant, consciously sourced food auroville, healthy restaurant, sustainable dining, kavas yoga retreat, conscious eating, vegetarian, vegan, ice bath, sauna, yogashala',
  },
  menu: {
    title: 'Vegetarian & Vegan Food Menu | Conscious Cafe Auroville',
    description: 'Browse our artisanal vegetarian & vegan menu featuring toasts, bowls, salads & desserts. Fresh, consciously sourced non-processed ingredients. Best healthy restaurant in Auroville!',
    keywords: 'vegetarian vegan menu auroville, consciously sourced food menu, healthy restaurant menu, artisanal dishes, vegetarian vegan breakfast, plant-based lunch, conscious cafe menu, auroville dining',
  },
  food: {
    title: 'Food Menu — Toasts, Bowls, Salads & More | Conscious Cafe Auroville',
    description: 'Our all-day vegetarian & vegan food menu: artisanal toasts, smoothie bowls, salads, earth bowls, pasta & desserts. Consciously sourced, made in-house in Auroville.',
    keywords: 'vegetarian vegan food auroville, smoothie bowls, healthy breakfast auroville, plant-based lunch, conscious cafe food menu',
  },
  drinks: {
    title: 'Drinks Menu — Coffee, Shakes, Smoothies & Teas | Conscious Cafe Auroville',
    description: 'Explore our drinks: specialty coffee, health shakes, smoothies, cold pressed juices, kombucha & herbal teas. Plant-based and consciously made in Auroville.',
    keywords: 'coffee auroville, health shakes, smoothies auroville, cold pressed juice, kombucha, herbal tea, conscious cafe drinks menu',
  },
  patisserie: {
    title: 'Patisserie — Cakes, Bakes & Desserts | Conscious Cafe Auroville',
    description: 'Freshly baked vegetarian & vegan patisserie — cakes, tarts, cookies and desserts made in-house with consciously sourced ingredients in Auroville.',
    keywords: 'vegan cakes auroville, patisserie auroville, healthy desserts, bakes, conscious cafe desserts',
  },
  about: {
    title: 'About Conscious Cafe | Sustainable Dining Auroville',
    description: 'Discover Conscious Cafe Auroville\'s mission of sustainable, conscious eating. Located at Kavas Yoga Retreat, we serve artisanal vegetarian & vegan food with love.',
    keywords: 'about conscious cafe auroville, sustainable restaurant, consciously sourced food philosophy, kavas yoga retreat, conscious eating, eco-friendly dining, vegetarian vegan restaurant story',
  },
  visit: {
    title: 'Visit Us — Location, Hours & Sanctuary | Conscious Cafe Auroville',
    description: 'Visit Conscious Cafe at Kavas Yoga Retreat, Auroville Road. Find our hours, directions, and the sanctuary — ice bath, sauna and yogashala. Open Wed–Mon, 9:30am–9pm.',
    keywords: 'conscious cafe location, auroville restaurant directions, kavas yoga retreat, ice bath sauna auroville, yogashala, cafe hours auroville',
  },
  contact: {
    title: 'Contact & Location | Conscious Cafe Auroville',
    description: 'Visit Conscious Cafe at Kavas Yoga Retreat, Auroville. Get directions, hours, phone & reservation info. Best vegetarian & vegan restaurant in Auroville Tamil Nadu.',
    keywords: 'conscious cafe location, auroville restaurant address, kavas yoga retreat, contact details, restaurant hours, reservations auroville, directions',
  },
  delivery: {
    title: 'Food Delivery Auroville | Conscious Cafe Online Order',
    description: 'Order healthy vegetarian & vegan food delivery from Conscious Cafe Auroville. Fresh, consciously sourced non-processed meals delivered to your door. Serving Auroville and nearby areas.',
    keywords: 'food delivery auroville, vegetarian vegan food delivery, conscious cafe delivery, online food order, healthy meal delivery, consciously sourced food delivery, plant-based takeout auroville',
  },
  'privacy-policy': {
    title: 'Privacy Policy | Conscious Cafe Auroville',
    description: 'Privacy Policy for Conscious Cafe, Auroville. Learn how we collect, use, and protect your personal information.',
    keywords: 'privacy policy, conscious cafe, data protection, personal information, auroville, pondicherry',
  },
  'terms-of-service': {
    title: 'Terms of Service | Conscious Cafe Auroville',
    description: 'Terms of Service for Conscious Cafe, Auroville. Our policies for dining, delivery, and online ordering.',
    keywords: 'terms of service, conscious cafe, ordering policies, delivery terms, auroville, pondicherry',
  },
};

// The core Restaurant / LocalBusiness entity, reused everywhere.
const restaurantSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': `${siteConfig.url}/#restaurant`,
  name: siteConfig.business.name,
  alternateName: 'Conscious Cafe Auroville',
  url: siteConfig.url,
  logo: {
    '@type': 'ImageObject',
    url: `${siteConfig.url}${siteConfig.logo}`,
    width: 192,
    height: 192,
  },
  image: [
    OG_IMAGE,
    'https://consciouscafe.gumlet.io/images/for%20food%20menu%20banner.jpg?w=1200&h=800&fm=jpg&q=80&mode=crop',
  ],
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
  areaServed: ['Auroville', 'Kuilapalayam', 'Pondicherry', 'Tamil Nadu'],
  keywords: siteConfig.keywords,
  servesCuisine: siteConfig.business.cuisine,
  priceRange: siteConfig.business.priceRange,
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Digital Payment',
  openingHoursSpecification: Object.entries(siteConfig.business.hours)
    .filter(([, h]) => h !== 'closed')
    .map(([day, hours]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
      opens: to24h(hours.split(' - ')[0]),
      closes: to24h(hours.split(' - ')[1]),
    })),
  menu: `${siteConfig.url}/menu`,
  hasMenu: `${siteConfig.url}/menu`,
  acceptsReservations: false,
  sameAs: [
    `https://www.instagram.com/${siteConfig.social.instagram.replace('@', '')}/`,
  ],
});

// Frequently asked questions — eligible for FAQ rich results and a strong
// signal for "near me" / voice queries. Answers are grounded in real data.
export const FAQS = [
  {
    q: 'Is Conscious Cafe vegetarian and vegan?',
    a: 'Yes — our entire menu is vegetarian, with a large selection of vegan dishes clearly labelled. Everything is plant-forward and made in-house with consciously sourced, non-processed ingredients.',
  },
  {
    q: 'Where is Conscious Cafe located?',
    a: "We're at Kavas Yoga Retreat on Kuilapalayam Main Road (Auroville Road), Auroville, Tamil Nadu 605101 — a short drive from Pondicherry.",
  },
  {
    q: 'What are your opening hours?',
    a: "We're open Wednesday to Monday, 9:30am to 9:00pm, and closed on Tuesdays.",
  },
  {
    q: 'Do you offer food delivery in Auroville?',
    a: 'Yes — we deliver fresh vegetarian & vegan meals across Auroville and nearby areas. You can order online through our website.',
  },
  {
    q: 'Do I need a reservation?',
    a: 'No reservation is needed — walk in any time during opening hours and we\'ll find you a seat.',
  },
];

const faqSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

// "9:30 AM" -> "09:30" (schema.org expects 24h time)
function to24h(t = '') {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return t;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const mer = m[3].toUpperCase();
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  publisher: { '@id': `${siteConfig.url}/#restaurant` },
});

// Generate structured data for different page types
export const generateStructuredData = (type, data = {}) => {
  switch (type) {
    case 'restaurant':
      return restaurantSchema();

    case 'website':
      return websiteSchema();

    case 'faq':
      return faqSchema();

    // Homepage: emit the Restaurant + WebSite graph together.
    case 'home':
      return [restaurantSchema(), websiteSchema()];

    case 'menuItem':
      return {
        '@context': 'https://schema.org',
        '@type': 'MenuItem',
        '@id': `${siteConfig.url}/product/${data.id}`,
        name: data.name,
        description: data.description,
        image: data.image ? {
          '@type': 'ImageObject',
          url: data.image,
        } : undefined,
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
        suitableForDiet: data.dietary && data.dietary.map(diet => `https://schema.org/${diet}`),
        isPartOf: {
          '@type': 'Menu',
          name: 'Conscious Cafe Menu',
          url: `${siteConfig.url}/menu`,
        },
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

    default:
      return restaurantSchema();
  }
};

// Build a breadcrumb trail with absolute URLs.
export const breadcrumb = (items) =>
  generateStructuredData('breadcrumb', {
    items: items.map(i => ({ name: i.name, url: `${siteConfig.url}${i.path}` })),
  });

// Generate page-specific SEO data
export const generatePageSEO = (page, additionalData = {}) => {
  const baseData = pageData[page] || pageData.home;

  return {
    title: baseData.title,
    description: baseData.description,
    keywords: baseData.keywords,
    image: OG_IMAGE,
    url: `${siteConfig.url}${page === 'home' ? '' : `/${page}`}`,
    structuredData: generateStructuredData('restaurant'),
    ...additionalData,
  };
};
