/**
 * Reel Wheels Experience - Main Application Entry Point
 * Developed by SeGa_cc
 * © 2025 DealerTower - All Rights Reserved
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Developer signature
console.log('%c🎬 Reel Wheels Experience', 'color: #bf9e47; font-size: 24px; font-weight: bold;');
console.log('%c⚡ Developed by SeGa_cc', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('%c🚀 Powered by DealerTower', 'color: #10b981; font-size: 14px;');
console.log('%c📧 Contact: https://dealertower.com', 'color: #6b7280; font-size: 12px;');

// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Update service worker when new version is available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, refresh the page
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Preload critical resources
const preloadCriticalResources = () => {
  const criticalImages = [
    '/logo-color.webp',
    '/reel wheel hero_first slide.webp',
    '/logo black and white.webp'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);

// Initialize performance optimizations
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadCriticalResources);
} else {
  preloadCriticalResources();
}