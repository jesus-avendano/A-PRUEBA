# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# A+PRUEBA · Landing — instrucciones para Claude Code

## Contexto

Landing del evento **A+PRUEBA — La Ruta del Estudiante** (UCSUR, martes 17 de noviembre de 2026).
Público: escolares de secundaria que llegan desde el celular (Instagram, TikTok, WhatsApp).
Objetivo único: que entiendan el evento en 30 segundos y se inscriban en **Presencial (200 cupos)** o **Virtual (800 cupos)**.

- **Contenido y datos:** `docs/PROYECTO.md` es la fuente de verdad de textos, fechas, aliados y pendientes. No inventes textos ni datos.
- **Documentos de cambios**, cada uno con prioridad sobre los anteriores donde se contradigan:
  - v2 `docs/CAMBIOS-INTERACCION.md`: entradas, aliados, ruta y nav.
  - v3 `docs/CAMBIOS-RUTA-HERO.md`: ruta, hero, textos y ubicación.
  - v4 `docs/CAMBIOS-VIDEO-AGENDA.md`: video de fondo en Entradas y la agenda (que después se quitó, ver abajo).
  - v5 `docs/CAMBIOS-CARRUSEL-VIDEO.md`: carrusel 3D en la ruta, video del hero sin pixelado y Entradas sin leyenda.
  - **v6 `docs/CAMBIOS-PORTAL-FONDO.md` (la más alta):** el carrusel abre cada estación en un portal, fondo de
    partículas en la ruta y arcos entre secciones oscuras y claras.
- **Cambios del 18 de octubre** (mandan sobre todos los documentos, también la v6): el hero
  ya no tiene el pasaporte, ni la ola de colores en "futuro profesional", ni el cielo de estrellas con el
  planeta: pasa a pantalla completa con el video del campus de fondo y el texto centrado. Los videos de fondo
  no tienen botón de pausa. Las secciones se funden entre sí en vez de cortarse en línea recta. Y **no hay
  agenda**: "Quiero vivir la ruta" baja a Entradas como los otros CTA. La v6 se escribió suponiendo que la agenda
  seguía (habla de pausar el video "con la agenda abierta" y de conservar `starfield.js` para ella): eso no
  aplica. El detalle está en las decisiones de abajo.
- **Diseño de referencia:** Figma `(link de Figma: no va en el repositorio)` (frames "Landing · Escritorio 1440", "Landing · Móvil 390" y "Componentes"). **No lo leas salvo que algo no esté claro aquí**: la cuenta tiene un límite bajo de lecturas por MCP (unas 20 al mes). Todo lo necesario está en este archivo.
- **Registro:** Luma. No hay base de datos ni formulario propio.
- **Publicación:** martes 20 de octubre de 2026.

## Estado actual

**Terminado**, con los cambios v2 a v6 y los cambios del 18 de octubre. Falta solo lo que depende de
datos, de decisiones pendientes o de aparatos reales (abajo).
Archivos: `index.html`, `favicon.svg`, `css/` (`tokens.css`, `styles.css`, `motion.css`), `js/`
(`config.js`, `main.js`, `dialog.js`, `enlaces.js`, `nav.js`, `hero.js`, `video.js`, `entradas.js`,
`countdown.js`, `ruta.js`, `carrusel.js`, `tabs.js`, `aliados.js`), `assets/img/` (`sede-norte.{webp,jpg}` y
`ruta/`), `assets/video/` y `assets/og/og-image.png` (provisional).

**QA (último, 18 de octubre, con la v6):**

- **Lighthouse:** móvil 99 en rendimiento y 100 en accesibilidad, buenas prácticas y SEO (FCP 1.2 s,
  LCP 2.2 s, TBT 0 ms, CLS 0.001; el LCP es el texto del hero); escritorio 100 en las cuatro. Se mide con el
  servidor comprimiendo, como cualquier hosting: sin compresión, rendimiento en móvil baja bastante.
- **Peso:** **1,253 KiB en móvil** (presupuesto de 1.5 MB), y 1,856 KiB en escritorio. Lo más pesado en móvil:
  el video del campus (578 KB), la foto de la sede (286 KB) y el auditorio (146 KB). Lighthouse emula una
  conexión lenta, y ahí Chrome empieza a cargar lo `lazy` desde 2500px y no desde 1250px como en 4G: por eso
  entran la foto de la sede y el cuadro quieto de la ruta (13 KB). El carrusel, sus fotos y el video de la ruta
  no entran; el mapa tampoco (ver decisiones).
- **Chrome y WebKit (el motor de Safari), con Playwright:** 35 corridas automáticas en 360, 390, 768, 1024 y
  1440, con y sin movimiento reducido y táctil. Cubren el portal desde las 4 fotos y desde una lateral, el
  cierre con ✕, Esc y clic afuera, el foco y el teclado (Tab al carrusel, flechas que anuncian, Enter), la nav
  y el menú móvil, las pestañas de Ubicación, los boletos, los aliados, la foto de la sede, los CTA, la cuenta
  regresiva y el fondo de la ruta (carga diferida, pausa fuera de pantalla, cuadro quieto con movimiento
  reducido). Sin errores de JS ni recursos rotos, sin scroll horizontal y con áreas táctiles de 44px. Sin JS,
  las estaciones se ven en grilla. WebKit decodifica los MP4 del fondo de la ruta (nivel 5.0 y 4.0) y les da la
  vuelta. Ojo: en Safari el Tab, por defecto, no pasa por enlaces ni botones; con Opción+Tab (o con "Resaltar
  cada elemento con Tab") el recorrido llega a todo, en orden y con foco visible.
- **Gama baja:** con la CPU 4× más lenta, el carrusel y el fondo de la ruta van a 60 fps sin cuadros largos,
  en 390 y en 1440.

**Lo que queda pendiente de verdad:**

- **Un iPhone y un Android reales.** El bloqueo de scroll con el dedo cuando hay un diálogo o el menú abierto
  (`overflow: hidden` en `<html>`; iOS dice respetarlo desde la versión 16, pero falta verlo); arrastrar el
  carrusel con el dedo sin que se trabe el scroll vertical; el 3D del carrusel y el desenfoque detrás de los
  diálogos en Safari (Playwright no los dibuja en sus capturas de WebKit, ver "Comandos"); y que el loop de 2 s
  del fondo de la ruta no dé tirones en Safari. WebKit en la Mac no puede simular el arrastre del dedo.
- **Datos de `docs/PROYECTO.md` (sección 8):** Luma (URL, IDs y el snippet del script donde dice
  `<!-- LUMA SCRIPT -->`), WhatsApp, redes, legales, el embed oficial del mapa (el actual es
  provisional), el texto real de cada aliado (hoy es lorem ipsum en `CONFIG.aliados`) y el favicon oficial.
- **El dominio:** con él, `og:image` y `twitter:image` pasan a URL absolutas y se agrega `og:url`
  (está anotado en el `<head>`).
- **El video del campus en 1080p.** El de hoy es un 360p de YouTube estirado: ya no se pixela, pero nunca se va
  a ver HD. El video es de UCSUR; hay que pedir el original (cómo procesarlo: `CAMBIOS-CARRUSEL-VIDEO.md`, A2).
  Está recortado a 20.4 s: los 55 s completos se pasan del presupuesto en celular.
- **Las fotos de la ruta** (`assets/img/ruta/`) son provisionales, vienen de internet: falta confirmar que se
  pueden usar. Si llegan fotos propias, se reemplazan con el mismo nombre y 560×560.
- **Textos por aprobar:** la pista "Toca una foto para descubrir cada estación" (propuesta en la v6).
- **Opcional, la foto de la sede:** `sede-norte.webp` pesa 286 KB y en la polaroid se ve a 210px. Una miniatura
  para la polaroid (y la grande solo en el diálogo) bajaría el peso en móvil unos 250 KB.
- **Antes de publicar, sacar `assets/video/117606-712421887.mp4` de la carpeta:** es el original 4K del fondo de
  la ruta (18 MB). No está en git ni lo usa la página, pero se subiría al hosting si se publica la carpeta.

Decisiones que conviene no deshacer sin querer:

- **Las fuentes no bloquean.** La hoja de Google Fonts se carga con `media="print"` y se activa al
  llegar, porque una hoja externa bloquea la ejecución de los módulos: si Google Fonts tarda, la
  página se queda sin JS. Hay `<noscript>` de respaldo.
- **El iframe del mapa va con `tabindex="-1"`:** si no, el Tab recorre decenas de controles de Google
  antes de salir. Con teclado, la dirección está en texto y "Abrir en Google Maps" da el mapa completo.
- **El iframe del mapa se crea recién con Ubicación a 400px** (`js/main.js`), no solo con `loading="lazy"`: en
  conexiones lentas Chrome carga lo `lazy` desde 2500px, y desde que la ruta de la v6 es más corta, Ubicación
  quedó a unos 2200px de la primera pantalla. El mapa metía unos 450 KB de scripts de Google en la primera
  carga y el peso en móvil llegaba a 1.71 MB. Mientras tanto se ve la ilustración CSS del mapa.
- **Las entradas se abren en `#dialogo-boleto`** (variante `ticket` de `js/dialog.js`), que crece desde
  el boleto con FLIP. **Al tocar el botón de Luma el diálogo se cierra al instante:** un `<dialog>` modal
  vive en el top layer, por encima de cualquier z-index, y deja inerte todo lo de fuera; el overlay de
  Luma quedaría tapado y sin poder usarse. Está probado con un overlay falso de z-index máximo.
- **Un transform por elemento.** El boleto (`<button>`) flota y lleva el anillo de foco; `.boleto__forma`
  lleva la sombra con `drop-shadow`; `.boleto__interior` es el boleto blanco: crece, menea y tiene las
  muescas como huecos reales (`mask`). La `mask` recorta cualquier `box-shadow`, por eso la sombra va
  en el envoltorio. Todas las escalas se componen con la variable `--escala`, así el hover y el saludo no se pisan.
- **La clase `saluda` de los boletos se quita al terminar su `menear`.** Si se queda, el hover encuentra
  su `menear` "ya terminado" en la misma posición de la lista y no lo repite (el boleto crece pero no menea).
- **Hero (18 oct):** pantalla completa (`min-height: 100svh`) con el video del campus de fondo, un velo azul
  marino (más oscuro arriba, por la nav) y el texto centrado.
  Ya no hay pasaporte, ni ola, ni brillo de colores: "futuro profesional" queda en celeste fijo y
  `js/hero.js` solo divide el título en palabras para su entrada. Tampoco hay cielo de estrellas,
  destellos, planeta ni órbita. El cielo de estrellas (`starfield.js`) ya no existe en ninguna sección.
- **La ruta: un carrusel 3D de fotos que abre cada estación en un portal** (v5 y v6; detalle en "Secciones"):
  - `js/carrusel.js` es CircularCarousel de React Bits portado a JS puro, solo con el preset `cylinder`.
    **Conserva los nombres de las opciones y de las clases (`.circular-carousel__*`) del original**, para
    compararlo y pegar valores del configurador de React Bits; es código de terceros portado, no se traduce. Lo
    que cambia respecto del original está comentado al inicio del archivo. Un arreglo propio: con movimiento
    reducido las flechas giraban sin anunciar (`announce` se marcaba después de pintar).
  - **El carrusel es el control accesible** (opción `label`): grupo enfocable, las flechas giran de a una
    estación y una región `aria-live` la anuncia, Enter abre la de adelante. No hay pestañas ni panel (la v5
    los tenía; la v6 los quitó, con los números sobre las fotos).
  - **El portal crece con escala uniforme y `clip-path`, no con el FLIP de los boletos** (que escala distinto a
    lo ancho y a lo alto y estiraría la foto cuadrada): la caja arranca calzada sobre la tarjeta, recortada a su
    foto, y crece hasta su lugar (`pegado()` en `js/dialog.js`). Por eso la caja lleva `transform-origin: 0 0`.
    Si al cerrar la caja está desplazada (celular), la foto ya no calza y sale con un fundido.
  - El portal copia el contenido del `<article>` de la estación: no hay textos duplicados. Las estaciones siguen
    en el HTML, en grilla sin JS y ocultas con JS. `<dialog>` trae `color: CanvasText` (negro): el portal
    necesita su propio color.
  - Abrir una estación apaga el giro automático hasta que la sección sale de pantalla y vuelve.
  - 4 tarjetas en celular y 8 desde 768px (cada foto dos veces), con la velocidad a la mitad: así cada
    estación queda unos 5 s adelante en los dos casos. Con 4 tarjetas en escritorio el cilindro parece una caja
    chica; con 8 en celular la foto de adelante quedaría en 140px.
  - `fadeColor` y `--cc-inner-color` en navy (el original usa gris y negro, que sobre navy lavaban las fotos).
  - El carrusel y sus fotos se importan con `import()` recién cuando la sección está a 600px: la primera carga
    no suma ni un byte. Al cruzar los 768px se rearma en la misma estación (si el portal está abierto, al cerrarlo).
  - **El carrusel va en un hijo del escenario**, no en el escenario: `.circular-carousel` lleva `width: 100%` y
    le pisaría el ancho a sangre del celular.
  - Con el portal abierto, el carrusel queda suspendido y los videos, pausados (`suspenderVideo()`): el
    `IntersectionObserver` no se entera de que algo los tapa.
- **Videos de fondo** (`js/video.js`, `<video class="video-fondo" data-fondo>`): el campus en el hero, el
  auditorio en Entradas y las partículas en la ruta. Cada uno trae sus fuentes en atributos: en celular (menos
  de 768px) `data-movil-webm` si existe y el navegador lee VP9, y si no `data-movil`; en escritorio, `data-webm`
  o `data-escritorio`. El del hero se pide cuando la página terminó de cargar (`data-carga="al-cargar"`), para
  no competir con la primera pantalla; los otros, cuando su sección está a 300px. Se pausan fuera de pantalla,
  con la pestaña oculta y con el portal de una estación abierto; con movimiento reducido o ahorro de datos no se
  cargan y queda el poster (en la ruta, su cuadro quieto). **No tienen botón de pausa
  (18 oct).** Ojo: un video en bucle de más de 5 s sin forma de pausarlo no cumple el criterio 2.2.2 de WCAG
  (nivel A); lo mitiga que con movimiento reducido no se reproducen. Lighthouse no lo mide.
- **Archivos de video** (`assets/video/`). Los originales no los carga la página: `videoplayback.mp4` (campus,
  360p de YouTube, 55 s, con audio) y `auditorio-original.webm` (848×384, 7 s). Nunca se recodifica un archivo
  sobre sí mismo. Los comandos para regenerar todo están en `CAMBIOS-CARRUSEL-VIDEO.md` (A2 y A3) y
  `CAMBIOS-PORTAL-FONDO.md` (Fase A).
  - **Campus y auditorio, a la resolución del original** (v5): en el hero a pantalla completa, las versiones
    achicadas se estiraban ×3 y el VP9 con pocos bits se deshacía en bloques. Ahora: `campus.webm` 640×360 y
    1.33 MB, `campus-movil.webm` 256×360 y 592 KB (la franja central: en vertical el 16:9 se recorta y solo se ve
    el centro), con sus `.mp4` de respaldo (H.264 High, 1.68 MB y 742 KB) y `campus-poster.jpg`. Con un denoise
    suave (`hqdn3d`) y **recortado a los primeros 20.4 s**: el corte cae en un barrido borroso del dron, así el
    salto del loop casi no se nota. Auditorio: `auditorio.webm` 640×290 (320 KB), `auditorio.mp4` (250 KB) y
    `auditorio-movil.mp4`, que **es la franja central de 256×360 (149 KB) y no el cuadro entero**: entero, en
    celular se pasaba del presupuesto.
  - VP9 pesa un 30 a 55% menos que H.264 con la misma calidad; el MP4 queda para quien no lea WebM
    (probablemente el iPhone). Keyframe cada 2 s (`-g 48`), índice al inicio y `setsar=1` (sin píxeles no
    cuadrados). **En los WebM, los Cues (el índice para saltar) solo apuntan a bloques que empiezan con
    keyframe:** saltar a uno que no, da error de decodificación en Chrome.
  - **El fondo de la ruta es solo MP4** (v6): el original (4K, 20 s) es una animación de 12 cuadros repetida, así
    que basta con **2 s exactos** (60 cuadros, 5 vueltas; con 0.4 s Chromium tironeaba en cada vuelta). Con
    `ref=12` cada cuadro se copia del idéntico de la vuelta anterior: 173 KB a 1080p (nivel 5.0) y 63 KB en
    celular (540×960, nivel 4.0), contra 420 KB en VP9, que además se comía las partículas. **El navy va dentro
    del archivo** (mezclado en modo "screen" con `--navy-900`). Medido en Chrome: cada vuelta repite uno o dos
    cuadros (67 a 83 ms en vez de 33), cada 2 s; si se nota, se puede regenerar con 4 o 6 s desde el original
    para que pase la mitad o un tercio de veces (el peso casi no cambia, por el `ref=12`).
  - **El cuadro quieto del fondo de la ruta va en un `<img loading="lazy">`** debajo del video, no en `poster`,
    que se pediría con la página aunque la ruta quede lejos. Al fondo de la ruta no se le aplica el desenfoque ni
    la escala de `.video-fondo`: borrarían las partículas.
  - Safari exige que el servidor responda por rangos de bytes para reproducir video; cualquier hosting lo hace.
- **Las secciones se unen sin saltos (18 oct y v6).** Entre secciones de luminosidad parecida, un degradado:
  el token `--fundido` (48px en celular, hasta 88px) es su alto, y cada borde lleva en el fondo de la sección un
  degradado del color de su vecina: el contador arriba y abajo (navy) y Aliados arriba (blanco). El fondo de la
  ruta se desvanece arriba y abajo con `mask-image`. **Del hero a Entradas el paso casi no se nota**:
  los velos solo llegan al 90% en el borde que comparten, y cada video se desvanece ahí con
  `mask-image`, así las dos imágenes se cruzan sin franja oscura ni línea recta. Abajo, Entradas sí termina en
  navy puro, para fundirse con el contador.
  **Entre una sección oscura y una clara, un arco** (v6): un degradado entre navy y blanco pasa por un gris de
  neblina. En Ruta → Ubicación y Aliados → Pie, la sección de abajo sube como un horizonte: un `::before` de
  `--arco` de alto (28 a 56px) justo encima de ella, con un degradado elíptico (ancho 150% de la franja, sube
  `--arco` en el medio y toca el borde a los costados). **No con un pseudo-elemento más ancho que la pantalla y
  `border-radius`:** da scroll horizontal. **Si cambia el orden o el color de una sección, hay que revisar las
  uniones de sus vecinas.**
- **Sin agenda (18 oct):** se quitó la agenda a pantalla completa (v4) con su JS, su CSS, la variante de
  `dialog.js` y `CONFIG.agenda`. "Quiero vivir la ruta" baja a Entradas y los boletos saludan, como los otros CTA.
  Está en `PROYECTO.md` con "No volver a ponerla".
- **`js/tabs.js` solo maneja las `.pestanas` de Ubicación.** Antes tomaba cualquier `role="tablist"`: con las
  pestañas de la ruta de la v5 les cambiaba el color y les ocultaba los paneles.
- **La nav** alterna `.nav--fija` con un listener de scroll directo, sin `requestAnimationFrame`.
- **Los enlaces que dependen de CONFIG salen del HTML como `<span role="link" aria-disabled="true">`**,
  no como `<a>` sin `href` (Lighthouse marca `aria-disabled` en un `<a>` sin `href`). `enlazar(el, url)`
  de `js/enlaces.js` lo cambia a `<a href>` con pestaña nueva cuando hay URL, y de vuelta a `<span>`
  cuando no. Como el elemento se reemplaza, hay que quedarse con el que devuelve. Sin URL llevan
  `title="Próximamente"`, y si son botones además cambian su texto.
- **Los botones naranjas van siempre a 19px ExtraBold**, también el compacto de la nav: blanco sobre
  naranja (3.1:1) solo cumple AA como texto grande.
- **El hosting tiene que comprimir** (brotli o gzip). Netlify, Vercel, Cloudflare Pages y GitHub Pages lo
  hacen solos.

## Comandos

No hay package.json, ni build, ni linter, ni tests: es un sitio estático y se abre tal cual.

**Para ver la página:** `npx serve .` en la carpeta del proyecto y abrir **http://localhost:3000**. No se
abre con doble clic en `index.html`: desde `file://` los módulos no cargan y la página queda sin JavaScript.
**Desde el celular u otro equipo en el mismo wifi:** `http://<IP de la Mac>:3000` (en la Mac: `ipconfig getifaddr
en0`; `npx serve` también la muestra como "Network"). `localhost` en el celular es el propio celular. Si aun así
no entra, la red suele tener aislamiento entre dispositivos (redes de invitados o de universidades).

```bash
npx serve .                      # servidor local → http://localhost:3000
npx lighthouse http://localhost:3000 --preset=desktop --view
npx lighthouse http://localhost:3000 --form-factor=mobile --view   # el presupuesto se mide en móvil
npx playwright@1.63.0 install webkit                                 # una vez: el motor de Safari
npx playwright@1.63.0 open --device="iPhone 13" http://localhost:3000   # la página en WebKit, como iPhone
```

**No uses `python3 -m http.server` para probar esto.** Con todos los módulos pidiéndose a la vez deja caer
peticiones cada tantas cargas: el grafo de módulos falla entero y la página se queda estática, sin ningún
error visible. Cuesta horas de depuración. `npx serve` (o cualquier servidor decente) no tiene el problema.

**Lo que tiene que cumplir cualquier servidor (local o el hosting).** `npx serve` lo cumple; está probado:
- **El tipo correcto por archivo, también en la raíz.** Si `/` sale como `application/octet-stream` en vez de
  `text/html`, el navegador descarga la página en vez de mostrarla. Pasó el 18 de octubre con un servidor
  de pruebas que calculaba el tipo con la ruta pedida (`/`) y no con el archivo entregado (`index.html`).
  También `video/webm` y `video/mp4` para los videos.
- **Rangos de bytes** (`Accept-Ranges`, respuesta 206): sin eso Safari no reproduce los videos.
- **Compresión** brotli o gzip: sin ella el rendimiento en móvil baja bastante.

**Al probar con Playwright (o mirar capturas), ojo con esto, que no son errores de la página:**
- **Las capturas de WebKit no dibujan 3D ni `backdrop-filter`:** el carrusel sale plano (y por dentro) y el fondo
  de los diálogos sin desenfoque, con o sin ventana. Un cubo 3D mínimo sale igual. La geometría sí está bien:
  `getBoundingClientRect` y `elementFromPoint` del carrusel coinciden con los de Chrome (1px de diferencia
  como máximo). Para ver el 3D en Safari hace falta un Safari real.
- **WebKit sin ventana corre a 6–8 cuadros por segundo** en toda la página (también en el hero). Las pruebas que
  dependen del tiempo (el giro del carrusel, cuánto tarda en asentarse) fallan ahí aunque todo esté bien. El
  rendimiento se mide en Chrome.
- En Chrome, una captura más alta que la ventana (`captureBeyondViewport`) puede sacar el carrusel vacío.
  Captura solo lo visible.
- Sin JavaScript, Chrome carga de una las imágenes `loading="lazy"`: no sirve para medir la primera carga.
- Los boletos flotan sin parar: Playwright espera a que se queden quietos para hacer clic. Usa `force: true`.

- `cwebp` **no está instalado**. Si se quieren versiones .webp de los logos: `brew install webp`, y si no se instala, se dejan los PNG (pesan 120 KB en total, muy por debajo del presupuesto de 1.5 MB).
- `ffmpeg` tampoco está instalado (ni Homebrew). Para los videos se usó `ffmpeg-static` de npm en una carpeta temporal.
- Para la verificación manual de cada fase: abrir el servidor local y revisar en 360, 390, 768, 1024 y 1440 px, con y sin `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature).

## Reglas

1. Usa HTML, CSS y JavaScript puro con ES modules. No uses frameworks, Tailwind, jQuery, librerías de animación ni paso de build.
2. Trabaja mobile-first. La página debe verse bien en 360, 390, 768, 1024 y 1440 px.
3. Copia los textos exactos de `docs/PROYECTO.md`. Si falta un dato, pon `[POR CONFIRMAR]` o déjalo en `js/config.js`. Nunca inventes direcciones, números ni enlaces.
4. Todo lo configurable (fechas, Luma, WhatsApp, redes, mapa) vive en `js/config.js`.
5. Respeta `prefers-reduced-motion: reduce`. Con esa preferencia se apagan el flotar, el menear, el giro solo del carrusel y los videos de fondo, pero los cambios de estado siguen funcionando.
6. Cumple los requisitos de accesibilidad y el presupuesto de rendimiento de las secciones de abajo.
7. Trabaja por las fases del final. Al terminar cada fase detente, resume qué hiciste y explica cómo verlo.
8. Los ES modules no cargan desde `file://`. Para probar usa `npx serve .` o Live Server.

## Estructura de archivos

```
/
├── index.html
├── favicon.svg
├── css/
│   ├── tokens.css      variables: color, tipografía, espacios, radios, sombras, movimiento, --fundido, --arco
│   ├── styles.css      base, layout, componentes y secciones (al final, el CSS del carrusel)
│   └── motion.css      keyframes, estados de animación y prefers-reduced-motion
├── js/
│   ├── config.js       datos editables (ver abajo)
│   ├── main.js         arranque: aplica CONFIG al DOM, inicializa módulos y conecta los CTA
│   ├── dialog.js       sistema de diálogos: boleto, portal de estación, aliado y foto; bloqueo de scroll
│   ├── enlaces.js      enlaces que dependen de CONFIG: <a> con URL, <span> deshabilitado sin ella
│   ├── nav.js          nav fija + menú móvil
│   ├── hero.js         entrada del título palabra por palabra
│   ├── video.js        videos de fondo: campus (hero), auditorio (Entradas) y partículas (ruta)
│   ├── entradas.js     boletos Presencial/Virtual que abren su diálogo; botones de Luma
│   ├── countdown.js    cuenta regresiva
│   ├── ruta.js         la ruta: arma el carrusel y abre cada estación en el portal
│   ├── carrusel.js     carrusel 3D (CircularCarousel de React Bits, portado); se importa al acercarse
│   ├── tabs.js         pestañas Presencial/Virtual de Ubicación
│   └── aliados.js      panel de cada aliado
├── assets/
│   ├── logos/          aprueba.png + 6 aliados (ya recortados en círculo)
│   ├── img/            sede-norte.webp y .jpg (la foto de Ubicación); ruta/ con las 4 fotos de las estaciones
│   ├── video/          campus (hero), auditorio (Entradas) y fondo-ruta (ruta): originales y versiones livianas
│   └── og/             og-image.png (provisional)
└── docs/
    ├── PROYECTO.md                 textos, datos y pendientes (fuente de verdad)
    ├── CAMBIOS-INTERACCION.md      v2: entradas, aliados, ruta y nav
    ├── CAMBIOS-RUTA-HERO.md        v3: ruta, hero, textos y ubicación
    ├── CAMBIOS-VIDEO-AGENDA.md     v4: video en Entradas y agenda (la agenda se quitó)
    ├── CAMBIOS-CARRUSEL-VIDEO.md   v5: carrusel en la ruta, video del hero y Entradas
    ├── CAMBIOS-PORTAL-FONDO.md     v6: portal de las estaciones, fondo de la ruta y uniones
    └── referencia/                 el CircularCarousel original, las conexiones probadas y capturas
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

El `config.js` real tiene además `mapa.referencia` y `aliados` (nombre, descripción, qué ofrece y redes de cada
aliado). Ver los comentarios del archivo.

## Tokens (css/tokens.css)

### Color

| Variable | Hex | Uso |
|---|---|---|
| `--navy-900` | `#0B1040` | fondo de hero, ruta y footer; texto principal sobre claro |
| `--navy-800` | `#141C57` | tarjetas sobre fondo oscuro |
| `--navy-700` | `#26327A` | bordes sobre oscuro |
| `--azul-500` | `#2457E6` | botón virtual, acentos, degradado |
| `--azul-600` | `#16399A` | sombra 3D del botón azul, texto sobre celeste-100 |
| `--celeste-400` | `#3EC6F2` | acento sobre oscuro, estación 1, anillo de foco |
| `--celeste-100` | `#E2F6FD` | fondos suaves de lo virtual |
| `--verde-400` | `#7ED348` | super-titular, estación 2, botón WhatsApp |
| `--verde-600` | `#357A17` | overlines verdes sobre claro (en Figma era `#3E8E1C`; se oscurece por contraste) |
| `--verde-100` | `#EAF8DF` | fondos suaves |
| `--naranja-500` | `#EE6C14` | botón principal, número 200, estación 3 |
| `--naranja-700` | `#B44C06` | sombra 3D del botón naranja, texto sobre naranja-100 |
| `--naranja-100` | `#FFEBDC` | fondos suaves de lo presencial |
| `--blanco` | `#FFFFFF` | estación 4 |
| `--nube-50` | `#F4F7FF` | fondo de secciones claras alternas |
| `--linea` | `#DCE3F4` | bordes y divisores sobre claro |
| `--tinta-600` | `#4A5482` | texto secundario sobre claro, **incluido el texto pequeño** |
| `--tinta-400` | `#8A93B8` | solo íconos y estados deshabilitados (no pasa contraste en texto pequeño) |
| `--tinta-sobre-oscuro` | `#C3CCF0` | texto secundario sobre navy |

- **Degradado del contador:** `linear-gradient(90deg, #2457E6, #3EC6F2)`.
- **Color de cada estación:** las clases `.estacion--1` a `.estacion--4` definen `--color` (celeste, verde,
  naranja y blanco); `js/ruta.js` lo lee con `getComputedStyle` para el portal.
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
- **Uniones entre secciones:** `--fundido` (48 a 88px, el degradado) y `--arco` (28 a 56px, el arco).
- **Radios:**
  - Botones y chips de pastilla: 999px
  - Tarjetas de entrada, diálogos y el portal: 28px
  - Tarjetas de estación: 24px
  - Fotos del carrusel: 12px
  - Cajas del contador: 20px
  - Chips de info: 16px
- **Sombras:**
  - `--sombra-tarjeta: 0 16px 40px rgba(11,16,64,.10)`
  - `--sombra-pasaporte: 0 24px 48px rgba(0,0,0,.35)` (el mismo valor lleva el portal de las estaciones)
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

El giro del carrusel y el crecimiento del portal no están en `motion.css`: los hace el JS
(`requestAnimationFrame` en `js/carrusel.js` y Web Animations en `js/dialog.js`).

**Patrón "crecer y menear"** (el lenguaje de movimiento de toda la página):
- Al entrar el puntero: `scale(1.08)` con `--ease-spring`, y `menear` una sola vez.
- Mientras el puntero sigue encima: `vaiven` suave.
- Al salir: vuelve a `scale(1)` en 250ms.
- Solo dentro de `@media (hover: hover) and (pointer: fine)`.
- Pon cada transform en un elemento distinto para que no se pisen: el envoltorio externo flota (`translate`) y el interno crece y se menea (`scale`/`rotate`).
- Se aplica a los botones de entrada, los círculos de aliados y los íconos de redes.
- Las tarjetas con texto **no se menean**, porque el texto que se mueve cuesta leerlo.

Con `prefers-reduced-motion: reduce` se anulan todas las animaciones infinitas y los transforms de hover. Los estados (abierto/cerrado, activo) cambian sin animación.

## Secciones

El orden sigue los ids, que son los destinos del menú.

### 0. Navegación

- **Escritorio:** logo (`assets/logos/aprueba.png`, alto 54px) a la izquierda; enlaces al centro (La ruta → `#ruta`, Entradas → `#entradas`, Ubicación → `#ubicacion`, Aliados → `#aliados`, Contacto → `#contacto`) en blanco al 82%; a la derecha, botón naranja compacto "Regístrate gratis".
- **Al pasar 40px de scroll:** la nav queda fija arriba, con fondo `rgba(11,16,64,.85)`, `backdrop-filter: blur(12px)` y alto 72px.
- **Móvil:** logo de 44px de alto y botón hamburguesa (círculo de 44px, fondo blanco al 8%). Abre un menú a pantalla completa en navy con los enlaces grandes (Fredoka 30px) y el CTA. Bloquea el scroll del body; se cierra con ✕, con Esc o al tocar un enlace; el foco queda atrapado dentro mientras está abierto.
- **Todos los CTA** ("Regístrate", "¡Regístrate gratis…!", "Quiero mi pasaporte", "Quiero vivir la ruta"): hacen scroll suave a `#entradas` y disparan un `menear` en los dos botones de entrada como saludo. No abren otra página.

### 1. Hero (`#inicio`)

> **Reemplazado el 18 de octubre:** ya no hay pasaporte, ni dos columnas, ni ola de colores, ni estrellas,
> destellos o planeta. El hero es de
> pantalla completa, con el video del campus de fondo y el texto centrado (ver "Estado actual"). Lo de
> abajo queda como referencia de los textos y los tamaños del título.

En escritorio eran dos columnas: texto (unos 690px) y la ilustración del pasaporte (470×640). Hoy el texto va centrado en una sola columna.

**Columna de texto** (gap 26px):
1. Pastilla `--verde-400` con brújula y el overline "La ruta del estudiante" en navy.
2. Logo A+PRUEBA (`aprueba.png`, 470px de ancho en escritorio y 260px en móvil). Es el `<h1>` visual: el texto del h1 se envuelve aparte; el logo lleva `alt="A+PRUEBA"`.
3. `<h1>`: "Descubre, experimenta y define tu **futuro profesional**", con la parte resaltada en `--celeste-400`.
4. Subtítulo en lead y `--tinta-sobre-oscuro`. Hay versión de escritorio y versión corta de móvil, ambas en PROYECTO.md.
5. Botones: naranja "¡Regístrate gratis y asegura tu lugar!" (en móvil "¡Regístrate gratis!"), y fantasma con borde blanco de 2px "Ver la ruta del evento" con flecha hacia abajo → `#ruta`. En móvil van a ancho completo y apilados.
6. Chips de info (fondo blanco al 7%, borde blanco al 16%, ícono `--celeste-400`, flex-wrap): calendario "17 de noviembre", reloj "9:00 a.m. – 1:00 p.m.", pin "UCSUR · Sede Norte", personas "200 presencial · 800 virtual".

### 2. Entradas (`#entradas`): botones flotantes que se abren en el mismo lugar

> **Actualizado:** desde la v2 cada boleto abre su diálogo (`#dialogo-boleto`), no un panel debajo. Desde la
> v4 la sección es oscura, con el video del auditorio de fondo, y las muescas de los boletos son huecos
> reales (`mask`). Desde el 18 de octubre no tiene botón de pausa, y desde la v5 no tiene la leyenda "Así es el
> Auditorio Norte" (no volver a ponerla). Los textos de abajo siguen valiendo.

**Esta es la interacción principal.** Reemplaza las dos tarjetas estáticas del Figma.

**Encabezado** (centrado, máximo 780px):
- Overline "Inscripción gratuita" en `--verde-600`.
- h2 "¡Asegura tu Pasaporte Vocacional!", salto de línea y "**Es gratis**" en `--verde-600`.
- Lead: "Elige cómo vivir A+PRUEBA el 17 de noviembre. Los cupos presenciales son limitados."

#### Estado cerrado: dos botones flotantes

Los dos van uno al lado del otro y centrados, con gap de 32px. En móvil también van en dos columnas (cada uno ocupa `calc(50% - 8px)`).

Cada botón es un `<button>` con forma de boleto:
- **Caja:** fondo blanco, radio 28, borde 1.5px `--linea`. Sombra 3D de color `0 8px 0` en `--naranja-500` (presencial) o `--azul-500` (virtual), más `--sombra-tarjeta`.
- **Muescas** semicirculares de 28px a los lados, a media altura (huecos reales con `mask`).
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
- **Debajo:** "Toca una opción para ver de qué se trata".

#### Al hacer clic: el diálogo del boleto

El boleto crece con FLIP hasta `#dialogo-boleto` con la experiencia de su modalidad (todos los textos están en
PROYECTO.md, sección 2): badge, título, cupos, descripción, los 4 beneficios, "Así funciona" con 3 pasos, el
botón de registro de Luma, la nota y el enlace para cambiar de modalidad. Cambiar de modalidad con el diálogo
abierto hace un fundido con 24px de deslizamiento. Se cierra con la ✕, con Esc o tocando afuera, y el foco
vuelve al boleto.

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

### 4. La ruta (`#ruta`): el carrusel abre las estaciones

> **v5 y v6** (`CAMBIOS-CARRUSEL-VIDEO.md` y `CAMBIOS-PORTAL-FONDO.md`). Ya no hay trazo, cometa, riel, nodos,
> modo enfoque, pestañas ni panel: el carrusel de fotos es la navegación. Las decisiones están en "Estado actual".

- **Fondo:** el video de partículas de colores (`fondo-ruta`), con el navy dentro del archivo y su cuadro quieto
  en un `<img lazy>` debajo. Se desvanece arriba y abajo con `mask-image`.
- **Encabezado** centrado: overline "El recorrido" en celeste; h2 "Las 4 estaciones de la", salto de línea y
  "**Ruta del Estudiante**" en celeste; lead "Una mañana, cuatro paradas. Al final sabrás qué tan seguro estás de
  tu elección." en `--tinta-sobre-oscuro`.
- **El carrusel 3D** (`js/carrusel.js`, preset `cylinder`), centrado y protagonista, con una foto por estación
  (`assets/img/ruta/`: `conocete`, `experimenta`, `escucha` y `valida`, cuadradas de 560×560). Escenario de
  `clamp(340px, 40vw, 520px)`, a sangre en celular. Opciones ajustadas en React Bits: `aspectRatio: 1`,
  `gap: 38`, `tilt: -5`, `curve: 1`, `perspective: 1780`, `autoplay: 'drift'`, `direction: 'left'`,
  `momentum: 0.6`, `snap`, `pauseOnHover`, `focusOnClick`, `draggable`, `parallax: 0.39`, `stretch: 0.5`,
  `depthFade: 0.55`, `innerShade: 0.6`, `cornerRadius: 12`, `intro: 'rise'`, y `fadeColor` navy. Celular: 4
  tarjetas de 266px a velocidad 17; desde 768px, 8 tarjetas de 300px a 8.5.
  - Gira solo cuando la sección aparece (la intro `rise` sube las fotos desde abajo). Puntero encima o foco de
    teclado adentro: se pausa y se asienta en la foto más cercana. Se arrastra con inercia (en táctil, un gesto
    vertical es scroll de la página: `touch-action: pan-y`).
  - Teclado: Tab llega al carrusel (anillo celeste alrededor del escenario), las flechas giran de a una estación
    y la anuncian ("Estación 2: Experimenta. 2 de 4."), Enter o Espacio abren la de adelante.
- **Pista** debajo, solo con JS: "Toca una foto para descubrir cada estación" (small, `--tinta-sobre-oscuro`).
- **El portal** (`#dialogo-estacion`, variante `estacion` de `js/dialog.js`): al tocar una foto, viene al frente
  y desde ella crece el portal (480ms con `--ease-out`; el texto aparece a mitad de camino) con la foto, la
  burbuja de ícono, "Estación N", el título, la pregunta y la descripción. El borde, el overline y la pregunta van
  del color de la estación (la 4, en blanco). Caja `--navy-800`, radio 28. **Celular:** la foto cuadrada arriba a
  todo el ancho y el texto debajo; si la pantalla es baja, la caja se desplaza. **Desde 768px:** la foto de
  400×400 a la izquierda define el alto, y si el texto no entra, su columna se desplaza. Se cierra con la ✕
  (44×44), con Esc o tocando afuera, por el mismo camino al revés. El foco va al título y vuelve al carrusel.
  Con movimiento reducido abre y cierra sin animación.
- **Sin JS:** el escenario y la pista no se ven, y las 4 estaciones van en grilla (1 columna en celular, 2 desde
  768px y 4 desde 1200px), con su ícono, "Estación N", título, pregunta y descripción.
- **Cierre:** CTA naranja "Quiero vivir la ruta" con el ícono de ruta → `#entradas` con saludo.

### 5. Ubicación (`#ubicacion`)

> **Actualizado:** desde la v3 la dirección va en cuatro líneas (con la referencia) y hay una foto de la sede
> tipo polaroid que se abre en grande. Ver `docs/CAMBIOS-RUTA-HERO.md`. Desde la v6 sube sobre la ruta con un arco.

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

> **Actualizado:** desde la v2 cada logo es un botón que abre el panel del aliado, con los datos de
> `CONFIG.aliados`.

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

- **Fondo:** `--navy-900`; sube sobre Aliados con un arco (v6). Escritorio: 3 columnas; móvil: apiladas.
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
- Los que se usan: compass, key, mic, target, route, calendar, clock, map-pin, users, check, arrow-right, arrow-down, chevron-down, monitor, message-circle, ticket, video, external-link, info, qr-code, menu, x.
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
- Todo funciona con teclado: menú, entradas (Enter/Espacio para abrir, Esc para cerrar), el carrusel de la ruta (flechas, Enter, Esc), pestañas (flechas) y enlaces.
- Decoración (videos de fondo y sus cuadros quietos) con `aria-hidden="true"`. Las fotos del carrusel no tienen texto alternativo propio: el carrusel se anuncia con su etiqueta y la estación de adelante.
- `prefers-reduced-motion` respetado, como dice la regla 5.

## Rendimiento

- Lighthouse en móvil: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Peso total de la primera carga menor a 1.5 MB.
- **Imágenes:** logos con `width`/`height`, `loading="lazy"` fuera del hero y `decoding="async"`. Si `cwebp` está disponible, genera versiones .webp con `<picture>`.
  - Tamaños reales de los archivos, para los atributos `width`/`height`: `aprueba.png` es 1000×408 (relación 2.451:1, así que a 470px de ancho mide 192px de alto, y a 54px de alto mide 132px de ancho); los 6 logos de aliados son 264×264 cuadrados.
- **Animaciones:** solo `transform` y `opacity` (nunca top/left/width en loops). Usa `requestAnimationFrame`, y pausa todo lo que no está en pantalla.
- **Celular de gama baja:** prueba con CPU throttling 4× en DevTools; el carrusel y el video de la ruta deben ir a 60fps. Si el carrusel no llega, `tiles: 4` en celular (la curva se ve un poco facetada) antes de tocar otra cosa.

## SEO y compartir

Gran parte del tráfico llega por WhatsApp, así que la vista previa del enlace importa.

- `<title>`: "A+PRUEBA | La Ruta del Estudiante, 17 de noviembre" (sin "·": CAMBIOS-RUTA-HERO §4)
- Meta description: "Descubre, experimenta y define tu futuro profesional. Evento gratuito para escolares: presencial en UCSUR Sede Norte o virtual. Martes 17 de noviembre, 9:00 a.m."
- Open Graph y Twitter: `og:title`, `og:description`, `og:image` (`assets/og/og-image.png`, 1200×630, provisional; con el dominio pasa a URL absoluta), `og:locale=es_PE` y `og:type=website`.
- `<meta name="theme-color" content="#0B1040">`.
- `favicon.svg` provisional: círculo navy con "A+" en blanco (Fredoka 700). Se reemplaza cuando haya uno oficial.

## Fases (detente al final de cada una)

1. **Estructura y estilos estáticos:** el HTML semántico de todas las secciones, `tokens.css`, `styles.css` mobile-first, íconos y logos. Sin JS. Revisa en 360, 390, 768, 1024 y 1440.
2. **Interacciones:** `config.js`, nav (fija y menú móvil), entradas, pestañas de Ubicación, cuenta regresiva, CTAs con scroll y saludo, y Luma con placeholders.
3. **Movimiento:** `motion.css`, el patrón "crecer y menear", el flotar de los botones de entrada, la ruta, las animaciones de entrada y `prefers-reduced-motion`.
4. **QA:** Lighthouse, recorrido completo con teclado, Safari iOS, Android con throttling, comparación de textos contra PROYECTO.md y revisión de que no quede ningún enlace roto ni texto inventado.

Los documentos de cambios (v2 a v6) traen sus propias fases; la regla de detenerse al final de cada una vale igual.

## Definición de terminado

- [x] Las 7 secciones y la nav con los textos exactos de PROYECTO.md.
- [x] Los botones de entrada flotan, crecen y se menean con hover, y abren su diálogo sin cambiar de página.
- [x] Se puede cambiar de Presencial a Virtual con el diálogo abierto, y cerrarlo con la ✕, Esc o tocando afuera.
- [x] El carrusel de la ruta gira solo, se pausa con el puntero o el foco, y cada foto abre su estación en el portal, que crece desde ella.
- [x] Con teclado: Tab al carrusel, las flechas giran y anuncian, Enter abre, Esc cierra y el foco vuelve.
- [x] Sin JS, las 4 estaciones se ven completas en grilla.
- [x] Con `prefers-reduced-motion` no hay animación infinita.
- [x] Todo lo pendiente vive en `config.js`, y los campos vacíos se ven como "Próximamente", no como enlaces rotos.
- [x] Lighthouse móvil cumple el presupuesto.
