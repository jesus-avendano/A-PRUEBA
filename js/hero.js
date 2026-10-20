/* Hero: el título entra palabra por palabra (docs/CAMBIOS-RUTA-HERO.md §3).
   "futuro profesional" queda en celeste fijo: la ola y el brillo de colores
   se quitaron (18 oct).
   - Las palabras son inline-block: nunca se parten entre líneas.
   - El texto completo queda en un span oculto para lectores de pantalla;
     las piezas animadas van con aria-hidden.
   - Con movimiento reducido no se divide nada: el título queda quieto. */

const PASO_PALABRA = 60;   // ms entre palabras al entrar
const ESPERA_SUB = 200;    // ms entre el título y el subtítulo

export function iniciarHero() {
  const frase = document.querySelector('.hero__frase');
  const hero = document.getElementById('inicio');
  if (!frase || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const oculto = document.createElement('span');
  oculto.className = 'sr-only';
  oculto.textContent = frase.textContent.replace(/\s+/g, ' ').trim();

  const piezas = document.createElement('span');
  piezas.className = 'hero__palabras';
  piezas.setAttribute('aria-hidden', 'true');

  let palabras = 0;
  const agregar = (texto, resalte) => {
    const palabra = document.createElement('span');
    palabra.className = resalte ? 'hero__palabra hero__palabra--resalte' : 'hero__palabra';
    palabra.style.setProperty('--i', palabras++);
    palabra.textContent = texto;
    if (piezas.childNodes.length) piezas.append(' ');
    piezas.append(palabra);
  };

  // el resaltado viene marcado en el HTML con .resalte-celeste
  frase.childNodes.forEach((nodo) => {
    const resalte = nodo.nodeType === Node.ELEMENT_NODE && nodo.classList.contains('resalte-celeste');
    nodo.textContent.split(/\s+/).filter(Boolean).forEach((texto) => agregar(texto, resalte));
  });

  frase.replaceChildren(oculto, piezas);
  hero.style.setProperty('--retraso-sub', `${palabras * PASO_PALABRA + ESPERA_SUB}ms`);
  hero.classList.add('hero--animado');
}
