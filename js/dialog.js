/* Sistema de diálogos compartido: entradas, estaciones y aliados.

   Usa <dialog> nativo con showModal(): el navegador ya pone el foco
   atrapado, el cierre con Esc, el fondo inerte y aria-modal. Este módulo
   solo agrega las animaciones, el cierre al tocar el fondo, el bloqueo de
   scroll y el regreso del foco al elemento que abrió el diálogo.

   Variantes:
   - ticket   centrado; se abre desde el boleto de origen (FLIP)
   - estacion centrado; con flip: true también crece desde su origen
   - aliado   panel lateral en escritorio, hoja inferior en móvil */

const EASE_OUT = 'cubic-bezier(.22, 1, .36, 1)';
const EASE_SPRING = 'cubic-bezier(.34, 1.56, .64, 1)';

let actual = null; // el diálogo abierto: { dialogo, caja, origen, variante, alCerrar, cerrando }
let bloqueos = 0;

const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esMovil = () => window.innerWidth < 768;
const terminada = (animacion) => animacion.finished.catch(() => {});

/* ---------------------------------------------------------------
   Bloqueo de scroll (también lo usa el menú móvil)
   overflow:hidden en <html> no mueve la página ni dispara eventos de
   scroll. Se mide la barra antes de quitarla para compensar su ancho.
   --------------------------------------------------------------- */
export function bloquearScroll() {
  if (bloqueos++ > 0) return;
  const raiz = document.documentElement;
  raiz.style.setProperty('--ancho-barra', `${window.innerWidth - raiz.clientWidth}px`);
  raiz.classList.add('sin-scroll');
}

export function liberarScroll() {
  if (bloqueos === 0) return;
  if (--bloqueos > 0) return;
  const raiz = document.documentElement;
  raiz.classList.remove('sin-scroll');
  raiz.style.removeProperty('--ancho-barra');
}

/* ---------------------------------------------------------------
   API
   --------------------------------------------------------------- */

/**
 * Abre un diálogo. Devuelve una promesa que se cumple al terminar la entrada.
 * @param {object} o
 * @param {string} o.id        id del <dialog>
 * @param {Element} [o.origin] quien lo abrió; recibe el foco al cerrar
 * @param {'ticket'|'estacion'|'aliado'} [o.variant]
 * @param {Element} [o.focus]  a dónde va el foco al abrir (por defecto, [data-foco-inicial] visible o la ✕)
 * @param {boolean} [o.flip]   crecer desde el origen y volver a él (por defecto, solo en ticket)
 * @param {Function} [o.onClose]
 */
export function openDialog({ id, origin = null, variant = 'estacion', focus = null, onClose = null, flip = variant === 'ticket' } = {}) {
  const dialogo = document.getElementById(id);
  if (!dialogo) return Promise.resolve();
  if (actual) cerrarSinAnimar(actual);

  preparar(dialogo);
  const caja = dialogo.querySelector('.dialogo__caja');
  const rectOrigen = flip && origin ? origin.getBoundingClientRect() : null;

  actual = {
    dialogo, caja, origen: origin, variante: variant, alCerrar: onClose,
    flip: Boolean(rectOrigen), ocultaOrigen: false, cerrando: false,
  };
  dialogo.classList.remove('dialogo--cerrando');
  dialogo.showModal();
  bloquearScroll();
  enfocar(dialogo, focus);
  return animarEntrada(actual, rectOrigen);
}

/**
 * Cierra el diálogo abierto con su animación de salida.
 * Con { inmediato: true } se cierra sin animar (p. ej. para dejar paso a Luma).
 */
export function closeDialog({ inmediato = false } = {}) {
  if (!actual || actual.cerrando) return Promise.resolve();
  const a = actual;
  if (inmediato) {
    cerrarSinAnimar(a);
    return Promise.resolve();
  }
  a.cerrando = true;
  a.dialogo.classList.add('dialogo--cerrando');
  return animarSalida(a).then(() => terminar(a));
}

/**
 * Cambia el elemento al que vuelve el diálogo al cerrarse (foco y FLIP).
 * Lo usan las estaciones: al pasar a otra, se cierra hacia su número.
 */
export function cambiarOrigen(nuevo) {
  if (!actual || !nuevo || nuevo === actual.origen) return;
  if (actual.ocultaOrigen && actual.origen) {
    actual.origen.style.visibility = '';
    nuevo.style.visibility = 'hidden';
  }
  actual.origen = nuevo;
}

/** El diálogo abierto, o null. */
export function dialogoAbierto() {
  return actual ? actual.dialogo : null;
}

/* ---------------------------------------------------------------
   Eventos (una sola vez por diálogo)
   --------------------------------------------------------------- */
function preparar(dialogo) {
  if (dialogo.dataset.preparado) return;
  dialogo.dataset.preparado = 'si';

  // Clic en el fondo: el ::backdrop entrega sus eventos al propio <dialog>.
  // Se exige que también el pointerdown haya sido en el fondo, para que
  // arrastrar una selección desde el contenido hacia afuera no lo cierre.
  let empezoEnFondo = false;
  dialogo.addEventListener('pointerdown', (e) => {
    empezoEnFondo = e.target === dialogo;
  });
  dialogo.addEventListener('click', (e) => {
    if (e.target.closest('[data-cerrar-dialogo]')) {
      closeDialog();
    } else if (e.target === dialogo && empezoEnFondo) {
      closeDialog();
    }
    empezoEnFondo = false;
  });

  // Esc: se intercepta para cerrar con animación
  dialogo.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDialog();
  });

  // Si el navegador lo cierra por su cuenta (sin pasar por closeDialog)
  dialogo.addEventListener('close', () => {
    if (actual && actual.dialogo === dialogo) terminar(actual, { yaCerrado: true });
  });
}

function enfocar(dialogo, destino) {
  const objetivo = destino
    || [...dialogo.querySelectorAll('[data-foco-inicial]')].find((el) => el.getClientRects().length)
    || dialogo.querySelector('.dialogo__cerrar');
  if (objetivo) objetivo.focus({ preventScroll: true });
}

function terminar(a, { yaCerrado = false } = {}) {
  if (actual !== a) return;
  actual = null;
  if (!yaCerrado && a.dialogo.open) a.dialogo.close();
  a.dialogo.classList.remove('dialogo--cerrando');
  a.caja.getAnimations({ subtree: true }).forEach((an) => an.cancel());
  if (a.origen) a.origen.style.visibility = '';
  liberarScroll();
  if (a.origen && a.origen.isConnected) a.origen.focus({ preventScroll: true });
  if (a.alCerrar) a.alCerrar();
}

function cerrarSinAnimar(a) {
  a.cerrando = true;
  terminar(a);
}

/* ---------------------------------------------------------------
   Animaciones (solo transform y opacity)
   --------------------------------------------------------------- */
function animarEntrada(a, rectOrigen) {
  const { caja, variante } = a;

  if (reducido()) {
    return terminada(caja.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'linear' }));
  }

  if (rectOrigen) return entrarDesdeOrigen(a, rectOrigen);

  if (variante === 'aliado') {
    const desde = esMovil() ? 'translateY(100%)' : 'translateX(100%)';
    return terminada(caja.animate(
      [{ transform: desde }, { transform: 'none' }],
      { duration: 450, easing: EASE_OUT },
    ));
  }

  return terminada(caja.animate(
    [{ opacity: 0, transform: 'translateY(16px) scale(.98)' }, { opacity: 1, transform: 'none' }],
    { duration: 400, easing: EASE_OUT },
  ));
}

/* FLIP: la caja arranca con el tamaño y la posición del boleto y crece hasta
   el centro. El boleto se esconde mientras tanto: parece que él mismo se abre. */
function entrarDesdeOrigen(a, rectOrigen) {
  const { caja, origen } = a;
  const destino = caja.getBoundingClientRect();
  const inversa = transformDesde(rectOrigen, destino);

  origen.style.visibility = 'hidden';
  a.ocultaOrigen = true;
  const crecer = caja.animate(
    [{ transform: inversa }, { transform: 'none' }],
    { duration: 450, easing: EASE_SPRING },
  );
  // el contenido aparece cuando la caja ya casi tiene su forma
  [...caja.children].forEach((hijo) => hijo.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 250, delay: 180, easing: 'linear', fill: 'backwards' },
  ));
  return terminada(crecer);
}

function animarSalida(a) {
  const { caja, variante, origen } = a;

  if (reducido()) {
    return terminada(caja.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }));
  }

  if (a.flip && origen && origen.isConnected) {
    // el contenido se va primero y la caja vuelve al lugar del boleto
    [...caja.children].forEach((hijo) => hijo.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 120, fill: 'forwards' },
    ));
    const destino = transformDesde(origen.getBoundingClientRect(), caja.getBoundingClientRect());
    return terminada(caja.animate(
      [{ transform: 'none' }, { transform: destino }],
      { duration: 320, easing: EASE_OUT, fill: 'forwards' },
    ));
  }

  if (variante === 'aliado') {
    const hacia = esMovil() ? 'translateY(100%)' : 'translateX(100%)';
    return terminada(caja.animate(
      [{ transform: 'none' }, { transform: hacia }],
      { duration: 300, easing: EASE_OUT, fill: 'forwards' },
    ));
  }

  return terminada(caja.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px) scale(.98)' }],
    { duration: 250, easing: EASE_OUT, fill: 'forwards' },
  ));
}

/** El transform que lleva la caja `hasta` a ocupar el rect `desde`. */
function transformDesde(desde, hasta) {
  const dx = (desde.left + desde.width / 2) - (hasta.left + hasta.width / 2);
  const dy = (desde.top + desde.height / 2) - (hasta.top + hasta.height / 2);
  const sx = desde.width / hasta.width;
  const sy = desde.height / hasta.height;
  return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
}
