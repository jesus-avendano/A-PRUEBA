/* Agenda del evento (docs/CAMBIOS-VIDEO-AGENDA.md §2 y §3).
   La abre el botón "Quiero vivir la ruta" (el clic con latido está en
   js/main.js). En reposo el botón lanza un anillo cada 3 s, que se apaga
   mientras no está en pantalla. */

import { openDialog, dialogoAbierto } from './dialog.js';

const ID = 'dialogo-agenda';

export function iniciarAgenda() {
  const botones = [...document.querySelectorAll('[data-abrir-agenda]')];
  if (!botones.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => e.target.classList.toggle('ruta__cta--viva', e.isIntersecting));
  });
  botones.forEach((boton) => io.observe(boton));
}

/** Abre la agenda; al cerrarla, el foco vuelve a `origen`. */
export function abrirAgenda(origen) {
  const dialogo = document.getElementById(ID);
  if (!dialogo || dialogoAbierto() === dialogo) return;
  openDialog({ id: ID, origin: origen, variant: 'agenda', focus: dialogo.querySelector('#agenda-titulo') });
}
