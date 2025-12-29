# Pages

This directory contains all full-page components that are directly associated with routes in the application.

## Structure

Each page should be in its own folder with related files colocated:

```
PageName/
├── PageName.js       # Main page component
├── PageName.css      # Page-specific styles
└── components/       # Page-specific sub-components (if needed)
```

## Current Pages

- **Home/** - Landing page with hero section
- **Menu/** - Food and drinks menu pages
- **Products/** - Product detail and listing pages
- **Checkout/** - Checkout and payment pages
- **Info/** - About Us, Contact, Delivery Info, Privacy, Terms
- **Dashboard/** - Admin dashboard for workshop management
- **Auth/** - Login and registration pages
- **NotFound/** - 404 error page

## Guidelines

1. Page components should be route-level components
2. Keep page-specific logic within the page component
3. Extract reusable components to `src/components/`
4. Colocate page-specific styles with the page component
5. Use descriptive names with "Page" suffix (e.g., `FoodMenuPage.js`)
