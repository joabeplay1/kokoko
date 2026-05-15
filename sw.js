// sw.js - Este arquivo roda escondido em segundo plano no seu computador
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Escuta as ordens enviadas pelo script.js para disparar a notificação no Windows
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DISPARAR_ALERTA') {
        const title = event.data.title;
        const options = {
            body: event.data.desc || 'Lembrete do aplicativo Jesus Reina',
            icon: 'https://cdn-icons-png.flaticon.com/512/3602/3602149.png', // Ícone padrão de sino
            badge: 'https://cdn-icons-png.flaticon.com/512/3602/3602149.png',
            tag: 'jesus-reina-alerta', // Evita acumular notificações repetidas
            requireInteraction: true, // Faz a notificação ficar travada na tela até você clicar
            silent: false // Permite que o Windows emita o som padrão dele
        };

        // Faz o banner pular oficialmente na tela do sistema operacional
        self.registration.showNotification(title, options);
    }
});
