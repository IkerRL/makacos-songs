// ════════════════════════════════════════════════════════════
//  MAKACOS SONGS — script.js
// ════════════════════════════════════════════════════════════

const TWITCH_CONFIG = {
    canal:  'makacagotica',       
    token:  'oauth:hhqcdtugdwdw2ivhnhaio6jr5zy29g', 
    nick:   'makacagotica',       
    comando: '!voto',               
};

const IMAGEN_PRE_VOTO = 'revelar_icono.png'; 

const juecesConfig = [
    { id: 1, nombre: 'Juez 1' },
    { id: 2, nombre: 'Juez 2' },
    { id: 3, nombre: 'Juez 3' },
    { id: 4, nombre: 'Juez Pito' },
];

const cancionesData = [

    { id: 1, titulo: "Mandanga Style", artista: "Iker_RL", logo: "portada1.jpg", audio: "audio1.mp3" },

    { id: 2, titulo: "Canción Ejemplo 2", artista: "Artista 2", logo: "portada2.jpg", audio: "audio2.mp3" },

    { id: 3, titulo: "Canción Ejemplo 3", artista: "Artista 2", logo: "portada3.jpg", audio: "audio3.mp3" },

    { id: 4, titulo: "Canción Ejemplo 4", artista: "Artista 2", logo: "portada4.jpg", audio: "audio4.mp3" },

    { id: 5, titulo: "Canción Ejemplo 5", artista: "Artista 2", logo: "portada5.jpg", audio: "audio5.mp3" },

    { id: 6, titulo: "Canción Ejemplo 6", artista: "Artista 1", logo: "portada6.jpg", audio: "audio6.mp3" },

    { id: 7, titulo: "Canción Ejemplo 7", artista: "Artista 2", logo: "portada7.jpg", audio: "audio7.mp3" },

    { id: 8, titulo: "Canción Ejemplo 8", artista: "Artista 2", logo: "portada8.jpg", audio: "audio8.mp3" },

    { id: 9, titulo: "Canción Ejemplo 9", artista: "Artista 2", logo: "portada9.jpg", audio: "audio9.mp3" },

    { id: 10, titulo: "Canción Ejemplo 10", artista: "Artista 2", logo: "portada10.jpg", audio: "audio10.mp3" },

    { id: 11, titulo: "Canción Ejemplo 11", artista: "Artista 1", logo: "portada11.jpg", audio: "audio11.mp3" },

    { id: 12, titulo: "Canción Ejemplo 12", artista: "Artista 2", logo: "portada12.jpg", audio: "audio12.mp3" },

    { id: 13, titulo: "Canción Ejemplo 13", artista: "Artista 2", logo: "portada13.jpg", audio: "audio13.mp3" },

    { id: 14, titulo: "Canción Ejemplo 14", artista: "Artista 2", logo: "portada14.jpg", audio: "audio14.mp3" },

    { id: 15, titulo: "Canción Ejemplo 15", artista: "Artista 2", logo: "portada15.jpg", audio: "audio15.mp3" },

    { id: 16, titulo: "Canción Ejemplo 16", artista: "Artista 1", logo: "portada16.jpg", audio: "audio16.mp3" },

    { id: 17, titulo: "Canción Ejemplo 17", artista: "Artista 2", logo: "portada17.jpg", audio: "audio17.mp3" },

    { id: 18, titulo: "Canción Ejemplo 18", artista: "Artista 2", logo: "portada18.jpg", audio: "audio18.mp3" },

    { id: 19, titulo: "Canción Ejemplo 19", artista: "Artista 2", logo: "portada19.jpg", audio: "audio19.mp3" },

    { id: 20, titulo: "Canción Ejemplo 20", artista: "Artista 2", logo: "portada20.jpg", audio: "audio20.mp3" },

    { id: 21, titulo: "Canción Ejemplo 21", artista: "Artista 1", logo: "portada21.jpg", audio: "audio21.mp3" },

    { id: 22, titulo: "Canción Ejemplo 22", artista: "Artista 2", logo: "portada22.jpg", audio: "audio22.mp3" },

    { id: 23, titulo: "Canción Ejemplo 23", artista: "Artista 2", logo: "portada23.jpg", audio: "audio23.mp3" },

    { id: 24, titulo: "Canción Ejemplo 24", artista: "Artista 2", logo: "portada24.jpg", audio: "audio24.mp3" },

    { id: 25, titulo: "Canción Ejemplo 25", artista: "Artista 2", logo: "portada25.jpg", audio: "audio25.mp3" },

    { id: 26, titulo: "Canción Ejemplo 26", artista: "Artista 1", logo: "portada26.jpg", audio: "audio26.mp3" },

    { id: 27, titulo: "Canción Ejemplo 27", artista: "Artista 2", logo: "portada27.jpg", audio: "audio27.mp3" },

    { id: 28, titulo: "Canción Ejemplo 28", artista: "Artista 2", logo: "portada28.jpg", audio: "audio28.mp3" },

    { id: 29, titulo: "Canción Ejemplo 29", artista: "Artista 2", logo: "portada29.jpg", audio: "audio29.mp3" },

    { id: 30, titulo: "Canción Ejemplo 30", artista: "Artista 2", logo: "portada30.jpg", audio: "audio30.mp3" },

];

// ESTADO
const votosJueces  = {};  
const votosTwitch  = {};  
let audioActual    = new Audio();
let twitchWS       = null;
let twitchActivo   = false;
let cancionModalActual = null;

function formatearTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// ─── LÓGICA DE MEDIA ───
function calcularMedia(cancionId) {
    let notas = [];
    if (votosJueces[cancionId]) {
        Object.values(votosJueces[cancionId]).forEach(n => notas.push(parseFloat(n)));
    }
    if (votosTwitch[cancionId]) {
        Object.values(votosTwitch[cancionId]).forEach(n => notas.push(n));
    }
    if (notas.length === 0) return null;
    return (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2);
}

function actualizarMediaUI(cancionId) {
    const media = calcularMedia(cancionId);
    const elModal = document.getElementById('score-media');
    if (elModal) elModal.textContent = media || '—';

    const elGrid = document.getElementById(`grid-score-${cancionId}`);
    if (elGrid) {
        elGrid.innerHTML = media || `<img src="${IMAGEN_PRE_VOTO}" class="score-placeholder-img">`;
    }
}

// ─── GRID ───
function renderizarGrid() {
    const grid = document.getElementById('grid-canciones');
    grid.innerHTML = '';
    cancionesData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card-equipo';
        const media = calcularMedia(item.id);
        
        card.innerHTML = `
            <span class="card-number">${(index + 1).toString().padStart(2, '0')}</span>
            <div class="equipo-content">
                <img src="${item.logo}" class="equipo-logo">
                <div class="equipo-info">
                    <span class="nombre-equipo">${item.titulo}</span>
                    <span class="artista-equipo">${item.artista}</span>
                </div>
                <span class="vol-text" id="grid-score-${item.id}">
                    ${media || `<img src="${IMAGEN_PRE_VOTO}" class="score-placeholder-img">`}
                </span>
            </div>
        `;
        card.onclick = () => card.classList.contains('revealed') ? abrirZoom(item) : card.classList.add('revealed');
        grid.appendChild(card);
    });
}

// ─── CONTROLES DE AUDIO ───
document.getElementById('btn-play').onclick = function() {
    if (audioActual.paused) { audioActual.play(); this.textContent = '⏸'; }
    else { audioActual.pause(); this.textContent = '▶'; }
};

document.getElementById('btn-adelante').onclick = () => audioActual.currentTime += 10;
document.getElementById('btn-atras').onclick = () => audioActual.currentTime -= 10;

document.getElementById('volumen-slider').oninput = function() {
    audioActual.volume = this.value;
    document.querySelector('.vol-icon').textContent = this.value == 0 ? '🔇' : this.value < 0.5 ? '🔉' : '🔊';
};

document.getElementById('barra-bg').onclick = function(e) {
    const rect = this.getBoundingClientRect();
    audioActual.currentTime = ((e.clientX - rect.left) / rect.width) * audioActual.duration;
};

audioActual.ontimeupdate = () => {
    if (audioActual.duration) {
        document.getElementById('barra-fill').style.width = `${(audioActual.currentTime / audioActual.duration) * 100}%`;
        document.getElementById('tiempo-texto').textContent = `${formatearTiempo(audioActual.currentTime)} / ${formatearTiempo(audioActual.duration)}`;
    }
};

// ─── MODAL ───
function abrirZoom(datos) {
    cancionModalActual = datos.id;
    document.getElementById('zoom-img').src = datos.logo;
    document.getElementById('zoom-titulo').textContent = datos.titulo;
    document.getElementById('zoom-user').textContent = datos.artista;
    audioActual.src = datos.audio;
    audioActual.play();
    document.getElementById('btn-play').textContent = '⏸';
    document.getElementById('modal-zoom').classList.add('active');
    actualizarMediaUI(datos.id);
    if (!twitchWS) conectarTwitch();
}

function cerrarModal() {
    document.getElementById('modal-zoom').classList.remove('active');
    audioActual.pause();
    cancionModalActual = null;
}

// (Aquí seguiría la función conectarTwitch que ya tenías)
// ... [Misma lógica de conectarTwitch y renderJueces] ...

window.onload = renderizarGrid;
