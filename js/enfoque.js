/* Ruta del estudiante: modo enfoque (docs/CAMBIOS-RUTA-HERO.md §2).
   Las tarjetas son compactas: ícono, "Estación N", título y pregunta. Al
   tocar una (o su número) se abre en su lugar con la descripción, las otras
   se apagan y el cometa viaja hasta esa estación (js/ruta.js). Sin JS, las
   tarjetas se ven completas. */

const ABIERTA = { texto: 'Ver menos', signo: '−' };
const CERRADA = { texto: 'Ver qué harás', signo: '+' };
const ESPERA_ALTURA = 420; // lo que tarda la descripción en desplegarse

export function iniciarEnfoque(ruta) {
  const lista = document.querySelector('.estaciones');
  const seccion = document.getElementById('ruta');
  if (!lista || !seccion) return;

  const estaciones = [...lista.querySelectorAll('.estacion[data-estacion]')].map((li) => ({
    li,
    tarjeta: li.querySelector('.estacion__tarjeta'),
    boton: li.querySelector('.estacion__boton'),
    nodo: li.querySelector('.estacion__nodo'),
    detalle: li.querySelector('.estacion__detalle'),
    texto: li.querySelector('.estacion__invitacion-texto'),
    signo: li.querySelector('.estacion__invitacion-signo'),
  }));
  if (estaciones.some((e) => !e.tarjeta || !e.boton || !e.detalle)) return;

  let activa = -1;
  let alturasPendientes = false;
  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // estado inicial: compactas y con la descripción fuera del alcance de lectores
  lista.classList.add('estaciones--compactas');
  estaciones.forEach(cerrar);
  igualarAlturas();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(igualarAlturas);
  let espera;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(igualarAlturas, 150);
  }, { passive: true });

  function abrir(e) {
    e.detalle.removeAttribute('inert');
    e.detalle.removeAttribute('aria-hidden');
    e.boton.setAttribute('aria-expanded', 'true');
    e.nodo.setAttribute('aria-expanded', 'true');
    e.texto.textContent = ABIERTA.texto;
    e.signo.textContent = ABIERTA.signo;
    e.li.classList.add('estacion--enfocada');
  }

  function cerrar(e) {
    e.detalle.setAttribute('inert', '');
    e.detalle.setAttribute('aria-hidden', 'true');
    e.boton.setAttribute('aria-expanded', 'false');
    e.nodo.setAttribute('aria-expanded', 'false');
    e.texto.textContent = CERRADA.texto;
    e.signo.textContent = CERRADA.signo;
    e.li.classList.remove('estacion--enfocada', 'estacion--aqui');
  }

  function enfocar(i, { moverFoco = false } = {}) {
    if (i === activa) return;
    if (activa >= 0) cerrar(estaciones[activa]);
    activa = i;
    const e = estaciones[i];
    lista.classList.add('estaciones--enfoque');
    abrir(e);
    if (moverFoco) e.boton.focus({ preventScroll: true });

    // el cometa (o el riel) va a la estación; al llegar, el nodo late y queda encendido
    Promise.resolve(ruta ? ruta.enfocar(i) : null).then(() => {
      if (activa !== i) return; // se cambió de estación a mitad de camino
      e.li.classList.add('estacion--aqui');
      if (!reducido()) {
        e.nodo.classList.remove('estacion__nodo--llega');
        void e.nodo.offsetWidth;
        e.nodo.classList.add('estacion__nodo--llega');
        setTimeout(() => e.nodo.classList.remove('estacion__nodo--llega'), 700);
      }
    });

    // solo si la tarjeta abierta queda fuera de pantalla, lo mínimo para verla
    setTimeout(() => {
      if (activa !== i) return;
      const caja = e.tarjeta.getBoundingClientRect();
      const tapa = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      if (caja.top < tapa || caja.bottom > window.innerHeight) {
        e.tarjeta.scrollIntoView({ block: 'nearest', behavior: reducido() ? 'auto' : 'smooth' });
      }
    }, reducido() ? 0 : ESPERA_ALTURA);
  }

  function salir() {
    if (activa < 0) return;
    cerrar(estaciones[activa]);
    activa = -1;
    lista.classList.remove('estaciones--enfoque');
    if (ruta) ruta.soltar();
    if (alturasPendientes) igualarAlturas();
  }

  /** Las 4 tarjetas compactas miden lo mismo (la más alta manda). */
  function igualarAlturas() {
    if (activa >= 0) {
      alturasPendientes = true;
      return;
    }
    alturasPendientes = false;
    lista.style.removeProperty('--alto-compacto');
    const alto = Math.max(...estaciones.map((e) => e.tarjeta.offsetHeight));
    if (alto > 0) lista.style.setProperty('--alto-compacto', `${alto}px`);
  }

  // tocar la tarjeta o su número abre; tocar la misma, cierra
  estaciones.forEach((e, i) => {
    const alternar = () => (activa === i ? salir() : enfocar(i));
    e.tarjeta.addEventListener('click', alternar);
    e.nodo.addEventListener('click', alternar);
  });

  // un clic fuera de las tarjetas, dentro de la sección, sale del enfoque
  seccion.addEventListener('click', (ev) => {
    if (activa < 0) return;
    if (ev.target.closest('.estacion__tarjeta, .estacion__nodo')) return;
    salir();
  });

  // Esc sale; ← → pasan a la estación anterior o siguiente
  document.addEventListener('keydown', (ev) => {
    if (activa < 0) return;
    const foco = document.activeElement;
    if (foco !== document.body && !seccion.contains(foco)) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      salir();
    } else if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      const destino = activa + (ev.key === 'ArrowRight' ? 1 : -1);
      if (destino < 0 || destino >= estaciones.length) return;
      ev.preventDefault();
      enfocar(destino, { moverFoco: true });
    }
  });
}
