const notificationArea = document.getElementById('notification-area');
const sideMenu = document.getElementById('side-menu');
const agendamentosAtivos = [];
let audioAtual = null;

// Parar Som Globalmente
function stopNotificationSound() {
    if (audioAtual) {
        audioAtual.pause();
        audioAtual.currentTime = 0;
        audioAtual = null;
    }
}

// Exibir Notificação na Tela
function sendNotify(type, title, message, showStopBtn = false) {
    const card = document.createElement('div');
    card.className = `notification ${type}`;
    
    let btnHtml = '';
    if(showStopBtn) {
        btnHtml = `<button class="btn-stop-audio" onclick="stopNotificationSound(); this.parentElement.remove()">
                    <i class="fas fa-stop"></i> Parar Alerta
                   </button>`;
    }

    card.innerHTML = `<h4>${title}</h4><p>${message}</p>${btnHtml}`;
    notificationArea.prepend(card);
}

// Abrir/Fechar Menu
document.getElementById('open-menu').addEventListener('click', () => sideMenu.classList.add('active'));
document.getElementById('close-menu').addEventListener('click', () => sideMenu.classList.remove('active'));

// Salvar Agendamento
document.getElementById('save-event').addEventListener('click', () => {
    const title = document.getElementById('event-title').value;
    const desc = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const cat = document.getElementById('event-category').value;
    const soundFile = document.getElementById('event-sound').files[0];
    
    // Pega dias selecionados
    const selectedDays = Array.from(document.querySelectorAll('.days-selector input:checked')).map(cb => parseInt(cb.value));

    if (title && time) {
        let soundUrl = soundFile ? URL.createObjectURL(soundFile) : null;

        agendamentosAtivos.push({
            title, desc, date, time, cat, soundUrl, 
            days: selectedDays,
            tocadoHoje: false
        });

        sendNotify('info', 'Agendado com Sucesso', `O alerta "${title}" tocará às ${time}.`);
        
        sideMenu.classList.remove('active');
        // Reset campos
        document.getElementById('event-title').value = '';
        document.getElementById('event-desc').value = '';
    } else {
        alert("Preencha ao menos Título e Hora!");
    }
});

// MONITOR DE TEMPO REAL
setInterval(() => {
    const agora = new Date();
    const diaSemana = agora.getDay();
    const dataHoje = agora.toISOString().split('T')[0];
    const horaAgora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    agendamentosAtivos.forEach(evento => {
        // Verifica se é dia de semana escolhido OU se é a data específica
        const eDiaDeTocar = evento.days.length > 0 ? evento.days.includes(diaSemana) : (evento.date === dataHoje);

        if (eDiaDeTocar && evento.time === horaAgora && !evento.tocadoHoje) {
            evento.tocadoHoje = true;

            // Dispara visual com botão de parar
            sendNotify(evento.cat, `⏰ ALERTA: ${evento.title}`, evento.desc, true);

            // Toca o som
            if (evento.soundUrl) {
                stopNotificationSound();
                audioAtual = new Audio(evento.soundUrl);
                audioAtual.loop = true;
                audioAtual.play().catch(() => console.log("Clique na tela para habilitar áudio."));

                // Limite de 15 minutos
                setTimeout(() => stopNotificationSound(), 900000);
            }
        }

        // Reseta gatilho meia-noite
        if (horaAgora === "00:00") evento.tocadoHoje = false;
    });
}, 1000);

document.getElementById('clear-all').addEventListener('click', () => notificationArea.innerHTML = '');
