/* La ruta (docs/CAMBIOS-CARRUSEL-VIDEO.md, Fase B): carrusel 3D de fotos,
   pestañas 1–4 y el panel de la estación que está adelante.
   - Las estaciones salen del HTML: cada <article> trae su foto (data-foto) y
     su color (--color). Sin JS se ven las 4 completas, en grilla.
   - El carrusel (js/carrusel.js) se importa recién cuando la sección está a
     600px: la primera carga no suma ni un byte. Es decorativo (aria-hidden);
     el control accesible son las pestañas.
   - Gira solo y el panel sigue a la foto de adelante. Con el puntero encima
     o el foco de teclado en las pestañas o el panel, se pausa.
   - Elegir una estación (pestaña, foto, flechas, Inicio, Fin) gira hasta
     ella y apaga el giro automático hasta que la sección sale de pantalla.
   - Desde 768px cada foto va dos veces y a la mitad de velocidad: con 4
     tarjetas el cilindro parece una caja chica. Al cruzar ese ancho se
     rearma, en la misma estación. */

// Los valores ajustados en el configurador de React Bits. Solo cambia fadeColor;
// la velocidad y la cantidad de tarjetas van en ANILLO.
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
const ANILLO = {
  celular: { rep: 1, cardWidth: 266, speed: 17 },
  escritorio: { rep: 2, cardWidth: 266, speed: 8.5 },
};

export function iniciarRuta(seccion) {
  if (!seccion) return;
  const tabs = [...seccion.querySelectorAll('[role="tab"]')];
  const paneles = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const escenario = seccion.querySelector('[data-carrusel]');
  const control = seccion.querySelector('.ruta__control');
  if (!tabs.length || paneles.some((panel) => !panel) || !escenario || !control) return;

  const N = paneles.length;
  const ancho = window.matchMedia('(min-width: 768px)');
  let carrusel = null;
  let modulo = null;
  let rep = 1;
  let actual = 0;
  let elegida = false; // el usuario eligió una estación: el giro automático queda apagado

  // sin JS son una grilla; con JS, los paneles de las pestañas
  seccion.classList.add('ruta--carrusel');
  seccion.querySelectorAll('.ruta__escenario, .ruta__nodos').forEach((el) => { el.hidden = false; });
  paneles.forEach((panel, i) => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs[i].id);
  });

  // El panel no tiene nada enfocable: recibe el foco él mismo (patrón de pestañas).
  // Solo el activo: el que sale sigue visible 300ms mientras se desvanece.
  const mostrar = (i) => {
    actual = i;
    tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(i === j));
      tab.tabIndex = i === j ? 0 : -1;
    });
    paneles.forEach((panel, j) => {
      panel.classList.toggle('estacion--activa', i === j);
      panel.tabIndex = i === j ? 0 : -1;
    });
  };
  mostrar(actual);

  // con las fotos repetidas, la copia de la estación i más cercana a la de adelante
  const copiaCercana = (i) => {
    const total = N * rep;
    const a = carrusel ? carrusel.activo : i;
    let mejor = i;
    let distancia = Infinity;
    for (let k = 0; k < rep; k++) {
      const c = i + k * N;
      const d = Math.min(Math.abs(c - a), total - Math.abs(c - a));
      if (d < distancia) {
        distancia = d;
        mejor = c;
      }
    }
    return mejor;
  };

  const elegir = (i) => {
    mostrar(i);
    elegida = true;
    if (!carrusel) return;
    carrusel.girar(false);
    carrusel.enfocar(copiaCercana(i));
  };

  const montar = async () => {
    modulo ??= import('./carrusel.js');
    const { crearCarrusel } = await modulo;
    if (carrusel) carrusel.destruir();
    const anillo = ancho.matches ? ANILLO.escritorio : ANILLO.celular;
    rep = anillo.rep;
    const fotos = paneles.map((panel) => ({
      src: panel.dataset.foto,
      color: getComputedStyle(panel).getPropertyValue('--color').trim(),
    }));
    carrusel = crearCarrusel(escenario, {
      ...OPCIONES,
      cardWidth: anillo.cardWidth,
      speed: anillo.speed,
      items: Array.from({ length: rep }, () => fotos).flat(),
      startIndex: actual,
      overlay: (item, c) => `<span class="ruta__marca" style="--color: ${item.color}">${(c % N) + 1}</span>`,
      onChange: (c) => mostrar(c % N),
      onItemClick: (_, c) => {
        mostrar(c % N);
        elegida = true;
        carrusel.girar(false);
      },
    });
    if (!carrusel) return;
    if (elegida) carrusel.girar(false);
    if (control.matches(':hover')) carrusel.pausar('panel', true);
    if (control.querySelector(':focus-visible')) carrusel.pausar('foco', true);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => elegir(i));
    tab.addEventListener('keydown', (e) => {
      const destino = { ArrowRight: (i + 1) % N, ArrowLeft: (i - 1 + N) % N, Home: 0, End: N - 1 }[e.key];
      if (destino === undefined) return;
      e.preventDefault();
      tabs[destino].focus();
      elegir(destino);
    });
  });

  // mientras alguien lee el panel (puntero encima) o navega con teclado, no gira solo
  control.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse' && carrusel) carrusel.pausar('panel', true);
  });
  control.addEventListener('pointerleave', () => {
    if (carrusel) carrusel.pausar('panel', false);
  });
  // solo el foco de teclado: en Chrome un clic también enfoca el botón y dejaría la pausa puesta
  control.addEventListener('focusin', (e) => {
    if (carrusel && e.target.matches(':focus-visible')) carrusel.pausar('foco', true);
  });
  control.addEventListener('focusout', (e) => {
    if (carrusel && !control.contains(e.relatedTarget)) carrusel.pausar('foco', false);
  });

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

    // si sale de pantalla después de que el usuario eligió, al volver gira de nuevo
    new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting) || !elegida) return;
      elegida = false;
      if (carrusel) carrusel.girar(true);
    }).observe(seccion);
  }

  // celular ⇄ escritorio: se rearma con la otra cantidad de tarjetas, en la misma estación
  ancho.addEventListener('change', () => {
    if (carrusel) montar();
  });

}
