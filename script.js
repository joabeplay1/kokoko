const notificationArea = document.getElementById('notification-area');
const sideMenu = document.getElementById('side-menu');
const quickStopBtn = document.getElementById('quick-stop');
let agendamentosAtivos = [];
let somAtivo = null;

// ====== VERSÍCULOS DINÂMICOS ======
const versiculos = [
    'AMAI-VOS UNS AOS OUTROS', 'EU SOU O CAMINHO', 'TEREIS AFLIÇÕES, MAS TENDE BOM ÂNIMO',
    'BUSCAI PRIMEIRO O REINO DE DEUS', 'TUDO É POSSÍVEL AO QUE CRÊ', 'A MINHA PAZ VOS DOU',
    'VENHAM A MIM', 'NÃO TEMAS, CRÊ SOMENTE', 'EU SOU A LUZ DO MUNDO'
];

function spawnVerse() {
    const container = document.querySelector('.dynamic-verses-container');
    const span = document.createElement('span');
    span.className = 'dynamic-verse-particle';
    span.innerText = versiculos[Math.floor(Math.random() * versiculos.length)];
    span.style.left = `${Math.random() * 70 + 5}vw`;
    span.style.animationDuration = `${Math.random() * 5 + 15}s`;
    container.appendChild(span);
    setTimeout(() => span.remove(), 20000);
}
setInterval(spawnVerse, 3000);

// ====== LOGICA DO APP ======
function desligarAlerta() {
    if (somAtivo) { somAtivo.pause(); somAtivo.currentTime = 0; somAtivo = null; }
    quickStopBtn.classList.remove('stop-btn-active');
    document.getElementById('central-alert-frame').classList.add('hidden');
}

function salvarDados() { localStorage.setItem('jesus_reina_db', JSON.stringify(agendamentosAtivos)); }
function carregarDados() {
    const dados = localStorage.getItem('jesus_reina_db');
    if (dados) {
        agendamentosAtivos = JSON.parse(dados);
        agendamentosAtivos.forEach(ev => sendNotify(ev.title, ev.time));
    }
}

function sendNotify(title, time) {
    const card = document.createElement('div');
    card.className = 'notification';
    card.innerHTML = `<h4>${title}</h4><p>Agendado para ${time}</p>`;
    notificationArea.prepend(card);
}

document.getElementById('open-menu').onclick = () => sideMenu.classList.add('active');
document.getElementById('close-menu').onclick = () => sideMenu.classList.remove('active');

document.getElementById('save-event').onclick = () => {
    const title = document.getElementById('event-title').value;
    const time = document.getElementById('event-time').value;
    const desc = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date').value;
    const soundFile = document.getElementById('event-sound').files[0];
    const imageFile = document.getElementById('event-image').files[0];
    const days = Array.from(document.querySelectorAll('.days-selector input:checked')).map(cb => parseInt(cb.value));

    if (title && time) {
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : '';
        const soundUrl = soundFile ? URL.createObjectURL(soundFile) : '';
        
        agendamentosAtivos.push({ title, time, desc, date, days, imageUrl, soundUrl, tocadoHoje: false });
        salvarDados();
        sendNotify(title, time);
        sideMenu.classList.remove('active');
    }
};

setInterval(() => {
    const agora = new Date();
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    const dia = agora.getDay();

    agendamentosAtivos.forEach(ev => {
        const eDia = ev.days.length > 0 ? ev.days.includes(dia) : true;
        if (eDia && ev.time === hora && !ev.tocadoHoje) {
            ev.tocadoHoje = true;
            
            const frame = document.getElementById('central-alert-frame');
            document.getElementById('central-alert-image').src = ev.imageUrl;
            document.getElementById('central-alert-text').innerHTML = `<h3>${ev.title}</h3><p>${ev.desc}</p>`;
            frame.classList.remove('hidden');

            if (ev.soundUrl) {
                somAtivo = new Audio(ev.soundUrl);
                somAtivo.loop = true;
                somAtivo.play();
                quickStopBtn.classList.add('stop-btn-active');
            }
        }
        if (hora === "00:00") ev.tocadoHoje = false;
    });
}, 1000);

document.getElementById('central-stop-btn').onclick = desligarAlerta;
document.getElementById('clear-all').onclick = () => { agendamentosAtivos = []; salvarDados(); notificationArea.innerHTML = ''; };
window.onload = carregarDados;
