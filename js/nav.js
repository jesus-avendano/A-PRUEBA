/* Nav fija al pasar 40px + menú móvil a pantalla completa. */

import { bloquearScroll, liberarScroll } from './dialog.js';

const UMBRAL = 40;

export function iniciarNav() {
  const nav = document.getElementById('nav');
  const hamburguesa = nav.querySelector('.nav__hamburguesa');
  const menu = document.getElementById('menu-movil');
  const botonCerrar = menu.querySelector('.menu-movil__cerrar');

  /* --- nav fija --- */
  const alScroll = () => {
    nav.classList.toggle('nav--fija', window.scrollY > UMBRAL);
  };
  alScroll();
  window.addEventListener('scroll', alScroll, { passive: true });

  /* --- menú móvil --- */
  const enfocables = () =>
    [...menu.querySelectorAll('a[href], button:not([disabled])')]
      .filter((el) => el.offsetParent !== null);

  function abrir() {
    menu.hidden = false;
    hamburguesa.setAttribute('aria-expanded', 'true');
    bloquearScroll();
    botonCerrar.focus();
    document.addEventListener('keydown', alTeclado);
  }

  function cerrar({ devolverFoco = true } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    hamburguesa.setAttribute('aria-expanded', 'false');
    liberarScroll();
    document.removeEventListener('keydown', alTeclado);
    if (devolverFoco) hamburguesa.focus();
  }

  function alTeclado(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      cerrar();
      return;
    }
    if (e.key !== 'Tab') return;
    // el foco queda atrapado dentro del menú
    const lista = enfocables();
    if (!lista.length) return;
    const primero = lista[0];
    const ultimo = lista[lista.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }

  hamburguesa.addEventListener('click', abrir);
  botonCerrar.addEventListener('click', () => cerrar());

  // al tocar un enlace: cerrar y recién ahí ir a la sección
  menu.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener('click', (e) => {
      const destino = document.querySelector(enlace.getAttribute('href'));
      if (!destino) return;
      e.preventDefault();
      cerrar({ devolverFoco: false });
      requestAnimationFrame(() => irA(destino));
    });
  });

  // si se agranda la ventana con el menú abierto, no debe quedar bloqueado
  window.addEventListener('resize', () => {
    if (!menu.hidden && window.innerWidth >= 1024) cerrar({ devolverFoco: false });
  });

  return { cerrarMenu: () => cerrar({ devolverFoco: false }) };
}

/** Desplazamiento suave que respeta prefers-reduced-motion. */
export function irA(destino) {
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
}
