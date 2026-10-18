/* Arranque: aplica CONFIG al DOM e inicializa los módulos. */

import { CONFIG } from './config.js';
import { iniciarNav, irA } from './nav.js';
import { iniciarHero } from './hero.js';
import { iniciarEntradas, saludar } from './entradas.js';
import { iniciarVideo } from './video.js';
import { iniciarCuentaRegresiva } from './countdown.js';
import { iniciarPestanas } from './tabs.js';
import { iniciarCielo } from './starfield.js';
import { iniciarRuta } from './ruta.js';
import { iniciarAliados } from './aliados.js';
import { iniciarEnfoque } from './enfoque.js';
import { openDialog } from './dialog.js';
import { enlazar } from './enlaces.js';

const PROXIMAMENTE = 'Próximamente';

aplicarConfig();
iniciarHero();
iniciarNav();
iniciarEntradas();
iniciarVideo();
iniciarCuentaRegresiva();
iniciarPestanas();
iniciarCielo();
iniciarEnfoque(iniciarRuta());
iniciarAliados();
conectarFoto();
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
    // fuera del orden de Tab: el mapa tiene decenas de controles y lugares
    // enfocables. Con teclado, el mismo dato está en texto y en "Abrir en Google Maps".
    marco.tabIndex = -1;
    caja.replaceChildren(marco);
  }
}

function leer(ruta) {
  return String(ruta || '')
    .split('.')
    .reduce((obj, clave) => (obj == null ? undefined : obj[clave]), CONFIG);
}

function activarEnlace(el, url) {
  enlazar(el, url).removeAttribute('title');
}

function deshabilitarEnlace(el) {
  const span = enlazar(el, '');
  span.title = PROXIMAMENTE;
  // los botones sí cambian de texto; los enlaces pequeños y los íconos
  // conservan su etiqueta y solo se ven deshabilitados
  if (span.classList.contains('boton')) {
    const icono = span.querySelector('svg');
    span.textContent = PROXIMAMENTE;
    if (icono) span.append(icono);
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

/* ---------------------------------------------------------
   Polaroid de la sede: abre la foto en grande
   --------------------------------------------------------- */
function conectarFoto() {
  const boton = document.querySelector('.polaroid');
  if (!boton) return;
  // si la foto no está (p. ej. un error al publicar), la polaroid no se muestra
  const img = boton.querySelector('img');
  if (img) {
    const ocultar = () => { boton.hidden = true; };
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) ocultar();
    img.addEventListener('error', ocultar);
  }
  if (!document.getElementById('dialogo-foto')) return;
  boton.addEventListener('click', () => openDialog({ id: 'dialogo-foto', origin: boton, variant: 'foto' }));
}
