/* Hero: el título entra palabra por palabra y "futuro profesional" tiene
   una ola y un brillo constantes (docs/CAMBIOS-RUTA-HERO.md §3).
   - Las palabras son inline-block: nunca se parten entre líneas.
   - El texto completo queda en un span oculto para lectores de pantalla;
     las piezas animadas van con aria-hidden.
   - Con movimiento reducido no se divide nada: el título queda quieto,
     con el color plano. */

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
  let letras = 0;
  const agregar = (texto, resalte) => {
    const palabra = document.createElement('span');
    palabra.className = resalte ? 'hero__palabra hero__palabra--resalte' : 'hero__palabra';
    palabra.style.setProperty('--i', palabras++);
    if (resalte) {
      for (const caracter of texto) {
        const letra = document.createElement('span');
        letra.className = 'hero__letra';
        letra.textContent = caracter;
        letra.style.setProperty('--l', letras++);
        palabra.append(letra);
      }
    } else {
      palabra.textContent = texto;
    }
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

  medirBrillo(piezas);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => medirBrillo(piezas));
}

/* El degradado del brillo debe verse continuo a lo largo de todas las letras,
   aunque cada letra lo pinte por separado. Se mide dónde empieza cada una,
   en em, para que siga valiendo cuando el título cambia de tamaño. */
function medirBrillo(piezas) {
  const letras = [...piezas.querySelectorAll('.hero__palabra--resalte .hero__letra')];
  if (!letras.length) return;
  const tamano = parseFloat(getComputedStyle(piezas).fontSize) || 16;
  let x = 0;
  letras.forEach((letra) => {
    letra.style.setProperty('--x', `${(x / tamano).toFixed(3)}em`);
    x += letra.offsetWidth;
  });
  piezas.style.setProperty('--ancho-brillo', `${(x / tamano).toFixed(3)}em`);
}
