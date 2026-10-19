/* La ruta (docs/CAMBIOS-PORTAL-FONDO.md, Fase B): el carrusel 3D de fotos es
   la navegación de las estaciones.
   - Cada foto guarda su estación: al tocarla (o con Enter en el carrusel)
     viene al frente y desde ella crece el portal (#dialogo-estacion, variante
     "estacion" de js/dialog.js) con su contenido.
   - Las estaciones siguen en el HTML (los <article>): sin JS se ven en grilla;
     con JS no se ven y el portal copia su contenido.
   - El carrusel es el control accesible (opción label): Tab llega a él, las
     flechas lo giran y anuncian la estación, y Enter abre la de adelante.
   - El carrusel (js/carrusel.js) se importa recién cuando la sección está a
     600px: la primera carga no suma ni un byte.
   - Gira solo, con pausa al pasar el puntero o con el foco de teclado. Abrir
     una estación apaga el giro hasta que la sección sale de pantalla.
   - Desde 768px cada foto va dos veces y a la mitad de velocidad: con 4
     tarjetas el cilindro parece una caja chica. Al cruzar ese ancho se
     rearma, en la misma estación.
   - Con el portal abierto, el carrusel y el video de fondo se detienen. */

import { openDialog } from './dialog.js';
import { suspenderVideo } from './video.js';

// Los valores ajustados en el configurador de React Bits. Solo cambia fadeColor;
// la velocidad, el ancho y la cantidad de tarjetas van en ANILLO.
const OPCIONES = {
  aspectRatio: 1,
  gap: 38,
  tilt: -5,
  curve: 1,
  perspective: 1780,
  autoplay: 'drift',
  direction: 'left',
  momentum: 0.6,
  snap: true,
  pauseOnHover: true,
  focusOnClick: true,
  draggable: true,
  parallax: 0.39,
  stretch: 0.5,
  fadeColor: 'var(--navy-900)',
  depthFade: 0.55,
  innerShade: 0.6,
  cornerRadius: 12,
  intro: 'rise',
};

// Con 8 tarjetas la velocidad va a la mitad: cada estación sigue unos 5 s adelante.
// En escritorio las fotos son más grandes: el carrusel es lo principal de la sección.
const ANILLO = {
  celular: { rep: 1, cardWidth: 266, speed: 17 },
  escritorio: { rep: 2, cardWidth: 300, speed: 8.5 },
};

export function iniciarRuta(seccion) {
  if (!seccion) return;
  const estaciones = [...seccion.querySelectorAll('.estacion')];
  const escenario = seccion.querySelector('[data-carrusel]');
  const portal = document.getElementById('dialogo-estacion');
  if (!estaciones.length || !escenario || !portal) return;

  const N = estaciones.length;
  const ancho = window.matchMedia('(min-width: 768px)');
  let carrusel = null;
  let modulo = null;
  let rep = 1;
  let actual = 0;
  let elegida = false; // el usuario abrió una estación: el giro automático queda apagado
  let abierto = false; // el portal está abierto (o abriéndose)
  let rearmar = false; // cambió el ancho con el portal abierto: se rearma al cerrarlo

  // sin JS son una grilla; con JS, el carrusel
  seccion.classList.add('ruta--carrusel');
  seccion.querySelector('.ruta__escenario').hidden = false;

  const titulo = (i) => estaciones[i].querySelector('.estacion__titulo').textContent.trim();

  // Copia la estación al portal: ícono, "Estación N", título, pregunta y descripción
  const llenar = async (articulo) => {
    const contenido = portal.querySelector('.portal__contenido');
    const foto = portal.querySelector('.portal__foto');
    contenido.replaceChildren(...[...articulo.children].map((nodo) => nodo.cloneNode(true)));
    contenido.querySelectorAll('[id]').forEach((nodo) => nodo.removeAttribute('id'));
    const h3 = contenido.querySelector('.estacion__titulo');
    h3.id = 'portal-titulo';
    h3.tabIndex = -1;
    portal.querySelector('.portal__caja').style.setProperty('--color', getComputedStyle(articulo).getPropertyValue('--color').trim());
    foto.loading = 'eager';
    foto.src = articulo.dataset.foto;
    if (foto.decode) await foto.decode().catch(() => {});
    return h3;
  };

  const abrir = async (tarjeta) => {
    if (abierto || !carrusel) return;
    abierto = true;
    const i = tarjeta % N;
    actual = i;
    elegida = true;
    carrusel.girar(false);
    await carrusel.enfocar(tarjeta); // la foto viene al frente (al instante con movimiento reducido)
    const foco = await llenar(estaciones[i]);
    carrusel.suspender(true);
    suspenderVideo(true);
    openDialog({
      id: 'dialogo-estacion',
      origin: escenario, // al cerrar, el foco vuelve al carrusel
      variant: 'estacion',
      focus: foco,
      rect: () => carrusel.rectDe(tarjeta),
      onClose: () => {
        abierto = false;
        carrusel.suspender(false);
        suspenderVideo(false);
        if (rearmar) montar();
      },
    });
  };

  const montar = async () => {
    rearmar = false;
    modulo ??= import('./carrusel.js');
    const { crearCarrusel } = await modulo;
    if (carrusel) carrusel.destruir();
    const anillo = ancho.matches ? ANILLO.escritorio : ANILLO.celular;
    rep = anillo.rep;
    const fotos = estaciones.map((articulo) => ({ src: articulo.dataset.foto }));
    carrusel = crearCarrusel(escenario, {
      ...OPCIONES,
      cardWidth: anillo.cardWidth,
      speed: anillo.speed,
      items: Array.from({ length: rep }, () => fotos).flat(),
      startIndex: actual,
      label: 'Las 4 estaciones de la ruta',
      hint: 'Usa las flechas para girar y Enter para abrir la estación de adelante.',
      itemLabel: (_, c) => `Estación ${(c % N) + 1}: ${titulo(c % N)}. ${(c % N) + 1} de ${N}.`,
      onChange: (c) => { actual = c % N; },
      onItemClick: (_, c) => abrir(c),
    });
    if (carrusel && elegida) carrusel.girar(false);
  };

  if (!('IntersectionObserver' in window)) {
    montar();
  } else {
    // el carrusel (y sus fotos) se crea recién cuando la sección está cerca
    const cerca = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      cerca.disconnect();
      montar();
    }, { rootMargin: '600px 0px' });
    cerca.observe(seccion);

    // si sale de pantalla después de abrir una estación, al volver gira de nuevo
    new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting) || !elegida || abierto) return;
      elegida = false;
      if (carrusel) carrusel.girar(true);
    }).observe(seccion);
  }

  // celular ⇄ escritorio: se rearma con la otra cantidad de tarjetas, en la misma estación
  ancho.addEventListener('change', () => {
    if (!carrusel) return;
    if (abierto) rearmar = true;
    else montar();
  });
}
