// Estado inicial
let tiempoRestante = 590; // segundos
let tiempoTotal = 590;
let estadoActual = 'roja';
let intervalId = null;
let tabActiva = 'entrada';

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    inicializarTabs();
    iniciarSemaforo();
});

// Configurar tabs
function inicializarTabs() {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover clase active de todos
            tabs.forEach(t => t.classList.remove('active'));

            // Agregar clase active al clickeado
            this.classList.add('active');

            // Actualizar tab activa
            tabActiva = this.dataset.tab;

            // Actualizar dirección
            actualizarDireccion();

            // Reiniciar semáforo
            reiniciarSemaforo();
        });
    });
}

// Actualizar dirección según la tab activa
function actualizarDireccion() {
    const direccionSpans = document.querySelectorAll('.direccion span');

    if (tabActiva === 'entrada') {
        direccionSpans[0].textContent = 'Arnedo';
        direccionSpans[2].textContent = 'Arnedillo';
    } else {
        direccionSpans[0].textContent = 'Arnedillo';
        direccionSpans[2].textContent = 'Arnedo';
    }
}

function iniciarSemaforo() {
    cambiarEstado('roja');

    // Tiempo inicial según dirección
    const tiempoInicial = tabActiva === 'entrada' ? 590 : 67;
    tiempoRestante = tiempoInicial;
    tiempoTotal = tiempoInicial;

    actualizarTiempo();

    // Iniciar countdown
    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(() => {
        tiempoRestante--;
        actualizarTiempo();
        actualizarBarraProgreso();

        if (tiempoRestante <= 0) {
            siguienteEstado();
        }
    }, 1000);
}

// Cambiar estado del semáforo
function cambiarEstado(nuevoEstado) {
    estadoActual = nuevoEstado;

    console.log('Cambiando a estado:', nuevoEstado);

    // Apagar todas las luces primero
    document.querySelectorAll('.luz').forEach(luz => {
        luz.classList.remove('active');
    });

    // Encender solo la luz correspondiente
    const luzActiva = document.querySelector(`.luz-${nuevoEstado}`);
    console.log('Luz encontrada:', luzActiva);
    console.log('Clases después de agregar active:', luzActiva?.classList);

    if (luzActiva) {
        luzActiva.classList.add('active');
    }
}

// Siguiente estado en el ciclo
function siguienteEstado() {
    const secuencia = ['roja', 'verde', 'amarilla'];

    // Tiempos según dirección
    const tiempos = tabActiva === 'entrada' ? {
        'roja': 590,      // 9 minutos 50 segundos = 590 segundos
        'amarilla': 3,    // 3 segundos
        'verde': 67       // 67 segundos
    } : {
        'roja': 67,       // En salida, rojo dura 67 segundos
        'amarilla': 3,    // 3 segundos
        'verde': 590      // En salida, verde dura 9 minutos 50 segundos
    };

    const indiceActual = secuencia.indexOf(estadoActual);
    const siguienteIndice = (indiceActual + 1) % secuencia.length;
    const siguienteColor = secuencia[siguienteIndice];

    cambiarEstado(siguienteColor);
    tiempoRestante = tiempos[siguienteColor];
    tiempoTotal = tiempos[siguienteColor];
}

// Actualizar display de tiempo
function actualizarTiempo() {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;

    const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')} min`;

    const tiempoElement = document.getElementById('tiempoRestante');
    if (tiempoElement) {
        tiempoElement.textContent = tiempoFormateado;
    }
}

// Actualizar barra de progreso
function actualizarBarraProgreso() {
    const porcentaje = (tiempoRestante / tiempoTotal) * 100;
    const barraElement = document.getElementById('barraProgreso');

    if (barraElement) {
        barraElement.style.width = porcentaje + '%';

        // Cambiar color según estado
        if (estadoActual === 'roja') {
            barraElement.style.background = 'linear-gradient(90deg, #d32f2f 0%, #ff4444 100%)';
        } else if (estadoActual === 'amarilla') {
            barraElement.style.background = 'linear-gradient(90deg, #f57f17 0%, #ffaa00 100%)';
        } else {
            barraElement.style.background = 'linear-gradient(90deg, #7cb342 0%, #a3d855 100%)';
        }
    }
}

// Reiniciar semáforo
function reiniciarSemaforo() {
    if (intervalId) {
        clearInterval(intervalId);
    }
    iniciarSemaforo();
}

function detenerSemaforo() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// Limpiar intervalo al salir
window.addEventListener('beforeunload', () => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
