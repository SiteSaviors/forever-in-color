
// Advanced Service Worker for Canvas Art Platform
const CACHE_NAME = 'canvas-art-v1';
const STATIC_CACHE = 'static-v1';
const IMAGE_CACHE = 'images-v1';
const API_CACHE = 'api-v1';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/product',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png', // Critical images
  '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png',
  '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png'
];

// Install event - Cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(CRITICAL_RESOURCES)),
      self.skipWaiting()
    ])
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !cacheName.includes('v1'))
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - Intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Image caching strategy - Cache first, network fallback
  if (request.destination === 'image' || url.pathname.includes('/lovable-uploads/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            // Serve from cache, update in background
            fetch(request).then(fetchResponse => {
              if (fetchResponse.ok) {
                cache.put(request, fetchResponse.clone());
              }
            }).catch(() => {});
            return response;
          }
          
          // Not in cache, fetch and cache
          return fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          }).catch(() => {
            // Return placeholder if offline
            return new Response('', { status: 200, statusText: 'Offline' });
          });
        });
      })
    );
    return;
  }

  // API caching strategy - Network first, cache fallback
  if (url.pathname.includes('/api/') || url.pathname.includes('/functions/')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          caches.open(API_CACHE).then(cache => {
            cache.put(request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        return caches.open(API_CACHE).then(cache => {
          return cache.match(request);
        });
      })
    );
    return;
  }

  // Static resources - Cache first
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(fetchResponse => {
        if (fetchResponse.ok) {
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, fetchResponse.clone());
          });
        }
        return fetchResponse;
      });
    })
  );
});

// Background sync for failed uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle failed image uploads when back online
  try {
    const failedUploads = await getFailedUploads();
    for (const upload of failedUploads) {
      await retryUpload(upload);
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

function getFailedUploads() {
  return new Promise((resolve) => {
    // Get failed uploads from IndexedDB
    resolve([]);
  });
}

function retryUpload(upload) {
  return fetch('/api/upload', {
    method: 'POST',
    body: upload.data
  });
}
