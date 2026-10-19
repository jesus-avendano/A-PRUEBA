// Dígitos que ruedan como un odómetro: port a JS puro de Counter de React Bits (@react-bits/Counter-JS-CSS),
// solo con lo que usa la cuenta regresiva: una cantidad fija de dígitos enteros, sin separadores, decimales,
// prefijos ni dígitos que entran o salen. La física, el desenfoque de movimiento, el fundido de la ventana y
// la intro son los del original.
//
//   const r = crearRodillo(caja, { digitos: 2, valor: 28 });
//   r.fijar(27);    r.destruir();
//
// Es decorativo (aria-hidden): el número accesible lo sigue dando el texto aria-live de la cuenta regresiva.

const TAU = Math.PI * 2;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const mod = (v, base) => ((v % base) + base) % base;
const wrap = offset => mod(offset + 5, 10) - 5;
const reducido = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Igual que stepBetween del original
const pasoEntre = (desde, hasta, direccion) => {
  const arriba = mod(hasta - desde, 10);
  if (direccion === 'up') return arriba;
  if (direccion === 'down') return arriba === 0 ? 0 : arriba - 10;
  return arriba > 5 ? arriba - 10 : arriba;
};

// La máscara de la ventana: los números se funden arriba y abajo (la misma curva del original)
const MASCARA =
  'linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,.0355) calc(var(--rodillo-fade) * .1667), rgba(0,0,0,.2099) calc(var(--rodillo-fade) * .3333), rgba(0,0,0,.5) calc(var(--rodillo-fade) * .5), rgba(0,0,0,.7901) calc(var(--rodillo-fade) * .6667), rgba(0,0,0,.9645) calc(var(--rodillo-fade) * .8333), #000 var(--rodillo-fade), #000 calc(100% - var(--rodillo-fade)), rgba(0,0,0,.9645) calc(100% - var(--rodillo-fade) * .8333), rgba(0,0,0,.7901) calc(100% - var(--rodillo-fade) * .6667), rgba(0,0,0,.5) calc(100% - var(--rodillo-fade) * .5), rgba(0,0,0,.2099) calc(100% - var(--rodillo-fade) * .3333), rgba(0,0,0,.0355) calc(100% - var(--rodillo-fade) * .1667), rgba(0,0,0,0) 100%)';

let serie = 0;

export function crearRodillo(
  contenedor,
  {
    digitos = 2,
    valor = 0,
    duracion = 0.65,
    rebote = 0.2,
    escalonado = 0.05,
    desvanecido = 0.3,
    desenfoque = true,
    direccion = 'down', // en una cuenta regresiva los números bajan
    intro = true,
  } = {}
) {
  const ns = 'http://www.w3.org/2000/svg';
  const raiz = document.createElement('span');
  raiz.className = 'rodillo';
  raiz.setAttribute('aria-hidden', 'true');
  raiz.style.setProperty('--rodillo-fade', `${Math.max(0, desvanecido)}em`);

  const cifras = n => String(clamp(Math.round(n), 0, 10 ** digitos - 1)).padStart(digitos, '0').split('').map(Number);
  const inicio = cifras(valor);

  // Un ítem por dígito, de izquierda a derecha. rank como el original: las unidades primero al cambiar.
  const items = inicio.map((d, k) => {
    const lugar = digitos - 1 - k;
    const el = document.createElement('span');
    el.className = 'rodillo__digito';
    const medida = document.createElement('span');
    medida.className = 'rodillo__medida';
    medida.textContent = '0';
    const ventana = document.createElement('span');
    ventana.className = 'rodillo__ventana';
    ventana.style.maskImage = MASCARA;
    ventana.style.webkitMaskImage = MASCARA;
    const tira = document.createElement('span');
    tira.className = 'rodillo__tira';
    const numerales = Array.from({ length: 10 }, (_, n) => {
      const s = document.createElement('span');
      s.className = 'rodillo__numeral';
      s.textContent = String(n);
      tira.appendChild(s);
      return s;
    });
    ventana.appendChild(tira);
    el.append(medida, ventana);
    let blur = null;
    let filtro = '';
    if (desenfoque) {
      filtro = `rodillo-blur-${++serie}`;
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', 'rodillo__blur');
      svg.setAttribute('aria-hidden', 'true');
      const filter = document.createElementNS(ns, 'filter');
      filter.setAttribute('id', filtro);
      filter.setAttribute('x', '-10%');
      filter.setAttribute('y', '-50%');
      filter.setAttribute('width', '120%');
      filter.setAttribute('height', '200%');
      filter.setAttribute('color-interpolation-filters', 'sRGB');
      blur = document.createElementNS(ns, 'feGaussianBlur');
      blur.setAttribute('stdDeviation', '0 0');
      filter.appendChild(blur);
      svg.appendChild(filter);
      el.appendChild(svg);
    }
    raiz.appendChild(el);
    return { rank: -2 * lugar, pos: d, vel: 0, target: d, wait: 0, el, tira, numerales, blur, filtro, borroso: false };
  });

  contenedor.replaceChildren(raiz);

  let raf = 0;
  let ultimo = 0;
  let em = 16;

  // Ancho fijo por dígito (el del más ancho): todos iguales, como cifras tabulares
  const medir = () => {
    em = parseFloat(getComputedStyle(raiz).fontSize) || 16;
    const prueba = document.createElement('span');
    prueba.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    raiz.appendChild(prueba);
    let max = 0;
    for (let n = 0; n < 10; n++) {
      prueba.textContent = String(n);
      max = Math.max(max, prueba.getBoundingClientRect().width);
    }
    prueba.remove();
    if (max) raiz.style.setProperty('--rodillo-ancho', `${max.toFixed(2)}px`);
  };
  medir();
  document.fonts?.ready?.then(medir).catch(() => {});

  const pintar = item => {
    item.numerales.forEach((numeral, n) => {
      numeral.style.transform = `translateY(${(wrap(n - item.pos) * 100).toFixed(3)}%)`;
    });
    if (!item.blur) return;
    const radio = clamp((Math.abs(item.vel) - 3) * 0.006, 0, 0.09) * em;
    if (radio > 0.25) {
      item.blur.setAttribute('stdDeviation', `0 ${radio.toFixed(2)}`);
      if (!item.borroso) {
        item.tira.style.filter = `url(#${item.filtro})`;
        item.borroso = true;
      }
    } else if (item.borroso) {
      item.tira.style.filter = '';
      item.borroso = false;
    }
  };
  items.forEach(pintar);

  const cuadro = ahora => {
    raf = 0;
    const dt = clamp((ahora - ultimo) / 1000, 0, 1 / 20);
    ultimo = ahora;
    const omega = TAU / Math.max(0.05, duracion);
    const zeta = 1 - clamp(rebote, 0, 0.9);
    let ocupado = false;
    for (const item of items) {
      if (reducido()) {
        item.wait = 0;
        item.pos = item.target;
        item.vel = 0;
      } else {
        let resto = dt;
        if (item.wait > 0) {
          const usado = Math.min(item.wait, resto);
          item.wait -= usado;
          resto -= usado;
        }
        if (resto > 0) {
          const pasos = Math.ceil(resto * 240);
          const h = resto / pasos;
          for (let i = 0; i < pasos; i++) {
            item.vel += (-omega * omega * (item.pos - item.target) - 2 * zeta * omega * item.vel) * h;
            item.pos += item.vel * h;
          }
        }
      }
      if (item.wait <= 0 && Math.abs(item.pos - item.target) < 0.002 && Math.abs(item.vel) < 0.02) {
        item.target = mod(Math.round(item.target), 10);
        item.pos = item.target;
        item.vel = 0;
      } else {
        ocupado = true;
      }
      pintar(item);
    }
    if (ocupado) raf = requestAnimationFrame(cuadro);
  };

  const arrancar = () => {
    if (raf) return;
    ultimo = performance.now();
    raf = requestAnimationFrame(cuadro);
  };

  // Intro: la primera vez que se ve, cada dígito da una vuelta completa, escalonada
  let observador = null;
  if (intro && !reducido() && 'IntersectionObserver' in window) {
    observador = new IntersectionObserver(
      entradas => {
        if (!entradas.some(e => e.isIntersecting)) return;
        observador.disconnect();
        const vuelta = direccion === 'down' ? -10 : 10;
        [...items]
          .sort((a, b) => a.rank - b.rank)
          .forEach((item, orden) => {
            item.target += vuelta;
            item.wait = orden * escalonado;
          });
        arrancar();
      },
      { threshold: 0.5 }
    );
    observador.observe(raiz);
  }

  return {
    fijar(nuevo) {
      const ds = cifras(nuevo);
      const moviendo = [];
      items.forEach((item, k) => {
        const paso = pasoEntre(mod(Math.round(item.target), 10), ds[k], direccion);
        if (paso !== 0) {
          item.target += paso;
          moviendo.push(item);
        }
      });
      moviendo.sort((a, b) => b.rank - a.rank).forEach((item, orden) => (item.wait = orden * escalonado));
      if (moviendo.length) arrancar();
    },
    destruir() {
      cancelAnimationFrame(raf);
      observador?.disconnect();
      raiz.remove();
    },
  };
}
