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
        caches.open(CACHE_NAME)
            .then(async cache => {
                try {
                    await cache.addAll(urlsToCache);
                } catch (err) {
                    console.error('Erro ao adicionar ao cache:', err);
                }
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
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se tiver no cache, retorna do cache
                if (response) {
                    return response;
                }

                // Se não tiver no cache, faz o fetch normalmente
                return fetch(event.request)
                    .then(networkResponse => {
                        // Verifica se a resposta é válida
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clona a resposta para salvar no cache
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    });
            })
    );
});
