/* La ruta animada.
   Escritorio: un cometa recorre el trazo y enciende cada nodo al pasar.
   Móvil: el riel se rellena con el scroll y enciende los nodos.
   Ambos modos se apagan con prefers-reduced-motion. */

const DURACION = 8000;   // lo que tarda el cometa en recorrer el trazo
const ESTELA = 0.012;    // separación entre los puntos de la estela
const FRENTE = 0.55;     // altura de pantalla que marca el avance en móvil

export function iniciarRuta() {
  const mapa = document.querySelector('.ruta__mapa');
  if (!mapa) return;

  const svg = mapa.querySelector('.ruta__trazo');
  const trazo = mapa.querySelector('.ruta__linea');
  const solida = mapa.querySelector('.ruta__linea-solida');
  const cometa = mapa.querySelector('.cometa');
  const estaciones = [...mapa.querySelectorAll('.estacion')];
  if (!svg || !trazo || !estaciones.length) return;

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
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      arrancar();
      io.disconnect();
    });
  }, { threshold: 0.2 });
  io.observe(mapa);
}

/* --------------------------------------------------------------
   Cometa (escritorio)
   -------------------------------------------------------------- */
class Cometa {
  constructor({ svg, trazo, cometa, estaciones, quieto, esEscritorio }) {
    this.svg = svg;
    this.trazo = trazo;
    this.grupo = cometa;
    this.cabeza = cometa ? cometa.querySelector('.cometa__cabeza') : null;
    this.estelas = cometa ? [...cometa.querySelectorAll('.cometa__estela')] : [];
    this.estaciones = estaciones;
    this.quieto = quieto;
    this.esEscritorio = esEscritorio;
    this.largo = 0;
    this.xNodos = [];
    this.xAnterior = -1;
    this.corriendo = false;
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
  }

  revisar(visible) {
    const debe = visible && !document.hidden && !this.quieto.matches && this.esEscritorio() && !!this.grupo;
    if (debe && !this.corriendo) {
      if (!this.largo) this.medir();
      this.corriendo = true;
      this.inicio = performance.now();
      this.grupo.classList.remove('cometa--apagado');
      this.cuadro = requestAnimationFrame((t) => this.tic(t));
    } else if (!debe && this.corriendo) {
      this.corriendo = false;
      cancelAnimationFrame(this.cuadro);
      if (this.grupo) this.grupo.classList.add('cometa--apagado');
    } else if (!debe && this.grupo && (this.quieto.matches || !this.esEscritorio())) {
      this.grupo.classList.add('cometa--apagado');
    }
  }

  tic(ahora) {
    if (!this.corriendo || !this.largo) return;
    const avance = ((ahora - this.inicio) % DURACION) / DURACION;
    const punto = this.trazo.getPointAtLength(avance * this.largo);

    if (this.cabeza) {
      this.cabeza.setAttribute('cx', punto.x);
      this.cabeza.setAttribute('cy', punto.y);
    }
    this.estelas.forEach((circulo, i) => {
      const atras = avance - (i + 1) * ESTELA;
      if (atras < 0) {
        circulo.setAttribute('opacity', 0);
        return;
      }
      const p = this.trazo.getPointAtLength(atras * this.largo);
      circulo.setAttribute('cx', p.x);
      circulo.setAttribute('cy', p.y);
      circulo.setAttribute('r', 4 - i * 0.6);
      circulo.setAttribute('opacity', 0.45 * (1 - i / this.estelas.length));
    });

    // al pasar por el centro de un nodo, el nodo y su tarjeta se encienden
    this.xNodos.forEach((x, i) => {
      if (this.xAnterior < x && punto.x >= x) this.encender(this.estaciones[i]);
    });
    this.xAnterior = punto.x;

    this.cuadro = requestAnimationFrame((t) => this.tic(t));
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
}
