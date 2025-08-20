const CACHE_NAME = 'meu-pwa-cache-v2';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './icons/atom.png',
    './icons/python.png'
];

// Instalação do Service Worker e cache inicial
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                for (const url of urlsToCache) {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            await cache.put(url, response.clone());
                        } else {
                            console.warn('Não foi possível cachear:', url, 'Status:', response.status);
                        }
                    } catch (err) {
                        console.warn('Erro ao cachear:', url, err);
                    }
                }
            })
    );
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            )
        )
    );
});

// Intercepta as requisições e responde com cache ou rede
self.addEventListener('fetch', event => {
    // Ignora requisições não HTTP/HTTPS
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;

            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache).catch(err => {
                        console.warn('Não foi possível adicionar ao cache:', event.request.url, err);
                    });
                });

                return networkResponse;
            }).catch(err => {
                console.warn('Falha no fetch:', event.request.url, err);
            });
        })
    );
});
