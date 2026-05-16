const CACHE_NAME = 'jesus-reina-cache-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icone-jesus-reina.png'
];

// Instala e força o armazenamento dos arquivos principais para o app rodar offline
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(assets);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Responde às requisições do app e gerencia as notificações do sistema
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DISPARAR_ALERTA') {
        const title = event.data.title;
        const options = {
            body: event.data.desc || 'Lembrete do aplicativo Jesus Reina',
            icon: 'icone-jesus-reina.png',
            badge: 'icone-jesus-reina.png',
            tag: 'jesus-reina-alerta',
            requireInteraction: true,
            silent: false
        };
        self.registration.showNotification(title, options);
    }
});
