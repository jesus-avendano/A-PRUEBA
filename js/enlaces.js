/* Enlaces que dependen de CONFIG.
   Con URL son <a href> (en pestaña nueva). Sin URL son un <span role="link">
   deshabilitado: nunca un enlace roto, y nunca un <a> sin href, que los
   buscadores marcan como no rastreable y que no admite aria-label. */

/**
 * Deja `el` como enlace a `url` o como enlace deshabilitado si no hay URL.
 * Puede reemplazar el elemento: usa siempre el que devuelve.
 */
export function enlazar(el, url) {
  const destino = url ? cambiarEtiqueta(el, 'a') : cambiarEtiqueta(el, 'span');
  if (url) {
    destino.href = url;
    destino.target = '_blank';
    destino.rel = 'noopener';
    destino.removeAttribute('role');
    destino.removeAttribute('aria-disabled');
  } else {
    destino.setAttribute('role', 'link');
    destino.setAttribute('aria-disabled', 'true');
  }
  return destino;
}

function cambiarEtiqueta(el, etiqueta) {
  if (el.tagName.toLowerCase() === etiqueta) return el;
  const nuevo = document.createElement(etiqueta);
  for (const { name, value } of [...el.attributes]) {
    if (etiqueta === 'span' && ['href', 'target', 'rel'].includes(name)) continue;
    nuevo.setAttribute(name, value);
  }
  nuevo.append(...el.childNodes);
  el.replaceWith(nuevo);
  return nuevo;
}
