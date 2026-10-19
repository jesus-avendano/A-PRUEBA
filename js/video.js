/* Videos de fondo, sin audio y en bucle: el campus en el hero, el auditorio
   en Entradas y las partículas en la ruta. Cada <video data-fondo> trae sus
   fuentes en atributos: en celular (<768px) data-movil-webm o data-movil, y
   si no data-webm o data-escritorio. El WebM (VP9, más liviano) se usa si
   existe y el navegador lo lee; si no, el MP4 (H.264), que lee cualquiera.
   La ruta no tiene WebM: su MP4 pesa menos (ver CAMBIOS-PORTAL-FONDO).
   - data-carga="al-cargar" (hero): el src se asigna cuando la página terminó
     de cargar, para no competir con lo que se ve primero. Sin ese atributo
     (Entradas y la ruta), cuando la sección está a 300px de la pantalla.
   - Fuera de pantalla o con la pestaña oculta se pausan; al volver siguen.
   - Con movimiento reducido o ahorro de datos no se cargan: queda el poster.
   - No tienen botón de pausa (ver CLAUDE.md). */

const videos = [];

export function iniciarVideos() {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ahorro = navigator.connection && navigator.connection.saveData === true;
  if (reducido || ahorro || !('IntersectionObserver' in window)) return; // solo los posters

  document.querySelectorAll('video[data-fondo]').forEach((video) => videos.push(new VideoDeFondo(video)));
  document.addEventListener('visibilitychange', () => videos.forEach((v) => v.actualizar()));
}

class VideoDeFondo {
  constructor(video) {
    this.video = video;
    this.cargado = false;
    this.enPantalla = false;
    const seccion = video.parentElement;

    if (video.dataset.carga === 'al-cargar') {
      if (document.readyState === 'complete') this.cargar();
      else window.addEventListener('load', () => this.cargar(), { once: true });
    } else {
      new IntersectionObserver((entradas, obs) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        this.cargar();
      }, { rootMargin: '300px 0px' }).observe(seccion);
    }

    new IntersectionObserver((entradas) => {
      this.enPantalla = entradas.some((e) => e.isIntersecting);
      this.actualizar();
    }).observe(seccion);
  }

  fuente() {
    const { movilWebm, movil, webm, escritorio } = this.video.dataset;
    const vp9 = this.video.canPlayType('video/webm; codecs="vp9"') !== '';
    if (movil && window.matchMedia('(max-width: 767px)').matches) return movilWebm && vp9 ? movilWebm : movil;
    return webm && vp9 ? webm : escritorio;
  }

  cargar() {
    this.video.preload = 'auto';
    this.video.src = this.fuente();
    this.cargado = true;
    this.actualizar();
  }

  actualizar() {
    const { video } = this;
    if (!this.cargado) return;
    const reproducir = this.enPantalla && !document.hidden;
    if (reproducir && video.paused) {
      // sin permiso para reproducir solo (iOS en ahorro de energía) queda el poster
      const promesa = video.play();
      if (promesa) promesa.catch(() => {});
    } else if (!reproducir && !video.paused) {
      video.pause();
    }
  }
}
