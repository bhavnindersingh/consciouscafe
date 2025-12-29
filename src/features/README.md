# Features

This directory contains self-contained feature modules that bundle related functionality.

## Structure

Each feature should be completely self-contained:

```
feature-name/
├── components/       # Feature-specific components
├── hooks/           # Feature-specific custom hooks
├── utils/           # Feature-specific utilities
├── context/         # Feature-specific context (optional)
├── services/        # Feature-specific API calls (optional)
└── README.md        # Feature documentation
```

## Current Features

- **workshops/** - Workshop/event management system
- **reservations/** - Table reservation system (planned)
- **loyalty/** - Customer loyalty program (planned)

## When to Create a Feature

Create a feature module when:
1. The functionality is substantial and self-contained
2. It has multiple related components, hooks, and utilities
3. It could potentially be extracted as a separate package
4. It has its own data model and business logic

## Guidelines

1. Features should be as independent as possible
2. Avoid importing between features - use shared utilities instead
3. Each feature should have its own README documenting usage
4. Keep feature-specific code within the feature folder
5. Export a public API from the feature's index.js

## Example Usage

```javascript
// Import from feature
import { WorkshopList, useWorkshops } from 'features/workshops';
```
