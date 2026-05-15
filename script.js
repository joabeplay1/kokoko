const notificationArea = document.getElementById('notification-area');
const sideMenu = document.getElementById('side-menu');
const quickStopBtn = document.getElementById('quick-stop');
const agendamentosAtivos = [];
let somAtivo = null;

// ====== SISTEMA DE SININHOS FLUTUANTES TURBO ======
const bellCanvas = document.getElementById('notification-canvas');
const bellCtx = bellCanvas.getContext('2d');
let bells = [];
const bellCount = 55;

function resizeBellCanvas() {
    bellCanvas.width = window.innerWidth;
    bellCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBellCanvas);
resizeBellCanvas();

class FloatingBell {
    constructor() { this.reset(); this.y = Math.random() * bellCanvas.height; }
    reset() {
        this.x = Math.random() * bellCanvas.width;
        this.y = bellCanvas.height + 100;
        this.size = Math.random() * 25 + 22;
        this.speedY = Math.random() * 0.6 + 0.3;
        this.opacity = Math.random() * 0.18 + 0.08;
        this.swingSpeed = Math.random() * 0.02;
    }
    update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.y * this.swingSpeed) * 0.8;
        if (this.y < -100) this.reset();
    }
    draw() {
        bellCtx.save();
        bellCtx.font = `${this.size}px "Font Awesome 6 Free"`;
        bellCtx.fontWeight = "900";
        bellCtx.fillStyle = `rgba(0, 210, 255, ${this.opacity})`;
        bellCtx.shadowBlur = 15;
        bellCtx.shadowColor = "rgba(0, 210, 255, 0.6)";
        bellCtx.fillText('\uf0f3', this.x, this.y);
        bellCtx.restore();
    }
}
function initBells() { for (let i = 0; i < bellCount; i++) bells.push(new FloatingBell()); }
function animateBells() {
    bellCtx.fillStyle = '#050505';
    bellCtx.fillRect(0, 0, bellCanvas.width, bellCanvas.height);
    bells.forEach(bell => { bell.update(); bell.draw(); });
    requestAnimationFrame(animateBells);
}
initBells(); animateBells();

// ====== FUNÇÃO DESLIGAR ALERTA (MELHORADA) ======
function desligarAlerta(botaoElemento) {
    if (somAtivo) {
        somAtivo.pause();
        somAtivo.currentTime = 0;
        somAtivo = null;
    }
    // Remove o pulso do botão principal
    quickStopBtn.classList.remove('stop-btn-active');
    
    // Se clicou no botão do card, altera visual dele
    if (botaoElemento && botaoElemento.classList.contains('btn-stop-alerta')) {
        botaoElemento.innerHTML = '<i class="fas fa-check"></i> Silenciado';
        botaoElemento.style.background = "rgba(255,255,255,0.1)";
        botaoElemento.disabled = true;
    }
}

// ====== NOTIFICAÇÕES VISUAIS ======
function sendNotify(type, title, message, imageUrl = null, showStopBtn = false) {
    const card = document.createElement('div');
    card.className = `notification ${type}`;
    let imgHtml = imageUrl ? `<img src="${imageUrl}" class="notification-capa">` : '';
    let btnHtml = showStopBtn ? `<button class="btn-stop-alerta" onclick="desligarAlerta(this)">
                                <i class="fas fa-volume-mute"></i> Desligar Som</button>` : '';
    card.innerHTML = `${imgHtml}<h4>${title}</h4><p>${message}</p>${btnHtml}`;
    notificationArea.prepend(card);
}

// ====== INTERAÇÕES ======
document.getElementById('open-menu').addEventListener('click', () => sideMenu.classList.add('active'));
document.getElementById('close-menu').addEventListener('click', () => sideMenu.classList.remove('active'));

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
        agendamentosAtivos.push({ title, desc, date, time, cat, soundUrl, imageUrl, days: selectedDays, tocadoHoje: false });
        sendNotify('success', 'Agendado!', `"${title}" para às ${time}`);
        sideMenu.classList.remove('active');
        document.getElementById('event-title').value = '';
        document.getElementById('event-desc').value = '';
    }
});

// ====== MONITOR EM TEMPO REAL ======
setInterval(() => {
    const agora = new Date();
    const diaSemana = agora.getDay();
    const dataHoje = agora.toISOString().split('T')[0];
    const horaAgora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    agendamentosAtivos.forEach(evento => {
        const eDiaDeTocar = evento.days.length > 0 ? evento.days.includes(diaSemana) : (evento.date === dataHoje);
        
        if (eDiaDeTocar && evento.time === horaAgora && !evento.tocadoHoje) {
            evento.tocadoHoje = true;
            sendNotify(evento.cat, `⏰ AGORA: ${evento.title}`, evento.desc, evento.imageUrl, true);
            
            if (evento.soundUrl) {
                if(somAtivo) desligarAlerta();
                somAtivo = new Audio(evento.soundUrl);
                somAtivo.loop = true;
                somAtivo.play().catch(() => console.log("Interaja com o app para o som sair."));
                
                // Ativa o pulso no botão de parada principal
                quickStopBtn.classList.add('stop-btn-active');
                
                // Desliga automático após 15 minutos
                setTimeout(() => desligarAlerta(), 900000); 
            }
        }
        if (horaAgora === "00:00") evento.tocadoHoje = false;
    });
}, 1000);

document.getElementById('clear-all').addEventListener('click', () => notificationArea.innerHTML = '');
