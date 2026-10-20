/* Hero: el título entra palabra por palabra (docs/CAMBIOS-RUTA-HERO.md §3), y
   "futuro profesional" va en su propia línea con las letras técnicas de
   js/rotulo.js (TechText de React Bits, 20 oct).
   - Las palabras son inline-block: nunca se parten entre líneas. "futuro
     profesional" entra como una sola pieza, que es donde se monta el canvas.
   - El texto completo queda en un span oculto para lectores de pantalla;
     las piezas animadas van con aria-hidden.
   - Con movimiento reducido no se divide nada: el título queda quieto (y el
     rótulo no barre solo ni salta: solo responde al puntero).
   - El rótulo se monta después de la carga, con las fuentes listas y en un
     momento libre: el título es el LCP, y hasta entonces se ve el texto del
     HTML, que se esconde recién cuando el canvas ya lo dibujó. */

const PASO_PALABRA = 60;   // ms entre palabras al entrar
const ESPERA_SUB = 200;    // ms entre el título y el subtítulo

// Las opciones del configurador de React Bits. fontWeight va en
// 400 y no en 600: Archivo Black solo tiene 400, y con 600 el canvas inventaría una
// negrita distinta al resto del título. fontSize sale del CSS de la línea.
const ROTULO = {
  fontWeight: 400,
  reveal: 'letter',
  dashLength: 4,
  dashGap: 2,
  specks: 15,
  intro: 'none',
  introDuration: 2,
  clickKick: true,
  guides: false,
  fontFamily: '',
  letterSpacing: -0.05,
  accentColor: 'currentColor',
  reach: 200,
  softness: 0.7,
  lineStyle: 'dashed',
  strokeWidth: 1.5,
  speed: 1,
  bounce: 0.4,
  selection: true,
  labels: true,
  color: 'currentColor',
  align: 'center',
  draggable: true,
  sweep: true,
};

export function iniciarHero() {
  const frase = document.querySelector('.hero__frase');
  const hero = document.getElementById('inicio');
  if (!frase || !hero) return;
  montarRotulo(frase);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const oculto = document.createElement('span');
  oculto.className = 'sr-only';
  oculto.textContent = frase.textContent.replace(/\s+/g, ' ').trim();

  const piezas = document.createElement('span');
  piezas.className = 'hero__palabras';
  piezas.setAttribute('aria-hidden', 'true');

  let palabras = 0;
  const agregar = (texto, clase) => {
    const palabra = document.createElement('span');
    palabra.className = clase ? `hero__palabra ${clase}` : 'hero__palabra';
    palabra.style.setProperty('--i', palabras++);
    palabra.textContent = texto;
    if (piezas.childNodes.length) piezas.append(' ');
    piezas.append(palabra);
  };

  // el resaltado viene marcado en el HTML con .resalte-celeste; la línea del rótulo, con .hero__tech
  frase.childNodes.forEach((nodo) => {
    const elemento = nodo.nodeType === Node.ELEMENT_NODE;
    if (elemento && nodo.classList.contains('hero__tech')) {
      agregar(nodo.textContent.replace(/\s+/g, ' ').trim(), 'hero__palabra--resalte hero__tech');
      return;
    }
    const resalte = elemento && nodo.classList.contains('resalte-celeste');
    nodo.textContent.split(/\s+/).filter(Boolean).forEach((texto) => agregar(texto, resalte && 'hero__palabra--resalte'));
  });

  frase.replaceChildren(oculto, piezas);
  hero.style.setProperty('--retraso-sub', `${palabras * PASO_PALABRA + ESPERA_SUB}ms`);
  hero.classList.add('hero--animado');
}

/* Monta el rótulo en la línea .hero__tech (la pieza que dejó la división en
   palabras, o el span del HTML con movimiento reducido). */
function montarRotulo(frase) {
  if (!('IntersectionObserver' in window) || !('ResizeObserver' in window)) return; // queda el texto

  const arrancar = async () => {
    const linea = frase.querySelector('.hero__tech');
    if (!linea) return;
    const { crearRotulo } = await import('./rotulo.js');
    const texto = linea.textContent.replace(/\s+/g, ' ').trim();

    const visible = document.createElement('span');
    visible.className = 'hero__tech-texto';
    visible.textContent = texto;
    const lienzo = document.createElement('span');
    lienzo.className = 'hero__tech-lienzo';
    lienzo.setAttribute('aria-hidden', 'true');
    linea.replaceChildren(visible, lienzo);

    const tamano = () => parseFloat(getComputedStyle(linea).fontSize);
    const rotulo = crearRotulo(lienzo, { ...ROTULO, text: texto, fontSize: tamano() }, () =>
      linea.classList.add('hero__tech--lienzo'),
    );
    new ResizeObserver(() => rotulo.actualizar({ fontSize: tamano() })).observe(linea);
  };

  const enReposo = window.requestIdleCallback
    ? (fn) => window.requestIdleCallback(fn, { timeout: 2000 })
    : (fn) => window.setTimeout(fn, 200);
  const cuandoCargue = () => {
    const fuentes = document.fonts ? document.fonts.ready : Promise.resolve();
    fuentes.then(() => enReposo(arrancar));
  };
  if (document.readyState === 'complete') cuandoCargue();
  else window.addEventListener('load', cuandoCargue, { once: true });
}
