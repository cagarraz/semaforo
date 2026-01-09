// Estado inicial
let tiempoRestante = 590; // segundos
let tiempoTotal = 590;
let estadoActual = 'roja';
let intervalId = null;
let tabActiva = 'entrada';

// Configuración del ciclo del semáforo (en segundos)
const CICLO_COMPLETO = 660; // 11 minutos (590s verde + 67s rojo + 3s amarillo)
const TIEMPO_VERDE = 590;   // 9 minutos 50 segundos
const TIEMPO_AMARILLO = 3;  // 3 segundos
const TIEMPO_ROJO = 67;     // 1 minuto 7 segundos

// Horas de inicio cuando se puso en verde (guardadas en localStorage)
let horaInicioEntrada = null;  // null = no configurado
let horaInicioSalida = null;   // null = no configurado

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarConfiguracion();
    inicializarTabs();
    inicializarConfiguracion();
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
    // Determinar el estado actual basándose en la hora de inicio configurada
    const horaInicio = tabActiva === 'entrada' ? horaInicioEntrada : horaInicioSalida;

    if (!horaInicio) {
        // Si no hay hora configurada, mostrar estado por defecto
        cambiarEstado('roja');
        tiempoRestante = TIEMPO_ROJO;
        tiempoTotal = TIEMPO_ROJO;
    } else {
        // Calcular en qué punto del ciclo estamos
        calcularEstadoActual(horaInicio);
    }

    actualizarTiempo();
    actualizarBarraProgreso();

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

    const indiceActual = secuencia.indexOf(estadoActual);
    const siguienteIndice = (indiceActual + 1) % secuencia.length;
    const siguienteColor = secuencia[siguienteIndice];

    cambiarEstado(siguienteColor);

    // Asignar tiempo según el color
    if (siguienteColor === 'verde') {
        tiempoRestante = TIEMPO_VERDE;
        tiempoTotal = TIEMPO_VERDE;
    } else if (siguienteColor === 'amarilla') {
        tiempoRestante = TIEMPO_AMARILLO;
        tiempoTotal = TIEMPO_AMARILLO;
    } else { // roja
        tiempoRestante = TIEMPO_ROJO;
        tiempoTotal = TIEMPO_ROJO;
    }
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

// ==================== CÁLCULO DE ESTADO BASADO EN HORA ====================

// Calcular en qué punto del ciclo estamos basándose en la hora de inicio
function calcularEstadoActual(horaInicio) {
    const ahora = new Date();
    const inicioVerde = new Date();

    // Configurar la hora de inicio del verde
    const [horas, minutos, segundos] = horaInicio.split(':').map(Number);
    inicioVerde.setHours(horas, minutos, segundos, 0);

    // Si la hora de inicio es en el futuro, ajustar al día anterior
    if (inicioVerde > ahora) {
        inicioVerde.setDate(inicioVerde.getDate() - 1);
    }

    // Calcular segundos transcurridos desde que se puso en verde
    const segundosTranscurridos = Math.floor((ahora - inicioVerde) / 1000);

    // Calcular posición en el ciclo (el ciclo se repite cada CICLO_COMPLETO segundos)
    // El ciclo completo es: VERDE (590s) → AMARILLO (3s) → ROJO (67s) = 660s total
    const posicionEnCiclo = segundosTranscurridos % CICLO_COMPLETO;

    // Determinar estado y tiempo restante según la posición en el ciclo
    // Empieza en VERDE (desde el momento en que se configuró)
    if (posicionEnCiclo < TIEMPO_VERDE) {
        // Estamos en VERDE
        cambiarEstado('verde');
        tiempoRestante = TIEMPO_VERDE - posicionEnCiclo;
        tiempoTotal = TIEMPO_VERDE;
    } else if (posicionEnCiclo < TIEMPO_VERDE + TIEMPO_AMARILLO) {
        // Estamos en AMARILLO (después del verde)
        cambiarEstado('amarilla');
        tiempoRestante = (TIEMPO_VERDE + TIEMPO_AMARILLO) - posicionEnCiclo;
        tiempoTotal = TIEMPO_AMARILLO;
    } else {
        // Estamos en ROJO (después del amarillo)
        cambiarEstado('roja');
        tiempoRestante = CICLO_COMPLETO - posicionEnCiclo;
        tiempoTotal = TIEMPO_ROJO;
    }
}

// ==================== CONFIGURACIÓN Y LOCALSTORAGE ====================

// Cargar configuración desde localStorage
function cargarConfiguracion() {
    const config = localStorage.getItem('semaforoConfig');
    if (config) {
        const { entrada, salida } = JSON.parse(config);
        horaInicioEntrada = entrada;
        horaInicioSalida = salida;
    }
}

// Guardar configuración en localStorage
function guardarConfiguracion() {
    const config = {
        entrada: horaInicioEntrada,
        salida: horaInicioSalida
    };
    localStorage.setItem('semaforoConfig', JSON.stringify(config));
}

// Inicializar controles de configuración
function inicializarConfiguracion() {
    // Rellenar inputs con valores actuales (si existen)
    if (horaInicioEntrada) {
        const [h, m, s] = horaInicioEntrada.split(':').map(Number);
        document.getElementById('entradaHoras').value = h;
        document.getElementById('entradaMinutos').value = m;
        document.getElementById('entradaSegundos').value = s;
    }

    if (horaInicioSalida) {
        const [h, m, s] = horaInicioSalida.split(':').map(Number);
        document.getElementById('salidaHoras').value = h;
        document.getElementById('salidaMinutos').value = m;
        document.getElementById('salidaSegundos').value = s;
    }

    // Event listener para el botón aplicar
    const btnAplicar = document.getElementById('btnAplicar');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', aplicarConfiguracion);
    }
}

// Aplicar la configuración de tiempos
function aplicarConfiguracion() {
    // Leer valores de entrada
    const entradaHoras = parseInt(document.getElementById('entradaHoras').value);
    const entradaMinutos = parseInt(document.getElementById('entradaMinutos').value);
    const entradaSegundos = parseInt(document.getElementById('entradaSegundos').value);

    // Leer valores de salida
    const salidaHoras = parseInt(document.getElementById('salidaHoras').value);
    const salidaMinutos = parseInt(document.getElementById('salidaMinutos').value);
    const salidaSegundos = parseInt(document.getElementById('salidaSegundos').value);

    // Validar entrada
    if (!isNaN(entradaHoras) && !isNaN(entradaMinutos) && !isNaN(entradaSegundos)) {
        if (entradaHoras >= 0 && entradaHoras <= 23 &&
            entradaMinutos >= 0 && entradaMinutos <= 59 &&
            entradaSegundos >= 0 && entradaSegundos <= 59) {

            // Formatear como HH:MM:SS
            horaInicioEntrada = `${entradaHoras.toString().padStart(2, '0')}:${entradaMinutos.toString().padStart(2, '0')}:${entradaSegundos.toString().padStart(2, '0')}`;
        } else {
            alert('La hora de entrada debe ser válida (HH: 0-23, MM: 0-59, SS: 0-59)');
            return;
        }
    }

    // Validar salida
    if (!isNaN(salidaHoras) && !isNaN(salidaMinutos) && !isNaN(salidaSegundos)) {
        if (salidaHoras >= 0 && salidaHoras <= 23 &&
            salidaMinutos >= 0 && salidaMinutos <= 59 &&
            salidaSegundos >= 0 && salidaSegundos <= 59) {

            // Formatear como HH:MM:SS
            horaInicioSalida = `${salidaHoras.toString().padStart(2, '0')}:${salidaMinutos.toString().padStart(2, '0')}:${salidaSegundos.toString().padStart(2, '0')}`;
        } else {
            alert('La hora de salida debe ser válida (HH: 0-23, MM: 0-59, SS: 0-59)');
            return;
        }
    }

    // Guardar en localStorage
    guardarConfiguracion();

    // Reiniciar semáforo con nuevos tiempos
    reiniciarSemaforo();

    // Feedback visual
    const btn = document.getElementById('btnAplicar');
    const textoOriginal = btn.textContent;
    btn.textContent = '¡Aplicado!';
    btn.style.background = '#4CAF50';
    setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.background = '';
    }, 1500);
}
