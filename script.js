// 1. Configura tus canciones con su archivo MP3
const cancionesData = [
    { 
        id: 1, 
        titulo: "Mi Sueño", 
        artista: "IvanBishop8", 
        logo: "https://via.placeholder.com/400", 
        score: "8.5",
        archivo: "musica/cancion1.mp3" // <--- Ruta a tu archivo
    },
    // Añade el resto igual...
];

let audioActual = new Audio();
let barraProgreso, tiempoTexto, btnPlay;

function cargarPagina() {
    const grid = document.getElementById('grid-canciones');
    barraProgreso = document.querySelector('.player-bar-fill');
    tiempoTexto = document.querySelector('.player-time');
    btnPlay = document.querySelector('.play-btn');

    for (let i = 1; i <= 30; i++) {
        const d = cancionesData.find(c => c.id === i) || {
            id: i, titulo: `CANCIÓN #${i}`, artista: "Participante", 
            logo: "https://via.placeholder.com/400", score: "0.0", archivo: ""
        };

        const card = document.createElement('div');
        card.className = 'card-equipo';
        card.innerHTML = `
            <div class="smoke-cover"></div>
            <div class="equipo-content">
                <img src="${d.logo}" class="equipo-logo">
                <div>
                    <span class="nombre-equipo">${d.titulo}</span>
                    <span style="font-size: 0.7rem; color: #7c72ff; display: block;">${d.artista}</span>
                </div>
                <span class="vol-text">${d.score}</span>
            </div>
        `;

        card.addEventListener('click', () => card.classList.add('revealed'));
        card.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            abrirZoom(d);
        });
        grid.appendChild(card);
    }

    // Actualización de la barra de tiempo
    audioActual.addEventListener('timeupdate', () => {
        const pct = (audioActual.currentTime / audioActual.duration) * 100;
        barraProgreso.style.width = `${pct}%`;
        tiempoTexto.innerText = `${formatTime(audioActual.currentTime)} / ${formatTime(audioActual.duration || 0)}`;
    });
}

function abrirZoom(datos) {
    document.getElementById('zoom-img').src = datos.logo;
    document.getElementById('zoom-titulo').innerText = datos.titulo;
    document.getElementById('zoom-user').innerText = datos.artista;
    
    // Cargar y reproducir audio
    if (datos.archivo) {
        audioActual.src = datos.archivo;
        audioActual.play();
        btnPlay.innerText = "⏸";
    }

    document.getElementById('modal-zoom').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal-zoom').classList.remove('active');
    audioActual.pause(); // Para la música al cerrar
}

// Formatear segundos a 0:00
function formatTime(secs) {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

document.addEventListener('DOMContentLoaded', cargarPagina);
