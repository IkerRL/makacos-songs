// ════════════════════════════════════════════════════════════
//  MAKACOS SONGS — script.js (Versión Completa + Artista Oculto)
// ════════════════════════════════════════════════════════════

const TWITCH_CONFIG = {
    canal: 'makacagotica',
    token: 'oauth:hhqcdtugdwdw2ivhnhaio6jr5zy29g',
    nick: 'makacagotica',
    comando: '!voto',
};

const IMAGEN_PRE_VOTO = 'revelar_icono.png';

const juecesConfig = [
    { id: 1, nombre: 'Iker',   img: 'juez1.png' },
    { id: 2, nombre: 'Valeria', img: 'juez2.png' },
    { id: 3, nombre: 'Michi',  img: 'juez3.png' },
    { id: 4, nombre: 'Luve',   img: 'juez4.png' },
];

const cancionesData = [
    {
        id: 1,
        titulo: "The Hills",
        artista: "Rachel Chinouriri",
        compartidoPor: "Eusebio",
        video: "videos/eusebio.mp4" // YouTube: https://youtu.be/G5lKmUw_Vxs
    },
    {
        id: 2,
        titulo: "Life is a Highway",
        artista: "Rascal Flatts",
        compartidoPor: "Hachiko",
        video: "videos/life_is_a_highway.mp4" // YouTube: https://www.youtube.com/watch?v=Zh-ZUrc-aLI
    },
    {
        id: 3,
        titulo: "Verano en la ciudad",
        artista: "Joaquina",
        compartidoPor: "RisaHerz",
        video: "videos/verano_en_la_ciudad.mp4"
    },
    {
        id: 4,
        titulo: "Heroine",
        artista: "Maroon 5",
        compartidoPor: "MasterKira",
        video: "videos/masterkira.mp4"
    },
    {
        id: 5,
        titulo: "La Bicicleta",
        artista: "Carlos Vives, Shakira",
        compartidoPor: "Makaco Entrenador",
        video: "videos/makaco_entrenador.mp4"
    },
    {
        id: 6,
        titulo: "Canción de Cabecera",
        artista: "Phineas y Ferb",
        compartidoPor: "MakaQuillo",
        video: "videos/makaquillo.mp4"
    },
    {
        id: 7,
        titulo: "QUE PRETENDES",
        artista: "J Balvin, Bad Bunny",
        compartidoPor: "Brrokeenn",
        video: "videos/brrokeenn.mp4"
    },
    {
        id: 8,
        titulo: "Firework",
        artista: "Katy Perry",
        compartidoPor: "Luvetyy",
        video: "videos/luvetyy.mp4"
    },
    {
        id: 9,
        titulo: "Cuando en marcha voy (La canción de la carretera)",
        artista: "Bob Esponja",
        compartidoPor: "Marru",
        video: "videos/marru.mp4"
    },
    {
        id: 10,
        titulo: "ALGO VA A PASAR",
        artista: "Quevedo ft. La Pantera",
        compartidoPor: "Michi",
        video: "videos/michi.mp4"
    },
    {
        id: 11,
        titulo: "Balada",
        artista: "Gusttavo Lima",
        compartidoPor: "Jokker",
        video: "videos/jokker.mp4"
    },
    {
        id: 12,
        titulo: "Fiesta Pagana",
        artista: "Mägo de Oz",
        compartidoPor: "Ikeer_RL",
        video: "videos/ikeer_rl.mp4"
    },
    {
        id: 13,
        titulo: "No Te Da",
        artista: "8BELIAL",
        compartidoPor: "Babuino Subentendedor",
        video: "videos/babuino.mp4" // YouTube: https://youtu.be/6M-wCGvbGNc
    },
    {
        id: 14,
        titulo: "Dancing Queen",
        artista: "ABBA (Mamma Mia! 2008)",
        compartidoPor: "Bru",
        video: "videos/bru.mp4" // YouTube: https://youtu.be/QRoWiTcO7dk
    },
    {
        id: 15,
        titulo: "Caprichoso",
        artista: "Quevedo",
        compartidoPor: "ner_pm",
        video: "videos/ner_pm.mp4" // YouTube: https://youtu.be/0_AO2vmNVng
    },
    {
        id: 16,
        titulo: "The Nights",
        artista: "Avicii",
        compartidoPor: "Valeria",
        video: "videos/valeria.mp4" // YouTube: https://youtu.be/UtF6Jej8yb4
    }
];

// ─── ESTADO ───
const votosJueces = {};
const votosTwitch = {};
const usuariosRevelados = {}; // Controla qué usuarios (quienes compartieron) se han descubierto
let twitchWS = null;
let twitchActivo = false;
let cancionModalActual = null;
let videoActual; // Se inicializará en onload

// ─── FUNCIÓN AUXILIAR PARA TIEMPO ───
function formatearTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return min + ":" + (seg < 10 ? '0' : '') + seg;
}

// ─── CONEXIÓN TWITCH ───
function conectarTwitch() {
    if (twitchWS) return;
    twitchWS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    twitchWS.onopen = function () {
        twitchWS.send('PASS ' + TWITCH_CONFIG.token);
        twitchWS.send('NICK ' + TWITCH_CONFIG.nick);
        twitchWS.send('JOIN #' + TWITCH_CONFIG.canal);
        console.log("Chat de Twitch Conectado");
    };

    twitchWS.onmessage = function (event) {
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
    // — Jurado —
    var notasJueces = [];
    if (votosJueces[cancionId]) {
        for (var jId in votosJueces[cancionId]) {
            notasJueces.push(parseFloat(votosJueces[cancionId][jId]));
        }
    }

    // — Chat —
    var notasChat = [];
    if (votosTwitch[cancionId]) {
        for (var user in votosTwitch[cancionId]) {
            notasChat.push(votosTwitch[cancionId][user]);
        }
    }

    // — Casos sin votos —
    if (notasJueces.length === 0 && notasChat.length === 0) return null;

    var mediaJueces = notasJueces.length > 0
        ? notasJueces.reduce((a, b) => a + b, 0) / notasJueces.length
        : 0;

    var mediaChat = notasChat.length > 0
        ? notasChat.reduce((a, b) => a + b, 0) / notasChat.length
        : 0;

    // — Si solo hay votos de uno de los dos, usa ese al 100% —
    if (notasJueces.length === 0) return mediaChat.toFixed(2);
    if (notasChat.length === 0) return mediaJueces.toFixed(2);

    // — 70% jurado + 30% chat —
    return (mediaJueces * 0.7 + mediaChat * 0.3).toFixed(2);
}

function actualizarMediaUI(cancionId) {
    var media = calcularMedia(cancionId);
    var elModal = document.getElementById('score-media');
    if (elModal) elModal.textContent = media !== null ? media : '—';

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
    cancionesData.forEach(function (item, index) {
        var card = document.createElement('div');
        card.className = 'card-equipo';

        // Si el usuario ya fue revelado anteriormente, mantener visualmente
        if (usuariosRevelados[item.id]) {
            card.classList.add('revealed');
        }

        var media = calcularMedia(item.id);
        var scoreHTML = media !== null ? media : `<img src="${IMAGEN_PRE_VOTO}" class="score-placeholder-img">`;

        // Mostrar nombre del usuario que comparte o incógnita
        var nombreUsuario = usuariosRevelados[item.id] ? item.compartidoPor : '???';

        // En video no hay logo fijo por defecto, se puede usar un placeholder genérico
        var logoSrc = item.logo ? item.logo : 'revelar_icono.png';

        card.innerHTML = `
            <span class="card-number">${(index + 1).toString().padStart(2, '0')}</span>
            <div class="smoke-cover"></div>
            <div class="equipo-content">
                <img src="${logoSrc}" class="equipo-logo">
                <div class="equipo-info">
                    <span class="nombre-equipo">${item.titulo}</span>
                    <span class="artista-equipo">${item.artista}</span>
                    <span class="usuario-equipo" style="font-size:0.65rem; color:var(--omen-purple);">👤 ${nombreUsuario}</span>
                </div>
                <span class="vol-text" id="grid-score-${item.id}">${scoreHTML}</span>
            </div>
        `;

        card.onclick = function () {
            if (!card.classList.contains('revealed')) {
                card.classList.add('revealed');
            } else {
                abrirZoom(item);
            }
        };
        grid.appendChild(card);
    });
}

// ─── MODAL Y JUECES ───
function abrirZoom(datos) {
    cancionModalActual = datos.id;

    document.getElementById('zoom-titulo').textContent = datos.titulo;
    document.getElementById('zoom-artista').textContent = datos.artista;

    // Configurar Usuario con opción a revelar
    const elUser = document.getElementById('zoom-user');
    elUser.textContent = usuariosRevelados[datos.id] ? datos.compartidoPor : '???';
    elUser.style.cursor = 'pointer';

    elUser.onclick = function () {
        if (!usuariosRevelados[datos.id]) {
            usuariosRevelados[datos.id] = true;
            elUser.textContent = datos.compartidoPor;
            renderizarGrid(); // Actualiza el grid de fondo para que ya no ponga ???
        }
    };

    if (datos.video) {
        videoActual.src = datos.video;
    } else {
        videoActual.removeAttribute('src'); // Si no hay video, limpiar
    }

    videoActual.pause();
    document.getElementById('barra-fill').style.width = '0%';
    document.getElementById('btn-play').innerHTML = '<svg class="play-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>';
    document.getElementById('tiempo-actual').textContent = "0:00";
    document.getElementById('tiempo-total').textContent = "0:00";

    document.getElementById('modal-zoom').classList.add('active');
    renderJueces(datos.id);
    actualizarMediaUI(datos.id);
    actualizarUIChat();
    if (!twitchWS) conectarTwitch();
}

function cerrarModal() {
    document.getElementById('modal-zoom').classList.remove('active');
    videoActual.pause();
    cancionModalActual = null;
}

function renderJueces(cancionId) {
    var container = document.getElementById('jurado-row');
    container.innerHTML = '';
    if (!votosJueces[cancionId]) votosJueces[cancionId] = {};

    juecesConfig.forEach(function (juez) {
        var nota = votosJueces[cancionId][juez.id];
        var dot = document.createElement('div');
        dot.className = 'dot-jurado' + (nota ? ' voted' : '');

        // Imagen circular
        var avatarHTML = `<img src="${juez.img}" class="juez-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span class="juez-fallback" style="display:none">J${juez.id}</span>`;

        // Nombre del juez
        var nombreHTML = `<span class="juez-nombre">${juez.nombre}</span>`;

        // Score debajo (solo si ha votado)
        var scoreHTML = nota ? `<span class="juez-score">${nota}</span>` : '';

        dot.innerHTML = avatarHTML + nombreHTML + scoreHTML;

        var overlay = document.createElement('div');
        overlay.className = 'juez-input-overlay';
        overlay.innerHTML = `<input type="number" step="0.1" min="0" max="10"><button class="juez-confirm-btn">OK</button>`;

        dot.ondblclick = function (e) {
            e.stopPropagation();
            overlay.classList.toggle('open');
        };

        overlay.querySelector('button').onclick = function (e) {
            e.stopPropagation();
            var inputElem = overlay.querySelector('input');

            if (inputElem.value.trim() === '') {
                overlay.classList.remove('open');
                return;
            }

            var val = parseFloat(inputElem.value);
            if (!isNaN(val)) {
                votosJueces[cancionId][juez.id] = val.toFixed(1);
                renderJueces(cancionId);
                actualizarMediaUI(cancionId);
            } else {
                overlay.classList.remove('open');
            }
        };

        dot.appendChild(overlay);
        container.appendChild(dot);
    });
}

// ─── CONTROLES TWITCH ───
document.getElementById('btn-twitch').onclick = function () {
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
    var list = document.getElementById('twitch-votes-list');

    if (cancionModalActual) {
        var votos = votosTwitch[cancionModalActual];
        var num = votos ? Object.keys(votos).length : 0;

        if (count) count.textContent = num > 0 ? num : '';

        if (list) {
            if (num === 0) {
                list.innerHTML = '<div class="twitch-empty-msg">Sin votos aún...</div>';
            } else {
                list.innerHTML = '';
                // Renderizamos los votos
                for (var user in votos) {
                    var item = document.createElement('div');
                    item.className = 'twitch-vote-item';
                    item.innerHTML = `<span class="twitch-vote-user">${user}</span><span class="twitch-vote-score">${votos[user]}</span>`;
                    list.prepend(item); // Prepend para los más nuevos arriba
                }
            }
        }
    }
}

// ─── CONTROLES DE VIDEO ───
window.onload = function () {
    videoActual = document.getElementById('videoActual');

    document.getElementById('btn-play').onclick = function () {
        if (!videoActual.src) return;
        if (videoActual.paused) {
            videoActual.play();
            this.innerHTML = '<svg class="play-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        } else {
            videoActual.pause();
            this.innerHTML = '<svg class="play-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>';
        }
    };

    document.getElementById('btn-adelante').onclick = function () {
        if (!videoActual.src) return;
        videoActual.currentTime += 10;
    };

    document.getElementById('btn-atras').onclick = function () {
        if (!videoActual.src) return;
        videoActual.currentTime -= 10;
    };

    document.getElementById('volumen-slider').oninput = function () {
        videoActual.volume = this.value;
    };

    document.getElementById('barra-bg').onclick = function (e) {
        if (!videoActual.src) return;
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var width = rect.width;
        var pct = x / width;
        videoActual.currentTime = pct * videoActual.duration;
    };

    videoActual.ontimeupdate = function () {
        if (videoActual.duration) {
            var pct = (videoActual.currentTime / videoActual.duration) * 100;
            document.getElementById('barra-fill').style.width = pct + '%';

            document.getElementById('tiempo-actual').textContent = formatearTiempo(videoActual.currentTime);
            document.getElementById('tiempo-total').textContent = formatearTiempo(videoActual.duration);
        }
    };

    videoActual.onended = function () {
        document.getElementById('btn-play').innerHTML = '<svg class="play-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>';
        document.getElementById('barra-fill').style.width = '0%';
    };

    renderizarGrid();
};
