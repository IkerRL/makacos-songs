// ════════════════════════════════════════════════════════════
//  MAKACOS SONGS — script.js (COMPLETO)
// ════════════════════════════════════════════════════════════

// ─── CONFIG TWITCH ───────────────────────────────────────────
const TWITCH_CONFIG = {
    canal:   'MakacaGotica',       
    token:   'oauth:hhqcdtugdwdw2ivhnhaio6jr5zy29g', 
    nick:    'MakacaGotica',       
    comando: '!voto',               
};

// ─── CONFIG JUECES ───────────────────────────────────────────
const juecesConfig = [
    { id: 1, nombre: 'Juez 1', foto: null },
    { id: 2, nombre: 'Juez 2', foto: null },
    { id: 3, nombre: 'Juez 3', foto: null },
];

// ─── DATOS DE LAS CANCIONES ──────────────────────────────────
const cancionesData = [
    { 
        id: 1, 
        titulo: "NOMBRE CANCIÓN 1", 
        artista: "USUARIO 1", 
        logo: "portada1.jpg", 
        audio: "audio1.mp3" 
    },
    { 
        id: 2, 
        titulo: "NOMBRE CANCIÓN 2", 
        artista: "USUARIO 2", 
        logo: "portada2.jpg", 
        audio: "audio2.mp3" 
    }
];

// ─── ESTADO GLOBAL ───────────────────────────────────────────
const votosJueces  = {};  // { [cancionId]: { [juezId]: 8.5 } }
const votosTwitch  = {};  // { [cancionId]: { [usuario]: numero } }

let audioActual        = new Audio();
let twitchWS           = null;
let twitchActivo       = false;
let cancionModalActual = null;

// ════════════════════════════════════════════════════════════
//  LOGICA DE TWITCH (VOTOS DEL CHAT)
// ════════════════════════════════════════════════════════════

function conectarTwitch() {
    if (twitchWS && twitchWS.readyState <= 1) return;

    twitchWS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    twitchWS.onopen = function() {
        twitchWS.send('PASS ' + TWITCH_CONFIG.token);
        twitchWS.send('NICK ' + TWITCH_CONFIG.nick);
        twitchWS.send('JOIN #' + TWITCH_CONFIG.canal);
        console.log('[Twitch] Conectado');
        actualizarBtnTwitch('activo');
    };

    twitchWS.onmessage = function(event) {
        var lineas = event.data.split('\r\n');
        lineas.forEach(function(line) {
            if (line.startsWith('PING')) {
                twitchWS.send('PONG :tmi.twitch.tv');
                return;
            }
            
            // Regex para capturar usuario y mensaje
            var match = line.match(/^:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)$/);
            if (match) {
                var usuario = match[1].toLowerCase();
                var mensaje = match[2].trim();

                // Regex para el comando !voto
                var re = new RegExp('^' + TWITCH_CONFIG.comando + '\\s+([0-9]+(?:[.,][0-9]+)?)$', 'i');
                var votoMatch = mensaje.match(re);

                if (votoMatch) {
                    var nota = parseFloat(votoMatch[1].replace(',', '.'));
                    if (!isNaN(nota) && nota >= 0 && nota <= 10) {
                        procesarVotoChat(usuario, nota);
                    }
                }
            }
        });
    };
}

function procesarVotoChat(usuario, nota) {
    // Solo si el interruptor está activo y hay un modal abierto
    if (!twitchActivo || !cancionModalActual) return;

    var id = cancionModalActual;
    if (!votosTwitch[id]) votosTwitch[id] = {};
    
    // Guardamos el voto (si el usuario ya votó, se actualiza)
    votosTwitch[id][usuario] = nota;

    actualizarUIChat(id);
    actualizarMediaUI(id);
    mostrarToastVoto(usuario, nota);
}

function activarVotacionChat() {
    twitchActivo = true;
    if (!twitchWS) conectarTwitch();
    actualizarBtnTwitch('activo');
}

function desactivarVotacionChat() {
    twitchActivo = false;
    actualizarBtnTwitch('pausado');
}

// ─── Interfaz de Twitch ───────────────────────────────────────

function actualizarBtnTwitch(estado) {
    var btn = document.getElementById('btn-twitch');
    if (!btn) return;
    btn.dataset.estado = estado;

    var dot = btn.querySelector('.twitch-dot');
    var label = btn.querySelector('.twitch-label');
    
    if (estado === 'activo') {
        dot.style.background = '#00e5a0';
        label.textContent = 'EN VIVO';
    } else if (estado === 'pausado') {
        dot.style.background = '#e8c84a';
        label.textContent = 'PAUSADO';
    } else {
        dot.style.background = '#4e4c74';
        label.textContent = 'CHAT';
    }
    actualizarUIChat(cancionModalActual);
}

function actualizarUIChat(cancionId) {
    var count = document.querySelector('.twitch-count');
    if (!count || !cancionId) return;
    var total = votosTwitch[cancionId] ? Object.keys(votosTwitch[cancionId]).length : 0;
    count.textContent = total > 0 ? total : '';
}

function mostrarToastVoto(usuario, nota) {
    var toast = document.getElementById('toast-voto');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-voto';
        document.body.appendChild(toast);
    }
    toast.innerHTML = '<span class="toast-user">' + usuario + '</span><span class="toast-nota">' + nota.toFixed(1) + '</span>';
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() { toast.classList.remove('visible'); }, 2500);
}

// ════════════════════════════════════════════════════════════
//  JUECES Y MEDIA
// ════════════════════════════════════════════════════════════

function renderJueces(cancionId) {
    var row = document.getElementById('jurado-row');
    row.innerHTML = '';
    if (!votosJueces[cancionId]) votosJueces[cancionId] = {};

    juecesConfig.forEach(function(juez) {
        var votoExistente = votosJueces[cancionId][juez.id];
        var dot = document.createElement('div');
        dot.className = 'dot-jurado' + (votoExistente !== undefined ? ' voted' : '');

        if (votoExistente !== undefined) {
            dot.innerHTML = '<span class="juez-score">' + votoExistente + '</span>' +
                            '<span class="juez-label">' + juez.nombre.toUpperCase() + '</span>';
        } else {
            dot.innerHTML = '<span class="juez-num">J' + juez.id + '</span>';
        }

        var overlay = document.createElement('div');
        overlay.className = 'juez-input-overlay';
        overlay.innerHTML = '<label>' + juez.nombre.toUpperCase() + '</label>' +
                            '<input type="number" min="0" max="10" step="0.5" placeholder="0.0">' +
                            '<button class="juez-confirm-btn">CONFIRMAR</button>';
        
        dot.appendChild(overlay);

        dot.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            if (dot.classList.contains('voted')) return;
            document.querySelectorAll('.juez-input-overlay').forEach(function(o) { o.classList.remove('open'); });
            overlay.classList.add('open');
            overlay.querySelector('input').focus();
        });

        overlay.querySelector('.juez-confirm-btn').onclick = function() {
            var val = parseFloat(overlay.querySelector('input').value);
            if (!isNaN(val)) {
                val = Math.min(10, Math.max(0, val));
                votosJueces[cancionId][juez.id] = val.toFixed(1);
                renderJueces(cancionId);
                actualizarMediaUI(cancionId);
            }
        };

        row.appendChild(dot);
    });
}

function calcularMedia(cancionId) {
    var notas = [];
    
    // Notas de jueces
    if (votosJueces[cancionId]) {
        for (var idJuez in votosJueces[cancionId]) {
            notas.push(parseFloat(votosJueces[cancionId][idJuez]));
        }
    }
    
    // Todos los votos de Twitch
    if (votosTwitch[cancionId]) {
        for (var user in votosTwitch[cancionId]) {
            notas.push(parseFloat(votosTwitch[cancionId][user]));
        }
    }

    if (notas.length === 0) return null;
    var suma = 0;
    for (var i = 0; i < notas.length; i++) { suma += notas[i]; }
    return (suma / notas.length).toFixed(2);
}

function actualizarMediaUI(cancionId) {
    var el = document.getElementById('score-media');
    var media = calcularMedia(cancionId);
    el.textContent = media !== null ? media : '—';
    el.classList.remove('updated');
    void el.offsetWidth;
    el.classList.add('updated');
}

// ════════════════════════════════════════════════════════════
//  GRID Y MODAL
// ════════════════════════════════════════════════════════════

function renderizarGrid() {
    var grid = document.getElementById('grid-canciones');
    grid.innerHTML = '';

    cancionesData.forEach(function(item, index) {
        var card = document.createElement('div');
        card.className = 'card-equipo';
        card.innerHTML = `
            <div class="smoke-cover"></div>
            <span class="card-number">${(index + 1).toString().padStart(2, '0')}</span>
            <div class="equipo-content">
                <img src="${item.logo}" class="equipo-logo">
                <div class="equipo-info">
                    <span class="nombre-equipo">${item.titulo}</span>
                    <span class="artista-equipo">${item.artista}</span>
                </div>
                <span class="vol-text">#${index + 1}</span>
            </div>
        `;

        card.onclick = function() {
            if (!card.classList.contains('revealed')) {
                card.classList.add('revealed');
            } else {
                abrirZoom(item);
            }
        };
        grid.appendChild(card);
    });
}

function abrirZoom(datos) {
    cancionModalActual = datos.id;
    document.getElementById('zoom-img').src = datos.logo;
    document.getElementById('zoom-titulo').textContent = datos.titulo;
    document.getElementById('zoom-user').textContent = datos.artista;
    
    audioActual.src = datos.audio;
    resetPlayerUI();

    document.getElementById('modal-zoom').classList.add('active');
    renderJueces(datos.id);
    actualizarMediaUI(datos.id);
    actualizarBtnTwitch(twitchActivo ? 'activo' : 'inactivo');
}

function cerrarModal() {
    document.getElementById('modal-zoom').classList.remove('active');
    audioActual.pause();
    cancionModalActual = null;
}

// ─── REPRODUCTOR ─────────────────────────────────────────────

var btnPlay = document.getElementById('btn-play');
var barraFill = document.getElementById('barra-fill');
var tiempoTexto = document.getElementById('tiempo-texto');

btnPlay.onclick = function() {
    if (audioActual.paused) {
        audioActual.play();
        btnPlay.textContent = '⏸';
    } else {
        audioActual.pause();
        btnPlay.textContent = '▶';
    }
};

audioActual.ontimeupdate = function() {
    var pct = (audioActual.currentTime / audioActual.duration) * 100;
    barraFill.style.width = pct + '%';
    tiempoTexto.textContent = formatearTiempo(audioActual.currentTime) + ' / ' + formatearTiempo(audioActual.duration);
};

function formatearTiempo(seg) {
    if (isNaN(seg)) return "0:00";
    var m = Math.floor(seg / 60);
    var s = Math.floor(seg % 60);
    return m + ":" + (s < 10 ? '0' + s : s);
}

function resetPlayerUI() {
    btnPlay.textContent = '▶';
    barraFill.style.width = '0%';
    tiempoTexto.textContent = '0:00 / 0:00';
}

// ─── INICIO ──────────────────────────────────────────────────

document.getElementById('btn-twitch').onclick = function() {
    if (!twitchActivo) activarVotacionChat();
    else desactivarVotacionChat();
};

window.onload = renderizarGrid;
