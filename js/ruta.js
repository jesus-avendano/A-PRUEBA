/* La ruta animada.
   Escritorio: un cometa recorre el trazo y enciende cada nodo al pasar.
   Móvil: el riel se rellena con el scroll y enciende los nodos.
   Ambos modos se apagan con prefers-reduced-motion.
   En modo enfoque (js/enfoque.js) el cometa deja su loop y viaja hasta la
   estación elegida; en móvil, el riel se rellena hasta ella. */

const DURACION = 8000;   // lo que tarda el cometa en recorrer el trazo
const ESTELA = 0.012;    // separación entre los puntos de la estela
const FRENTE = 0.55;     // altura de pantalla que marca el avance en móvil
const VIAJE = 800;       // lo que tarda el cometa en ir a la estación enfocada
const RELLENO = 400;     // lo que tarda el riel en llegar a la estación enfocada

export function iniciarRuta() {
  const mapa = document.querySelector('.ruta__mapa');
  if (!mapa) return null;

  const svg = mapa.querySelector('.ruta__trazo');
  const trazo = mapa.querySelector('.ruta__linea');
  const solida = mapa.querySelector('.ruta__linea-solida');
  const cometa = mapa.querySelector('.cometa');
  const estaciones = [...mapa.querySelectorAll('.estacion')];
  if (!svg || !trazo || !estaciones.length) return null;

  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
  const esEscritorio = () => getComputedStyle(svg).display !== 'none';

  entrada(mapa, solida, trazo, quieto);
  const vuelo = new Cometa({ svg, trazo, cometa, estaciones, quieto, esEscritorio });
  const riel = new Riel({ estaciones, quieto, esEscritorio });

  let visible = false;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entradas) => {
      visible = entradas.some((e) => e.isIntersecting);
      vuelo.revisar(visible);
      riel.revisar(visible);
    }, { threshold: 0 });
    io.observe(mapa);
  } else {
    visible = true;
    vuelo.revisar(true);
    riel.revisar(true);
  }

  document.addEventListener('visibilitychange', () => {
    vuelo.revisar(visible);
    riel.revisar(visible);
  });

  window.addEventListener('resize', () => {
    vuelo.medir();
    riel.medir();
    vuelo.revisar(visible);
    riel.revisar(visible);
  }, { passive: true });

  quieto.addEventListener('change', () => {
    vuelo.revisar(visible);
    riel.revisar(visible);
  });

  return {
    /** Lleva la ruta a la estación i; la promesa se cumple al llegar. */
    enfocar: (i) => (esEscritorio() ? vuelo.viajarA(i) : riel.enfocar(i)),
    /** Sale del enfoque: el cometa retoma su loop desde donde está. */
    soltar: () => {
      vuelo.retomar();
      riel.soltar();
    },
  };
}

/** Dibujo de entrada: una sola vez, cuando la sección aparece. */
function entrada(mapa, solida, trazo, quieto) {
  if (quieto.matches) return;
  const arrancar = () => {
    if (solida) {
      const largo = solida.getTotalLength();
      solida.style.setProperty('--largo', largo);
      solida.style.strokeDasharray = largo;
      solida.style.strokeDashoffset = largo;
    }
    mapa.classList.add('ruta__mapa--entra');
    // al terminar (trazo 1.7s; nodos y tarjetas < 1s) se quita la clase: sus
    // animaciones quedan con relleno y pisarían los transforms del hover y del
    // cometa, y al cambiar de animación (hover del nodo) se repetirían
    setTimeout(() => mapa.classList.remove('ruta__mapa--entra'), 2000);
  };

  if (!('IntersectionObserver' in window)) return arrancar();
  // arranca justo antes de que la ruta asome por abajo. Con un umbral por
  // porcentaje del bloque (antes 0.2), en un celular angosto, donde la ruta mide
  // ~2400px, llegaba tarde: la primera tarjeta ya se veía y "parpadeaba" al entrar
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      arrancar();
      io.disconnect();
    });
  }, { threshold: 0, rootMargin: '0px 0px 40px 0px' });
  io.observe(mapa);
}

/* --------------------------------------------------------------
   Cometa (escritorio)
   -------------------------------------------------------------- */
class Cometa {
  constructor({ svg, trazo, cometa, estaciones, quieto, esEscritorio }) {
    this.svg = svg;
    this.trazo = trazo;
    this.solida = svg.querySelector('.ruta__linea-solida');
    this.grupo = cometa;
    this.cabeza = cometa ? cometa.querySelector('.cometa__cabeza') : null;
    this.estelas = cometa ? [...cometa.querySelectorAll('.cometa__estela')] : [];
    this.estaciones = estaciones;
    this.quieto = quieto;
    this.esEscritorio = esEscritorio;
    this.largo = 0;
    this.largoActual = 0;   // dónde va el cometa, en largo del trazo
    this.xNodos = [];
    this.largoNodos = [];
    this.xAnterior = -1;
    this.corriendo = false; // la sección está a la vista y hay cuadros
    this.enfoque = false;   // el cometa dejó su loop para ir a una estación
    this.medir();
  }

  medir() {
    if (!this.grupo || !this.esEscritorio()) return;
    this.largo = this.trazo.getTotalLength();
    const caja = this.svg.getBoundingClientRect();
    if (!caja.width) return;
    // el nodo es HTML y el trazo es SVG: hay que pasar su centro a coordenadas del viewBox
    this.xNodos = this.estaciones.map((li) => {
      const nodo = li.querySelector('.estacion__nodo').getBoundingClientRect();
      return ((nodo.left + nodo.width / 2) - caja.left) / caja.width * 1200;
    });
    this.largoNodos = this.xNodos.map((x) => this.largoEnX(x));
  }

  /** El largo del trazo en el que se llega a la x dada (el trazo avanza siempre a la derecha). */
  largoEnX(x) {
    let bajo = 0;
    let alto = this.largo;
    for (let k = 0; k < 24; k++) {
      const medio = (bajo + alto) / 2;
      if (this.trazo.getPointAtLength(medio).x < x) bajo = medio;
      else alto = medio;
    }
    return (bajo + alto) / 2;
  }

  revisar(visible) {
    const debe = visible && !document.hidden && !this.quieto.matches && this.esEscritorio() && !!this.grupo;
    if (debe && !this.corriendo) {
      if (!this.largo) this.medir();
      this.corriendo = true;
      this.grupo.classList.remove('cometa--apagado');
      if (!this.enfoque) this.arrancarLoop();
    } else if (!debe && this.corriendo) {
      this.corriendo = false;
      cancelAnimationFrame(this.cuadro);
      if (this.grupo) this.grupo.classList.add('cometa--apagado');
    } else if (!debe && this.grupo && (this.quieto.matches || !this.esEscritorio())) {
      this.grupo.classList.add('cometa--apagado');
    }
  }

  /** Arranca (o retoma) el loop desde donde está el cometa, no desde el principio. */
  arrancarLoop() {
    cancelAnimationFrame(this.cuadro);
    this.inicio = performance.now() - (this.largoActual / (this.largo || 1)) * DURACION;
    this.xAnterior = this.largo ? this.trazo.getPointAtLength(this.largoActual).x : -1;
    this.cuadro = requestAnimationFrame((t) => this.tic(t));
  }

  tic(ahora) {
    if (!this.corriendo || this.enfoque || !this.largo) return;
    const avance = ((ahora - this.inicio) % DURACION) / DURACION;
    this.largoActual = avance * this.largo;
    const punto = this.posicionar(this.largoActual);

    // al pasar por el centro de un nodo, el nodo y su tarjeta se encienden
    this.xNodos.forEach((x, i) => {
      if (this.xAnterior < x && punto.x >= x) this.encender(this.estaciones[i]);
    });
    this.xAnterior = punto.x;

    this.cuadro = requestAnimationFrame((t) => this.tic(t));
  }

  /** Pone la cabeza en el largo dado y la estela detrás, según hacia dónde va. */
  posicionar(largo, direccion = 1) {
    const punto = this.trazo.getPointAtLength(largo);
    if (this.cabeza) {
      this.cabeza.setAttribute('cx', punto.x);
      this.cabeza.setAttribute('cy', punto.y);
    }
    this.estelas.forEach((circulo, i) => {
      const atras = largo - direccion * (i + 1) * ESTELA * this.largo;
      if (atras < 0 || atras > this.largo) {
        circulo.setAttribute('opacity', 0);
        return;
      }
      const p = this.trazo.getPointAtLength(atras);
      circulo.setAttribute('cx', p.x);
      circulo.setAttribute('cy', p.y);
      circulo.setAttribute('r', 4 - i * 0.6);
      circulo.setAttribute('opacity', 0.45 * (1 - i / this.estelas.length));
    });
    return punto;
  }

  /** Deja el loop y recorre el trazo hasta el nodo i (800ms, ease-in-out). */
  viajarA(i) {
    if (!this.grupo || !this.esEscritorio()) return Promise.resolve();
    if (!this.largoNodos.length) this.medir();
    const hasta = this.largoNodos[i];
    if (hasta === undefined) return Promise.resolve();

    if (this.terminarViaje) this.terminarViaje(); // un viaje anterior queda sin efecto
    this.enfoque = true;
    cancelAnimationFrame(this.cuadro);

    const desde = this.largoActual;
    const direccion = Math.sign(hasta - desde) || 1;

    // con movimiento reducido (o sin cuadros) salta al nodo, sin recorrido
    if (this.quieto.matches || !this.corriendo) {
      this.largoActual = hasta;
      this.posicionar(hasta, direccion);
      this.tramo(hasta);
      return Promise.resolve();
    }

    return new Promise((resolver) => {
      this.terminarViaje = () => { this.terminarViaje = null; resolver(); };
      const t0 = performance.now();
      const paso = (t) => {
        if (!this.enfoque) return this.terminarViaje && this.terminarViaje();
        const p = Math.min((t - t0) / VIAJE, 1);
        const e = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2; // ease-in-out
        this.largoActual = desde + (hasta - desde) * e;
        this.posicionar(this.largoActual, direccion);
        this.tramo(this.largoActual);
        if (p < 1) this.cuadro = requestAnimationFrame(paso);
        else if (this.terminarViaje) this.terminarViaje();
      };
      this.cuadro = requestAnimationFrame(paso);
    });
  }

  /** Sale del enfoque: el tramo sólido se va y el loop sigue desde aquí. */
  retomar() {
    if (!this.enfoque) return;
    this.enfoque = false;
    if (this.terminarViaje) this.terminarViaje();
    this.ocultarTramo();
    if (this.corriendo) this.arrancarLoop();
  }

  /** Línea sólida desde el inicio del trazo hasta el largo dado. */
  tramo(largo) {
    if (!this.solida) return;
    this.solida.style.strokeDasharray = `${largo} ${this.largo}`;
    this.solida.style.strokeDashoffset = '0';
    this.solida.classList.add('ruta__linea-solida--tramo');
  }

  ocultarTramo() {
    if (this.solida) this.solida.classList.remove('ruta__linea-solida--tramo');
  }

  encender(estacion) {
    const nodo = estacion.querySelector('.estacion__nodo');
    nodo.classList.remove('estacion__nodo--llega');
    void nodo.offsetWidth;
    nodo.classList.add('estacion__nodo--llega');
    estacion.classList.add('estacion--encendida');
    clearTimeout(estacion._apagar);
    estacion._apagar = setTimeout(() => {
      estacion.classList.remove('estacion--encendida');
      nodo.classList.remove('estacion__nodo--llega');
    }, 1200);
  }
}

/* --------------------------------------------------------------
   Riel (móvil): el relleno avanza con el scroll
   -------------------------------------------------------------- */
class Riel {
  constructor({ estaciones, quieto, esEscritorio }) {
    this.estaciones = estaciones;
    this.quieto = quieto;
    this.esEscritorio = esEscritorio;
    this.medidas = [];
    this.escuchando = false;
    this.enfoque = null; // índice de la estación enfocada, o null
    this.alScroll = () => this.pintar();
    this.medir();
  }

  medir() {
    if (this.esEscritorio()) { this.medidas = []; return; }
    const y = window.scrollY;
    this.medidas = this.estaciones.map((li) => {
      const riel = li.querySelector('.estacion__riel');
      const nodo = li.querySelector('.estacion__nodo');
      const cajaRiel = riel ? riel.getBoundingClientRect() : null;
      const cajaNodo = nodo.getBoundingClientRect();
      return {
        li,
        relleno: li.querySelector('.estacion__relleno'),
        rielTop: cajaRiel ? cajaRiel.top + y : 0,
        rielAlto: cajaRiel ? cajaRiel.height : 0,
        nodoY: cajaNodo.top + y + cajaNodo.height / 2,
      };
    });
  }

  revisar(visible) {
    const debe = visible && !document.hidden && !this.esEscritorio();
    if (debe && !this.escuchando) {
      this.escuchando = true;
      if (!this.medidas.length) this.medir();
      window.addEventListener('scroll', this.alScroll, { passive: true });
      this.pintar();
    } else if (!debe && this.escuchando) {
      this.escuchando = false;
      window.removeEventListener('scroll', this.alScroll);
    }
  }

  pintar() {
    if (this.enfoque !== null) return; // en modo enfoque manda la estación elegida
    const frente = window.scrollY + window.innerHeight * FRENTE;
    for (const m of this.medidas) {
      if (m.relleno && m.rielAlto) {
        const avance = Math.min(Math.max((frente - m.rielTop) / m.rielAlto, 0), 1);
        m.relleno.style.height = `${(avance * 100).toFixed(1)}%`;
      }
      const alcanzada = frente >= m.nodoY;
      if (alcanzada === m.li.classList.contains('estacion--alcanzada')) continue;
      m.li.classList.toggle('estacion--alcanzada', alcanzada);
      if (!alcanzada || this.quieto.matches) continue;
      const nodo = m.li.querySelector('.estacion__nodo');
      nodo.classList.add('estacion__nodo--llega');
      setTimeout(() => nodo.classList.remove('estacion__nodo--llega'), 700);
    }
  }

  /** El relleno avanza hasta la estación i; la promesa se cumple al llegar. */
  enfocar(i) {
    this.enfoque = i;
    this.estaciones.forEach((li, j) => {
      const relleno = li.querySelector('.estacion__relleno');
      if (relleno) relleno.style.height = j < i ? '100%' : '0%';
      li.classList.toggle('estacion--alcanzada', j <= i);
    });
    const espera = this.quieto.matches ? 0 : RELLENO;
    return new Promise((resolver) => setTimeout(resolver, espera));
  }

  /** Vuelve al relleno por scroll (las tarjetas pudieron cambiar de alto). */
  soltar() {
    if (this.enfoque === null) return;
    this.enfoque = null;
    this.medir();
    if (this.escuchando) this.pintar();
  }
}
