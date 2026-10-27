/* Burbuja flotante del chatbot.

   - Aparece cuando el hero sale de la pantalla (no compite con "¡Regístrate gratis!") y se va
     si se vuelve a él, salvo con el chat abierto.
   - Al llegar al pie, una sola vez por visita, el globito "¿Tienes dudas? Pregúntame".
   - El panel y las respuestas (js/chatbot-panel.js y js/chatbot-respuestas.js) se importan
     recién al tocar la burbuja: la primera carga no suma nada. */

const CLAVE_GLOBITO = 'aprueba-chatbot-globito';

export function iniciarChatbot() {
  const raiz = document.querySelector('[data-chatbot]');
  const dialogo = document.getElementById('chatbot-panel');
  const hero = document.getElementById('inicio');
  const pie = document.getElementById('contacto');
  if (!raiz || !dialogo || !('IntersectionObserver' in window)) return;

  const burbuja = raiz.querySelector('.chatbot__burbuja');
  const globito = raiz.querySelector('.chatbot__globito');
  let panel = null; // el módulo del panel, una vez importado
  let heroVisible = true;

  raiz.hidden = false;
  const actualizar = () => {
    raiz.classList.toggle('chatbot--fuera', heroVisible && !dialogo.open);
  };
  actualizar();

  new IntersectionObserver(([entrada]) => {
    heroVisible = entrada.isIntersecting;
    actualizar();
  }).observe(hero);

  /* --- globito: al llegar al pie, una vez por visita --- */
  const globitoVisto = () => {
    try { return sessionStorage.getItem(CLAVE_GLOBITO) === '1'; } catch { return false; }
  };
  const ocultarGlobito = () => {
    globito.hidden = true;
    try { sessionStorage.setItem(CLAVE_GLOBITO, '1'); } catch { /* sin almacenamiento: vale para esta página */ }
  };
  if (pie && !globitoVisto()) {
    const alPie = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return;
      alPie.disconnect();
      if (!dialogo.open) globito.hidden = false;
    });
    alPie.observe(pie);
  }
  globito.querySelector('.chatbot__globito-cerrar').addEventListener('click', () => {
    ocultarGlobito();
    burbuja.focus();
  });

  /* --- abrir y cerrar --- */
  async function abrir() {
    ocultarGlobito();
    panel ??= await import('./chatbot-panel.js');
    panel.abrirPanel(dialogo, burbuja);
    burbuja.setAttribute('aria-expanded', 'true');
    burbuja.setAttribute('aria-label', 'Cerrar el asistente de A+PRUEBA');
    actualizar();
  }

  dialogo.addEventListener('close', () => {
    burbuja.setAttribute('aria-expanded', 'false');
    burbuja.setAttribute('aria-label', 'Abrir el asistente de A+PRUEBA');
    actualizar();
  });

  burbuja.addEventListener('click', () => {
    if (dialogo.open) panel.cerrarPanel(dialogo);
    else abrir();
  });
  globito.querySelector('.chatbot__globito-texto').addEventListener('click', abrir);
}
