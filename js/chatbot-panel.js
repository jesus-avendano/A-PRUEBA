/* Panel del chatbot (lo importa js/chatbot.js al tocar la burbuja).

   En celular (menos de 768px) es un <dialog> modal a pantalla completa: foco atrapado, fondo
   inerte y scroll bloqueado. En escritorio es una ventana flotante no modal sobre la burbuja,
   para seguir mirando la página mientras se conversa. En los dos, Esc y la ✕ lo cierran y el
   foco vuelve a la burbuja.

   La conversación vive solo en la página: no se guarda ni se envía a ningún lado. */

import { CONFIG } from './config.js';
import { bloquearScroll, liberarScroll } from './dialog.js';
import { enlazar } from './enlaces.js';
import { saludo, responder, respuesta, etiqueta } from './chatbot-respuestas.js';

const NUMERO_VALIDO = /^51\d{9}$/;

const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esMovil = () => window.matchMedia('(max-width: 767.98px)').matches;

let preparado = false;
let origen = null;
let bloqueado = false;

export function abrirPanel(dialogo, desde) {
  if (dialogo.open) return;
  if (!preparado) preparar(dialogo);
  origen = desde;

  if (esMovil()) {
    dialogo.showModal();
    bloquearScroll();
    bloqueado = true;
  } else {
    dialogo.show();
  }

  // con el dedo, el teclado del celular taparía las opciones: el foco va a la ✕
  const tactil = window.matchMedia('(pointer: coarse)').matches;
  const foco = tactil ? dialogo.querySelector('.chatbot-panel__cerrar') : dialogo.querySelector('.chatbot-panel__texto');
  foco.focus({ preventScroll: true });
}

export function cerrarPanel(dialogo) {
  if (dialogo.open) dialogo.close();
}

function preparar(dialogo) {
  preparado = true;
  const mensajes = dialogo.querySelector('.chatbot-panel__mensajes');
  const form = dialogo.querySelector('.chatbot-panel__form');
  const entrada = dialogo.querySelector('.chatbot-panel__texto');

  dialogo.querySelector('.chatbot-panel__cerrar').addEventListener('click', () => cerrarPanel(dialogo));

  // modal: Esc dispara "cancel"; no modal, hay que escucharlo
  dialogo.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !e.defaultPrevented) {
      e.preventDefault();
      cerrarPanel(dialogo);
    }
  });

  dialogo.addEventListener('close', () => {
    if (bloqueado) {
      liberarScroll();
      bloqueado = false;
    }
    origen?.focus({ preventScroll: true });
  });

  // seguir por WhatsApp: el número del bot, solo si tiene el formato 51 y 9 dígitos
  const whatsapp = dialogo.querySelector('.chatbot-panel__whatsapp');
  const numero = String(CONFIG.chatbot?.numero ?? '').trim();
  if (whatsapp && NUMERO_VALIDO.test(numero)) {
    enlazar(whatsapp.querySelector('[role="link"]'), `https://wa.me/${numero}?text=${encodeURIComponent(CONFIG.whatsapp.mensaje || '')}`);
    whatsapp.hidden = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = entrada.value.trim();
    if (!texto) return;
    entrada.value = '';
    agregarBot(mensajes, responder(texto), agregarUsuario(mensajes, texto));
  });

  mensajes.addEventListener('click', (e) => {
    const opcion = e.target.closest('[data-intencion]');
    if (!opcion) return;
    agregarBot(mensajes, respuesta(opcion.dataset.intencion), agregarUsuario(mensajes, opcion.textContent));
  });

  agregarBot(mensajes, saludo());
}

function agregarUsuario(mensajes, texto) {
  const globo = document.createElement('p');
  globo.className = 'chatbot-msg chatbot-msg--usuario';
  globo.textContent = texto;
  mensajes.append(globo);
  return globo;
}

/* `pregunta` es el globo del usuario al que responde: queda arriba, con el comienzo de la
   respuesta debajo, así las largas se leen desde el principio. */
function agregarBot(mensajes, { bloques, opciones }, pregunta = null) {
  const globo = document.createElement('div');
  globo.className = 'chatbot-msg chatbot-msg--bot';
  globo.append(...bloques);
  mensajes.append(globo);

  if (opciones?.length) {
    const grupo = document.createElement('div');
    grupo.className = 'chatbot-opciones';
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', 'Opciones');
    for (const intencion of opciones) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'chatbot-opcion';
      boton.dataset.intencion = intencion;
      boton.textContent = etiqueta(intencion);
      grupo.append(boton);
    }
    mensajes.append(grupo);
  }

  if (pregunta) mensajes.scrollTo({ top: pregunta.offsetTop - 12, behavior: reducido() ? 'auto' : 'smooth' });
}
