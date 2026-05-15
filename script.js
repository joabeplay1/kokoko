const notificationArea = document.getElementById('notification-area');
const sideMenu = document.getElementById('side-menu');
const agendamentosAtivos = [];

// Função para exibir notificações na tela
function sendNotify(type, title, message) {
    const card = document.createElement('div');
    card.classList.add('notification', type);
    card.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
    notificationArea.prepend(card);
}

// Abrir e Fechar Menu Lateral
document.getElementById('open-menu').addEventListener('click', () => sideMenu.classList.add('active'));
document.getElementById('close-menu').addEventListener('click', () => sideMenu.classList.remove('active'));

// Lógica de Agendamento
document.getElementById('save-event').addEventListener('click', () => {
    const title = document.getElementById('event-title').value;
    const desc = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const cat = document.getElementById('event-category').value;
    const soundFile = document.getElementById('event-sound').files[0];

    if (title && date && time) {
        let soundUrl = null;
        if (soundFile) {
            soundUrl = URL.createObjectURL(soundFile);
        }

        // Adiciona à lista de monitoramento
        agendamentosAtivos.push({
            title, desc, date, time, cat, soundUrl, tocado: false
        });

        // Notificação de confirmação visual
        const dataBr = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
        sendNotify('info', `Agendado: ${title}`, `⏰ ${dataBr} às ${time}`);

        // Limpa campos e fecha menu
        sideMenu.classList.remove('active');
        document.getElementById('event-title').value = '';
        document.getElementById('event-desc').value = '';
        document.getElementById('event-sound').value = '';
    } else {
        alert("Preencha título, data e hora.");
    }
});

// MONITOR DE TEMPO REAL (Checa a cada 1 segundo)
setInterval(() => {
    const agora = new Date();
    const dataAtual = agora.toISOString().split('T')[0];
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    agendamentosAtivos.forEach(evento => {
        if (evento.date === dataAtual && evento.time === horaAtual && !evento.tocado) {
            evento.tocado = true; 

            // Disparar Notificação Visual
            sendNotify(evento.cat, `⏰ AGORA: ${evento.title}`, evento.desc);

            // Tocar Som se existir
            if (evento.soundUrl) {
                const audio = new Audio(evento.soundUrl);
                audio.play().catch(() => {
                    console.warn("Interaja com a página para permitir a reprodução de som.");
                });
            }
        }
    });
}, 1000);

// Limpar Painel
document.getElementById('clear-all').addEventListener('click', () => {
    notificationArea.innerHTML = '';
});
