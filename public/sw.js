const CACHE_NAME = 'reel-wheels-v1';
const STATIC_CACHE_NAME = 'reel-wheels-static-v1';
const API_CACHE_NAME = 'reel-wheels-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo-color.webp',
  '/logo.png',
  '/vdp hero (2).webp',
  '/reel wheel hero_first slide.webp',
  '/about us section background.webp',
  '/site.webmanifest'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/v1/products',
  '/v1/memorabilia',
  '/v1/merchandises'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE_NAME)
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with stale-while-revalidate
  if (url.hostname === 'reel-wheel-api-x92jj.ondigitalocean.app') {
    event.respondWith(staleWhileRevalidate(request, API_CACHE_NAME));
    return;
  }

  // Handle static assets with cache-first
  if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
      url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff|woff2)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    return;
  }

  // Handle navigation requests with network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Default to network-first for other requests
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// Cache-first strategy for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback if available
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy for navigation
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy for API requests
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Always try to fetch fresh data
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Return cached version on network error
    return cached;
  });
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // Otherwise wait for network
  return fetchPromise;
}

// Background sync for cache updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'cache-update') {
    event.waitUntil(updateCaches());
  }
});

async function updateCaches() {
  const cache = await caches.open(API_CACHE_NAME);
  const requests = await cache.keys();
  
  // Update cached API responses
  const updatePromises = requests.map(async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response);
      }
    } catch (error) {
      console.log('Failed to update cache for:', request.url);
    }
  });
  
  await Promise.all(updatePromises);
}

// Handle cache invalidation messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INVALIDATE_CACHE') {
    const { pattern } = event.data;
    invalidateCache(pattern);
  }
});

async function invalidateCache(pattern) {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (new RegExp(pattern).test(request.url)) {
        await cache.delete(request);
      }
    }
  }
}