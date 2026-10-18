/* Video del auditorio de fondo en Entradas (docs/CAMBIOS-VIDEO-AGENDA.md §1).
   - El src se asigna recién cuando la sección está a 300px de la pantalla.
   - Fuera de pantalla (o con la pestaña oculta) se pausa; al volver sigue.
   - Con movimiento reducido o ahorro de datos no se carga: queda el poster.
   - El botón de pausa es obligatorio: un bucle de más de 5 s tiene que poder detenerse.
   suspenderVideo() lo detiene mientras otra vista lo tapa (la agenda). */

const FUENTE_MOVIL = 'assets/video/auditorio-movil.mp4';
const FUENTE_WEBM = 'assets/video/auditorio.webm';
const FUENTE_MP4 = 'assets/video/auditorio.mp4';

const estado = {
  video: null,
  boton: null,
  cargado: false,
  enPantalla: false,
  pausadoPorUsuario: false,
  suspendido: false,
};

export function iniciarVideo() {
  const seccion = document.getElementById('entradas');
  const video = seccion && seccion.querySelector('.entradas__video');
  if (!video) return;
  estado.video = video;
  estado.boton = seccion.querySelector('.entradas__pausa');

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ahorro = navigator.connection && navigator.connection.saveData === true;
  if (reducido || ahorro || !('IntersectionObserver' in window)) return; // solo el poster

  new IntersectionObserver((entradas, obs) => {
    if (!entradas.some((e) => e.isIntersecting)) return;
    obs.disconnect();
    cargar();
  }, { rootMargin: '300px 0px' }).observe(seccion);

  new IntersectionObserver((entradas) => {
    estado.enPantalla = entradas.some((e) => e.isIntersecting);
    actualizar();
  }).observe(seccion);

  document.addEventListener('visibilitychange', actualizar);

  if (estado.boton) {
    estado.boton.addEventListener('click', () => {
      estado.pausadoPorUsuario = !estado.pausadoPorUsuario;
      actualizar();
    });
  }
}

/** Detiene el video mientras otra vista lo tapa, y lo retoma al terminar. */
export function suspenderVideo(suspender) {
  estado.suspendido = suspender;
  actualizar();
}

function fuente(video) {
  if (window.matchMedia('(max-width: 767px)').matches) return FUENTE_MOVIL;
  return video.canPlayType('video/webm; codecs="vp9"') ? FUENTE_WEBM : FUENTE_MP4;
}

function cargar() {
  const { video, boton } = estado;
  video.preload = 'auto';
  video.src = fuente(video);
  estado.cargado = true;
  if (boton) boton.hidden = false;
  actualizar();
}

function actualizar() {
  const { video } = estado;
  if (!video || !estado.cargado) return;
  const reproducir = estado.enPantalla && !document.hidden && !estado.pausadoPorUsuario && !estado.suspendido;
  if (reproducir && video.paused) {
    const promesa = video.play();
    // sin permiso para reproducir solo (iOS en ahorro de energía): queda el poster
    // y el botón ofrece reproducir, que con el toque del usuario sí funciona
    if (promesa) {
      promesa.catch((e) => {
        if (e && e.name === 'NotAllowedError') {
          estado.pausadoPorUsuario = true;
          pintarBoton();
        }
      });
    }
  } else if (!reproducir && !video.paused) {
    video.pause();
  }
  pintarBoton();
}

function pintarBoton() {
  const { boton } = estado;
  if (!boton) return;
  const pausado = estado.pausadoPorUsuario;
  boton.setAttribute('aria-label', pausado ? 'Reproducir video de fondo' : 'Pausar video de fondo');
  boton.querySelector('.entradas__icono-pausa').hidden = pausado;
  boton.querySelector('.entradas__icono-play').hidden = !pausado;
}
