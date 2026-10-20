/* Cuenta regresiva hasta la próxima fecha del evento: hay dos (CONFIG.evento,
   presencial el 14 y virtual el 17 de noviembre). Durante una fecha muestra
   "¡Está pasando ahora!"; al terminar, vuelve a contar hasta la siguiente; después
   de la última, "¡Gracias por vivir A+PRUEBA!". Los números ruedan como un
   odómetro (js/rodillo.js, Counter de React Bits): un rodillo por caja, creado
   con el valor del primer tic. Las cajas y los rodillos son aria-hidden; el
   número accesible es el texto aria-live, que cambia una vez por minuto. */

import { CONFIG } from './config.js';
import { crearRodillo } from './rodillo.js';

const MENSAJES = {
  durante: '¡Está pasando ahora!',
  despues: '¡Gracias por vivir A+PRUEBA!',
};

export function iniciarCuentaRegresiva() {
  const cajas = document.querySelector('.contador__cajas');
  const aria = document.getElementById('contador-aria');
  if (!cajas) return;

  // las fechas, en orden: { nombre: 'presencial', inicio, fin }
  const sesiones = Object.entries(CONFIG.evento || {})
    .map(([nombre, fecha]) => ({ nombre, inicio: Date.parse(fecha.inicio), fin: Date.parse(fecha.fin) }))
    .filter((sesion) => !Number.isNaN(sesion.inicio))
    .sort((a, b) => a.inicio - b.inicio);
  if (!sesiones.length) return;

  const numeros = {};
  cajas.querySelectorAll('[data-unidad]').forEach((el) => {
    numeros[el.dataset.unidad] = el;
  });

  const separadores = [...cajas.querySelectorAll('.contador__sep')];

  const mensaje = document.createElement('p');
  mensaje.className = 'contador__mensaje';
  mensaje.hidden = true;
  cajas.after(mensaje);

  let ultimoAviso = null; // el texto aria-live cambia una vez por minuto (o al cambiar de fecha)
  let temporizador = null;
  let rodillos = null; // { dias, horas, minutos, segundos }

  function pintar() {
    const ahora = Date.now();
    if (sesiones.some((s) => ahora >= s.inicio && ahora < s.fin)) {
      mostrarMensaje(MENSAJES.durante);
      return;
    }
    const proxima = sesiones.find((s) => s.inicio > ahora);
    if (!proxima) {
      mostrarMensaje(MENSAJES.despues);
      clearInterval(temporizador);
      temporizador = null;
      return;
    }
    mostrarCajas();

    const falta = proxima.inicio - ahora;
    const segundos = Math.floor(falta / 1000);
    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    const valores = { dias, horas, minutos, segundos: segs };
    if (!rodillos) {
      rodillos = {};
      Object.entries(valores).forEach(([unidad, valor]) => {
        if (!numeros[unidad]) return;
        // los días pueden pasar de 99; el resto, nunca
        const digitos = unidad === 'dias' ? Math.max(2, String(valor).length) : 2;
        rodillos[unidad] = crearRodillo(numeros[unidad], { digitos, valor });
      });
    } else {
      Object.entries(valores).forEach(([unidad, valor]) => rodillos[unidad]?.fijar(valor));
    }

    // el texto para lectores de pantalla cambia una vez por minuto, no cada segundo
    const aviso = `${proxima.nombre}:${dias}:${horas}:${minutos}`;
    if (aria && aviso !== ultimoAviso) {
      ultimoAviso = aviso;
      aria.textContent =
        `Faltan ${plural(dias, 'día', 'días')}, ${plural(horas, 'hora', 'horas')} ` +
        `y ${plural(minutos, 'minuto', 'minutos')} para A+PRUEBA ${proxima.nombre}.`;
    }
  }

  function mostrarMensaje(texto) {
    if (rodillos) Object.values(rodillos).forEach((r) => r.destruir());
    rodillos = null;
    cajas.hidden = true;
    separadores.forEach((s) => { s.hidden = true; });
    mensaje.hidden = false;
    mensaje.textContent = texto;
    if (aria && ultimoAviso !== texto) {
      ultimoAviso = texto;
      aria.textContent = texto;
    }
  }

  function mostrarCajas() {
    if (!cajas.hidden) return;
    cajas.hidden = false;
    separadores.forEach((s) => { s.hidden = false; });
    mensaje.hidden = true;
  }

  pintar();
  temporizador = setInterval(pintar, 1000);

  // al volver a la pestaña, ponerse al día sin esperar el siguiente tic
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && temporizador) pintar();
  });
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
