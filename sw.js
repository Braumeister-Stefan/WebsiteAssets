/**
 * Service Worker
 * Handles caching and offline support.
 */

const CACHE_NAME = 'wilmars-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/about.html',
    '/contact.html',
    '/project-particle-simulator.html',
    '/tradinator.html',
    '/css/main.css',
    '/css/home.css',
    '/css/about.css',
    '/css/contact.css',
    '/css/project.css',
    '/css/tradinator.css',
    '/js/modules/utils.js',
    '/js/modules/themeManager.js',
    '/js/modules/mouseTracking.js',
    '/js/modules/animations.js',
    '/js/pages/home.js',
    '/js/pages/about.js',
    '/js/pages/contact.js',
    '/js/pages/project.js',
    '/js/pages/tradinator.js',
    '/js/main.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function(name) { return name !== CACHE_NAME; })
                    .map(function(name) { return caches.delete(name); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    // Only intercept GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(function(cached) {
            return cached || fetch(event.request).catch(function() {
                // Network failed and no cache — nothing we can do for this request
                return new Response('', { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
});
