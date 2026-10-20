// Brillo especular en el borde de los botones: port a JS puro de SpecularButton de React Bits
// (@react-bits/SpecularButton-JS-CSS). Del original se trae solo la luz: un <canvas> WebGL2 detrás del texto,
// con una línea que recorre el borde y se acerca al puntero. El botón conserva su color, su texto, su sombra
// 3D, su tamaño y su foco: del CSS del original no se usan el vidrio (tint, blur), la sombra, los tamaños
// (sm, md, lg) ni el :active. Conserva los nombres de las opciones y la clase del canvas
// (.specular-button__light), para compararlo con el original y pegar valores de su configurador.
//
//   const b = crearBrillo(boton, { lineColor: '#fff', baseColor: '#ffebdc', radius: 999 });
//   b.destruir();
//
// Lo que cambia respecto del original:
// - El contexto WebGL se crea recién después de la primera interacción (mover el puntero, tocar, hacer
//   scroll o usar el teclado), cuando el botón se acerca a la pantalla y en un momento libre. Así la carga no
//   paga WebGL: en Lighthouse (celular simulado, navegador recién abierto) crear el primer contexto dio una
//   tarea de 377 ms. Y los botones que no se ven (el de la nav en celular, el del menú cerrado, el de la otra
//   modalidad del diálogo) no ocupan un contexto (el navegador permite unos 16).
// - Un solo listener de pointermove para todos los botones, y no redibuja si nada cambió.
// - El canvas se ubica desde el borde exterior del botón: el original no tiene borde, y aquí el fantasma
//   y el de contorno llevan 2px.
// - Con movimiento reducido la luz no sigue al puntero: queda quieta en su esquina (el original solo
//   apagaba el giro de autoAnimate).
// - Sin WebGL2, o si el navegador quita el contexto, el canvas se va y el botón queda como siempre.

const PAD = 24;
const TAU = Math.PI * 2;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform float uPx;
uniform float uSpot;
uniform vec2 uEntry;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform vec2 uWindow;
uniform float uThickness;
uniform float uGlow;
out vec4 outColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float loopPosition(vec2 p, vec2 b, float r) {
  vec2 inner = b - r;
  float arc = 1.5707963 * r;
  float quarter = inner.x + inner.y + arc;
  vec2 a = abs(p);
  vec2 q = a - inner;
  float s = q.x > 0.0 && q.y > 0.0
    ? inner.y + atan(q.y, q.x) * r
    : (q.x > q.y ? min(a.y, inner.y) : inner.y + arc + inner.x - min(a.x, inner.x));
  if (p.x < 0.0) s = p.y >= 0.0 ? 2.0 * quarter - s : 2.0 * quarter + s;
  else if (p.y < 0.0) s = 4.0 * quarter - s;
  return s / max(4.0 * quarter, 0.0001);
}

float lobe(float position, float center) {
  float gap = abs(fract(position - center + 0.5) - 0.5);
  return 1.0 - smoothstep(uWindow.x, uWindow.x + uWindow.y, gap);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = roundedBox(p, uHalf, uRadius);
  float position = loopPosition(p, uHalf, uRadius);
  float key = lobe(position, uSpot);
  float back = lobe(position, uSpot + 0.5);
  float streak = key + back * 0.45;
  float width = max(uThickness * uPx * mix(1.0, max(key, back), 0.6), 0.35);
  float band = smoothstep(-width - 0.6, -width + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float hair = smoothstep(-uPx - 0.6, -uPx + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float inside = 1.0 - smoothstep(-0.6, 0.6, d);
  vec2 pool = (p - uEntry) / (uHalf.y * vec2(1.6, 1.1));
  float glow = streak * 0.2 * exp(-abs(d + width * 0.5) / (5.0 * uPx)) + inside * 0.08 * exp(-dot(pool, pool));
  float light = clamp((band * streak + glow * uGlow) * uIntensity, 0.0, 1.0);
  vec4 base = vec4(uBaseColor, 1.0) * hair * 0.6;
  outColor = vec4(uLineColor, 1.0) * light + base * (1.0 - light);
}`;

const UNIFORMS = [
  'uCenter',
  'uHalf',
  'uRadius',
  'uPx',
  'uSpot',
  'uEntry',
  'uLineColor',
  'uBaseColor',
  'uIntensity',
  'uWindow',
  'uThickness',
  'uGlow'
];

// Las opciones del original, con sus valores por defecto
const PREDETERMINADAS = {
  radius: 18,
  lineColor: '#ffffff',
  baseColor: '#525252',
  intensity: 1,
  idleIntensity: 0.35,
  shineSize: 10,
  shineFade: 34,
  thickness: 1.2,
  glow: 1,
  speed: 0.35,
  followMouse: true,
  proximity: 250,
  autoAnimate: false,
  disabled: false
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const wrap = value => value - Math.floor(value);

const reducido = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const enReposo = window.requestIdleCallback
  ? fn => window.requestIdleCallback(fn, { timeout: 1500 })
  : fn => window.setTimeout(fn, 60);
const cancelarReposo = window.cancelIdleCallback
  ? id => window.cancelIdleCallback(id)
  : id => window.clearTimeout(id);

// La primera interacción habilita los contextos WebGL (ver arriba)
const INTERACCIONES = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
const enEspera = new Set();
let interactuo = false;

function alInteractuar(fn) {
  if (interactuo) return fn();
  if (!enEspera.size) {
    INTERACCIONES.forEach(tipo => window.addEventListener(tipo, interactuar, { capture: true, passive: true }));
  }
  enEspera.add(fn);
}

function interactuar() {
  interactuo = true;
  INTERACCIONES.forEach(tipo => window.removeEventListener(tipo, interactuar, { capture: true }));
  enEspera.forEach(fn => fn());
  enEspera.clear();
}

const loopPosition = (x, y, halfX, halfY, r) => {
  const innerX = halfX - r;
  const innerY = halfY - r;
  const arc = (Math.PI / 2) * r;
  const quarter = innerX + innerY + arc;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const qx = ax - innerX;
  const qy = ay - innerY;
  let s;
  if (qx > 0 && qy > 0) s = innerY + Math.atan2(qy, qx) * r;
  else if (qx > qy) s = Math.min(ay, innerY);
  else s = innerY + arc + innerX - Math.min(ax, innerX);
  if (x < 0) s = y >= 0 ? 2 * quarter - s : 2 * quarter + s;
  else if (y < 0) s = 4 * quarter - s;
  return wrap(s / Math.max(4 * quarter, 0.0001));
};

const rimPoint = (position, halfX, halfY, r) => {
  const innerX = halfX - r;
  const innerY = halfY - r;
  const arc = (Math.PI / 2) * r;
  const quarter = innerX + innerY + arc;
  let s = wrap(position) * 4 * quarter;
  let signX = 1;
  let signY = 1;
  if (s > 3 * quarter) {
    s = 4 * quarter - s;
    signY = -1;
  } else if (s > 2 * quarter) {
    s -= 2 * quarter;
    signX = -1;
    signY = -1;
  } else if (s > quarter) {
    s = 2 * quarter - s;
    signX = -1;
  }
  let x = innerX - (s - innerY - arc);
  let y = halfY;
  if (s <= innerY) {
    x = halfX;
    y = s;
  } else if (s <= innerY + arc) {
    const angle = (s - innerY) / Math.max(r, 0.0001);
    x = innerX + Math.cos(angle) * r;
    y = innerY + Math.sin(angle) * r;
  }
  return [x * signX, y * signY];
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = gl => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
};

// El puntero es uno para todos los botones (en el original, cada botón escuchaba la ventana por su cuenta)
const pointer = { x: 0, y: 0, known: false };
const despiertos = new Set();
let escuchando = false;

function escuchar() {
  if (escuchando) return;
  escuchando = true;
  const despertar = () => despiertos.forEach(wake => wake());
  window.addEventListener('pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.known = true;
    despertar();
  }, { passive: true });
  const onPointerEnd = event => {
    if (event.pointerType === 'mouse') return;
    pointer.known = false;
    despertar();
  };
  window.addEventListener('pointerup', onPointerEnd, { passive: true });
  window.addEventListener('pointercancel', onPointerEnd, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.known = false;
    despertar();
  });
}

export function crearBrillo(button, opciones = {}) {
  const o = { ...PREDETERMINADAS, ...opciones };
  const settings = {
    radius: Math.max(0, o.radius),
    lineColor: String(o.lineColor),
    baseColor: String(o.baseColor),
    intensity: Math.max(0, o.intensity),
    idleIntensity: clamp(o.idleIntensity, 0, 1),
    shineSize: Math.max(0, o.shineSize),
    shineFade: Math.max(0, o.shineFade),
    thickness: Math.max(0, o.thickness),
    glow: Math.max(0, o.glow),
    speed: o.speed,
    followMouse: o.followMouse,
    proximity: Math.max(1, o.proximity),
    autoAnimate: o.autoAnimate,
    disabled: o.disabled
  };

  const canvas = document.createElement('canvas');
  canvas.className = 'specular-button__light';
  canvas.setAttribute('aria-hidden', 'true');

  let apagar = null;
  let espera = 0;
  let destruido = false;

  // se enciende cuando el botón está a 200px de la pantalla (uno oculto nunca llega)
  const prender = () => {
    espera = enReposo(() => {
      espera = 0;
      if (!destruido) apagar = encender(button, canvas, settings);
    });
  };
  const cerca = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    cerca.disconnect();
    alInteractuar(prender);
  }, { rootMargin: '200px 0px' });
  cerca.observe(button);

  return {
    destruir() {
      destruido = true;
      enEspera.delete(prender);
      cerca.disconnect();
      if (espera) cancelarReposo(espera);
      apagar?.();
      apagar = null;
      canvas.remove();
    }
  };
}

// El cuerpo del useEffect del original: arma WebGL y devuelve la limpieza (o null si no hay WebGL2)
function encender(button, canvas, s) {
  button.prepend(canvas);
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false
  });
  const program = gl && link(gl);
  if (!program) {
    canvas.remove();
    return null;
  }
  const uniforms = {};
  for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);
  const buffer = gl.createBuffer();
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const colors = new Map();
  const view = { width: 1, height: 1, ratio: 1 };
  const state = { spot: 0, level: 0, press: 0, ready: false };
  const drawn = { spot: -1, level: -1, press: -1 }; // lo último dibujado
  let raf = 0;
  let last = 0;
  let visible = true;
  let dirty = true; // el canvas cambió de tamaño (y se borró): hay que dibujar sí o sí

  const toRgb = value => {
    if (colors.has(value)) return colors.get(value);
    let rgb = [1, 1, 1];
    if (probe) {
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = '#000000';
      probe.fillStyle = value;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      rgb = [r / 255, g / 255, b / 255];
    }
    colors.set(value, rgb);
    return rgb;
  };

  const cornerRadius = s => Math.min(s.radius, view.width / 2, view.height / 2);

  const restSpot = s => {
    const r = cornerRadius(s);
    const inset = r * (1 - Math.SQRT1_2);
    return loopPosition(inset - view.width / 2, view.height / 2 - inset, view.width / 2, view.height / 2, r);
  };

  const aim = s => {
    if (!s.followMouse || s.disabled || !pointer.known || reducido()) return null;
    const rect = button.getBoundingClientRect();
    const scale = rect.width / view.width || 1;
    const halfX = view.width / 2;
    const halfY = view.height / 2;
    const x = (pointer.x - rect.left - rect.width / 2) / scale;
    const y = (rect.top + rect.height / 2 - pointer.y) / scale;
    const distance = Math.hypot(Math.max(Math.abs(x) - halfX, 0), Math.max(Math.abs(y) - halfY, 0));
    const t = clamp(1 - distance / s.proximity, 0, 1);
    const near = t * t * (3 - 2 * t);
    const nearest = loopPosition(x, y, halfX, halfY, cornerRadius(s));
    if (distance > 0) return { spot: nearest, near };
    const depth = clamp(Math.min(halfX - Math.abs(x), halfY - Math.abs(y)) / (halfY * 0.8), 0, 1);
    const sway = restSpot(s) - (x / halfX) * 0.06 - (y / halfY) * 0.02;
    const offset = sway - nearest - Math.round(sway - nearest);
    return { spot: wrap(nearest + offset * depth * depth * (3 - 2 * depth)), near };
  };

  const draw = s => {
    if (
      !dirty &&
      Math.abs(state.spot - drawn.spot) < 1e-5 &&
      Math.abs(state.level - drawn.level) < 1e-4 &&
      Math.abs(state.press - drawn.press) < 1e-4
    ) return;
    dirty = false;
    drawn.spot = state.spot;
    drawn.level = state.level;
    drawn.press = state.press;
    const { width, height } = view;
    const scaleX = canvas.width / (width + PAD * 2);
    const scaleY = canvas.height / (height + PAD * 2);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform2f(uniforms.uCenter, (PAD + width / 2) * scaleX, (PAD + height / 2) * scaleY);
    gl.uniform2f(uniforms.uHalf, (width / 2) * scaleX, (height / 2) * scaleY);
    gl.uniform1f(uniforms.uRadius, Math.min(s.radius, width / 2, height / 2) * scaleX);
    gl.uniform1f(uniforms.uPx, view.ratio);
    const r = Math.min(s.radius, width / 2, height / 2);
    const [rimX, rimY] = rimPoint(state.spot, width / 2, height / 2, r);
    const pull = 1 - Math.min(0.35 * (height / 2), Math.hypot(rimX, rimY)) / Math.max(Math.hypot(rimX, rimY), 0.0001);
    gl.uniform1f(uniforms.uSpot, state.spot);
    gl.uniform2f(uniforms.uEntry, rimX * pull * scaleX, rimY * pull * scaleY);
    gl.uniform3fv(uniforms.uLineColor, toRgb(s.lineColor));
    gl.uniform3fv(uniforms.uBaseColor, toRgb(s.baseColor));
    gl.uniform1f(uniforms.uIntensity, s.intensity * (state.level + state.press * 0.8));
    gl.uniform2f(uniforms.uWindow, s.shineSize / 360 + state.press * 0.06, s.shineFade / 360 + 0.0001);
    gl.uniform1f(uniforms.uThickness, s.thickness);
    gl.uniform1f(uniforms.uGlow, s.glow);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  };

  const frame = now => {
    raf = 0;
    if (!visible) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const target = aim(s);
    const spinning = s.autoAnimate && !reducido();
    const steering = !!target && target.near > 0;
    if (!state.ready) {
      state.spot = restSpot(s);
      state.level = s.autoAnimate ? 1 : s.idleIntensity;
      state.ready = true;
    }
    let diff = 0;
    if (spinning && !steering) state.spot = wrap(state.spot + (s.speed / TAU) * dt);
    else {
      diff = (steering ? target.spot : restSpot(s)) - state.spot;
      diff -= Math.round(diff);
      state.spot = wrap(state.spot + diff * (1 - Math.exp(-dt * 8)));
    }
    const level = s.autoAnimate ? 1 : s.idleIntensity + (1 - s.idleIntensity) * (target ? target.near : 0);
    state.level += (level - state.level) * (1 - Math.exp(-dt * 7));
    state.press *= Math.exp(-dt * 5);
    draw(s);
    const settling = Math.abs(diff) > 0.0002 || Math.abs(level - state.level) > 0.001 || state.press > 0.002;
    if (settling || (spinning && !steering)) raf = requestAnimationFrame(frame);
    else last = 0;
  };

  const wake = () => {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  };

  const measure = entry => {
    const box = entry?.borderBoxSize?.[0];
    view.width = Math.max(1, box ? box.inlineSize : button.offsetWidth);
    view.height = Math.max(1, box ? box.blockSize : button.offsetHeight);
    view.ratio = Math.min(window.devicePixelRatio || 1, 3);
    // desde el borde exterior del botón, con PAD de aire alrededor para el resplandor
    const estilo = getComputedStyle(button);
    canvas.style.left = `${-(PAD + (parseFloat(estilo.borderLeftWidth) || 0))}px`;
    canvas.style.top = `${-(PAD + (parseFloat(estilo.borderTopWidth) || 0))}px`;
    canvas.style.width = `${view.width + PAD * 2}px`;
    canvas.style.height = `${view.height + PAD * 2}px`;
    canvas.width = Math.max(1, Math.round((view.width + PAD * 2) * view.ratio));
    canvas.height = Math.max(1, Math.round((view.height + PAD * 2) * view.ratio));
    dirty = true;
    if (state.ready) draw(s);
    wake();
  };

  const onPointerDown = event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.known = true;
    if (!s.disabled) state.press = 1;
    wake();
  };

  const resizeObserver = new ResizeObserver(entries => measure(entries[entries.length - 1]));
  resizeObserver.observe(button);
  const intersection = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible) {
      last = 0;
      wake();
    }
  });
  intersection.observe(button);
  escuchar();
  despiertos.add(wake);
  button.addEventListener('pointerdown', onPointerDown);
  measure();

  const limpiar = () => {
    canvas.removeEventListener('webglcontextlost', perdido);
    cancelAnimationFrame(raf);
    despiertos.delete(wake);
    resizeObserver.disconnect();
    intersection.disconnect();
    button.removeEventListener('pointerdown', onPointerDown);
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vao);
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  // si el navegador quita el contexto (p. ej. por tener demasiados), el botón queda sin luz, como siempre
  const perdido = () => {
    limpiar();
    canvas.remove();
  };
  canvas.addEventListener('webglcontextlost', perdido);

  return limpiar;
}
