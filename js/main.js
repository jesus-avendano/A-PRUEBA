/* Arranque: aplica CONFIG al DOM e inicializa los módulos. */

import { CONFIG } from './config.js';
import { iniciarNav, irA } from './nav.js';
import { iniciarEntradas, saludar } from './entradas.js';
import { iniciarCuentaRegresiva } from './countdown.js';
import { iniciarPestanas } from './tabs.js';
import { iniciarCielo } from './starfield.js';
import { iniciarRuta } from './ruta.js';

const PROXIMAMENTE = 'Próximamente';

aplicarConfig();
iniciarNav();
iniciarEntradas();
iniciarCuentaRegresiva();
iniciarPestanas();
iniciarCielo();
iniciarRuta();
conectarCTAs();

/* ---------------------------------------------------------
   CONFIG → DOM
   Los elementos que dependen de un campo vacío quedan
   deshabilitados, nunca como enlace roto.
   --------------------------------------------------------- */
function aplicarConfig() {
  // textos sueltos: data-config="mapa.direccion"
  document.querySelectorAll('[data-config]').forEach((el) => {
    const valor = leer(el.dataset.config);
    if (valor) el.textContent = valor;
  });

  // enlaces: data-config-href="mapa.linkUrl"
  document.querySelectorAll('[data-config-href]').forEach((el) => {
    const valor = leer(el.dataset.configHref);
    if (valor) activarEnlace(el, valor);
    else deshabilitarEnlace(el);
  });

  // WhatsApp
  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const { numero, mensaje } = CONFIG.whatsapp;
    if (numero) {
      activarEnlace(el, `https://wa.me/${numero}?text=${encodeURIComponent(mensaje || '')}`);
    } else {
      deshabilitarEnlace(el);
    }
  });

  // redes
  document.querySelectorAll('[data-red]').forEach((el) => {
    const url = CONFIG.redes[el.dataset.red];
    if (url) activarEnlace(el, url);
    else deshabilitarEnlace(el);
  });

  // mapa embebido: mientras no haya embedUrl se queda la ilustración CSS
  const caja = document.querySelector('[data-mapa]');
  if (caja && CONFIG.mapa.embedUrl) {
    const marco = document.createElement('iframe');
    marco.src = CONFIG.mapa.embedUrl;
    marco.title = 'Mapa de UCSUR Sede Norte';
    marco.loading = 'lazy';
    marco.referrerPolicy = 'no-referrer-when-downgrade';
    marco.allowFullscreen = true;
    caja.replaceChildren(marco);
  }
}

function leer(ruta) {
  return String(ruta || '')
    .split('.')
    .reduce((obj, clave) => (obj == null ? undefined : obj[clave]), CONFIG);
}

function activarEnlace(el, url) {
  el.href = url;
  el.removeAttribute('aria-disabled');
}

function deshabilitarEnlace(el) {
  el.removeAttribute('href');
  el.setAttribute('aria-disabled', 'true');
  el.title = PROXIMAMENTE;
  // los botones sí cambian de texto; los enlaces pequeños y los íconos
  // conservan su etiqueta y solo se ven deshabilitados
  if (el.classList.contains('boton')) {
    const icono = el.querySelector('svg');
    el.textContent = PROXIMAMENTE;
    if (icono) el.append(icono);
  }
}

/* ---------------------------------------------------------
   CTAs genéricos: bajan a #entradas y saludan
   --------------------------------------------------------- */
function conectarCTAs() {
  const entradas = document.getElementById('entradas');
  if (!entradas) return;
  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-ir-entradas]').forEach((cta) => {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const ir = () => {
        irA(entradas);
        saludar();
      };
      // el botón de la nav (data-latido) late primero y después baja
      if (!cta.hasAttribute('data-latido') || reducido()) {
        ir();
        return;
      }
      cta.classList.remove('late');
      void cta.offsetWidth; // reinicia la animación si se pulsa dos veces
      cta.classList.add('late');
      setTimeout(() => {
        cta.classList.remove('late');
        ir();
      }, 400);
    });
  });
}
