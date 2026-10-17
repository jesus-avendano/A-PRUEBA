/* Ruta del estudiante: cada número (y su tarjeta) abre la ficha de su
   estación, que crece desde el número como los boletos (js/dialog.js).
   Dentro se cambia de estación con los botones 1·2·3·4, las flechas de la
   pantalla o del teclado, o deslizando el dedo; el sello vuelve a caer.
   Los textos salen de las propias tarjetas de la ruta: no se duplican. */

import { openDialog, cambiarOrigen } from './dialog.js';

const ID = 'dialogo-estacion';
const EASE_SPRING = 'cubic-bezier(.34, 1.56, .64, 1)';
const UMBRAL_DESLIZ = 50; // px de recorrido horizontal para cambiar de estación

export function iniciarEstaciones() {
  const items = [...document.querySelectorAll('.estacion[data-estacion]')];
  const dialogo = document.getElementById(ID);
  if (!items.length || !dialogo) return;

  const $ = (selector) => dialogo.querySelector(selector);
  const caja = $('.dialogo__caja');
  const contenido = $('.ficha-estacion__contenido');
  const agua = $('.ficha-estacion__agua');
  const sello = $('.ficha-estacion__sello');
  const selloIcono = $('.ficha-estacion__sello-icono');
  const selloTexto = $('.ficha-estacion__sello-texto');
  const overline = $('.ficha-estacion__overline');
  const titulo = $('#estacion-titulo');
  const pregunta = $('.ficha-estacion__pregunta');
  const descripcion = $('#estacion-desc');
  const cuenta = $('.ficha-estacion__cuenta');
  const numeros = [...dialogo.querySelectorAll('[data-ir]')];
  const flechas = [...dialogo.querySelectorAll('[data-paso]')];

  const estaciones = items.map((li) => ({
    n: Number(li.dataset.estacion),
    nodo: li.querySelector('.estacion__nodo'),
    tarjeta: li.querySelector('.estacion__tarjeta'),
    titulo: li.querySelector('.estacion__titulo').textContent.trim(),
    pregunta: li.querySelector('.estacion__pregunta').textContent.trim(),
    descripcion: li.querySelector('.estacion__desc').textContent.trim(),
    icono: li.querySelector('.estacion__burbuja svg'),
  }));
  const total = estaciones.length;
  let actual = 0;

  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pintar(i, desde = 0) {
    actual = i;
    const e = estaciones[i];
    caja.dataset.estacion = String(e.n);
    overline.textContent = `Estación ${e.n}`;
    titulo.textContent = e.titulo;
    pregunta.textContent = e.pregunta;
    descripcion.textContent = e.descripcion;
    agua.textContent = String(e.n);
    selloIcono.replaceChildren(e.icono.cloneNode(true));
    selloTexto.textContent = `Estación ${e.n}`;

    // "Estación N de 4" a la vista; el lector de pantalla oye también el título
    const oculto = document.createElement('span');
    oculto.className = 'sr-only';
    oculto.textContent = `: ${e.titulo}`;
    cuenta.replaceChildren(`Estación ${e.n} de ${total}`, oculto);

    numeros.forEach((boton) => {
      if (Number(boton.dataset.ir) === e.n) boton.setAttribute('aria-current', 'step');
      else boton.removeAttribute('aria-current');
    });

    // en los extremos la flecha se deshabilita; si tenía el foco, pasa al número
    const enfocado = document.activeElement;
    flechas.forEach((boton) => {
      const destino = i + Number(boton.dataset.paso);
      boton.disabled = destino < 0 || destino >= total;
    });
    if (flechas.includes(enfocado) && enfocado.disabled) numeros[i].focus({ preventScroll: true });

    if (desde) {
      reiniciar(contenido, 'ficha-estacion__contenido--anima', desde);
      reiniciar(agua, 'ficha-estacion__agua--anima', desde);
    }
  }

  /** El sello cae sobre la página y la tarjeta tiembla al recibirlo. */
  function estampar() {
    if (reducido()) return;
    sello.getAnimations().forEach((a) => a.cancel());
    sello.animate(
      [
        { transform: 'scale(1.6) rotate(-20deg)', opacity: 0 },
        { transform: 'scale(1) rotate(-8deg)', opacity: 1 },
      ],
      { duration: 400, easing: EASE_SPRING },
    );
    caja.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(3px)' },
        { transform: 'translateX(-2px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 260, delay: 340, easing: 'ease-out' },
    );
  }

  function abrir(i) {
    pintar(i);
    caja.scrollTop = 0;
    openDialog({ id: ID, origin: estaciones[i].nodo, variant: 'estacion', flip: true }).then(estampar);
  }

  function ir(i) {
    if (!dialogo.open || i < 0 || i >= total || i === actual) return;
    pintar(i, i > actual ? 1 : -1);
    caja.scrollTop = 0;
    cambiarOrigen(estaciones[i].nodo); // al cerrar, la ficha vuelve a este número
    estampar();
  }

  estaciones.forEach((e, i) => {
    e.nodo.addEventListener('click', () => abrir(i));
    e.tarjeta.addEventListener('click', () => abrir(i));
  });

  numeros.forEach((boton) => boton.addEventListener('click', () => ir(Number(boton.dataset.ir) - 1)));
  flechas.forEach((boton) => boton.addEventListener('click', () => ir(actual + Number(boton.dataset.paso))));

  dialogo.addEventListener('keydown', (ev) => {
    if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
    ev.preventDefault();
    ir(actual + (ev.key === 'ArrowRight' ? 1 : -1));
  });

  // deslizar con el dedo: a la izquierda avanza, a la derecha retrocede
  let x0 = null;
  let y0 = null;
  caja.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType === 'mouse') return;
    x0 = ev.clientX;
    y0 = ev.clientY;
  });
  caja.addEventListener('pointerup', (ev) => {
    if (x0 === null) return;
    const dx = ev.clientX - x0;
    const dy = ev.clientY - y0;
    x0 = null;
    if (Math.abs(dx) >= UMBRAL_DESLIZ && Math.abs(dx) > Math.abs(dy) * 1.5) ir(actual + (dx < 0 ? 1 : -1));
  });
  caja.addEventListener('pointercancel', () => { x0 = null; });
}

function reiniciar(el, clase, desde) {
  el.style.setProperty('--desliz', `${desde * 24}px`);
  el.classList.remove(clase);
  void el.offsetWidth; // reinicia la animación
  el.classList.add(clase);
}
