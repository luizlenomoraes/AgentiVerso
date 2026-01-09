// Service Worker para AgentiVerso PWA
// Este arquivo é carregado diretamente pelo navegador

const CACHE_NAME = 'agentiverso-v1';

// Assets para cachear no install
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icon-light-32x32.png',
    '/icon-dark-32x32.png',
    '/apple-icon.png',
];

// Install event - cachear assets estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Ativar imediatamente
    self.skipWaiting();
});

// Activate event - limpar caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    // Tomar controle imediatamente
    self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Ignorar requisições não-GET
    if (event.request.method !== 'GET') return;

    // Ignorar requisições de API (sempre buscar do servidor)
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone a resposta para cachear
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Se falhar, tentar do cache
                return caches.match(event.request);
            })
    );
});
