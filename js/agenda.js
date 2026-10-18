/* Agenda del evento (docs/CAMBIOS-VIDEO-AGENDA.md §2 y §3).
   - La abre el botón "Quiero vivir la ruta" (el clic con latido está en
     js/main.js). En reposo el botón lanza un anillo cada 3 s, que se apaga
     mientras no está en pantalla.
   - La línea de tiempo se arma desde CONFIG.agenda. Las estaciones toman su
     título, pregunta, descripción e ícono de su tarjeta en la sección Ruta:
     la misma fuente, sin copiar textos.
   - El relleno de la línea sigue el progreso del scroll de la agenda; al
     llegar a un hito, su nodo late y se queda encendido y su tarjeta entra.
   - Mientras está abierta se pausan los cielos y los videos de la página. */

import { CONFIG } from './config.js';
import { openDialog, closeDialog, dialogoAbierto } from './dialog.js';
import { iniciarCielo, suspenderCielos } from './starfield.js';
import { suspenderVideo } from './video.js';
import { irA } from './nav.js';
import { saludar } from './entradas.js';

const ID = 'dialogo-agenda';
const SVG = 'class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const ICONOS = {
  'qr-code': `<svg ${SVG}><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>`,
  flag: `<svg ${SVG}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
};
const PIN = `<svg ${SVG}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;

const quieto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const agenda = {
  dialogo: null,
  caja: null,
  riel: null,
  relleno: null,
  cometa: null,
  hitos: [],
  cielos: [], // el cielo propio: no se pausa con los de la página
  medidas: { alto: 0, posiciones: [] },
  cuadro: 0,
};

export function iniciarAgenda() {
  encenderAnillo();

  const dialogo = document.getElementById(ID);
  if (!dialogo) return;
  const lista = dialogo.querySelector('[data-agenda-lista]');
  Object.assign(agenda, {
    dialogo,
    caja: dialogo.querySelector('.agenda__caja'),
    riel: dialogo.querySelector('.agenda__riel'),
    relleno: dialogo.querySelector('.agenda__relleno'),
    cometa: dialogo.querySelector('.agenda__cometa'),
    hitos: armar(lista),
    cielos: iniciarCielo('.agenda__cielo'),
  });

  agenda.caja.addEventListener('scroll', () => {
    if (agenda.cuadro) return;
    agenda.cuadro = requestAnimationFrame(() => {
      agenda.cuadro = 0;
      pintar();
    });
  }, { passive: true });

  // si cambia el ancho, las tarjetas cambian de alto y los nodos de lugar
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (!dialogo.open) return;
      medir();
      pintar();
    }).observe(lista);
  }

  // "Quiero mi pasaporte": cierra con el círculo, baja a Entradas y los boletos saludan
  const pasaporte = dialogo.querySelector('[data-agenda-pasaporte]');
  if (pasaporte) {
    pasaporte.addEventListener('click', () => {
      closeDialog().then(() => {
        const entradas = document.getElementById('entradas');
        if (!entradas) return;
        irA(entradas);
        saludar();
      });
    });
  }
}

/** Abre la agenda; al cerrarla, el foco vuelve a `origen`. */
export function abrirAgenda(origen) {
  const { dialogo } = agenda;
  if (!dialogo || dialogoAbierto() === dialogo) return;

  // cada vez arranca de cero: solo el primer hito encendido
  agenda.hitos.forEach((li) => li.classList.remove('hito--alcanzado'));
  suspenderCielos(true, agenda.cielos);
  suspenderVideo(true);

  openDialog({
    id: ID,
    origin: origen,
    variant: 'agenda',
    focus: dialogo.querySelector('#agenda-titulo'),
    onClose: () => {
      suspenderCielos(false, agenda.cielos);
      suspenderVideo(false);
    },
  });
  agenda.caja.scrollTop = 0;
  medir();
  pintar();
}

/* ---------------------------------------------------------------
   Línea de tiempo
   --------------------------------------------------------------- */
function armar(lista) {
  if (!lista) return [];
  const datos = (CONFIG.agenda || []).map(completar).filter(Boolean);
  lista.replaceChildren(...datos.map(crearHito));
  return [...lista.children];
}

/** Una estación toma sus textos y su ícono de la tarjeta de la Ruta. */
function completar(item) {
  if (!item.estacion) return item;
  const tarjeta = document.querySelector(`.estacion--${item.estacion}`);
  if (!tarjeta) return null;
  const texto = (selector) => {
    const el = tarjeta.querySelector(selector);
    return el ? el.textContent.trim() : '';
  };
  const icono = tarjeta.querySelector('.estacion__burbuja svg');
  return {
    ...item,
    titulo: `${texto('.estacion__overline')}: ${texto('.estacion__titulo')}`,
    pregunta: texto('.estacion__pregunta'),
    descripcion: texto('.estacion__desc'),
    svg: icono ? icono.cloneNode(true) : null,
  };
}

function crearHito(d, i) {
  const li = document.createElement('li');
  li.className = `hito hito--${d.color || 'blanco'} hito--${i % 2 ? 'derecha' : 'izquierda'}`;
  li.dataset.hito = d.id;

  const nodo = document.createElement('span');
  nodo.className = 'hito__nodo';
  nodo.setAttribute('aria-hidden', 'true');
  if (d.svg) nodo.append(d.svg);
  else nodo.innerHTML = ICONOS[d.icono] || '';

  const tarjeta = document.createElement('div');
  tarjeta.className = 'hito__tarjeta';
  if (d.hora) tarjeta.append(crear('p', 'hito__hora', d.hora));
  tarjeta.append(crear('h3', 'hito__titulo', d.titulo));
  if (d.pregunta) tarjeta.append(crear('p', 'hito__pregunta', d.pregunta));
  if (d.descripcion) tarjeta.append(crear('p', 'hito__desc', d.descripcion));
  if (d.lugar) {
    const lugar = crear('p', 'hito__lugar small', '');
    lugar.innerHTML = PIN;
    lugar.append(d.lugar);
    tarjeta.append(lugar);
  }

  li.append(nodo, tarjeta);
  return li;
}

function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  el.className = clase;
  el.textContent = texto;
  return el;
}

/** La línea va del centro del primer nodo al del último. */
function medir() {
  const { hitos, riel } = agenda;
  if (!hitos.length) return;
  const lista = hitos[0].parentElement;
  const centros = hitos.map((li) => {
    const nodo = li.querySelector('.hito__nodo');
    return lista.offsetTop + li.offsetTop + nodo.offsetTop + nodo.offsetHeight / 2;
  });
  const primero = centros[0];
  agenda.medidas = {
    alto: Math.max(centros[centros.length - 1] - primero, 0),
    posiciones: centros.map((c) => c - primero),
  };
  riel.style.top = `${primero}px`;
  riel.style.height = `${agenda.medidas.alto}px`;
}

/** El relleno sigue el progreso del scroll; los hitos alcanzados se quedan encendidos. */
function pintar() {
  const { dialogo, caja, relleno, cometa, hitos, medidas } = agenda;
  if (!dialogo || !dialogo.open) return;
  const recorrido = caja.scrollHeight - caja.clientHeight;
  const avance = quieto() || recorrido < 1 ? 1 : Math.min(Math.max(caja.scrollTop / recorrido, 0), 1);
  const largo = avance * medidas.alto;
  relleno.style.transform = `scaleY(${avance})`;
  cometa.style.transform = `translateY(${largo}px)`;
  hitos.forEach((li, i) => {
    if (medidas.posiciones[i] <= largo + 1) li.classList.add('hito--alcanzado');
  });
}

/* ---------------------------------------------------------------
   Botón "Quiero vivir la ruta": anillo solo mientras se ve
   --------------------------------------------------------------- */
function encenderAnillo() {
  const botones = [...document.querySelectorAll('[data-abrir-agenda]')];
  if (!botones.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => e.target.classList.toggle('ruta__cta--viva', e.isIntersecting));
  });
  botones.forEach((boton) => io.observe(boton));
}
