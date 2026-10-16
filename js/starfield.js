/* Cielo de estrellas en <canvas>, detrás del hero y de la ruta.
   Se pausa cuando no está en pantalla o la pestaña está oculta.
   Con movimiento reducido se dibuja una sola vez, quieto. */

const MAX_ESCRITORIO = 140;
const MAX_MOVIL = 60;
const AREA_POR_ESTRELLA = 9000;
const CAPAS = [
  { velocidad: 0.35, radio: [0.6, 1.1] },
  { velocidad: 0.65, radio: [0.9, 1.5] },
  { velocidad: 1.0,  radio: [1.2, 2.0] },
];

export function iniciarCielo(selector = '.cielo') {
  const lienzos = [...document.querySelectorAll(selector)];
  return lienzos.map((lienzo) => new Cielo(lienzo)).filter(Boolean);
}

class Cielo {
  constructor(lienzo) {
    this.lienzo = lienzo;
    this.ctx = lienzo.getContext('2d', { alpha: true });
    if (!this.ctx) return;

    this.estrellas = [];
    this.visible = false;
    this.animando = false;
    this.ultimo = 0;
    this.quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.medir();

    if ('ResizeObserver' in window) {
      this.ro = new ResizeObserver(() => this.medir());
      this.ro.observe(lienzo);
    } else {
      window.addEventListener('resize', () => this.medir(), { passive: true });
    }

    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver((entradas) => {
        this.visible = entradas.some((e) => e.isIntersecting);
        this.revisar();
      }, { threshold: 0 });
      this.io.observe(lienzo);
    } else {
      this.visible = true;
    }

    document.addEventListener('visibilitychange', () => this.revisar());
    this.quieto.addEventListener('change', () => {
      this.revisar();
      if (this.quieto.matches) this.dibujar();
    });

    this.revisar();
  }

  medir() {
    const { clientWidth: ancho, clientHeight: alto } = this.lienzo;
    if (!ancho || !alto) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.lienzo.width = Math.round(ancho * dpr);
    this.lienzo.height = Math.round(alto * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ancho = ancho;
    this.alto = alto;

    const tope = window.innerWidth < 768 ? MAX_MOVIL : MAX_ESCRITORIO;
    const cuantas = Math.min(Math.round((ancho * alto) / AREA_POR_ESTRELLA), tope);
    this.sembrar(cuantas);
    this.dibujar();
  }

  sembrar(cuantas) {
    const antes = this.estrellas.length;
    if (cuantas < antes) {
      this.estrellas.length = cuantas;
      return;
    }
    for (let i = antes; i < cuantas; i++) {
      const capa = CAPAS[i % CAPAS.length];
      const [rMin, rMax] = capa.radio;
      this.estrellas.push({
        x: Math.random() * this.ancho,
        y: Math.random() * this.alto,
        r: rMin + Math.random() * (rMax - rMin),
        capa,
        // cada estrella titila con su propia fase y período (2–5s)
        fase: Math.random() * Math.PI * 2,
        periodo: 2 + Math.random() * 3,
      });
    }
  }

  revisar() {
    const debe = this.visible && !document.hidden && !this.quieto.matches;
    if (debe && !this.animando) {
      this.animando = true;
      this.ultimo = performance.now();
      this.cuadro = requestAnimationFrame((t) => this.tic(t));
    } else if (!debe && this.animando) {
      this.animando = false;
      cancelAnimationFrame(this.cuadro);
    }
  }

  tic(ahora) {
    if (!this.animando) return;
    const dt = Math.min((ahora - this.ultimo) / 1000, 0.05); // sin saltos al volver
    this.ultimo = ahora;

    for (const e of this.estrellas) {
      // deriva lenta a la izquierda y un poco hacia arriba
      e.x -= (4 + e.capa.velocidad * 8) * dt;
      e.y -= e.capa.velocidad * 1.5 * dt;
      if (e.x < -2) { e.x = this.ancho + 2; e.y = Math.random() * this.alto; }
      if (e.y < -2) { e.y = this.alto + 2; }
    }

    this.dibujar(ahora / 1000);
    this.cuadro = requestAnimationFrame((t) => this.tic(t));
  }

  dibujar(tiempo = 0) {
    const { ctx } = this;
    if (!ctx || !this.ancho) return;
    ctx.clearRect(0, 0, this.ancho, this.alto);
    ctx.fillStyle = '#FFFFFF';
    for (const e of this.estrellas) {
      const brillo = this.quieto.matches
        ? 0.55
        : 0.25 + 0.3 * (1 + Math.sin(e.fase + (tiempo * Math.PI * 2) / e.periodo));
      ctx.globalAlpha = Math.min(Math.max(brillo, 0.25), 0.85);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
