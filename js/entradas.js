/* Selector Presencial/Virtual: cada boleto abre su experiencia en un
   diálogo centrado que crece desde el propio boleto (js/dialog.js). */

import { CONFIG } from './config.js';
import { openDialog, closeDialog } from './dialog.js';

const ID_DIALOGO = 'dialogo-boleto';

const ETIQUETA_LUMA = {
  presencial: 'Quiero mi pasaporte presencial',
  virtual: 'Quiero mi pasaporte virtual',
};

export function iniciarEntradas() {
  const boletos = [...document.querySelectorAll('.boleto')];
  const dialogo = document.getElementById(ID_DIALOGO);
  if (!boletos.length || !dialogo) return;

  const caja = dialogo.querySelector('.dialogo__caja');
  const contenidos = [...dialogo.querySelectorAll('.panel-entrada__contenido')];

  prepararLuma(contenidos);
  aplicarCupos();

  function mostrar(modalidad, { animar = false } = {}) {
    contenidos.forEach((c) => {
      const esta = c.dataset.modalidad === modalidad;
      c.hidden = !esta;
      if (!esta || !animar) return;
      // entra deslizando desde el lado de la modalidad elegida
      c.style.setProperty('--desliz', modalidad === 'virtual' ? '24px' : '-24px');
      c.classList.remove('panel-entrada__contenido--anima');
      void c.offsetWidth; // reinicia la animación
      c.classList.add('panel-entrada__contenido--anima');
    });
    dialogo.dataset.modalidad = modalidad;
    dialogo.setAttribute('aria-labelledby', `panel-titulo-${modalidad}`);
    dialogo.setAttribute('aria-describedby', `panel-desc-${modalidad}`);
    caja.scrollTop = 0;
  }

  boletos.forEach((boleto) => {
    boleto.addEventListener('click', () => {
      mostrar(boleto.dataset.modalidad);
      openDialog({ id: ID_DIALOGO, origin: boleto, variant: 'ticket' });
    });
  });

  // "¿Prefieres…?": cambia el contenido dentro del mismo diálogo, sin cerrarlo
  dialogo.querySelectorAll('[data-cambiar]').forEach((enlace) => {
    enlace.addEventListener('click', () => {
      const modalidad = enlace.dataset.cambiar;
      mostrar(modalidad, { animar: true });
      // el enlace pulsado quedó oculto: el foco pasa al título nuevo
      const titulo = dialogo.querySelector(`#panel-titulo-${modalidad}`);
      if (titulo) titulo.focus({ preventScroll: true });
    });
  });

  // Luma: un <dialog> modal vive en el top layer, por encima de cualquier
  // z-index, y deja inerte todo lo de fuera. Se cierra antes de que Luma
  // abra su overlay; si el script de Luma no está, el enlace abre el evento
  // en otra pestaña igual que siempre.
  dialogo.addEventListener('click', (e) => {
    if (e.target.closest('a[data-luma]')) closeDialog({ inmediato: true });
  });

  // saludo escalonado la primera vez que la sección entra en pantalla
  const seccion = document.getElementById('entradas');
  if (seccion && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        saludar(boletos);
        obs.disconnect();
      });
    }, { threshold: 0.4 });
    obs.observe(seccion);
  }

  return { saludar: () => saludar(boletos) };
}

/** Menea los dos boletos, escalonados, como invitación a tocarlos. */
export function saludar(boletos = [...document.querySelectorAll('.boleto')]) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  boletos.forEach((b, i) => {
    setTimeout(() => {
      b.classList.remove('saluda');
      void b.offsetWidth;
      b.classList.add('saluda');
      // al terminar se quita la clase: si se quedara, el hover encontraría su
      // "menear" ya terminado en la misma posición y no lo repetiría
      const interior = b.querySelector('.boleto__interior');
      const fin = (e) => {
        if (e.animationName !== 'menear') return;
        b.classList.remove('saluda');
        interior.removeEventListener('animationend', fin);
      };
      interior.addEventListener('animationend', fin);
    }, i * 200);
  });
}

/** Cada CTA de registro es el botón embebible de Luma. Sin URL queda deshabilitado. */
function prepararLuma(contenidos) {
  contenidos.forEach((contenido) => {
    const modalidad = contenido.dataset.modalidad;
    const boton = contenido.querySelector('[data-luma]');
    const datos = CONFIG.luma[modalidad];
    if (!boton || !datos || !datos.url) return; // se queda en "Inscripciones muy pronto"

    const enlace = document.createElement('a');
    enlace.className = boton.className;
    enlace.href = datos.url;
    enlace.textContent = ETIQUETA_LUMA[modalidad];
    enlace.dataset.luma = modalidad;
    // atributos del botón embebible de Luma
    enlace.dataset.lumaAction = 'checkout';
    if (datos.eventId) enlace.dataset.lumaEventId = datos.eventId;
    if (datos.ticketTypeId) enlace.dataset.lumaTicketType = datos.ticketTypeId;
    // si el script de Luma no carga, el href abre el evento en otra pestaña
    enlace.target = '_blank';
    enlace.rel = 'noopener';
    boton.replaceWith(enlace);
  });
}

function aplicarCupos() {
  document.querySelectorAll('[data-cupos]').forEach((el) => {
    const valor = CONFIG.cupos[el.dataset.cupos];
    if (typeof valor === 'number') el.textContent = String(valor);
  });
}
