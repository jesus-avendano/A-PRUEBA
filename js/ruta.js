/* La ruta (docs/CAMBIOS-CARTAS-CONTADOR.md, Fase D): un carrusel 3D de cartas
   que se voltean.
   - Cada carta muestra la foto de su estación con su número (blanco, arriba a
     la izquierda). Al tocarla viene al frente, si no lo estaba, y se voltea:
     en el reverso está su estación. Tocarla de nuevo la endereza. Solo una
     carta volteada a la vez; arrastrar o girar el anillo la endereza.
   - Las estaciones siguen en el HTML (los <article>): sin JS se ven en
     grilla; con JS quedan solo para lectores de pantalla, y el reverso de
     cada carta copia su contenido.
   - El carrusel es el control accesible (opción label): Tab llega a él, las
     flechas lo giran y anuncian la estación, Enter voltea la de adelante.
   - Si el texto de alguna estación no entra en su reverso, todas las cartas
     achican la letra un poco (ajustarDorsos). Nunca se corta.
   - El carrusel (js/carrusel.js) se importa recién cuando la sección está a
     600px: la primera carga no suma ni un byte.
   - Gira solo, con pausa al pasar el puntero o con el foco de teclado. Con
     una carta volteada no gira; al salir de la sección se endereza y, al
     volver, gira de nuevo.
   - Desde 768px cada foto va dos veces y a la mitad de velocidad: con 4
     cartas el cilindro parece una caja chica. Al cruzar ese ancho se rearma,
     en la misma estación. */

// Los valores ajustados en el configurador de React Bits. Cambian fadeColor,
// aspectRatio y cornerRadius (cartas 3:4), y se suma el resorte del volteo
// (el de FlipCard).
const OPCIONES = {
  aspectRatio: 0.75,
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
  cornerRadius: 18,
  intro: 'rise',
  flipStiffness: 170, // FlipCard de React Bits
  flipDamping: 20,
};

// Celular: cada foto una vez y la carta a tamaño real (minFit 1: el anillo se
// recorta a los costados en vez de achicarse, así el reverso se lee). Desde
// 768px: dos veces y a la mitad de velocidad (cada estación, unos 5 s adelante).
const ANILLO = {
  celular: { rep: 1, cardWidth: 240, speed: 17, minFit: 1 },
  escritorio: { rep: 2, cardWidth: 260, speed: 8.5, minFit: 0 },
};

// La letra del reverso baja de a poco hasta que el texto entra (0.86: la descripción en 12px)
const LETRAS = [1, 0.96, 0.92, 0.89, 0.86];

export function iniciarRuta(seccion) {
  if (!seccion) return;
  const estaciones = [...seccion.querySelectorAll('.estacion')];
  const escenario = seccion.querySelector('[data-carrusel]');
  if (!estaciones.length || !escenario) return;

  const N = estaciones.length;
  const ancho = window.matchMedia('(min-width: 768px)');
  let carrusel = null;
  let modulo = null;
  let actual = 0;
  let elegida = false; // el usuario volteó una carta: el giro automático queda apagado

  // sin JS son una grilla; con JS, el carrusel
  seccion.classList.add('ruta--carrusel');
  seccion.querySelector('.ruta__escenario').hidden = false;

  const texto = (articulo, selector) => articulo.querySelector(selector)?.textContent.trim() ?? '';
  const titulo = (i) => texto(estaciones[i], '.estacion__titulo');
  const resumen = (i) => [
    `Estación ${i + 1}: ${titulo(i)}.`,
    texto(estaciones[i], '.estacion__pregunta'),
    texto(estaciones[i], '.estacion__desc'),
  ].join(' ');

  // Reverso: una copia de la estación, con su color, y cómo volver
  const reverso = (_, c) => {
    const articulo = estaciones[c % N];
    const dorso = document.createElement('div');
    dorso.className = 'ruta__dorso';
    dorso.style.setProperty('--color', getComputedStyle(articulo).getPropertyValue('--color').trim());
    dorso.append(...[...articulo.children].map((nodo) => nodo.cloneNode(true)));
    dorso.querySelectorAll('[id]').forEach((nodo) => nodo.removeAttribute('id'));
    const volver = document.createElement('p');
    volver.className = 'ruta__dorso-volver';
    volver.textContent = 'Toca para volver';
    dorso.append(volver);
    return dorso;
  };

  // Que el texto entre en el reverso: si en alguna carta "Toca para volver" se
  // mete en el padding de abajo, todas achican la letra (--letra-dorso). Si ni
  // en 0.86 entra, ese texto es muy largo para la carta: se avisa en la consola.
  // Son medidas de layout: la transformación 3D no las afecta.
  let avisado = '';
  const ajustarDorsos = () => {
    const dorsos = [...escenario.querySelectorAll('.ruta__dorso')];
    if (!dorsos.length) return;
    const sobran = () => dorsos.filter((dorso) => {
      const ultimo = dorso.lastElementChild;
      const abajo = parseFloat(getComputedStyle(dorso).paddingBottom) || 0;
      return ultimo.offsetTop + ultimo.offsetHeight > dorso.clientHeight - abajo + 1;
    });
    for (const letra of LETRAS) {
      seccion.style.setProperty('--letra-dorso', letra);
      if (!sobran().length) return;
    }
    const largas = [...new Set(sobran().map((dorso) => dorso.querySelector('.estacion__titulo')?.textContent.trim()))];
    const aviso = `Ruta: el texto de ${largas.join(', ')} no entra en el reverso de la carta. Hay que acortarlo.`;
    if (aviso !== avisado) console.warn((avisado = aviso));
  };

  const tocar = async (c) => {
    const i = c % N;
    if (carrusel.volteada === c) {
      carrusel.voltear(c, false);
      carrusel.anunciar(`Estación ${i + 1}: ${titulo(i)}.`);
      return;
    }
    carrusel.enderezar();
    elegida = true;
    carrusel.girar(false);
    await carrusel.enfocar(c); // viene al frente (si ya lo estaba, al toque)
    carrusel.voltear(c, true);
    carrusel.anunciar(resumen(i));
  };

  const montar = async () => {
    modulo ??= import('./carrusel.js');
    const { crearCarrusel } = await modulo;
    if (carrusel) carrusel.destruir();
    const anillo = ancho.matches ? ANILLO.escritorio : ANILLO.celular;
    const fotos = estaciones.map((articulo) => ({ src: articulo.dataset.foto }));
    carrusel = crearCarrusel(escenario, {
      ...OPCIONES,
      cardWidth: anillo.cardWidth,
      speed: anillo.speed,
      minFit: anillo.minFit,
      items: Array.from({ length: anillo.rep }, () => fotos).flat(),
      startIndex: actual,
      overlay: (_, c) => `<span class="ruta__numero">${(c % N) + 1}</span>`,
      back: reverso,
      label: 'Las 4 estaciones de la ruta',
      hint: 'Usa las flechas para girar y Enter para voltear la carta de adelante.',
      itemLabel: (_, c) => `Estación ${(c % N) + 1}: ${titulo(c % N)}. ${(c % N) + 1} de ${N}.`,
      onChange: (c) => { actual = c % N; },
      onItemClick: (_, c) => tocar(c),
    });
    if (!carrusel) return;
    if (elegida) carrusel.girar(false);
    ajustarDorsos();
  };

  // con las fuentes reales, la letra del reverso se vuelve a ajustar
  document.fonts?.addEventListener?.('loadingdone', ajustarDorsos);

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

    // al salir de la sección las cartas se enderezan y, al volver, gira solo de nuevo
    new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting) || !carrusel) return;
      carrusel.enderezar();
      if (!elegida) return;
      elegida = false;
      carrusel.girar(true);
    }).observe(seccion);
  }

  // celular ⇄ escritorio: se rearma con la otra cantidad de cartas, en la misma estación
  ancho.addEventListener('change', () => {
    if (carrusel) montar();
  });
}
