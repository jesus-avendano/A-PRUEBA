/* Aliados: cada logo lleva directo a la red social del aliado
   (CONFIG.aliados), en una pestaña nueva. Desde el 19 oct, sin
   el panel de información de la v2. Sin red, el logo queda deshabilitado
   ("Próximamente"), nunca como enlace roto. */

import { CONFIG } from './config.js';
import { enlazar } from './enlaces.js';

const REDES = [['instagram.com', 'Instagram'], ['tiktok.com', 'TikTok'], ['facebook.com', 'Facebook']];

export function iniciarAliados() {
  document.querySelectorAll('.aliado[data-aliado]').forEach((el) => {
    const datos = (CONFIG.aliados && CONFIG.aliados[el.dataset.aliado]) || {};
    const nombre = datos.nombre || el.querySelector('img')?.alt || '';
    const enlace = enlazar(el, datos.red || '');
    if (datos.red) {
      // el nombre accesible empieza con el del logo (WCAG 2.5.3) y dice adónde lleva
      enlace.setAttribute('aria-label', `${nombre} en ${redDe(datos.red)}`);
      enlace.removeAttribute('title');
    } else {
      enlace.removeAttribute('aria-label');
      enlace.title = 'Próximamente';
    }
  });
}

/** El nombre de la red de una URL: "Instagram", "TikTok", "Facebook" o "su sitio web". */
function redDe(url) {
  let host = '';
  try {
    host = new URL(url).hostname;
  } catch {
    return 'su sitio web';
  }
  const red = REDES.find(([dominio]) => host === dominio || host.endsWith(`.${dominio}`));
  return red ? red[1] : 'su sitio web';
}
