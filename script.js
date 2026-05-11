// ════════════════════════════════════════════════════════════
//  MAKACOS SONGS — script.js
// ════════════════════════════════════════════════════════════

const TWITCH_CONFIG = {

    canal:   'makacagotica',       

    token:   'oauth:hhqcdtugdwdw2ivhnhaio6jr5zy29g', 

    nick:    'makacagotica',       

    comando: '!voto',               

};

const IMAGEN_PRE_VOTO = 'revelar_icono.png'; // Tu imagen placeholder

const juecesConfig = [
    { id: 1, nombre: 'Juez 1' },
    { id: 2, nombre: 'Juez 2' },
    { id: 3, nombre: 'Juez 3' },
];

const cancionesData = [
    { id: 1, titulo: "Canción Ejemplo 1", artista: "Artista 1", logo: "portada1.jpg", audio: "audio1.mp3" },
    { id: 2, titulo: "Canción Ejemplo 2", artista: "Artista 2", logo: "portada2.jpg", audio: "audio2.mp3" },
];

// ESTADO
const votosJueces  = {};  
const votosTwitch  = {};  
let audioActual        = new Audio();
let twitchWS           = null;
let twitchActivo       = false;
let cancionModalActual = null;

// ─── CONEXIÓN TWITCH ───
function conectarTwitch() {
    if (twitchWS) return;
    twitchWS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    twitchWS.onopen = function() {
        twitchWS.send('PASS ' + TWITCH_CONFIG.token);
        twitchWS.send('NICK ' + TWITCH_CONFIG.nick);
        twitchWS.send('JOIN #' + TWITCH_CONFIG.canal);
        console.log("Chat de Twitch Conectado");
    };

    twitchWS.onmessage = function(event) {
        var line = event.data;
        if (line.includes('PING')) { twitchWS.send('PONG :tmi.twitch.tv'); }
        
        var match = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/);
        if (match) {
            var usuario = match[1].toLowerCase();
            var mensaje = match[2].trim();
            
            var re = new RegExp('^' + TWITCH_CONFIG.comando + '\\s+([0-9]+(?:[.,][0-9]+)?)$', 'i');
            var votoMatch = mensaje.match(re);

            if (votoMatch && twitchActivo && cancionModalActual) {
                var nota = parseFloat(votoMatch[1].replace(',', '.'));
                if (nota >= 0 && nota <= 10) {
                    var id = cancionModalActual;
                    if (!votosTwitch[id]) votosTwitch[id] = {};
                    votosTwitch[id][usuario] = nota;
                    
                    actualizarMediaUI(id);
                    actualizarUIChat();
                }
            }
        }
    };
}

// ─── LÓGICA DE MEDIA ───
function calcularMedia(cancionId) {
    var notas = [];
    if (votosJueces[cancionId]) {
        for (var jId in votosJueces[cancionId]) { notas.push(parseFloat(votosJueces[cancionId][jId])); }
    }
    if (votosTwitch[cancionId]) {
        for (var user in votosTwitch[cancionId]) { notas.push(votosTwitch[cancionId][user]); }
    }
    if (notas.length === 0) return null;
    var suma = 0;
    for (var i = 0; i < notas.length; i++) { suma += notas[i]; }
    return (suma / notas.length).toFixed(2);
}

function actualizarMediaUI(cancionId) {
    var media = calcularMedia(cancionId);
    
    // En el Modal
    var elModal = document.getElementById('score-media');
    if (elModal) elModal.textContent = media !== null ? media : '—';

    // En el Grid
    var elGrid = document.getElementById('grid-score-' + cancionId);
    if (elGrid) {
        if (media !== null) {
            elGrid.innerHTML = media;
        } else {
            elGrid.innerHTML = `<img src="${IMAGEN_PRE_VOTO}" class="score-placeholder-img">`;
        }
    }
}

// ─── GRID ───
function renderizarGrid() {
    var grid = document.getElementById('grid-canciones');
    grid.innerHTML = '';
    cancionesData.forEach(function(item, index) {
        var card = document.createElement('div');
        card.className = 'card-equipo';
        var media = calcularMedia(item.id);
        var scoreHTML = media !== null ? media : `<img src="${IMAGEN_PRE_VOTO}" class="score-placeholder-img">`;

        card.innerHTML = `
            <div class="smoke-cover"></div>
            <div class="equipo-content">
                <img src="${item.logo}" class="equipo-logo">
                <div class="equipo-info">
                    <span class="nombre-equipo">${item.titulo}</span>
                    <span class="artista-equipo">${item.artista}</span>
                </div>
                <span class="vol-text" id="grid-score-${item.id}">${scoreHTML}</span>
            </div>
        `;
        card.onclick = function() {
            if (!card.classList.contains('revealed')) card.classList.add('revealed');
            else abrirZoom(item);
        };
        grid.appendChild(card);
    });
}

// ─── MODAL Y JUECES ───
function abrirZoom(datos) {
    cancionModalActual = datos.id;
    document.getElementById('zoom-img').src = datos.logo;
    document.getElementById('zoom-titulo').textContent = datos.titulo;
    document.getElementById('zoom-user').textContent = datos.artista;
    
    audioActual.src = datos.audio;
    audioActual.pause();
    document.getElementById('barra-fill').style.width = '0%';
    document.getElementById('btn-play').textContent = '▶';

    document.getElementById('modal-zoom').classList.add('active');
    renderJueces(datos.id);
    actualizarMediaUI(datos.id);
    actualizarUIChat();
    if (!twitchWS) conectarTwitch();
}

function cerrarModal() {
    document.getElementById('modal-zoom').classList.remove('active');
    audioActual.pause();
    cancionModalActual = null;
}

function renderJueces(cancionId) {
    var container = document.getElementById('jurado-row');
    container.innerHTML = '';
    if (!votosJueces[cancionId]) votosJueces[cancionId] = {};

    juecesConfig.forEach(function(juez) {
        var nota = votosJueces[cancionId][juez.id];
        var dot = document.createElement('div');
        dot.className = 'dot-jurado' + (nota ? ' voted' : '');
        
        if (nota) {
            dot.innerHTML = `<span class="juez-score">${nota}</span><span class="juez-label">J${juez.id}</span>`;
        } else {
            dot.innerHTML = `<span class="juez-num">J${juez.id}</span>`;
        }

        var overlay = document.createElement('div');
        overlay.className = 'juez-input-overlay';
        overlay.innerHTML = `<input type="number" step="0.1" min="0" max="10"><button>OK</button>`;
        
        dot.ondblclick = function(e) {
            e.stopPropagation();
            overlay.classList.toggle('open');
        };

        overlay.querySelector('button').onclick = function() {
            var val = parseFloat(overlay.querySelector('input').value);
            if (!isNaN(val)) {
                votosJueces[cancionId][juez.id] = val.toFixed(1);
                renderJueces(cancionId);
                actualizarMediaUI(cancionId);
            }
        };

        dot.appendChild(overlay);
        container.appendChild(dot);
    });
}

// ─── CONTROLES ───
document.getElementById('btn-twitch').onclick = function() {
    twitchActivo = !twitchActivo;
    var dot = this.querySelector('.twitch-dot');
    var label = this.querySelector('.twitch-label');
    if (twitchActivo) {
        dot.style.background = '#00e5a0';
        label.textContent = 'EN VIVO';
    } else {
        dot.style.background = '#e8c84a';
        label.textContent = 'PAUSADO';
    }
};

function actualizarUIChat() {
    var count = document.querySelector('.twitch-count');
    if (count && cancionModalActual) {
        var num = votosTwitch[cancionModalActual] ? Object.keys(votosTwitch[cancionModalActual]).length : 0;
        count.textContent = num > 0 ? num : '';
    }
}

document.getElementById('btn-play').onclick = function() {
    if (audioActual.paused) {
        audioActual.play();
        this.textContent = '⏸';
    } else {
        audioActual.pause();
        this.textContent = '▶';
    }
};

audioActual.ontimeupdate = function() {
    var pct = (audioActual.currentTime / audioActual.duration) * 100;
    document.getElementById('barra-fill').style.width = pct + '%';
};

window.onload = renderizarGrid;
