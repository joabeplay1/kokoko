const notificationArea = document.getElementById('notification-area');
const sideMenu = document.getElementById('side-menu');
const agendamentosAtivos = [];
let somAtivo = null;

// Função para Desligar o Som
function desligarAlerta(botao) {
    if (somAtivo) {
        somAtivo.pause();
        somAtivo.currentTime = 0;
        somAtivo = null;
    }
    if(botao) {
        botao.innerHTML = '<i class="fas fa-check"></i> Alerta Silenciado';
        botao.style.background = "rgba(255,255,255,0.1)";
        botao.disabled = true;
    }
}

// Exibir Notificação na Tela
function sendNotify(type, title, message, imageUrl = null, showStopBtn = false) {
    const card = document.createElement('div');
    card.className = `notification ${type}`;
    
    let imgHtml = imageUrl ? `<img src="${imageUrl}" class="notification-capa">` : '';
    let btnHtml = showStopBtn ? `<button class="btn-stop-alerta" onclick="desligarAlerta(this)">
                                <i class="fas fa-volume-mute"></i> Desligar Som
                               </button>` : '';

    card.innerHTML = `${imgHtml}<h4>${title}</h4><p>${message}</p>${btnHtml}`;
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
    const imageFile = document.getElementById('event-image').files[0];
    
    const selectedDays = Array.from(document.querySelectorAll('.days-selector input:checked')).map(cb => parseInt(cb.value));

    if (title && time) {
        const soundUrl = soundFile ? URL.createObjectURL(soundFile) : null;
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;

        agendamentosAtivos.push({
            title, desc, date, time, cat, soundUrl, imageUrl,
            days: selectedDays,
            tocadoHoje: false
        });

        sendNotify('success', 'Agendado!', `Evento "${title}" configurado.`);
        
        sideMenu.classList.remove('active');
        // Reset campos
        document.getElementById('event-title').value = '';
        document.getElementById('event-desc').value = '';
        document.getElementById('event-image').value = '';
        document.getElementById('event-sound').value = '';
    } else {
        alert("Preencha título e hora!");
    }
});

// MONITOR DE TEMPO REAL
setInterval(() => {
    const agora = new Date();
    const diaSemana = agora.getDay();
    const dataHoje = agora.toISOString().split('T')[0];
    const horaAgora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    agendamentosAtivos.forEach(evento => {
        const eDiaDeTocar = evento.days.length > 0 ? evento.days.includes(diaSemana) : (evento.date === dataHoje);

        if (eDiaDeTocar && evento.time === horaAgora && !evento.tocadoHoje) {
            evento.tocadoHoje = true;

            // Dispara visual com imagem e botão
            sendNotify(evento.cat, `⏰ AGORA: ${evento.title}`, evento.desc, evento.imageUrl, true);

            // Tocar Som
            if (evento.soundUrl) {
                if(somAtivo) desligarAlerta();
                somAtivo = new Audio(evento.soundUrl);
                somAtivo.loop = true;
                somAtivo.play().catch(() => console.log("Interaja com a página."));

                // REGRA DE 15 MINUTOS (900.000 ms)
                setTimeout(() => desligarAlerta(), 900000);
            }
        }
        if (horaAgora === "00:00") evento.tocadoHoje = false;
    });
}, 1000);

document.getElementById('clear-all').addEventListener('click', () => notificationArea.innerHTML = '');
