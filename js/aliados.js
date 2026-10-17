/* Aliados: cada logo es un botón que abre su panel (js/dialog.js):
   panel lateral en escritorio, hoja inferior en móvil. Los textos salen
   de CONFIG.aliados; con las flechas ← → se pasa al aliado vecino. */

import { CONFIG } from './config.js';
import { openDialog } from './dialog.js';
import { enlazar } from './enlaces.js';

const ID = 'dialogo-aliado';
const PROXIMAMENTE = 'Próximamente';
const NOMBRE_RED = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', web: 'Web' };

export function iniciarAliados() {
  const botones = [...document.querySelectorAll('.aliado[data-aliado]')];
  const dialogo = document.getElementById(ID);
  if (!botones.length || !dialogo) return;

  const contenido = dialogo.querySelector('.ficha-aliado__contenido');
  const logo = dialogo.querySelector('[data-aliado-logo]');
  const nombre = dialogo.querySelector('#aliado-nombre');
  const descripcion = dialogo.querySelector('#aliado-desc');
  const ofrece = dialogo.querySelector('[data-aliado-ofrece]');
  const redes = [...dialogo.querySelectorAll('[data-red-aliado]')];
  const caja = dialogo.querySelector('.dialogo__caja');
  const plantillaCheck = dialogo.querySelector('template[data-aliado-check]');

  let indice = 0;

  function pintar(nuevo, { desde = 0 } = {}) {
    indice = (nuevo + botones.length) % botones.length;
    const boton = botones[indice];
    const img = boton.querySelector('img');
    const datos = (CONFIG.aliados && CONFIG.aliados[boton.dataset.aliado]) || {};
    const titulo = datos.nombre || img.alt;

    logo.src = img.getAttribute('src');
    nombre.textContent = titulo;
    descripcion.textContent = datos.descripcion || '';

    ofrece.replaceChildren(...(datos.queOfrece || []).map((texto) => {
      const li = document.createElement('li');
      if (plantillaCheck) li.append(plantillaCheck.content.cloneNode(true));
      li.append(texto);
      return li;
    }));

    redes.forEach((anterior, i) => {
      const red = anterior.dataset.redAliado;
      const url = datos.redes && datos.redes[red];
      // con URL es un <a>; sin URL, un <span> deshabilitado: nunca un enlace roto
      const enlace = enlazar(anterior, url || '');
      redes[i] = enlace;
      const texto = enlace.querySelector('.red-aliado__texto');
      if (url) {
        enlace.removeAttribute('title');
        enlace.setAttribute('aria-label', `${NOMBRE_RED[red]} de ${titulo}`);
        texto.textContent = NOMBRE_RED[red];
      } else {
        enlace.title = PROXIMAMENTE;
        enlace.setAttribute('aria-label', `${NOMBRE_RED[red]}: ${PROXIMAMENTE.toLowerCase()}`);
        texto.textContent = PROXIMAMENTE;
      }
    });

    caja.scrollTop = 0;
    if (desde) {
      contenido.style.setProperty('--desliz', `${desde * 24}px`);
      contenido.classList.remove('ficha-aliado__contenido--anima');
      void contenido.offsetWidth; // reinicia la animación
      contenido.classList.add('ficha-aliado__contenido--anima');
    }
  }

  botones.forEach((boton, i) => {
    boton.addEventListener('click', () => {
      pintar(i);
      openDialog({ id: ID, origin: boton, variant: 'aliado' });
    });
  });

  // ← → pasan al aliado anterior o siguiente sin cerrar el panel
  dialogo.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const paso = e.key === 'ArrowRight' ? 1 : -1;
    pintar(indice + paso, { desde: paso });
    nombre.focus({ preventScroll: true }); // el lector de pantalla anuncia el nuevo nombre
  });
}
