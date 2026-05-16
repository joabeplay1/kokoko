// sw.js - Versão Corrigida para Reativar o Botão de Baixar (PWA)
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// OBRIGATÓRIO PARA O NAVEGADOR PERMITIR O DOWNLOAD (BOTÃO DE BAIXAR)
// Esse evento intercepta as buscas e prova ao navegador que o app funciona offline
self.addEventListener('fetch', (event) => {
    // Mantém as requisições fluindo normalmente sem travar o site
    event.respondWith(fetch(event.request).catch(() => fetch(event.request)));
});

// CONTROLE DE NOTIFICAÇÕES EM SEGUNDO PLANO (Mantido Intacto)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DISPARAR_ALERTA') {
        const title = event.data.title;
        const options = {
            body: event.data.desc || 'Lembrete do aplicativo Jesus Reina',
            icon: 'icone-jesus-reina.png', // Usa o novo ícone da águia como padrão
            badge: 'icone-jesus-reina.png',
            tag: 'jesus-reina-alerta',
            requireInteraction: true,
            silent: false
        };

        self.registration.showNotification(title, options);
    }
});
