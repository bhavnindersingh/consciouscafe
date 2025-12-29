# Services

This directory contains modules for interacting with external services and APIs.

## Structure

```
services/
├── api/              # API endpoint functions
│   ├── workshops.js
│   ├── orders.js
│   └── users.js
├── supabase/         # Supabase client configuration
│   └── supabaseClient.js
└── analytics/        # Analytics tracking
    └── analytics.js
```

## Purpose

Services encapsulate:
- API calls to backend services
- Third-party integrations (Supabase, Stripe, etc.)
- Analytics tracking
- External service configurations

## Guidelines

1. **Separation of Concerns**: Keep API logic separate from components
2. **Error Handling**: Always handle errors gracefully
3. **Type Safety**: Document expected parameters and return types
4. **Async/Await**: Use modern async patterns
5. **Environment Config**: Use environment variables for API keys

## Example Service

```javascript
// services/api/workshops.js
import { supabase } from 'services/supabase/supabaseClient';

export const workshopService = {
  async getAll() {
    const { data, error } = await supabase
      .from('workshops')
      .select('*');

    if (error) throw error;
    return data;
  },

  async create(workshop) {
    const { data, error } = await supabase
      .from('workshops')
      .insert([workshop]);

    if (error) throw error;
    return data;
  }
};
```

## Usage

```javascript
import { workshopService } from 'services/api/workshops';

async function loadWorkshops() {
  const workshops = await workshopService.getAll();
  // ...
}
```
