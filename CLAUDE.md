# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# A+PRUEBA · Landing — instrucciones para Claude Code

## Contexto

Landing del evento **A+PRUEBA — La Ruta del Estudiante** (UCSUR, martes 17 de noviembre de 2026).
Público: escolares de secundaria que llegan desde el celular (Instagram, TikTok, WhatsApp).
Objetivo único: que entiendan el evento en 30 segundos y se inscriban en **Presencial (200 cupos)** o **Virtual (800 cupos)**.

- **Contenido y datos:** `docs/PROYECTO.md` es la fuente de verdad de textos, fechas, aliados y pendientes. No inventes textos ni datos.
- **Diseño de referencia:** Figma `(link de Figma: no va en el repositorio)` (frames "Landing · Escritorio 1440", "Landing · Móvil 390" y "Componentes"). **No lo leas salvo que algo no esté claro aquí**: la cuenta tiene un límite bajo de lecturas por MCP (unas 20 al mes). Todo lo necesario está en este archivo.
- **Registro:** Luma. No hay base de datos ni formulario propio.
- **Publicación:** martes 20 de octubre de 2026.

## Estado actual

**Fases 1, 2 y 3 terminadas.** La landing está maquetada, es funcional y se mueve.
Archivos: `index.html`, `favicon.svg`, `css/` (`tokens.css`, `styles.css`, `motion.css`) y
`js/` (`config.js`, `main.js`, `nav.js`, `entradas.js`, `countdown.js`, `tabs.js`, `starfield.js`,
`ruta.js`). Falta `assets/og/og-image.png`.

**Lo siguiente es la Fase 4 (QA).** Lo que queda pendiente de verdad:

- Lighthouse móvil contra el presupuesto (no se ha corrido todavía).
- Safari iOS y Android reales. Dos cosas a mirar ahí:
  - `transition` sobre `grid-template-rows` (la apertura del panel). Donde no esté soportado, el panel
    abre y cierra igual, pero de golpe.
  - El bloqueo de scroll del menú móvil usa `position: fixed` en el body, que es la técnica que
    funciona en iOS, pero conviene confirmarlo en un aparato real.
- Rellenar `js/config.js` con los datos que faltan en `docs/PROYECTO.md` (sección 8) y el snippet
  del script de Luma donde dice `<!-- LUMA SCRIPT -->`.
- La imagen `og-image.png` (1200×630) y el favicon oficial.

Decisiones que conviene no deshacer sin querer:

- **Las fuentes no bloquean.** La hoja de Google Fonts se carga con `media="print"` y se activa al
  llegar, porque una hoja externa bloquea la ejecución de los módulos: si Google Fonts tarda, la
  página se queda sin JS. Hay `<noscript>` de respaldo.
- **El panel de entradas** vive dentro de `#panel-envoltorio` (grid `0fr → 1fr`) y `.panel-recorte`,
  que recorta en vertical pero tiene padding lateral para no cortar las muescas ni la flecha. Cerrado
  lleva `inert` + `aria-hidden`, no `hidden`, para poder animarlo.
- **Un transform por elemento.** El boleto flota y `.boleto__interior` crece y menea; el nodo flota y
  `.estacion__nodo-circulo` crece y late. Todas las escalas se componen con la variable `--escala`,
  así el hover, el saludo y el estado atenuado no se pisan.
- **La nav** alterna `.nav--fija` con un listener de scroll directo, sin `requestAnimationFrame`.
- **Los enlaces que dependen de CONFIG** salen del HTML sin `href`; `main.js` se los pone si el campo
  tiene valor y si no los deja deshabilitados con `title="Próximamente"` (y, si son botones, además
  les cambia el texto).

## Comandos

No hay package.json, ni build, ni linter, ni tests: es un sitio estático y se abre tal cual.

```bash
npx serve .                      # servidor local (los ES modules no cargan desde file://)
npx lighthouse http://localhost:3000 --preset=desktop --view
npx lighthouse http://localhost:3000 --form-factor=mobile --view   # el presupuesto se mide en móvil
```

**No uses `python3 -m http.server` para probar esto.** Con los 8 módulos pidiéndose a la vez deja caer
peticiones cada tantas cargas: el grafo de módulos falla entero y la página se queda estática, sin ningún
error visible. Cuesta horas de depuración. `npx serve` (o cualquier servidor decente) no tiene el problema.

- `cwebp` **no está instalado**. Si se quieren versiones .webp de los logos: `brew install webp`, y si no se instala, se dejan los PNG (pesan 120 KB en total, muy por debajo del presupuesto de 1.5 MB).
- Para la verificación manual de cada fase: abrir el servidor local y revisar en 360, 390, 768, 1024 y 1440 px, con y sin `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature).

## Reglas

1. Usa HTML, CSS y JavaScript puro con ES modules. No uses frameworks, Tailwind, jQuery, librerías de animación ni paso de build.
2. Trabaja mobile-first. La página debe verse bien en 360, 390, 768, 1024 y 1440 px.
3. Copia los textos exactos de `docs/PROYECTO.md`. Si falta un dato, pon `[POR CONFIRMAR]` o déjalo en `js/config.js`. Nunca inventes direcciones, números ni enlaces.
4. Todo lo configurable (fechas, Luma, WhatsApp, redes, mapa) vive en `js/config.js`.
5. Respeta `prefers-reduced-motion: reduce`. Con esa preferencia se apagan el flotar, el menear, la deriva de estrellas y el cometa, pero los cambios de estado siguen funcionando.
6. Cumple los requisitos de accesibilidad y el presupuesto de rendimiento de las secciones de abajo.
7. Trabaja por las fases del final. Al terminar cada fase detente, resume qué hiciste y explica cómo verlo.
8. Los ES modules no cargan desde `file://`. Para probar usa `npx serve .` o Live Server.

## Estructura de archivos

```
/
├── index.html
├── favicon.svg
├── css/
│   ├── tokens.css      variables: color, tipografía, espacios, radios, sombras, movimiento
│   ├── styles.css      base, layout, componentes y secciones
│   └── motion.css      keyframes, estados de animación y prefers-reduced-motion
├── js/
│   ├── config.js       datos editables (ver abajo)
│   ├── main.js         arranque: importa e inicializa módulos
│   ├── nav.js          nav fija + menú móvil
│   ├── entradas.js     selector Presencial/Virtual con panel que se abre en el mismo lugar
│   ├── countdown.js    cuenta regresiva
│   ├── starfield.js    cielo de estrellas en <canvas> (hero y ruta)
│   ├── ruta.js         animación de la ruta 1–4
│   └── tabs.js         pestañas Presencial/Virtual de Ubicación
├── assets/
│   ├── logos/          aprueba.png + 6 aliados (ya recortados en círculo)
│   └── og/             og-image.png (pendiente)
└── docs/PROYECTO.md
```

### js/config.js

```js
export const CONFIG = {
  evento: {
    inicio: '2026-11-17T09:00:00-05:00', // hora de Lima
    fin:    '2026-11-17T13:00:00-05:00',
  },
  // Sirve para un evento de Luma con 2 tipos de entrada (mismo eventId) o para 2 eventos separados.
  luma: {
    presencial: { url: '', eventId: '', ticketTypeId: '' },
    virtual:    { url: '', eventId: '', ticketTypeId: '' },
  },
  cupos: { presencial: 200, virtual: 800 },
  whatsapp: { numero: '', mensaje: 'Hola, tengo una consulta sobre A+PRUEBA' }, // formato 51XXXXXXXXX
  redes: { instagram: '', tiktok: '', facebook: '' },
  mapa: { embedUrl: '', linkUrl: '', direccion: '[POR CONFIRMAR]' },
  virtual: { plataforma: '[POR CONFIRMAR]' },
  legal: { privacidadUrl: '', terminosUrl: '' },
};
```

Si un campo está vacío, el elemento que depende de él se muestra deshabilitado con el texto "Próximamente". Nunca debe quedar un enlace roto.

## Tokens (css/tokens.css)

### Color

| Variable | Hex | Uso |
|---|---|---|
| `--navy-900` | `#0B1040` | fondo de hero, ruta y footer; texto principal sobre claro |
| `--navy-800` | `#141C57` | tarjetas sobre fondo oscuro |
| `--navy-700` | `#26327A` | bordes sobre oscuro |
| `--azul-500` | `#2457E6` | botón virtual, acentos, degradado |
| `--azul-600` | `#16399A` | sombra 3D del botón azul, texto sobre celeste-100 |
| `--celeste-400` | `#3EC6F2` | acento sobre oscuro, estación 1, cometa |
| `--celeste-100` | `#E2F6FD` | fondos suaves de lo virtual |
| `--verde-400` | `#7ED348` | super-titular, estación 2, botón WhatsApp, sticker |
| `--verde-600` | `#357A17` | overlines verdes sobre claro (en Figma era `#3E8E1C`; se oscurece por contraste) |
| `--verde-100` | `#EAF8DF` | fondos suaves |
| `--naranja-500` | `#EE6C14` | botón principal, número 200, estación 3 |
| `--naranja-700` | `#B44C06` | sombra 3D del botón naranja, texto sobre naranja-100 |
| `--naranja-100` | `#FFEBDC` | fondos suaves de lo presencial |
| `--blanco` | `#FFFFFF` | |
| `--nube-50` | `#F4F7FF` | fondo de secciones claras alternas |
| `--linea` | `#DCE3F4` | bordes y divisores sobre claro |
| `--tinta-600` | `#4A5482` | texto secundario sobre claro, **incluido el texto pequeño** |
| `--tinta-400` | `#8A93B8` | solo íconos y estados deshabilitados (no pasa contraste en texto pequeño) |
| `--tinta-sobre-oscuro` | `#C3CCF0` | texto secundario sobre navy |

- **Degradado del contador:** `linear-gradient(90deg, #2457E6, #3EC6F2)`.
- **Planeta:** `linear-gradient(135deg, #7FE3FF, #2457E6)`.
- **Botones naranjas:** texto blanco a **19px ExtraBold como mínimo**. El contraste es 3.1:1, así que solo cumple AA como texto grande.

### Tipografía

Usa Google Fonts: **Fredoka** (600, 700) para títulos y números, y **Nunito** (400, 600, 700, 800 y 600 itálica) para todo lo demás. Agrega `display=swap` y `preconnect`.

| Token | Fuente | Escritorio | Móvil |
|---|---|---|---|
| display (h1) | Fredoka 700, tracking -1% | 58/64 | 36/42 |
| h2 | Fredoka 700 | 44/52 | 30/36 |
| h3 | Fredoka 700 | 28/34 | 24/30 |
| numero (cupos) | Fredoka 700 | 76/76 | 56/58 |
| contador | Fredoka 700 | 56/60 | 34/40 |
| lead | Nunito 400 | 19/30 | 16/26 |
| base | Nunito 400 | 16/26 | 16/26 |
| card | Nunito 400 | 15/24 | 15/24 |
| small | Nunito 400 | 14/22 | 14/22 |
| pregunta | Nunito 600 itálica | 17/25 | 17/25 |
| overline | Nunito 800, MAYÚSCULAS, tracking 0.12em | 13/18 | 13/18 |
| boton | Nunito 800 | 19/24 | 19/24 |
| nav | Nunito 700 | 15/20 | 15/20 |
| strong | Nunito 700 | 16/24 | 16/24 |

Interpola entre escritorio y móvil con `clamp()`.

### Espacios, radios y sombras

- **Contenedor:** máximo 1200px. El margen lateral es 120px en 1440 y 20px en móvil, con `clamp(20px, 8vw, 120px)`.
- **Padding vertical de secciones:** 112px en escritorio y 64px en móvil.
- **Radios:**
  - Botones y chips de pastilla: 999px
  - Tarjetas de entrada y pasaporte: 28px
  - Tarjetas de estación: 24px
  - Cajas del contador: 20px
  - Chips de info: 16px
- **Sombras:**
  - `--sombra-tarjeta: 0 16px 40px rgba(11,16,64,.10)`
  - `--sombra-pasaporte: 0 24px 48px rgba(0,0,0,.35)`
  - Caja del contador: `0 6px 0 rgba(11,16,64,.28)`
- **Botón 3D:** `box-shadow: 0 5px 0 <tono oscuro>`, con `--naranja-700` en el naranja, `--azul-600` en el azul y `#3E8E1C` en el verde. En `:active` usa `translateY(3px)` y sombra `0 2px 0`.

### Movimiento (css/motion.css)

```css
--ease-out: cubic-bezier(.22, 1, .36, 1);
--ease-spring: cubic-bezier(.34, 1.56, .64, 1);
```

| Keyframe | Qué hace |
|---|---|
| `flotar` | translateY 0 → -10px → 0, 4s ease-in-out infinito |
| `menear` | rotate/translateX: 0 → -4°/-6px → 4°/6px → -3°/-4px → 2°/2px → 0, en 600ms |
| `vaiven` | rotate -2° ↔ 2°, 1.6s ease-in-out infinito alternate |
| `latido` | scale 1 → 1.22 → 1, 500ms con `--ease-spring` |
| `aparecer` | opacity 0 → 1 y translateY 16px → 0, 500ms con `--ease-out` |
| `parpadeo` | opacity de los destellos de 4 puntas: 0.4 ↔ 1 con un giro lento |

**Patrón "crecer y menear"** (el lenguaje de movimiento de toda la página):
- Al entrar el puntero: `scale(1.08)` con `--ease-spring`, y `menear` una sola vez.
- Mientras el puntero sigue encima: `vaiven` suave.
- Al salir: vuelve a `scale(1)` en 250ms.
- Solo dentro de `@media (hover: hover) and (pointer: fine)`.
- Pon cada transform en un elemento distinto para que no se pisen: el envoltorio externo flota (`translate`) y el interno crece y se menea (`scale`/`rotate`).
- Se aplica a los botones de entrada, los nodos 1–4, las burbujas de ícono de las estaciones, los círculos de aliados y los íconos de redes.
- Las tarjetas con texto **no se menean**. Solo crecen a `scale(1.03)` y suben 8px, porque el texto que se mueve cuesta leerlo.

Con `prefers-reduced-motion: reduce` se anulan todas las animaciones infinitas y los transforms de hover. Los estados (abierto/cerrado, activo) cambian sin animación.

## Secciones

El orden sigue los ids, que son los destinos del menú.

### 0. Navegación

- **Escritorio:** logo (`assets/logos/aprueba.png`, alto 54px) a la izquierda; enlaces al centro (La ruta → `#ruta`, Entradas → `#entradas`, Ubicación → `#ubicacion`, Aliados → `#aliados`, Contacto → `#contacto`) en blanco al 82%; a la derecha, botón naranja compacto "Regístrate gratis".
- **Al pasar 40px de scroll:** la nav queda fija arriba, con fondo `rgba(11,16,64,.85)`, `backdrop-filter: blur(12px)` y alto 72px.
- **Móvil:** logo de 44px de alto y botón hamburguesa (círculo de 44px, fondo blanco al 8%). Abre un menú a pantalla completa en navy con los enlaces grandes (Fredoka 30px) y el CTA. Bloquea el scroll del body; se cierra con ✕, con Esc o al tocar un enlace; el foco queda atrapado dentro mientras está abierto.
- **Todos los CTA genéricos** ("Regístrate", "¡Regístrate gratis…!", "Quiero mi pasaporte", "Quiero vivir la ruta"): hacen scroll suave a `#entradas` y disparan un `menear` en los dos botones de entrada como saludo. No abren otra página.

### 1. Hero (`#inicio`)

Fondo `--navy-900` con el cielo de estrellas en `<canvas>` (ver "Cielo de estrellas").

En escritorio son dos columnas: texto (unos 690px) y la ilustración del pasaporte (470×640). En móvil todo va en una sola columna y el pasaporte va al final, escalado al 80%.

**Columna de texto** (gap 26px):
1. Pastilla `--verde-400` con brújula y el overline "La ruta del estudiante" en navy.
2. Logo A+PRUEBA (`aprueba.png`, 470px de ancho en escritorio y 260px en móvil). Es el `<h1>` visual: el texto del h1 se envuelve aparte; el logo lleva `alt="A+PRUEBA"`.
3. `<h1>`: "Descubre, experimenta y define tu **futuro profesional**", con la parte resaltada en `--celeste-400`.
4. Subtítulo en lead y `--tinta-sobre-oscuro`. Hay versión de escritorio y versión corta de móvil, ambas en PROYECTO.md.
5. Botones: naranja "¡Regístrate gratis y asegura tu lugar!" (en móvil "¡Regístrate gratis!"), y fantasma con borde blanco de 2px "Ver la ruta del evento" con flecha hacia abajo → `#ruta`. En móvil van a ancho completo y apilados.
6. Chips de info (fondo blanco al 7%, borde blanco al 16%, ícono `--celeste-400`, flex-wrap): calendario "17 de noviembre", reloj "9:00 a.m. – 1:00 p.m.", pin "UCSUR · Sede Norte", personas "200 presencial · 800 virtual".

**Ilustración del pasaporte.** Constrúyela en HTML/CSS, no como imagen, porque luego se puede animar:
- **Tarjeta:** 392px de ancho, blanca, radio 28, `rotate(-5deg)`, `--sombra-pasaporte`.
- **Cabecera** `--azul-500`: overline "Pasaporte vocacional" en celeste-100, "A+PRUEBA 2026" en h3 blanco y una brújula blanca de 34px.
- **Datos:** "Titular / Tu nombre aquí" y "Modalidad / Presencial". Debajo, una línea punteada `--linea`.
- **Sellos en grilla 2×2** (cajas en `--nube-50`, radio 18, círculo de 72px):
  - Conócete: sellado, borde de 3px `--celeste-400`, fondo celeste al 16%, `rotate(-10deg)`.
  - Experimenta: sellado en verde.
  - Escucha y Valida: pendientes, con borde punteado `--linea` e ícono `--tinta-400`.
- **Fila QR** en `--celeste-100`: ícono QR en una caja blanca y el texto "Tu QR de acceso llega a tu correo al inscribirte".
- **Sticker "¡Es gratis!"** arriba a la derecha: estrella de 12 puntas de 120px en `--verde-400` (SVG inline) con borde blanco de 4px, texto Fredoka 24/24 en navy y `rotate(12deg)`.

**Decoración:**
- Planeta de 560px con degradado, opacidad 0.9, abajo a la derecha y medio fuera de la sección (300px en móvil).
- Órbita: elipse punteada blanca al 14% (820×250, `rotate(12deg)`).
- Destellos de 4 puntas en celeste, verde, blanco y naranja (14–22px) con `parpadeo`.

### 2. Entradas (`#entradas`): botones flotantes que se abren en el mismo lugar

**Esta es la interacción principal.** Reemplaza las dos tarjetas estáticas del Figma.

**Encabezado** (centrado, máximo 780px), sobre fondo `--nube-50`:
- Overline "Inscripción gratuita" en `--verde-600`.
- h2 "¡Asegura tu Pasaporte Vocacional!", salto de línea y "**Es gratis**" en `--verde-600`.
- Lead: "Elige cómo vivir A+PRUEBA el 17 de noviembre. Los cupos presenciales son limitados."

#### Estado cerrado: dos botones flotantes

Los dos van uno al lado del otro y centrados, con gap de 32px. En móvil también van en dos columnas (cada uno ocupa `calc(50% - 8px)`).

Cada botón es un `<button>` con forma de boleto:
- **Caja:** fondo blanco, radio 28, borde 1.5px `--linea`. Sombra 3D de color `0 8px 0` en `--naranja-500` (presencial) o `--azul-500` (virtual), más `--sombra-tarjeta`.
- **Muescas** semicirculares de 28px a los lados, a media altura, del color del fondo de la sección (con pseudo-elementos).
- **Contenido**, de arriba abajo:
  1. Burbuja de 56px (`--naranja-100` con ícono ticket o `--celeste-100` con ícono monitor).
  2. "Presencial" o "Virtual" en h3.
  3. "200" o "800" en Fredoka 56 del color de la modalidad, más "cupos".
  4. "Vívelo en el campus" o "Vívelo desde donde estés" en small `--tinta-600`.
  5. Pie: "Ver experiencia" con chevron hacia abajo, en el color de la modalidad.
- **Tamaño:** unos 300×230 en escritorio; en móvil el alto se ajusta al contenido, con número de 40px.
- **Reposo:** `flotar` infinito; el virtual va desfasado 2s para que nunca estén a la misma altura.
- **Hover** (puntero fino): "crecer y menear" y la sombra crece.
- **Táctil:** en `pointerdown` hace `scale(.96)`. La primera vez que la sección entra en pantalla, los dos hacen `menear` escalonado (0 y 200ms) para invitar a tocar.
- **Foco de teclado:** anillo de 3px `--celeste-400` con offset de 4px y `scale(1.04)`, sin vaivén.
- **Debajo:** "Toca una opción para ver de qué se trata", en small `--tinta-600`.

#### Al hacer clic: la entrada se abre ahí mismo

No hay cambio de página, ni modal, ni salto a otra sección.

- **Botón elegido:** se rellena de su color (`--naranja-500` o `--azul-500`), sus textos pasan a blanco, el chevron gira 180° y "Ver experiencia" pasa a "Cerrar". Hace un `latido`.
- **El otro botón:** baja a `scale(.92)` y opacidad .7, pero sigue flotando y se puede tocar para cambiar de modalidad.
- **Panel:** debajo de los botones se despliega el panel de la entrada, que debe sentirse como el boleto desplegándose:
  - Borde superior con línea punteada y muescas a los lados.
  - Un triángulo apunta al centro del botón elegido.
  - Fondo blanco, radio 28, `--sombra-tarjeta`, padding 40 (24 en móvil), ancho máximo 1000px.
  - **Escritorio**, dos columnas:
    - Izquierda: badge ("Experiencia presencial" o "Experiencia virtual"), título h3, cupos grandes, descripción y los 4 beneficios con check en burbuja de color.
    - Derecha: "Así funciona" con 3 pasos numerados, el botón de registro de Luma a ancho completo (naranja o azul), la nota debajo y el enlace para cambiar de modalidad.
  - **Móvil:** una columna con el mismo orden.
  - Todos los textos están en PROYECTO.md, sección 2.
- **Cambiar de modalidad** con el panel abierto: el contenido hace fundido y desliza 24px en la dirección del botón elegido. El panel no se cierra.
- **Cerrar** con el botón elegido, la ✕ del panel o Esc. Al cerrar, el foco vuelve al botón.
- **Animación:**
  - Altura con `display:grid; grid-template-rows: 0fr → 1fr` en 450ms con `--ease-out`.
  - Contenido con `aparecer`, retrasado 120ms.
  - Si `document.startViewTransition` existe, se puede usar para el morph, siempre con este fallback.
- **Scroll:** en móvil, solo si el panel queda fuera de pantalla, `panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' })`. Nada más se mueve.
- **ARIA:**
  - Los botones llevan `aria-expanded` y `aria-controls="panel-entrada"`.
  - El panel es `role="region"` con `aria-labelledby` apuntando a su título, que tiene `tabindex="-1"` y recibe el foco al abrir.
- **Nota final de la sección:** ícono info y "Al elegir tu entrada se abre el formulario de registro. Tu confirmación y tu QR llegan a tu correo."

### 3. Cuenta regresiva

- **Fondo y texto:** el degradado azul → celeste, todo centrado.
  - Overline "Martes 17 de noviembre · 9:00 a.m." en blanco al 90%.
  - h2 "El evento que transformará tus dudas en certeza".
- **Cajas:**
  - 4 cajas blancas (128px de ancho en escritorio, 76px en móvil), separadas por ":" en blanco al 60% (los ":" se ocultan en móvil).
  - Número en Fredoka y unidad en overline `--tinta-600`: Días, Horas, Min, Seg.
- **Párrafo:** "No busques una charla aburrida sobre carreras. Ven a **vibrar, experimentar y medir tu nivel de seguridad real** sobre lo que quieres hacer con tu vida.", con la parte resaltada en Nunito 800.
- **CTA:** naranja "Quiero mi pasaporte" → `#entradas` con saludo.
- **Lógica** (`countdown.js`):
  - Calcula contra `CONFIG.evento.inicio` y actualiza cada segundo, con dos dígitos.
  - Entre el inicio y el fin muestra "¡Está pasando ahora!"; después del fin, "¡Gracias por vivir A+PRUEBA!".
  - Las cajas llevan `aria-hidden` y aparte hay un texto oculto con `aria-live="polite"` que se actualiza solo una vez por minuto.

### 4. La ruta (`#ruta`): animada

**Fondo y encabezado:**
- Fondo `--navy-900` con cielo de estrellas.
- Encabezado centrado:
  - Overline "El recorrido" en celeste.
  - h2 "Las 4 estaciones de la", salto de línea y "**Ruta del Estudiante**" en celeste.
  - Lead "Una mañana, cuatro paradas. Al final sabrás qué tan seguro estás de tu elección." en `--tinta-sobre-oscuro`.

**Escritorio: trazo y 4 tarjetas**
- **Trazo SVG** de 1200×96:
  ```html
  <path d="M0 48 C 60 48 100 48 141 48 S 300 88 447 48 S 600 8 753 48 S 910 88 1059 48 S 1160 48 1200 48"/>
  ```
  - Trazo `--celeste-400` al 70%, grosor 3, `stroke-dasharray: 2 12` y `stroke-linecap: round`.
  - Los nodos están en x = 141, 447, 753 y 1059, centrados sobre cada tarjeta.
- **Nodos:** círculos de 68px con color propio (1 celeste, 2 verde, 3 naranja, 4 blanco), número en Fredoka 28 navy y anillo exterior de 6px `--navy-900`.
- **Tarjetas:** 282px de ancho, gap 24 y misma altura. Fondo `--navy-800`, borde 1.5px `--navy-700`, radio 24, padding 28. Contenido:
  - Burbuja de ícono de 56px (radio 18) del color de la estación, con ícono navy: brújula, llave, micrófono o diana.
  - Número "01"–"04" en Fredoka 44, blanco al 16%, alineado a la derecha.
  - Overline "Estación N" en el color de la estación.
  - Título h3 blanco.
  - Pregunta en itálica del color de la estación (en la estación 4 va en blanco).
  - Descripción en card con `--tinta-sobre-oscuro`.

**Movimiento constante:**
1. **La ruta avanza:** los puntos del trazo se desplazan sin parar animando `stroke-dashoffset` (de 0 a -14 en 1.2s, linear, infinito).
2. **Cometa:** un punto `--celeste-400` de 10px con brillo (`filter: drop-shadow`) y estela corta recorre el trazo de izquierda a derecha en 8s y vuelve a empezar.
   - Usa `path.getTotalLength()` y `getPointAtLength()` en `requestAnimationFrame`.
   - La estela son 5 círculos que siguen al cometa con retardo y opacidad decreciente.
3. **Llegada a un nodo:** cuando el cometa pasa por el centro de un nodo:
   - El nodo hace `latido` (crece a 1.22) y emite un anillo expansivo de su color (`box-shadow` de 0 a 24px, opacidad de 0.6 a 0, en 700ms).
   - Su tarjeta se ilumina 1.2s: sube 6px y su borde pasa al color de la estación.
4. **Reposo de los nodos:** `flotar` de ±6px en 3s, con delays de 0, 0.4, 0.8 y 1.2s.
5. **Hover:**
   - Sobre un nodo: "crecer y menear" (scale 1.25).
   - Sobre una tarjeta: crece a 1.03, sube 8px y su burbuja de ícono hace "crecer y menear".
   - El nodo y su tarjeta se resaltan juntos, en ambas direcciones.
6. **Entrada** (una vez, al entrar en pantalla): el trazo se dibuja de izquierda a derecha en 1.2s (una copia sólida con `stroke-dashoffset` de su largo a 0), los nodos aparecen escalonados cada 150ms con `latido`, y las tarjetas con `aparecer` escalonado.

**Móvil: línea de tiempo vertical**
- Columna izquierda de 40px con nodo de 40px y riel de 3px `--celeste-400` al 45% hasta el siguiente nodo. La tarjeta va a la derecha a ancho completo, con padding 22.
- **Movimiento constante:** los nodos flotan. Un "relleno" celeste sólido avanza por el riel según el progreso del scroll dentro de la sección (`IntersectionObserver` + scroll pasivo). Cuando llega a un nodo, el nodo hace `latido` y queda encendido con brillo.
- El cometa y el trazo horizontal no existen en móvil.

**Cierre:** CTA naranja "Quiero vivir la ruta" → `#entradas` con saludo.

### Cielo de estrellas (`starfield.js`)

- Un `<canvas>` absoluto detrás del contenido del hero y de la ruta (`pointer-events: none`, `aria-hidden`).
- **Cantidad:** área / 9000, con tope de 140 en escritorio y 60 en móvil. Radio 0.6–2px, en blanco.
- **Movimiento constante:**
  - Cada estrella titila con opacidad 0.25–0.85 siguiendo un seno con fase y período aleatorios (2–5s).
  - Deriva lenta hacia la izquierda y un poco hacia arriba (4–12 px/s) y reaparece por el otro lado.
- **Profundidad:** 3 capas con velocidades distintas.
- **Rendimiento:**
  - `devicePixelRatio` con tope de 2.
  - Se pausa cuando el canvas no está en pantalla (`IntersectionObserver`) y cuando `document.hidden`.
  - Redimensiona con `ResizeObserver`.
- **Movimiento reducido:** se dibuja una vez, estático.

### 5. Ubicación (`#ubicacion`)

- **Fondo y encabezado:** fondo blanco. Overline "Cómo llegar" en `--verde-600` y h2 "¿Dónde nos vemos?".
- **Pestañas:** pastilla `--nube-50` con borde `--linea` y dos pestañas: "Presencial" (pin) y "Virtual" (video). La activa va en navy con texto blanco.
  - Patrón ARIA de tabs: `role="tablist"`, `tab` y `tabpanel`, con flechas izquierda y derecha.
  - En móvil las pestañas ocupan el ancho completo.
- **Panel Presencial** (escritorio: info en unos 520px a la izquierda y mapa de 616×460 con radio 28 a la derecha; móvil: mapa de 250px de alto arriba y la lista debajo):
  - Lista con ícono en caja `--nube-50` de 48px:
    - "Auditorio Norte y Explanada" / "UCSUR · Sede Norte — {CONFIG.mapa.direccion}"
    - "Martes 17 de noviembre" / "9:00 a.m. – 1:00 p.m."
    - "Lleva tu QR de inscripción" / "Lo recibes en tu correo al registrarte."
  - Botón con contorno navy "Abrir en Google Maps" ↗, que usa `CONFIG.mapa.linkUrl` y abre en una pestaña nueva.
  - Mapa: `<iframe>` de Google Maps con `loading="lazy"` y `title`. Mientras `embedUrl` esté vacío, se muestra una ilustración en CSS: fondo `#E9EFFB`, calles blancas, bloques "Auditorio Norte" (azul translúcido) y "Explanada" (verde translúcido), pin naranja.
- **Panel Virtual** (no está en Figma; mismo esqueleto):
  - Lista:
    - "Transmisión exclusiva con acceso interactivo" / "Plataforma: {CONFIG.virtual.plataforma}"
    - "Martes 17 de noviembre" / "9:00 a.m. – 1:00 p.m."
    - "Tu enlace privado llega a tu correo" / "Solo para inscritos en la modalidad virtual."
    - "Qué necesitas" / "Celular o computadora con internet."
  - En lugar del mapa: una ilustración CSS de una pantalla (marco navy, badge rojo "EN VIVO", 4 burbujas de participantes de colores y la etiqueta "Sala A+PRUEBA").

### 6. Aliados (`#aliados`)

- **Fondo y encabezado:** fondo `--nube-50`. Overline "Aliados" en verde y h2 "Con el apoyo de".
- **Logos:** 6 círculos `<img>` (132px en escritorio, 98px en móvil, en filas de 3). Fondo blanco, borde 1.5px `--linea` y `--sombra-tarjeta`. En escritorio van en una fila con gap 40; en móvil, en grilla de 3 columnas con gap 18.
- **Archivos y alt:** los PNG ya vienen recortados en círculo con fondo transparente en las esquinas.
  - `face-to-face.png`: "Face to Face"
  - `lead-ucsur.png`: "LEAD UCSUR"
  - `bell.png`: "BELL"
  - `red-astrum.png`: "Red Astrum"
  - `club-tecnologia-electronica.png`: "Club de Tecnología y Electrónica"
  - `legado-stemos.png`: "Legado STEMos"
- **Hover:** "crecer y menear".

### 7. Footer (`#contacto`)

- **Fondo:** `--navy-900`. Escritorio: 3 columnas; móvil: apiladas.
- **Marca:** logo de 196px y "Descubre tu potencial antes de elegir tu camino."
- **Contacto:**
  - Overline "Dudas e informes".
  - h3 "¿Tienes preguntas? Escríbenos".
  - Botón verde con texto navy "Escríbenos por WhatsApp", que abre `https://wa.me/{numero}?text={mensaje codificado}` en una pestaña nueva.
- **Redes:**
  - Overline "Síguenos" y "Novedades antes del evento".
  - 3 círculos de 52px (fondo blanco al 8%, borde blanco al 16%) para Instagram, TikTok y Facebook, cada uno con `aria-label`.
  - Íconos en SVG inline de Simple Icons.
- **Divisor:** línea blanca al 12%.
- **Fila legal:** "© 2026 A+PRUEBA · La Ruta del Estudiante" y los enlaces "Política de privacidad" y "Términos y condiciones" (desde CONFIG.legal).

## Íconos

- Usa SVG inline de **Lucide** (lucide.dev), con trazo 2, `stroke="currentColor"` y `aria-hidden="true"`.
- Los que se usan: compass, wrench, mic, target, calendar, clock, map-pin, users, check, arrow-right, arrow-down, chevron-down, monitor, message-circle, ticket, video, external-link, info, qr-code, menu, x.
- Las marcas (Instagram, TikTok, Facebook, WhatsApp) salen de Simple Icons.

## Integración con Luma

El registro se abre como overlay de Luma en la misma página, así que no se sale de la landing.

- **Botón:** cada CTA del panel de entrada es el **botón de registro embebible de Luma**. Hay que pegar el snippet exacto que da Luma en Gestionar evento → More → *Embed Registration Button*, con su `<script>`, al final del body donde dice `<!-- LUMA SCRIPT -->`. **No inventes la URL del script.**
- **Atributos del botón:** `href` (URL del evento), `data-luma-action="checkout"` y `data-luma-event-id`.
- **Preselección:** para abrir directamente en la entrada correcta se agrega `data-luma-ticket-type="ttyp-…"` con el ID del tipo de entrada (Registration → el ticket → ⋯ → *Copy Ticket Type ID*). Genera estos atributos desde `CONFIG.luma`.
- **Estilos:** el botón se estiliza con nuestro CSS; el overlay de Luma no se puede personalizar.
- **Fallback:** si el script no está o el JS falla, el `<a href>` abre el evento de Luma en una pestaña nueva.
- **Si `CONFIG.luma.*.url` está vacío:** el botón se muestra deshabilitado con el texto "Inscripciones muy pronto".

## Accesibilidad (WCAG AA)

- `<html lang="es-PE">`, landmarks (`header`, `nav`, `main`, `section` con `aria-labelledby`, `footer`), un solo h1 y títulos en orden.
- Foco visible en todo lo interactivo (anillo de 3px `--celeste-400`) y áreas táctiles de 44×44px como mínimo.
- Contraste: aplica los ajustes de la tabla de color (verde-600, tinta-600 para texto pequeño y botones naranjas a 19px).
- Todo funciona con teclado: menú, entradas (Enter/Espacio para abrir, Esc para cerrar), pestañas (flechas) y enlaces.
- Decoración (estrellas, planeta, órbita, destellos, cometa) con `aria-hidden="true"`.
- `prefers-reduced-motion` respetado, como dice la regla 5.

## Rendimiento

- Lighthouse en móvil: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Peso total de la primera carga menor a 1.5 MB.
- **Imágenes:** logos con `width`/`height`, `loading="lazy"` fuera del hero y `decoding="async"`. Si `cwebp` está disponible, genera versiones .webp con `<picture>`.
  - Tamaños reales de los archivos, para los atributos `width`/`height`: `aprueba.png` es 1000×408 (relación 2.451:1, así que a 470px de ancho mide 192px de alto, y a 54px de alto mide 132px de ancho); los 6 logos de aliados son 264×264 cuadrados.
- **Animaciones:** solo `transform` y `opacity` (nunca top/left/width en loops). Usa `requestAnimationFrame`, y pausa todo lo que no está en pantalla.
- **Celular de gama baja:** prueba con CPU throttling 4× en DevTools; las estrellas y el cometa deben ir a 60fps o bajar de cantidad.

## SEO y compartir

Gran parte del tráfico llega por WhatsApp, así que la vista previa del enlace importa.

- `<title>`: "A+PRUEBA · La Ruta del Estudiante | 17 de noviembre"
- Meta description: "Descubre, experimenta y define tu futuro profesional. Evento gratuito para escolares: presencial en UCSUR Sede Norte o virtual. Martes 17 de noviembre, 9:00 a.m."
- Open Graph y Twitter: `og:title`, `og:description`, `og:image` (`assets/og/og-image.png`, 1200×630, pendiente; deja la ruta lista), `og:locale=es_PE` y `og:type=website`.
- `<meta name="theme-color" content="#0B1040">`.
- `favicon.svg` provisional: círculo navy con "A+" en blanco (Fredoka 700). Se reemplaza cuando haya uno oficial.

## Fases (detente al final de cada una)

1. **Estructura y estilos estáticos:** el HTML semántico de todas las secciones, `tokens.css`, `styles.css` mobile-first, íconos y logos. Sin JS. Revisa en 360, 390, 768, 1024 y 1440.
2. **Interacciones:** `config.js`, nav (fija y menú móvil), entradas (estado cerrado y abierto, cambio de modalidad, cierre, ARIA), pestañas de Ubicación, cuenta regresiva, CTAs con scroll y saludo, y Luma con placeholders.
3. **Movimiento:** `motion.css`, el patrón "crecer y menear", el flotar de los botones de entrada, el cielo de estrellas, la ruta animada (escritorio y móvil), las animaciones de entrada y `prefers-reduced-motion`.
4. **QA:** Lighthouse, recorrido completo con teclado, Safari iOS, Android con throttling, comparación de textos contra PROYECTO.md y revisión de que no quede ningún enlace roto ni texto inventado.

## Definición de terminado

- [ ] Las 7 secciones y la nav con los textos exactos de PROYECTO.md.
- [ ] Los botones de entrada flotan, crecen y se menean con hover, y abren el panel en el mismo lugar sin cambiar de página.
- [ ] Se puede cambiar de Presencial a Virtual con el panel abierto, y cerrarlo con el botón, la ✕ o Esc.
- [ ] Las estrellas se mueven sin parar, el trazo de la ruta avanza, el cometa recorre los nodos 1→4 y cada nodo crece al recibirlo.
- [ ] En móvil, la línea de tiempo se ilumina con el scroll.
- [ ] Con `prefers-reduced-motion` no hay animación infinita.
- [ ] Todo lo pendiente vive en `config.js`, y los campos vacíos se ven como "Próximamente", no como enlaces rotos.
- [ ] Lighthouse móvil cumple el presupuesto.
