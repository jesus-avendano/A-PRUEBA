// Carrusel 3D de fotos (preset "cylinder").
//
// Port a JS puro de CircularCarousel de React Bits (@react-bits/CircularCarousel-JS-CSS). La física,
// la geometría y el render son los del original, línea por línea. Se conservan los nombres de las
// opciones (props) y de las clases CSS del original para poder compararlo y para que los valores del
// configurador de React Bits se peguen tal cual.
//
// Se quitó lo que la ruta no usa: los presets orbit, wheel y panorama; el autoplay "step"; las
// intros "assemble" y "spin"; los captions con contador, y el cambio animado de items.
//
// Cambios respecto al original:
// - Accesibilidad: sin la opción `label` es decorativo (aria-hidden) y no recibe el foco. Con `label`
//   es un grupo enfocable (role="group", aria-roledescription="carrusel"): las flechas giran de a una
//   tarjeta, Enter o Espacio llaman a onItemClick con la de adelante, y una región aria-live anuncia
//   itemLabel(item, i) cuando se gira con el teclado. Con el foco de teclado adentro no gira solo.
// - El bucle no corre hasta que las fotos cargaron, ni con la pestaña oculta, ni fuera de pantalla,
//   ni con suspender(true) (la agenda abierta tapa la página y el IntersectionObserver no se entera).
// - pausar(clave, true/false): pausas externas con nombre (puntero sobre el panel, foco en las
//   pestañas...). Mientras haya alguna, no gira solo, como con pauseOnHover.
// - girar(false) apaga el giro automático (y girar(true) lo vuelve a encender).
// - Con movimiento reducido no hay intro, ni giro solo, ni parallax, ni estirón, y enfocar() salta
//   sin animación.
// - overlay(item, i): HTML opcional que se pinta encima de cada foto (por ejemplo, el número de la
//   estación). Se corta en tiras igual que la foto, así se curva con la tarjeta.
// - startIndex: la tarjeta que arranca adelante.
// - enfocar() devuelve una promesa que se cumple cuando la tarjeta llegó adelante (true), o si el
//   usuario la interrumpe o pasan 1.2 s (false). rectDe(i) da el rectángulo en pantalla de la
//   tarjeta i: sirve para que un diálogo crezca desde ella (FLIP). paso(±1) gira de a una tarjeta.
// - tiles: tiras por tarjeta para curvarla (8 en el original). Menos tiras, menos trabajo en celulares
//   de gama baja; con 4 la curva se ve un poco facetada.
// - Mientras enfocar() viaja a una tarjeta, onChange no avisa las tarjetas por las que pasa: solo la
//   de llegada.
//
// Uso:
//   const carrusel = crearCarrusel(contenedor, {
//     items: [{ src }], cardWidth: 266, label: 'Las 4 estaciones', itemLabel: (item, i) => '…',
//     onItemClick: async (item, i) => { await carrusel.enfocar(i); abrirDesde(carrusel.rectDe(i)); },
//   });
//   carrusel.girar(false);    carrusel.pausar('panel', true);    carrusel.suspender(true);
//   carrusel.destruir();

const PRESET = { tilt: -5, perspective: 2500, curve: 1, spread: 1 }; // "cylinder" del original

const INTRO_LENGTH = { rise: 1400, none: 0 };
const OVERLAP = 2.5;
const DRAG_THRESHOLD = 5;
const SPRING = 118;
const SETTLE_SPEED = 9;
const HOLD = 2800;
const TO_RAD = Math.PI / 180;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrap = degrees => ((((degrees + 180) % 360) + 360) % 360) - 180;
const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

const rotateX = (p, degrees) => {
  const r = degrees * TO_RAD;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
};

const rotateY = (p, degrees) => {
  const r = degrees * TO_RAD;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
};

const DEFAULTS = {
  items: [],
  intro: 'rise',
  cardWidth: 220,
  aspectRatio: 1,
  gap: 25,
  curve: PRESET.curve,
  tilt: PRESET.tilt,
  perspective: PRESET.perspective,
  autoplay: 'drift',
  speed: 14,
  direction: 'left',
  draggable: true,
  momentum: 0.6,
  snap: true,
  pauseOnHover: true,
  focusOnClick: true,
  parallax: 0.3,
  stretch: 0.5,
  depthFade: 0.55,
  fadeColor: '#000000',
  innerShade: 0.6,
  cornerRadius: 12,
  overlay: null,
  label: '',
  hint: '',
  itemLabel: null,
  startIndex: 0,
  tiles: 8,
  onChange: null,
  onItemClick: null,
};

const crear = (tag, clase, padre) => {
  const el = document.createElement(tag);
  if (clase) el.className = clase;
  if (padre) padre.appendChild(el);
  return el;
};

export function crearCarrusel(root, opciones = {}) {
  const o = { ...DEFAULTS, ...opciones };
  const items = o.items;
  const count = items.length;
  if (!root || !count) return null;

  const consulta = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reduced = Boolean(consulta?.matches);

  // Geometría (igual que el original para axis "y", sin inward ni billboard)
  const cardW = Math.max(40, o.cardWidth);
  const cardH = cardW / clamp(o.aspectRatio, 0.2, 5);
  const along = cardW;
  const step = 360 / count;
  const curveValue = clamp(o.curve, 0, 1);
  const tilt = o.tilt;
  const perspective = o.perspective;

  const radius = (() => {
    const n = Math.max(count, 3);
    const pitch = (along + o.gap) * PRESET.spread;
    const chord = pitch / (2 * Math.sin(Math.PI / n));
    const arc = (n * pitch) / (2 * Math.PI);
    return Math.max(chord + (arc - chord) * curveValue, along * 0.6);
  })();

  const tiles = (() => {
    const total = curveValue > 0.001 ? Math.max(1, Math.round(o.tiles)) : 1;
    const length = along / total;
    const bend = curveValue > 0.001 ? radius / curveValue : 0;
    return Array.from({ length: total }, (_, index) => {
      const start = index * length - (index > 0 ? OVERLAP / 2 : 0);
      const end = (index + 1) * length + (index < total - 1 ? OVERLAP / 2 : 0);
      const center = (start + end) / 2 - along / 2;
      const alpha = bend ? center / bend : 0;
      const shift = bend ? bend * Math.sin(alpha) : center;
      const sink = bend ? bend * (1 - Math.cos(alpha)) : 0;
      const turn = (alpha * 180) / Math.PI;
      const move = `translate3d(${shift}px, 0px, ${-sink}px) rotateY(${turn}deg)`;
      return { index, total, start, end, size: end - start, move };
    });
  })();

  // DOM
  root.classList.add('circular-carousel');
  root.dataset.axis = 'y';
  root.dataset.shape = 'cylinder';
  if (o.draggable) root.dataset.draggable = '';
  root.style.setProperty('--cc-fade', o.fadeColor);
  root.style.setProperty('--cc-radius', `${Math.max(0, o.cornerRadius)}px`);
  root.style.setProperty('--cc-inner', (1 - clamp(o.innerShade, 0, 1)).toFixed(3));
  const view = crear('div', 'circular-carousel__view', root);
  view.setAttribute('aria-hidden', 'true');
  let vivo = null;
  if (o.label) {
    root.setAttribute('role', 'group');
    root.setAttribute('aria-roledescription', 'carrusel');
    root.setAttribute('aria-label', o.label);
    root.tabIndex = 0;
    if (o.hint) {
      const pista = crear('span', 'circular-carousel__live', root);
      pista.id = `cc-pista-${Math.random().toString(36).slice(2, 8)}`;
      pista.textContent = o.hint;
      root.setAttribute('aria-describedby', pista.id);
    }
    vivo = crear('div', 'circular-carousel__live', root);
    vivo.setAttribute('aria-live', 'polite');
    vivo.setAttribute('aria-atomic', 'true');
  } else {
    root.setAttribute('aria-hidden', 'true');
  }
  const stage = crear('div', 'circular-carousel__stage', view);
  const camera = crear('div', 'circular-carousel__camera', stage);
  const ring = crear('div', 'circular-carousel__ring', camera);

  const renderTile = (item, index, tile, back) => {
    const strip = back ? tile.total - 1 - tile.index : tile.index;
    const first = strip === 0;
    const last = strip === tile.total - 1;
    const r = 'var(--cc-radius)';
    const offset = back ? along - tile.end : tile.start;
    const el = crear('div', 'circular-carousel__tile');
    Object.assign(el.style, {
      left: `${-tile.size / 2}px`,
      top: `${-cardH / 2}px`,
      width: `${tile.size}px`,
      height: `${cardH}px`,
      transform: tile.move + (back ? ' rotateY(180deg)' : ''),
    });
    const frame = crear('div', 'circular-carousel__frame', el);
    frame.style.height = `${cardH}px`;
    frame.style.borderRadius = `${first ? r : 0} ${last ? r : 0} ${last ? r : 0} ${first ? r : 0}`;
    const lugar = { left: `${-offset}px`, top: '0px', width: `${cardW}px`, height: `${cardH}px` };
    const img = crear('img', 'circular-carousel__photo', frame);
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    Object.assign(img.style, lugar);
    img.src = item.src;
    if (o.overlay) {
      const capa = crear('div', 'circular-carousel__overlay', frame);
      Object.assign(capa.style, lugar);
      capa.innerHTML = o.overlay(item, index);
    }
    if (back) crear('div', 'circular-carousel__inner', frame);
    crear('div', 'circular-carousel__shade', frame);
    return el;
  };

  const cards = items.map((item, index) => {
    const card = crear('div', 'circular-carousel__card', ring);
    card.dataset.ccIndex = String(index);
    tiles.forEach(tile => card.appendChild(renderTile(item, index, tile, false)));
    tiles.forEach(tile => card.appendChild(renderTile(item, index, tile, true))); // el cilindro muestra el revés
    return card;
  });

  // Estado (el mismo del original)
  const directionSign = o.direction === 'right' ? 1 : -1;
  const state = {
    angle: -clamp(Math.round(o.startIndex) || 0, 0, count - 1) * step,
    seek: null,
    waits: [],
    focus: false,
    announce: false,
    velocity: 0,
    target: null,
    dir: directionSign,
    press: null,
    drag: false,
    hover: false,
    pointer: { inside: false, x: 0, y: 0 },
    yaw: 0,
    pitch: 0,
    intro: null,
    introDone: false,
    holdUntil: 0,
    suppressClick: false,
    wheelTimer: 0,
    fit: 1,
    shift: 0,
    drop: 0,
    last: 0,
  };
  let ready = false;
  let active = ((Math.round(-state.angle / step) % count) + count) % count || 0;
  let raf = 0;
  let visible = true;
  let suspendido = false;
  let destruido = false;
  let giroActivo = o.autoplay === 'drift';
  const pausas = new Set();

  const ajustes = () => ({
    intro: reduced ? 'none' : o.intro in INTRO_LENGTH ? o.intro : 'rise',
    autoplay: reduced || !giroActivo ? 'off' : 'drift',
    momentum: clamp(o.momentum, 0, 1),
    parallax: reduced ? 0 : clamp(o.parallax, 0, 1),
    stretch: reduced ? 0 : clamp(o.stretch, 0, 1),
    depthFade: clamp(o.depthFade, 0, 1),
  });

  const nearest = angle => Math.round(angle / step) * step;

  // Cumple las promesas de enfocar(): true si la tarjeta llegó, false si se interrumpió
  const settle = ok => {
    const waits = state.waits;
    state.waits = [];
    waits.forEach(fn => fn(ok));
  };

  const measure = () => {
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const width = rect.width * 0.94;
    const height = rect.height * 0.92;
    const P = perspective;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const corners = [
      [-cardW / 2, -cardH / 2],
      [cardW / 2, -cardH / 2],
      [-cardW / 2, cardH / 2],
      [cardW / 2, cardH / 2],
    ];
    const limit = 180;
    for (let a = -limit; a <= limit; a += limit / 24) {
      for (const [cx, cy] of corners) {
        let p = rotateX(rotateY([cx, cy, radius], a), tilt);
        p = [p[0], p[1], p[2] - radius];
        if (p[2] >= P * 0.95) continue;
        const k = P / (P - p[2]);
        minX = Math.min(minX, p[0] * k);
        maxX = Math.max(maxX, p[0] * k);
        minY = Math.min(minY, p[1] * k);
        maxY = Math.max(maxY, p[1] * k);
      }
    }
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const fit = Math.min(1, width / spanX, height / spanY);
    state.fit = fit;
    state.shift = -((minY + maxY) / 2) * fit;
    state.drop = (rect.height / fit) * 0.55 + cardH;
    stage.style.perspective = `${P}px`;
    stage.style.transform = `translate3d(0, ${state.shift}px, 0) scale(${fit})`;
  };

  const introCard = (elapsed, landing) => {
    if (!state.intro) return { radius: 1, lift: 0 };
    const reach = Math.abs(wrap(landing + state.angle));
    const delay = (reach / 180) * 480;
    const p = easeOutQuint(clamp((elapsed - delay) / 900, 0, 1));
    return { radius: 1, lift: (1 - p) * state.drop };
  };

  const advance = (s, dt, now) => {
    if (!state.introDone && ready) {
      if (!state.intro) {
        if (s.intro === 'none') state.introDone = true;
        else state.intro = { type: s.intro, start: now };
      }
      if (state.intro && now - state.intro.start >= INTRO_LENGTH[state.intro.type]) {
        state.intro = null;
        state.introDone = true;
      }
    }

    const paused =
      (o.pauseOnHover && state.hover) || state.focus || state.drag || now < state.holdUntil || pausas.size > 0;
    const cruise = s.autoplay === 'drift' && !paused && !state.intro ? o.speed * state.dir : 0;
    let busy = Boolean(state.intro) || state.drag;

    if (state.drag || state.intro) {
      state.velocity = state.drag ? state.velocity : 0;
    } else if (state.target !== null) {
      let remaining = dt;
      const damping = 2 * Math.sqrt(SPRING);
      while (remaining > 0) {
        const h = Math.min(remaining, 1 / 240);
        const accel = SPRING * (state.target - state.angle) - damping * state.velocity;
        state.velocity += accel * h;
        state.angle += state.velocity * h;
        remaining -= h;
      }
      if (Math.abs(state.target - state.angle) < 0.004 && Math.abs(state.velocity) < 0.03) {
        state.angle = state.target;
        state.velocity = 0;
        state.target = null;
        settle(true);
      }
      busy = true;
    } else {
      const tau = 0.18 + s.momentum * 1.5;
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau));
      state.angle += state.velocity * dt;
      if (cruise === 0 && o.snap && Math.abs(state.velocity) < SETTLE_SPEED) {
        state.target = nearest(state.angle);
      }
      busy = busy || cruise !== 0 || Math.abs(state.velocity) > 0.01 || state.target !== null;
    }

    if (now < state.holdUntil) busy = true;

    const ease = 1 - Math.exp(-dt / 0.35);
    const aimYaw = state.pointer.inside ? state.pointer.x * s.parallax * 9 : 0;
    const aimPitch = state.pointer.inside ? -state.pointer.y * s.parallax * 6 : 0;
    state.yaw += (aimYaw - state.yaw) * ease;
    state.pitch += (aimPitch - state.pitch) * ease;
    if (Math.abs(aimYaw - state.yaw) > 0.01 || Math.abs(aimPitch - state.pitch) > 0.01) busy = true;

    return busy;
  };

  const render = (s, now) => {
    const elapsed = state.intro ? now - state.intro.start : 0;
    const swell = 1 + s.stretch * 0.12 * Math.min(1, Math.abs(state.velocity) / 420);
    const angle = state.angle;
    const R = radius * swell;

    camera.style.transform = `translate3d(0, 0, ${-R}px) rotateX(${tilt + state.pitch}deg) rotateY(${state.yaw}deg)`;
    ring.style.transform = `rotateY(${angle}deg)`;

    for (let index = 0; index < count; index++) {
      const card = cards[index];
      const base = index * step;
      const mod = introCard(elapsed, base);
      let transform = `rotateY(${base}deg) translateZ(${R * mod.radius}px)`;
      if (mod.lift) transform += ` translateY(${mod.lift}px)`;
      card.style.transform = transform;

      const world = wrap(base + angle);
      const facing = Math.cos(world * TO_RAD);
      const fade = s.depthFade * Math.pow((1 - facing) / 2, 1.25);
      card.style.setProperty('--cc-depth', fade.toFixed(3));
    }

    const index = ((Math.round(-state.angle / step) % count) + count) % count || 0;
    const changed = index !== active;
    active = index;
    if (state.seek !== null) {
      // viajando hacia la tarjeta pedida con enfocar(): solo se avisa la llegada
      if (index === state.seek || state.target === null) {
        state.seek = null;
        if (changed) o.onChange?.(index);
      }
    } else if (changed) {
      o.onChange?.(index);
    }
    if (changed && state.announce && vivo) {
      state.announce = false;
      vivo.textContent = o.itemLabel ? o.itemLabel(items[index], index) : items[index].alt || '';
    }
  };

  const puedeCorrer = () => ready && visible && !document.hidden && !suspendido && !destruido;

  const frame = now => {
    raf = 0;
    const s = ajustes();
    const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 1 / 60;
    state.last = now;
    const busy = advance(s, dt, now);
    render(s, now);
    if (busy && puedeCorrer()) raf = requestAnimationFrame(frame);
    else state.last = 0;
  };

  const wake = () => {
    if (!raf && puedeCorrer()) raf = requestAnimationFrame(frame);
  };

  const parar = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    state.last = 0;
  };

  // Puntero (igual que el original, solo eje Y)
  const updatePointer = event => {
    const rect = root.getBoundingClientRect();
    state.pointer.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    state.pointer.y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  };

  const onPointerDown = event => {
    state.suppressClick = false;
    if (!o.draggable || event.button !== 0) return;
    state.seek = null;
    state.press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      angle: state.angle,
      moved: false,
      origin: 0,
      samples: [{ time: performance.now(), angle: state.angle }],
    };
  };

  const onPointerMove = event => {
    if (event.pointerType === 'mouse') {
      state.pointer.inside = true;
      updatePointer(event);
    }
    const press = state.press;
    if (!press || press.id !== event.pointerId) {
      wake();
      return;
    }
    const delta = event.clientX - press.x;
    const cross = event.clientY - press.y;
    if (!press.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      if (Math.abs(cross) > Math.abs(delta) * 1.2 && event.pointerType !== 'mouse') {
        state.press = null; // gesto vertical en táctil: es scroll de la página
        return;
      }
      press.moved = true;
      press.origin = delta;
      state.drag = true;
      state.target = null;
      state.velocity = 0;
      settle(false);
      root.dataset.dragging = '';
      try {
        root.setPointerCapture(event.pointerId);
      } catch {}
    }
    const perPixel = 180 / (Math.PI * radius * state.fit);
    state.angle = press.angle + (delta - press.origin) * perPixel;
    const now = performance.now();
    press.samples.push({ time: now, angle: state.angle });
    while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
    wake();
  };

  const releasePointer = event => {
    const press = state.press;
    if (!press || press.id !== event.pointerId) return;
    state.press = null;
    if (!press.moved) return;
    state.drag = false;
    delete root.dataset.dragging;
    state.suppressClick = true;
    const s = ajustes();
    const first = press.samples[0];
    const last = press.samples[press.samples.length - 1];
    const span = (last.time - first.time) / 1000;
    const velocity = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
    state.velocity = velocity;
    if (Math.abs(velocity) > 60) state.dir = Math.sign(velocity);
    const coasting = s.autoplay === 'drift' && !(o.pauseOnHover && state.hover && event.pointerType === 'mouse');
    if (o.snap && !coasting) {
      const tau = 0.18 + s.momentum * 1.5;
      state.target = Math.round((state.angle + velocity * tau * 0.55) / step) * step;
    }
    wake();
  };

  const onPointerEnter = event => {
    if (event.pointerType !== 'mouse') return;
    state.hover = true;
    wake();
  };

  const onPointerLeave = event => {
    if (event.pointerType === 'mouse') {
      state.hover = false;
      state.pointer.inside = false;
    }
    wake();
  };

  const enfocar = (index, { mantener = HOLD } = {}) => {
    state.seek = index === active ? null : index;
    let target = -index * step;
    target += 360 * Math.round((state.angle - target) / 360);
    state.holdUntil = performance.now() + mantener;
    if (reduced || !ready) {
      // movimiento reducido (o antes de que aparezca): el cambio es instantáneo
      state.angle = target;
      state.velocity = 0;
      state.target = null;
      settle(false);
      render(ajustes(), performance.now());
      wake();
      return Promise.resolve(true);
    }
    state.target = target;
    wake();
    return new Promise(resolve => {
      const tope = setTimeout(() => {
        state.waits = state.waits.filter(fn => fn !== listo);
        resolve(false);
      }, 1200);
      const listo = ok => {
        clearTimeout(tope);
        resolve(ok);
      };
      state.waits.push(listo);
    });
  };

  // Gira de a una tarjeta (teclado), como stepBy del original
  const paso = delta => {
    const base = state.target ?? nearest(state.angle);
    state.seek = null;
    state.target = base - delta * step;
    state.holdUntil = performance.now() + HOLD;
    if (reduced) {
      state.angle = state.target;
      state.target = null;
      state.velocity = 0;
      render(ajustes(), performance.now());
    }
    wake();
  };

  // Rectángulo en pantalla de la tarjeta i (sus tiras de adelante): el origen de un FLIP
  const rectDe = index => {
    const tiras = [...cards[index].children].slice(0, tiles.length);
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const tira of tiras) {
      const r = tira.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      left = Math.min(left, r.left);
      top = Math.min(top, r.top);
      right = Math.max(right, r.right);
      bottom = Math.max(bottom, r.bottom);
    }
    return left === Infinity ? root.getBoundingClientRect() : new DOMRect(left, top, right - left, bottom - top);
  };

  const onKeyDown = event => {
    if (!o.label) return;
    if (event.key === 'ArrowRight') paso(1);
    else if (event.key === 'ArrowLeft') paso(-1);
    else if (event.key === 'Enter' || event.key === ' ') o.onItemClick?.(items[active], active);
    else return;
    if (event.key.startsWith('Arrow')) state.announce = true;
    event.preventDefault();
  };

  const onFocusIn = () => {
    state.focus = root.matches(':focus-visible');
    if (state.focus && vivo) vivo.textContent = o.itemLabel ? o.itemLabel(items[active], active) : '';
    wake();
  };

  const onFocusOut = () => {
    state.focus = false;
    wake();
  };

  const onClick = event => {
    if (state.suppressClick) {
      state.suppressClick = false;
      return;
    }
    const card = event.target.closest?.('[data-cc-index]');
    if (!card) return;
    const index = Number(card.dataset.ccIndex);
    if (o.focusOnClick) enfocar(index);
    o.onItemClick?.(items[index], index);
  };

  const onWheel = event => {
    if (!o.draggable) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
    if (!delta) return; // la rueda vertical sigue moviendo la página
    event.preventDefault();
    const perPixel = 180 / (Math.PI * radius * state.fit);
    state.target = null;
    state.seek = null;
    settle(false);
    state.angle -= delta * perPixel;
    state.velocity = -delta * perPixel * 30;
    state.holdUntil = performance.now() + 1600;
    clearTimeout(state.wheelTimer);
    state.wheelTimer = setTimeout(() => {
      if (o.snap) state.target = nearest(state.angle + state.velocity * 0.12);
      wake();
    }, 140);
    wake();
  };

  const onVisibility = () => (document.hidden ? parar() : wake());
  const onMotion = () => {
    reduced = Boolean(consulta?.matches);
    wake();
  };

  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerup', releasePointer);
  root.addEventListener('pointercancel', releasePointer);
  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointerleave', onPointerLeave);
  root.addEventListener('click', onClick);
  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibility);
  consulta?.addEventListener?.('change', onMotion);

  const resize = new ResizeObserver(() => {
    measure();
    wake();
  });
  resize.observe(root);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else parar();
  });
  io.observe(root);

  measure();
  render(ajustes(), performance.now());

  // Precarga: el carrusel aparece (y su intro arranca) cuando las fotos están decodificadas,
  // o a los 2.4 s como máximo, como en el original.
  const cargar = src =>
    new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => (image.decode ? image.decode().then(resolve, resolve) : resolve());
      image.onerror = resolve;
      image.src = src;
    });
  const espera = new Promise(resolve => setTimeout(resolve, 2400));
  Promise.race([Promise.all(items.map(item => cargar(item.src))), espera]).then(() => {
    if (destruido) return;
    ready = true;
    root.dataset.ready = '';
    state.introDone = false;
    state.intro = null;
    wake();
  });

  return {
    enfocar,
    paso,
    rectDe,
    /** Enciende o apaga el giro automático. Al encenderlo vuelve a la dirección configurada. */
    girar(encendido) {
      giroActivo = Boolean(encendido) && o.autoplay === 'drift';
      if (giroActivo) state.dir = directionSign;
      wake();
    },
    /** Pausa con nombre: mientras haya alguna activa, no gira solo (y se asienta en la foto más cercana). */
    pausar(clave, activa) {
      if (activa) pausas.add(clave);
      else pausas.delete(clave);
      wake();
    },
    /** Detiene el bucle por completo (por ejemplo, con la agenda abierta encima). */
    suspender(activo) {
      suspendido = Boolean(activo);
      if (suspendido) parar();
      else wake();
    },
    get activo() {
      return active;
    },
    destruir() {
      destruido = true;
      parar();
      resize.disconnect();
      io.disconnect();
      clearTimeout(state.wheelTimer);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', releasePointer);
      root.removeEventListener('pointercancel', releasePointer);
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('click', onClick);
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('keydown', onKeyDown);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVisibility);
      consulta?.removeEventListener?.('change', onMotion);
      view.remove();
      root.querySelectorAll('.circular-carousel__live').forEach(el => el.remove());
      ['role', 'aria-roledescription', 'aria-label', 'aria-describedby', 'aria-hidden', 'tabindex'].forEach(a =>
        root.removeAttribute(a)
      );
      root.classList.remove('circular-carousel');
      delete root.dataset.ready;
      settle(false);
    },
  };
}
