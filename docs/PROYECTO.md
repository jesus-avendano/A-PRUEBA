# A+PRUEBA — Datos del proyecto

Fuente de verdad del contenido de la landing. Si algo cambia, se cambia aquí primero.

## 1. El evento

| Campo | Dato |
|---|---|
| Nombre | A+PRUEBA — La Ruta del Estudiante |
| Lema del logo | "Descubre tu potencial antes de elegir tu camino" |
| Fechas | **Presencial: sábado 14 de noviembre de 2026. Virtual: próximamente** (desde el 20 oct; el 19 se había puesto el martes 17 de noviembre, y antes las dos eran el martes 17) |
| Horario | 9:00 a.m. – 1:00 p.m. (hora de Lima, UTC-5), en las dos fechas. **Por confirmar:** si el sábado 14 mantiene ese horario |
| Lugar presencial | UCSUR Sede Norte, Auditorio Norte y Explanada |
| Dirección | Cruce de Av. Alfredo Mendiola y Av. 2 de Octubre, Los Olivos. Referencia: Óvalo Infantas. (Fuente: página oficial del Campus Norte; da un cruce de avenidas, sin número.) |
| Modalidades | Presencial: **200 cupos**, Virtual: **800 cupos** |
| Costo | Gratis |
| Público | Escolares de secundaria (menores de edad en su mayoría) |

## 2. Objetivo de la landing

Que un escolar entienda el evento en 30 segundos y se inscriba en una de las dos modalidades. La medida de éxito es llenar los 200 cupos presenciales y los 800 virtuales.

- El tráfico llega sobre todo desde el **celular** (Instagram, TikTok, WhatsApp), por eso el diseño es móvil primero.
- La landing **informa e inscribe**. El diagnóstico vocacional y el Pasaporte Vocacional ocurren durante el evento, no en la web.

## 3. Registro (Luma)

> **Desde el 19 de octubre, mientras Luma no esté configurado, los botones "Quiero mi pasaporte presencial" y "Quiero mi pasaporte virtual" abren el formulario de Google (`https://docs.google.com/forms/d/e/1FAIpQLSc7edGDRnYyBGKbZSBVK2gHvofAPw-ElJmHqAgJODE-nSVzow/viewform`, en `CONFIG.inscripcion`) en otra pestaña.** Es el mismo formulario para las dos modalidades. Si se cargan los datos de Luma en `CONFIG.luma`, el botón de esa modalidad vuelve a ser el de Luma. Lo de abajo describe el plan con Luma.

- **Plataforma:** Luma. Guarda los registros, genera el QR y envía la confirmación por correo. No se usa base de datos propia.
- **Acceso a los registros:** el responsable del proyecto y las personas que agregue como organizadores (co-hosts) del evento en Luma.
- **Configuración recomendada:** un evento con **2 tipos de entrada gratuitos**, cada uno con su capacidad: "Presencial" (200) y "Virtual" (800). Luma permite capacidad por tipo de entrada, y el botón embebido puede abrir el registro directamente en el tipo elegido.
- **Por verificar en Luma:** cómo reciben el **enlace de la transmisión** solo los inscritos virtuales. Si un evento presencial no permite mandarlo solo a ese tipo de entrada, se usan **2 eventos separados** (uno presencial y otro online). La landing soporta ambos casos desde `js/config.js`.
- **Preguntas del registro** (se configuran en Luma, no en la landing):
  1. ¿Eres estudiante de secundaria? (Sí / No)
  2. Nombres y apellidos
  3. Celular de WhatsApp (9 dígitos)
  4. Correo electrónico (Luma lo pide por defecto)
  5. Modalidad: la define el tipo de entrada, no hace falta preguntarla
  6. ¿Tienes alguna carrera en mente actualmente? (desplegable; **lista pendiente**)
  7. Casilla de consentimiento para el tratamiento de datos personales (Ley 29733) y autorización del padre, madre o apoderado. **El texto lo valida UCSUR.**
- **Correo de confirmación con QR:** lo envía Luma.
- **Grupo de WhatsApp:** desde el 19 de octubre, el botón del pie lleva al grupo (`https://chat.whatsapp.com/C2blyHlVFO673nyyDHYKXR`, en `CONFIG.whatsapp.grupo`). Si Luma permite personalizar el correo de confirmación, se puede sumar ahí también.

## 4. Cronograma

| Fecha | Hito |
|---|---|
| Vie 16 oct | Encargo recibido; brief y diseño en Figma |
| Sáb 17 oct (noche) | Entrega del diseño para aprobación |
| Dom 18 – Lun 19 oct | Desarrollo con Claude Code, conexión con Luma, pruebas en celular |
| **Mar 20 oct** | **Landing publicada** |
| Sáb 14 nov | Evento presencial |
| Por confirmar | Evento virtual ("próximamente") |

## 5. Identidad visual

- **Figma:** un archivo del dueño del proyecto (el link no va en el repositorio; si hace falta, se le pide)
- **Paleta:** azul marino de base, blanco, verde y celeste/azul. El naranja del logo se reserva para los botones principales. Presencial = naranja, virtual = azul. Los hex están en `CLAUDE.md`.
- **Tipografías:** Fredoka (títulos y números) y Nunito (texto).
- **Logo:** `assets/logos/aprueba.png`, sin fondo. Si existe una versión SVG oficial, reemplazarlo.

## 6. Aliados

| Aliado | Archivo | Red (al tocar el logo) |
|---|---|---|
| Face to Face | `assets/logos/face-to-face.png` | https://www.instagram.com/somosfacetoface |
| LEAD UCSUR | `assets/logos/lead-ucsur.png` | https://www.instagram.com/lead_cientifica |
| BELL | `assets/logos/bell.png` | https://www.instagram.com/comunidad.bell |
| Red Astrum | `assets/logos/red-astrum.png` | https://www.instagram.com/red_astrum |
| Club de Tecnología y Electrónica | `assets/logos/club-tecnologia-electronica.png` | https://www.instagram.com/clubtecnologia_ucsur |
| Legado STEMos | `assets/logos/legado-stemos.png` | https://www.instagram.com/legado_stemos |

Todos van en círculo, cada uno manteniendo su diseño original. **Desde el 19 de octubre, cada logo lleva directo a
su red** (en `CONFIG.aliados`), en una pestaña nueva: ya no hay panel con descripción y "qué ofrece".

## 7. Contenido (textos finales)

> En ningún texto visible se usa el punto medio "·" como separador. Si dos datos van juntos, se
> separan con coma o cada uno va en su propia línea.

### Navegación
- Enlaces: La ruta, Entradas, Ubicación, Aliados, Contacto
- CTA: **Regístrate gratis**

### 1. Hero
- Título (h1): **Descubre, experimenta y define tu futuro profesional** (resaltado: "futuro profesional", en celeste fijo, sin animación de colores)
- Subtítulo, escritorio:
  > ¿Sientes la presión de no saber qué estudiar o dudas si tu elección es la correcta? Tranquilo, es normal. Elegir tu carrera no debería ser una decisión a ciegas: vive una experiencia donde pondrás a prueba tus habilidades, resolverás retos reales y conectarás con profesionales antes de tomar la gran decisión.
- Subtítulo, móvil (versión corta):
  > Elegir tu carrera no debería ser una decisión a ciegas. Pon a prueba tus habilidades, resuelve retos reales y conecta con profesionales antes de decidir.
- Botón principal: **¡Regístrate gratis y asegura tu lugar!** (móvil: **¡Regístrate gratis!**)
- Botón secundario: **Ver la ruta del evento**
- Sin pastilla ni chips de datos (se quitaron en la v3).
- Sin la ilustración del pasaporte, ni el cielo de estrellas, ni el planeta (se quitaron el 18 de octubre): de fondo va el video del campus y el texto va centrado.

### 2. Entradas
- Overline: **Inscripción gratuita**
- Título: **¡Asegura tu Pasaporte Vocacional!** / **Es gratis**
- Bajada: Elige cómo vivir A+PRUEBA: presencial el sábado 14 de noviembre o virtual (fecha próximamente). Los cupos presenciales son limitados.
- Sin leyenda sobre el video de fondo: "Así es el Auditorio Norte" se quitó (18 oct). No volver a ponerla.
- Botones flotantes:

| | Presencial | Virtual |
|---|---|---|
| Nombre | Presencial | Virtual |
| Número | 200 cupos | 800 cupos |
| Línea | Vívelo en el campus | Vívelo desde donde estés |
| Pie | Ver experiencia (abierto: Cerrar) | Ver experiencia (abierto: Cerrar) |

- Ayuda bajo los botones: Toca una opción para ver de qué se trata

**Panel Presencial**
- Badge: Experiencia presencial
- Título: Vívelo en el campus
- Cupos: 200 cupos
- Descripción: Recorre las 4 estaciones en el Auditorio Norte y la Explanada de UCSUR Sede Norte, con especialistas y profesionales a tu lado.
- Beneficios:
  - Diagnóstico vocacional con especialistas
  - Retos prácticos en mesas de trabajo
  - Mentores de la industria en vivo
  - Networking y validación al instante
- Así funciona:
  1. Regístrate gratis con tus datos.
  2. Recibe tu Pasaporte (QR) en tu correo.
  3. Preséntalo el sábado 14 de noviembre en UCSUR Sede Norte.
- Botón: **Quiero mi pasaporte presencial**
- Nota: Cupos limitados por orden de inscripción
- Cambio: ¿Prefieres conectarte desde casa? **Ver experiencia virtual**

**Panel Virtual**
- Badge: Experiencia virtual
- Título: Vívelo desde donde estés
- Cupos: 800 cupos
- Descripción: Conéctate desde tu celular o computadora a una experiencia pensada para lo virtual: no es una simple transmisión, tiene dinámicas propias.
- Beneficios:
  - Diagnóstico digital desde tu celular
  - Experiencias dinámicas guiadas
  - Retos colaborativos en equipos online
  - Conversatorios y salas interactivas
- Así funciona:
  1. Regístrate gratis con tus datos.
  2. Recibe tu enlace privado en tu correo.
  3. Conéctate el día del evento (fecha próximamente).
- Botón: **Quiero mi pasaporte virtual**
- Nota: Recibirás el enlace privado de acceso en tu correo
- Cambio: ¿Prefieres vivirlo en el campus? **Ver experiencia presencial**

- Nota de la sección: Al elegir tu entrada se abre el formulario de registro. Tu confirmación y tu QR llegan a tu correo.
- Los dos botones abren el formulario de Google mientras no haya Luma (19 oct).
- Botón sin Luma ni formulario: **Inscripciones muy pronto**
- **Por revisar con el formulario de Google** (no se cambiaron): "Recibe tu Pasaporte (QR) en tu correo", la nota de la sección ("…Tu confirmación y tu QR llegan a tu correo.") y "Lleva tu QR de inscripción" en Ubicación suponen que el registro manda un QR, como Luma. Si el formulario no lo manda, hay que cambiarlos.

### 3. Cuenta regresiva

> Desde el 19 de octubre va **después de la ruta** (orden: Hero → Entradas → Ruta → Cuenta regresiva → Ubicación → Aliados → Pie). Desde el 20 de octubre hay **dos cuentas regresivas, una por fecha**, una debajo de la otra, y ya no se separan textos con " · ".
- Sin overline (antes "Presencial: sábado 14 · Virtual: martes 17 de noviembre"). Cada cuenta lleva su etiqueta:
  - **Presencial** / Sábado 14 de noviembre, 9:00 a.m.
  - **Virtual** / Próximamente (sin cajas hasta que haya fecha)
- Título: **El evento que transformará tus dudas en certeza**
- Unidades: Días, Horas, Min, Seg
- Texto: No busques una charla aburrida sobre carreras. Ven a **vibrar, experimentar y medir tu nivel de seguridad real** sobre lo que quieres hacer con tu vida.
- Botón: **Quiero mi pasaporte**
- Cada cuenta, durante su fecha: ¡Está pasando ahora!
- Cada cuenta, después de su fecha: ¡Gracias por vivir A+PRUEBA!

### 4. La ruta
- Overline: **El recorrido**
- Título: **Las 4 estaciones de la Ruta del Estudiante** (resaltado: "Ruta del Estudiante")
- Bajada: Una mañana, cuatro paradas. Al final sabrás qué tan seguro estás de tu elección.

| # | Color | Ícono | Título | Pregunta | Descripción |
|---|---|---|---|---|---|
| 1 | celeste | brújula | Conócete | ¿Qué podría encajar conmigo? | Realiza un diagnóstico vocacional en tiempo real desde tu celular. Descubre tus principales intereses, identifica carreras sugeridas y regístralas en tu Pasaporte Vocacional. |
| 2 | verde | llave | Experimenta | ¿Cómo resolverías un problema real desde la profesión que quieres ejercer? | Trabaja en equipo en la explanada con un reto basado en los ODS (Salud, Educación, Sostenibilidad o Consumo Responsable). Prepara un pitch, compite por mentorías, membresías y premios en efectivo, y demuestra tu talento. |
| 3 | naranja | micrófono | Escucha y conecta | ¿Cómo es realmente estudiar y ejercer estas carreras? | Paneles en vivo con estudiantes y profesionales, sin filtros ni discursos armados. Descubre los mitos, las sorpresas, las dificultades reales y el impacto de la inteligencia artificial en cada profesión. |
| 4 | blanco | diana | Valida y consolida | Después de todo lo vivido, ¿qué tan seguro estás? | Evalúa tu evolución antes y después del evento. Descubre si confirmas tu carrera, encuentras una nueva vocación o decides explorar más. ¡Conecta directo con organizaciones que potenciarán tu futuro! |

- Pista debajo del carrusel (texto propuesto en la v7; falta aprobarlo): **Toca una carta para voltearla**
- Al pie del reverso de cada carta (texto propuesto en la v7): **Toca para volver**
- ~~Botón "Quiero vivir la ruta"~~: se quitó (19 oct). No volver a ponerlo.

### 5. Ubicación
- Overline: **Cómo llegar**
- Título: **¿Dónde nos vemos?**
- Pestañas: Presencial y Virtual
- Presencial:
  - Auditorio Norte y Explanada, con cada dato en su propia línea:
    - UCSUR Sede Norte
    - Cruce de Av. Alfredo Mendiola y Av. 2 de Octubre, Los Olivos
    - Referencia: Óvalo Infantas
  - Sábado 14 de noviembre — 9:00 a.m. – 1:00 p.m.
  - Lleva tu QR de inscripción — Lo recibes en tu correo al registrarte.
  - Botón: **Abrir en Google Maps**
  - Mapa de Google embebido (el `embedUrl` de `js/config.js` es provisional)
  - Foto de la sede en una polaroid: pie **Así luce la Sede Norte**; texto alternativo
    "Edificio de la Universidad Científica del Sur, Sede Norte". Archivos: `assets/img/sede-norte.webp`
    y `assets/img/sede-norte.jpg` (respaldo). Al tocarla se abre en grande.
- Virtual:
  - Transmisión exclusiva con acceso interactivo — Plataforma: [por confirmar]
  - Fecha: próximamente — Horario por confirmar
  - Tu enlace privado llega a tu correo — Solo para inscritos en la modalidad virtual.
  - Qué necesitas — Celular o computadora con internet.
  - En vez del mapa, una pantalla con la etiqueta **EN VIVO** y la barra **Sala A+PRUEBA**. Adentro, desde el 20 de
    octubre, la animación de una conferencia (un GIF de 150×150, 1.1 MB; en la página va como
    video MP4 de 106 KB: `assets/video/sala.mp4`, con su cuadro quieto `sala-poster.jpg`). Si hay una versión más
    grande del GIF, se vería más nítida.

### 6. Aliados
- Overline: **Aliados**
- Título: **Con el apoyo de**

### 7. Footer
- Lema: Descubre tu potencial antes de elegir tu camino.
- Overline: **Dudas e informes**
- Título: **¡Únete a nuestro grupo de WhatsApp y no te pierdas de nada!** (19 oct; antes "¿Tienes preguntas? Escríbenos")
- Botón: **¡Todo se encuentra aquí!** (lleva al grupo; 20 oct; antes "Escríbenos por WhatsApp")
- Mensaje prellenado (solo si algún día el botón va a un número y no al grupo): Hola, tengo una consulta sobre A+PRUEBA
- Overline: **Síguenos**
- Texto: Novedades antes del evento
- Legal: © 2026 A+PRUEBA, La Ruta del Estudiante
- Enlaces legales: "Política de privacidad" y "Términos y condiciones", separados solo por espacio, sin ningún carácter entre ellos

### Chatbot (20 oct)

Una burbuja abajo a la derecha abre un asistente que responde las dudas frecuentes en la misma página. La lógica
viene del bot de WhatsApp (`a-mas-chatbot`), pero con los datos de esta landing: horario de 9:00 a.m. a 1:00 p.m. y
las estaciones de la ruta. **Sin "Soy menor de edad" ni la lista de espera** (datos sin confirmar; no volver a
ponerlos sin confirmación). Funciona solo en el navegador: lo que se escribe no se envía ni se guarda.

- Opciones: ¿Qué es A+PRUEBA?, Fecha, hora y lugar, Las 4 estaciones, ¿Cómo me inscribo?, ¿Tiene costo?, Cupos,
  Edición virtual, Aliados, Hablar con el equipo (lleva al grupo de WhatsApp).
- Las respuestas reutilizan los textos de esta página (secciones de arriba).
- **Textos por aprobar** (propuestos el 20 oct): el nombre "Asistente de A+PRUEBA"; el saludo "¡Hola! Soy el asistente
  de A+PRUEBA. ¿Sobre qué tienes dudas?"; el globito "¿Tienes dudas? Pregúntame"; "No entendí tu mensaje. Elige una
  de estas opciones:"; "¡Con gusto! Si tienes otra duda, elige una opción."; "Toca una estación para saber más.";
  "No, la inscripción es gratis, en las dos modalidades."; "Escribe tu pregunta"; "Seguir por WhatsApp"; los
  enlaces "Abrir el formulario de inscripción" y "Unirme al grupo de WhatsApp"; y en "¿Cómo me inscribo?" el
  paso 3: "Preséntalo el sábado 14 de noviembre en UCSUR Sede Norte. Si eliges la modalidad virtual, recibes tu
  enlace privado en tu correo."

### SEO
- Título de pestaña: A+PRUEBA | La Ruta del Estudiante, 14 de noviembre
- Descripción: Descubre, experimenta y define tu futuro profesional. Evento gratuito para escolares: presencial el sábado 14 de noviembre en UCSUR Sede Norte, a las 9:00 a.m. La fecha virtual, próximamente.

## 8. Pendientes por confirmar

- [x] Dirección de UCSUR Sede Norte (cruce de avenidas, sin número) y enlace de Google Maps
- [ ] Embed oficial del mapa: Google Maps → Compartir → Insertar un mapa, copiar solo el `src` del iframe (el actual es provisional)
- [x] Inscripción: formulario de Google en los dos boletos (19 oct), mientras no haya Luma
- [ ] Luma (si se sigue usando): URL del evento, ID del evento, IDs de los 2 tipos de entrada y snippet del botón embebible
- [ ] Horario del sábado 14 (presencial): hoy dice 9:00 a.m. – 1:00 p.m.
- [ ] Fecha y horario del evento virtual (hoy, "próximamente"). Cuando lleguen: `CONFIG.evento.virtual` y los textos que dicen "próximamente" (bajada de Entradas, paso 3 del virtual, cuenta regresiva, Ubicación virtual, título, descripción e imagen para compartir)
- [ ] ¿El formulario de Google manda un QR o una confirmación? Si no, cambiar los textos del QR (ver la sección 7, Entradas)
- [ ] Luma: cómo reciben el enlace de la transmisión solo los virtuales (define si son 1 o 2 eventos)
- [ ] Plataforma de la transmisión virtual y si soporta 800 participantes
- [ ] Presencial: ¿orden de inscripción o selección? (hoy dice "por orden de inscripción")
- [x] WhatsApp: el botón del pie lleva al grupo (19 oct). Un número de soporte ya no hace falta
- [ ] URLs de Instagram, TikTok y Facebook
- [ ] Texto de consentimiento de datos y autorización del apoderado (lo valida UCSUR)
- [ ] URLs de política de privacidad y términos
- [ ] Lista de carreras para el desplegable del registro
- [ ] Número del bot de WhatsApp (`CONFIG.chatbot.numero`, 51 y 9 dígitos): con él, el chat de la página muestra "Seguir por WhatsApp"
- [ ] El bot de WhatsApp (`a-mas-chatbot`) todavía dice 10:00 a.m. – 2:00 p.m., usa las estaciones del dossier y tiene "Soy menor de edad" y la lista de espera: no coincide con la landing (decidido el 20 oct no tocarlo por ahora)
- [x] Imagen para compartir (`assets/og/og-aprueba-3.jpg`, 1200×630, 109 KB), como el hero de ahora: el campus bajo el velo navy, la pastilla, el logo, "Sábado 14 de noviembre, 9:00 a.m." y "Gratis, presencial en UCSUR Sede Norte. Virtual: próximamente". Se genera con `docs/og/og.html` (20 oct; las anteriores, `og-aprueba.jpg` con el martes 17 y `og-aprueba-2.jpg` con el 14 y el 17, quedan en la carpeta para las vistas previas ya guardadas). Reemplazarla si llega una oficial, con otro nombre para saltar la caché de WhatsApp
- [ ] Favicon oficial (el actual es provisional: círculo navy con "A+")
- [ ] Isotipo oficial en SVG: el del chatbot (`assets/logos/isotipo.webp`) es provisional, sacado del PDF del dossier
- [x] Aliados: cada logo lleva a su Instagram (19 oct). Sin panel, ya no hacen falta su descripción ni "qué ofrece"
- [ ] Dominio: ¿subdominio de UCSUR (hay que pedírselo a TI) o URL gratuita del hosting? Con él, `og:image` y `twitter:image` pasan a URL absolutas y se agrega `og:url` (WhatsApp y Facebook las piden)

## 9. Decisiones tomadas

- **Sin base de datos propia:** Luma maneja el registro, el QR y la confirmación.
- **Tecnología:** HTML, CSS y JavaScript puro, publicado en un hosting estático gratuito.
- **El hosting debe comprimir** (brotli o gzip). Netlify, Vercel, Cloudflare Pages y GitHub Pages lo hacen solos. Sin compresión, Lighthouse móvil baja de 100 a 86 en rendimiento.
- **Cupos virtuales:** 800, no ilimitados.
- **Inscripción:** no navega a otro lugar. Los botones flotantes Presencial/Virtual abren la explicación en el mismo sitio, y el registro de Luma se abre como overlay sobre la página.
- **Ruta (v6):** un carrusel 3D con una foto por estación que gira solo; cada foto abre su estación en un portal que crece desde ella. De fondo, un video de partículas de colores. Ya no hay estrellas, trazo, cometa ni nodos.
- **Video del auditorio de fondo en Entradas:** con un velo azul marino. Se carga al acercarse a la sección y se pausa fuera de pantalla; con movimiento reducido o ahorro de datos queda solo la imagen fija.
- **Hero con el video del campus de fondo (18 de octubre):** a pantalla completa y con el texto centrado; sin el pasaporte, las estrellas ni el planeta.
- **Sin botón de pausa en los videos de fondo (18 de octubre).** Con movimiento reducido o ahorro de datos se ve solo la imagen fija.
- **Uniones rectas entre lo oscuro y lo claro (18 de octubre):** de la ruta a Ubicación y de Aliados al pie, el cambio de sección es una línea recta (ni degradado ni arco). Las demás uniones siguen con su fundido.
- **Sin agenda (18 de octubre):** se quitó la agenda a pantalla completa que abría "Quiero vivir la ruta". El botón vuelve a bajar a Entradas y los boletos saludan, como los otros CTA. No volver a ponerla.
- **Sin "Quiero vivir la ruta" y la cuenta regresiva después de la ruta (19 de octubre):** cambios de la v7. La cuenta regresiva se funde arriba con el navy de la ruta y abajo corta con Ubicación en línea recta.
- **Correcciones al texto original:** "¿Sentir la presión…?" pasó a "¿Sientes la presión…?". Los títulos "Inmersión física" y "Alcance escalable" pasaron a "Vívelo en el campus" y "Vívelo desde donde estés", más cercanos a un escolar.
- **Grupo de WhatsApp (19 de octubre):** el botón del pie lleva al grupo. Antes estaba fuera de alcance.
- **Aliados sin panel (19 de octubre):** cada logo lleva directo a su red.
- **Dos fechas (19 de octubre):** presencial el sábado 14 y virtual el martes 17 de noviembre. Desde el 20 de octubre, una cuenta regresiva para cada una, y **la virtual pasó a "próximamente"**: su cuenta muestra solo esa etiqueta.
- **Sin TechText en "futuro profesional" (20 de octubre):** se puso y, ese mismo día, se quitó. El título volvió a ser el de antes (celeste, dentro de la frase). No volver a ponerlo.
- **Formulario de Google para inscribirse (19 de octubre):** lo abren los dos boletos mientras no haya Luma.
- **Botones con brillo especular (20 de octubre):** con SpecularButton de React Bits. Una luz recorre el borde de cada botón y se acerca al puntero; los botones conservan sus colores, textos y sombras. Con movimiento reducido la luz no se mueve.
