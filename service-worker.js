const CACHE_NAME = 'meu-pwa-cache-v1';
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
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                urlsToCache.map(url =>
                    fetch(url).then(response => {
                        if (response.ok) {
                            return cache.put(url, response);
                        } else {
                            console.warn("Não foi possível cachear:", url);
                        }
                    }).catch(err => {
                        console.warn("Erro ao buscar para cachear:", url, err);
                    })
                )
            );
        })
    );
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Intercepta as requisições e responde com cache ou rede
self.addEventListener('fetch', event => {
    // Ignora requisições que não sejam http/https
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }

            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(err => {
                console.warn("Falha ao buscar:", event.request.url, err);
            });
        })
    );
});
