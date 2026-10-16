/* Cuenta regresiva hasta el inicio del evento. */

import { CONFIG } from './config.js';

const MENSAJES = {
  durante: '¡Está pasando ahora!',
  despues: '¡Gracias por vivir A+PRUEBA!',
};

export function iniciarCuentaRegresiva() {
  const cajas = document.querySelector('.contador__cajas');
  const aria = document.getElementById('contador-aria');
  if (!cajas) return;

  const inicio = new Date(CONFIG.evento.inicio).getTime();
  const fin = new Date(CONFIG.evento.fin).getTime();
  if (Number.isNaN(inicio)) return;

  const numeros = {};
  cajas.querySelectorAll('[data-unidad]').forEach((el) => {
    numeros[el.dataset.unidad] = el;
  });

  const separadores = [...cajas.querySelectorAll('.contador__sep')];

  const mensaje = document.createElement('p');
  mensaje.className = 'contador__mensaje';
  mensaje.hidden = true;
  cajas.after(mensaje);

  let ultimoMinuto = null;
  let temporizador = null;

  function pintar() {
    const ahora = Date.now();

    if (!Number.isNaN(fin) && ahora >= fin) {
      terminar(MENSAJES.despues);
      return;
    }
    if (ahora >= inicio) {
      terminar(MENSAJES.durante);
      return;
    }

    const falta = inicio - ahora;
    const segundos = Math.floor(falta / 1000);
    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (numeros.dias) numeros.dias.textContent = dos(dias);
    if (numeros.horas) numeros.horas.textContent = dos(horas);
    if (numeros.minutos) numeros.minutos.textContent = dos(minutos);
    if (numeros.segundos) numeros.segundos.textContent = dos(segs);

    // el texto para lectores de pantalla cambia una vez por minuto, no cada segundo
    if (aria && minutos !== ultimoMinuto) {
      ultimoMinuto = minutos;
      aria.textContent =
        `Faltan ${plural(dias, 'día', 'días')}, ${plural(horas, 'hora', 'horas')} ` +
        `y ${plural(minutos, 'minuto', 'minutos')} para A+PRUEBA.`;
    }
  }

  function terminar(texto) {
    cajas.hidden = true;
    separadores.forEach((s) => { s.hidden = true; });
    mensaje.hidden = false;
    mensaje.textContent = texto;
    if (aria) aria.textContent = texto;
    if (temporizador) clearInterval(temporizador);
    temporizador = null;
  }

  pintar();
  temporizador = setInterval(pintar, 1000);

  // al volver a la pestaña, ponerse al día sin esperar el siguiente tic
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && temporizador) pintar();
  });
}

const dos = (n) => String(n).padStart(2, '0');
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
