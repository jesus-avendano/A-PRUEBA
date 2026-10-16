/* Selector Presencial/Virtual: los dos botones flotantes abren su panel
   en el mismo lugar, sin cambiar de página ni abrir un modal. */

import { CONFIG } from './config.js';

const ETIQUETA_LUMA = {
  presencial: 'Quiero mi pasaporte presencial',
  virtual: 'Quiero mi pasaporte virtual',
};

export function iniciarEntradas() {
  const boletos = [...document.querySelectorAll('.boleto')];
  const envoltorio = document.getElementById('panel-envoltorio');
  const panel = document.getElementById('panel-entrada');
  if (!boletos.length || !panel) return;

  const contenidos = [...panel.querySelectorAll('.panel-entrada__contenido')];
  const botonCerrar = panel.querySelector('.panel-entrada__cerrar');

  let abierta = null;        // 'presencial' | 'virtual' | null
  let boletoQueAbrio = null; // para devolverle el foco al cerrar

  prepararLuma(contenidos);
  aplicarCupos();

  /* --- apertura y cierre --- */

  function mostrarContenido(modalidad, desde) {
    contenidos.forEach((c) => {
      const esta = c.dataset.modalidad === modalidad;
      c.hidden = !esta;
      if (!esta) return;
      if (desde) {
        // el contenido entra deslizando desde el lado del botón elegido
        c.style.setProperty('--desliz', desde === 'virtual' ? '24px' : '-24px');
        c.classList.remove('panel-entrada__contenido--anima');
        void c.offsetWidth; // reinicia la animación
        c.classList.add('panel-entrada__contenido--anima');
      }
    });
    panel.dataset.activa = modalidad;
    const titulo = panel.querySelector(`#panel-titulo-${modalidad}`);
    if (titulo) panel.setAttribute('aria-labelledby', titulo.id);
  }

  function pintarBoletos() {
    boletos.forEach((b) => {
      const mod = b.dataset.modalidad;
      const activo = mod === abierta;
      b.classList.toggle('boleto--activo', activo);
      b.classList.toggle('boleto--atenuado', abierta !== null && !activo);
      b.setAttribute('aria-expanded', String(activo));
      const pie = b.querySelector('.boleto__pie-texto');
      if (pie) pie.textContent = activo ? 'Cerrar' : 'Ver experiencia';
    });
  }

  function abrir(modalidad, boton) {
    const cambio = abierta !== null && abierta !== modalidad;
    const primera = abierta === null;
    abierta = modalidad;
    boletoQueAbrio = boton;

    mostrarContenido(modalidad, cambio ? modalidad : null);
    pintarBoletos();

    envoltorio.classList.add('panel-envoltorio--abierto');
    panel.removeAttribute('inert');
    panel.removeAttribute('aria-hidden');

    if (primera) {
      panel.classList.remove('panel-entrada--aparece');
      void panel.offsetWidth;
      panel.classList.add('panel-entrada--aparece');
      const boletoActivo = boton;
      if (boletoActivo) {
        boletoActivo.classList.remove('late');
        void boletoActivo.offsetWidth;
        boletoActivo.classList.add('late');
      }
    }

    const titulo = panel.querySelector(`#panel-titulo-${modalidad}`);
    if (titulo) titulo.focus({ preventScroll: true });

    // en móvil, mover la vista solo si el panel se quedó fuera de pantalla
    if (window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        const caja = panel.getBoundingClientRect();
        const fuera = caja.bottom > window.innerHeight || caja.top < 0;
        if (fuera) {
          const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          panel.scrollIntoView({ block: 'nearest', behavior: suave ? 'smooth' : 'auto' });
        }
      });
    }
  }

  function cerrar({ devolverFoco = true } = {}) {
    if (abierta === null) return;
    abierta = null;
    pintarBoletos();
    envoltorio.classList.remove('panel-envoltorio--abierto');
    panel.setAttribute('inert', '');
    panel.setAttribute('aria-hidden', 'true');
    if (devolverFoco && boletoQueAbrio) boletoQueAbrio.focus();
    boletoQueAbrio = null;
  }

  /* --- eventos --- */

  boletos.forEach((boton) => {
    boton.addEventListener('click', () => {
      const mod = boton.dataset.modalidad;
      if (abierta === mod) cerrar();
      else abrir(mod, boton);
    });
  });

  botonCerrar.addEventListener('click', () => cerrar());

  // enlace "¿Prefieres…?" dentro del panel
  panel.querySelectorAll('[data-cambiar]').forEach((enlace) => {
    enlace.addEventListener('click', () => {
      const mod = enlace.dataset.cambiar;
      abrir(mod, boletos.find((b) => b.dataset.modalidad === mod) || boletoQueAbrio);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && abierta !== null) {
      e.preventDefault();
      cerrar();
    }
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
