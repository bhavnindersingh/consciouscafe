# Components

This directory contains all reusable UI components organized by feature domain.

## Structure

Components are grouped by functionality:

- **layout/** - Header, Footer, Hero and other layout components
- **products/** - Product-related components (Card, Grid, etc.)
- **cart/** - Shopping cart components
- **social/** - Social media integrations (Instagram feed, etc.)
- **seo/** - SEO-related components
- **common/** - Shared/generic components used across features

## Component Organization

Each component should live in its own folder:

```
ComponentName/
├── ComponentName.js
├── ComponentName.css
├── ComponentName.test.js (optional)
└── index.js (optional - for clean imports)
```

## Guidelines

1. Components should be reusable and not tied to specific pages
2. Keep components small and focused on a single responsibility
3. Colocate styles with components
4. Use PropTypes or TypeScript for prop validation
5. Write components to be as generic as possible
6. Extract page-specific components to page folders

## Naming Conventions

- Use PascalCase for component names
- Component file should match the folder name
- CSS file should match the component name
