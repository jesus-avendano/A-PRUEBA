/* Cuentas regresivas: una por fecha del evento (CONFIG.evento: presencial el 14 y
   virtual el 17 de noviembre), cada una en su .contador__fecha[data-sesion]. Cada
   una muestra "¡Está pasando ahora!" durante su fecha y "¡Gracias por vivir
   A+PRUEBA!" después. Los números ruedan como un odómetro (js/rodillo.js, Counter
   de React Bits): un rodillo por caja, creado con el valor del primer tic. Las
   cajas y los rodillos son aria-hidden; el número accesible es el texto aria-live,
   uno solo para las dos fechas, que cambia una vez por minuto. */

import { CONFIG } from './config.js';
import { crearRodillo } from './rodillo.js';

const MENSAJES = {
  durante: '¡Está pasando ahora!',
  despues: '¡Gracias por vivir A+PRUEBA!',
};

export function iniciarCuentaRegresiva() {
  const aria = document.getElementById('contador-aria');
  const relojes = [...document.querySelectorAll('.contador__fecha[data-sesion]')]
    .map(crearReloj)
    .filter(Boolean);
  if (!relojes.length) return;

  let ultimoAviso = null; // el texto aria-live cambia una vez por minuto (o cuando cambia un estado)
  let temporizador = null;

  function pintar() {
    const ahora = Date.now();
    const aviso = relojes.map((reloj) => reloj.pintar(ahora)).join(' ');
    if (aria && aviso !== ultimoAviso) {
      ultimoAviso = aviso;
      aria.textContent = aviso;
    }
    if (relojes.every((reloj) => reloj.terminado) && temporizador) {
      clearInterval(temporizador);
      temporizador = null;
    }
  }

  pintar();
  if (!relojes.every((reloj) => reloj.terminado)) temporizador = setInterval(pintar, 1000);

  // al volver a la pestaña, ponerse al día sin esperar el siguiente tic
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && temporizador) pintar();
  });
}

/** El reloj de una fecha. pintar(ahora) actualiza las cajas y devuelve su aviso
    para lectores de pantalla, que cambia a lo sumo una vez por minuto. */
function crearReloj(grupo) {
  const nombre = grupo.dataset.sesion;
  const fecha = CONFIG.evento?.[nombre];
  const inicio = Date.parse(fecha?.inicio);
  const fin = Date.parse(fecha?.fin);
  const cajas = grupo.querySelector('.contador__cajas');
  if (!cajas || Number.isNaN(inicio)) return null;

  const numeros = {};
  cajas.querySelectorAll('[data-unidad]').forEach((el) => {
    numeros[el.dataset.unidad] = el;
  });

  const mensaje = document.createElement('p');
  mensaje.className = 'contador__mensaje';
  mensaje.hidden = true;
  cajas.after(mensaje);

  let rodillos = null; // { dias, horas, minutos, segundos }

  const reloj = {
    terminado: false,
    pintar(ahora) {
      if (ahora >= inicio && !(ahora >= fin)) return mostrarMensaje(MENSAJES.durante);
      if (ahora >= inicio) {
        reloj.terminado = true;
        return mostrarMensaje(MENSAJES.despues);
      }
      mostrarCajas();

      const segundos = Math.floor((inicio - ahora) / 1000);
      const dias = Math.floor(segundos / 86400);
      const horas = Math.floor((segundos % 86400) / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const valores = { dias, horas, minutos, segundos: segundos % 60 };
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

      return `Faltan ${plural(dias, 'día', 'días')}, ${plural(horas, 'hora', 'horas')} ` +
        `y ${plural(minutos, 'minuto', 'minutos')} para A+PRUEBA ${nombre}.`;
    },
  };

  function mostrarMensaje(texto) {
    if (rodillos) Object.values(rodillos).forEach((r) => r.destruir());
    rodillos = null;
    cajas.hidden = true;
    mensaje.hidden = false;
    mensaje.textContent = texto;
    return `A+PRUEBA ${nombre}: ${texto}`;
  }

  function mostrarCajas() {
    if (!cajas.hidden) return;
    cajas.hidden = false;
    mensaje.hidden = true;
  }

  return reloj;
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
