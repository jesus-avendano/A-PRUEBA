/* Pestañas Presencial/Virtual de Ubicación (patrón ARIA tabs). */

export function iniciarPestanas() {
  document.querySelectorAll('[role="tablist"]').forEach(prepararLista);
}

function prepararLista(lista) {
  const pestanas = [...lista.querySelectorAll('[role="tab"]')];
  if (!pestanas.length) return;

  const paneles = pestanas.map((t) => document.getElementById(t.getAttribute('aria-controls')));

  function activar(indice, moverFoco = true) {
    pestanas.forEach((pestana, i) => {
      const activa = i === indice;
      pestana.setAttribute('aria-selected', String(activa));
      pestana.tabIndex = activa ? 0 : -1;
      pestana.classList.toggle('pestana--activa', activa);
      if (paneles[i]) paneles[i].hidden = !activa;
    });
    if (moverFoco) pestanas[indice].focus();
  }

  pestanas.forEach((pestana, i) => {
    pestana.addEventListener('click', () => activar(i, false));
    pestana.addEventListener('keydown', (e) => {
      const ultimo = pestanas.length - 1;
      let destino = null;
      if (e.key === 'ArrowRight') destino = i === ultimo ? 0 : i + 1;
      else if (e.key === 'ArrowLeft') destino = i === 0 ? ultimo : i - 1;
      else if (e.key === 'Home') destino = 0;
      else if (e.key === 'End') destino = ultimo;
      if (destino === null) return;
      e.preventDefault();
      activar(destino);
    });
  });
}
