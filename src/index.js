import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Global Styles - Import order matters!
import './styles/reset.css';      // 1. Reset browser defaults
import './styles/variables.css';  // 2. CSS custom properties
import './styles/typography.css'; // 3. Font definitions
import './styles/global.css';     // 4. Base global styles
import './styles/utilities.css';  // 5. Utility classes
import './styles/auth.css';       // 6. Authentication pages
import './styles/dashboard.css';  // 7. Dashboard pages
import './styles/App.css';        // 8. Component-specific styles

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Register service worker for caching - TEMPORARILY DISABLED
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('SW registered: ', registration);
//       })
//       .catch(registrationError => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }
