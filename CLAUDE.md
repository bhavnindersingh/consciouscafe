# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based restaurant website for Conscious Cafe, featuring an artisanal food and beverage menu with e-commerce capabilities. The site includes product browsing, cart functionality, checkout process, and comprehensive SEO optimization.

## Development Commands

### Core Development Commands
- `npm start` - Start development server (USER WILL START MANUALLY - DO NOT RUN)
- `npm run build` - Build for production
- `npm test` - Run tests (React Testing Library)

### Deployment
- Deployed on Netlify with automatic builds from Git
- Build configuration in `netlify.toml`
- Node.js version 18 required for deployment

## Architecture Overview

### Component Structure
The application follows a standard React component hierarchy:

- **App.js** - Main application component with routing, state management for cart, and category definitions
- **Components** - Modular React components organized by functionality:
  - Navigation: `Header.js`, `Footer.js`
  - Product Display: `ProductGrid.js`, `ProductCard.js`, `ProductPage.js`, `ProductDetailPage.js`
  - Menu Pages: `FoodMenuPage.js`, `DrinksMenuPage.js`, `CategoryPage.js`
  - E-commerce: `Cart.js`, `Checkout.js`
  - Content: `Hero.js`, `AboutUs.js`, `Contact.js`, `DeliveryInfo.js`
  - Utilities: `SEO.js`, `InstagramFeed.js`

### State Management
- Local React state for cart management with localStorage persistence
- Cart state managed in `App.js` and passed down to components
- Product navigation using React Router with dynamic URLs

### Data Structure
- **products.js** - Centralized product data with categories, pricing, descriptions, and images
- Categories: Toast, All Day Breakfast, Smoothie Bowls, Earth Grills/Crisps, Salads, Platters, Earth Bowls, Noodle Bowls, Pasta/Pizza, Desserts
- Drink categories managed separately in drink menu components

### Routing Architecture
- React Router v6 with slug-based product URLs
- Category-based navigation: `/category/:categoryId`
- Product detail pages: `/product/:productSlug`
- Menu pages: `/menu` (food), `/drinks` (beverages)
- Static pages: `/about`, `/contact`, `/delivery`

## SEO Implementation

### Comprehensive SEO Setup
The site includes extensive SEO optimization:

- **react-helmet-async** for dynamic meta tags
- **Structured Data**: Restaurant, LocalBusiness, MenuItem, BreadcrumbList schemas
- **Product Pages**: Individual SEO optimization for each menu item
- **Social Media**: Open Graph and Twitter Card tags

### SEO Architecture
- **SEO.js** - Reusable SEO component
- **seoData.js** - Centralized SEO configuration and structured data
- **sitemapGenerator.js** - Sitemap generation utilities

### Configuration Requirements
Update actual business information in `src/utils/seoData.js`:
- Business address and coordinates
- Phone number and email
- Domain URL (currently placeholder)

## Styling Architecture

### CSS Organization
- **App.css** - Main stylesheet with responsive design
- Component-specific styles integrated within the main CSS file
- Mobile-first responsive design with breakpoints at 768px and 480px

### Key Style Features
- Custom CSS Grid layouts for product displays
- ImageKit video player integration for hero banner video
- Hardware acceleration for smooth animations
- Comprehensive mobile responsiveness

## Known Issues & Fixes

### Deployment-Specific Issues
- **CSS Build Failures**: Invalid CSS syntax can break Netlify builds - ensure proper CSS comment syntax
- **Mobile Responsiveness**: Production builds may lose responsive styles if CSS syntax errors occur
- **Hero Video**: ImageKit video player requires proper z-index management to ensure content visibility

### Development vs Production Differences
- CSS minifier in production is more strict than development server
- Media queries can be lost during build if CSS syntax errors exist
- Z-index conflicts may appear differently in production

## Video Integration

The hero section uses ImageKit video player:
- ImageKit iframe embed configured in `Hero.js`
- Video set to autoplay, loop, and muted for optimal user experience
- Custom inline styles and CSS ensure proper sizing and content visibility
- Background color set to black (#000000) for seamless loading

## Data Management

### Product Data Structure
Products include:
- Categories and subcategories
- Pricing (including dietary-specific prices)
- Nutritional information
- Image URLs (Sirv CDN)
- SEO-optimized descriptions

### Cart Functionality
- localStorage persistence
- Quantity management
- Checkout integration
- WhatsApp ordering system (utility in `src/utils/whatsapp.js`)

## Critical Development Notes

- **NEVER run `npm start` automatically** - User will start the development server manually when needed
- Always run builds locally before deployment to catch CSS syntax errors
- Product URLs are auto-generated from product names using slug conversion
- Category definitions in `App.js` must match product categories in `products.js`
- SEO data should be updated with actual business information before production use