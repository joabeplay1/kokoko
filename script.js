const notificationArea = document.getElementById('notification-area');
const sideMenu = document.getElementById('side-menu');
const quickStopBtn = document.getElementById('quick-stop');
let agendamentosAtivos = [];
let somAtivo = null;

// ====== FUNDO DE SININHOS ======
const bellCanvas = document.getElementById('notification-canvas');
const bellCtx = bellCanvas.getContext('2d');
let bells = [];
function resizeBellCanvas() { bellCanvas.width = window.innerWidth; bellCanvas.height = window.innerHeight; }
window.addEventListener('resize', resizeBellCanvas); resizeBellCanvas();
class FloatingBell {
    constructor() { this.reset(); this.y = Math.random() * bellCanvas.height; }
    reset() { this.x = Math.random() * bellCanvas.width; this.y = bellCanvas.height + 100; this.size = Math.random() * 25 + 22; this.speedY = Math.random() * 0.6 + 0.3; this.opacity = Math.random() * 0.18 + 0.08; this.swingSpeed = Math.random() * 0.02; }
    update() { this.y -= this.speedY; this.x += Math.sin(this.y * this.swingSpeed) * 0.8; if (this.y < -100) this.reset(); }
    draw() { bellCtx.save(); bellCtx.font = `${this.size}px "Font Awesome 6 Free"`; bellCtx.fontWeight = "900"; bellCtx.fillStyle = `rgba(0, 210, 255, ${this.opacity})`; bellCtx.shadowBlur = 15; bellCtx.shadowColor = "rgba(0, 210, 255, 0.6)"; bellCtx.fillText('\uf0f3', this.x, this.y); bellCtx.restore(); }
}
function initBells() { for (let i = 0; i < 55; i++) bells.push(new FloatingBell()); }
function animateBells() { bellCtx.fillStyle = '#050505'; bellCtx.fillRect(0, 0, bellCanvas.width, bellCanvas.height); bells.forEach(bell => { bell.update(); bell.draw(); }); requestAnimationFrame(animateBells); }
initBells(); animateBells();

// ====== MEMÓRIA (LOCAL STORAGE) ======
function salvarDados() { localStorage.setItem('jesus_reina_vFinal', JSON.stringify(agendamentosAtivos)); }
function carregarDados() {
    const dados = localStorage.getItem('jesus_reina_vFinal');
    if (dados) {
        agendamentosAtivos = JSON.parse(dados);
        agendamentosAtivos.forEach(ev => sendNotify('success', 'Lembrete Ativo', `${ev.title} às ${ev.time}`));
    }
}

// ====== LOGICA DO APLICATIVO ======
function desligarAlerta(btn) {
    if (somAtivo) { somAtivo.pause(); somAtivo.currentTime = 0; somAtivo = null; }
    quickStopBtn.classList.remove('stop-btn-active');
    if (btn && btn.classList.contains('btn-stop-alerta')) { btn.innerHTML = '<i class="fas fa-check"></i> Silenciado'; btn.disabled = true; }
}

function sendNotify(type, title, message, imageUrl = null, showStopBtn = false) {
    const card = document.createElement('div');
    card.className = `notification ${type}`;
    let imgHtml = imageUrl ? `<img src="${imageUrl}" class="notification-capa">` : '';
    let btnHtml = showStopBtn ? `<button class="btn-stop-alerta" onclick="desligarAlerta(this)"><i class="fas fa-volume-mute"></i> Parar Som</button>` : '';
    card.innerHTML = `${imgHtml}<h4>${title}</h4><p>${message}</p>${btnHtml}`;
    notificationArea.prepend(card);
}

document.getElementById('open-menu').addEventListener('click', () => sideMenu.classList.add('active'));
document.getElementById('close-menu').addEventListener('click', () => sideMenu.classList.remove('active'));

document.getElementById('save-event').addEventListener('click', () => {
    const title = document.getElementById('event-title').value;
    const desc = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const soundFile = document.getElementById('event-sound').files[0];
    const imageFile = document.getElementById('event-image').files[0];
    const days = Array.from(document.querySelectorAll('.days-selector input:checked')).map(cb => parseInt(cb.value));

    if (title && time) {
        const soundUrl = soundFile ? URL.createObjectURL(soundFile) : null;
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
        
        agendamentosAtivos.push({ title, desc, date, time, days, soundUrl, imageUrl, tocadoHoje: false });
        salvarDados();
        sendNotify('success', 'Agendado!', `"${title}" salvo.`);
        sideMenu.classList.remove('active');
        document.getElementById('event-title').value = '';
        document.getElementById('event-desc').value = '';
    }
});

setInterval(() => {
    const agora = new Date();
    const dia = agora.getDay();
    const dataH = agora.toISOString().split('T')[0];
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    agendamentosAtivos.forEach(ev => {
        const eDia = ev.days.length > 0 ? ev.days.includes(dia) : (ev.date === dataH);
        if (eDia && ev.time === hora && !ev.tocadoHoje) {
            ev.tocadoHoje = true;
            sendNotify('success', `⏰ AGORA: ${ev.title}`, ev.desc, ev.imageUrl, true);
            if (ev.soundUrl) {
                if(somAtivo) desligarAlerta();
                somAtivo = new Audio(ev.soundUrl); somAtivo.loop = true; somAtivo.play();
                quickStopBtn.classList.add('stop-btn-active');
                setTimeout(() => desligarAlerta(), 900000); 
            }
        }
        if (hora === "00:00") ev.tocadoHoje = false;
    });
}, 1000);

document.getElementById('clear-all').addEventListener('click', () => { agendamentosAtivos = []; localStorage.removeItem('jesus_reina_vFinal'); notificationArea.innerHTML = ''; });
window.onload = carregarDados;
