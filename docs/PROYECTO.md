# A+PRUEBA — Datos del proyecto

Fuente de verdad del contenido de la landing. Si algo cambia, se cambia aquí primero.

## 1. El evento

| Campo | Dato |
|---|---|
| Nombre | A+PRUEBA — La Ruta del Estudiante |
| Lema del logo | "Descubre tu potencial antes de elegir tu camino" |
| Fecha | Martes 17 de noviembre de 2026 |
| Horario | 9:00 a.m. – 1:00 p.m. (hora de Lima, UTC-5) |
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
- **Grupo de WhatsApp:** fuera de alcance por ahora. Más adelante se puede agregar su enlace al correo de confirmación de Luma, si Luma permite personalizarlo.

## 4. Cronograma

| Fecha | Hito |
|---|---|
| Vie 16 oct | Encargo recibido; brief y diseño en Figma |
| Sáb 17 oct (noche) | Entrega del diseño para aprobación |
| Dom 18 – Lun 19 oct | Desarrollo con Claude Code, conexión con Luma, pruebas en celular |
| **Mar 20 oct** | **Landing publicada** |
| Mar 17 nov | Evento |

## 5. Identidad visual

- **Figma:** (link de Figma: no va en el repositorio)
- **Paleta:** azul marino de base, blanco, verde y celeste/azul. El naranja del logo se reserva para los botones principales. Presencial = naranja, virtual = azul. Los hex están en `CLAUDE.md`.
- **Tipografías:** Fredoka (títulos y números) y Nunito (texto).
- **Logo:** `assets/logos/aprueba.png`, sin fondo. Si existe una versión SVG oficial, reemplazarlo.

## 6. Aliados

| Aliado | Archivo |
|---|---|
| Face to Face | `assets/logos/face-to-face.png` |
| LEAD UCSUR | `assets/logos/lead-ucsur.png` |
| BELL | `assets/logos/bell.png` |
| Red Astrum | `assets/logos/red-astrum.png` |
| Club de Tecnología y Electrónica | `assets/logos/club-tecnologia-electronica.png` |
| Legado STEMos | `assets/logos/legado-stemos.png` |

Todos van en círculo, cada uno manteniendo su diseño original.

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
- Bajada: Elige cómo vivir A+PRUEBA el 17 de noviembre. Los cupos presenciales son limitados.
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
  3. Preséntalo el martes 17 de noviembre en UCSUR Sede Norte.
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
  3. Conéctate el martes 17 de noviembre a las 9:00 a.m.
- Botón: **Quiero mi pasaporte virtual**
- Nota: Recibirás el enlace privado de acceso en tu correo
- Cambio: ¿Prefieres vivirlo en el campus? **Ver experiencia presencial**

- Nota de la sección: Al elegir tu entrada se abre el formulario de registro. Tu confirmación y tu QR llegan a tu correo.
- Botón sin enlace de Luma: **Inscripciones muy pronto**

### 3. Cuenta regresiva
- Overline: **Martes 17 de noviembre, 9:00 a.m.**
- Título: **El evento que transformará tus dudas en certeza**
- Unidades: Días, Horas, Min, Seg
- Texto: No busques una charla aburrida sobre carreras. Ven a **vibrar, experimentar y medir tu nivel de seguridad real** sobre lo que quieres hacer con tu vida.
- Botón: **Quiero mi pasaporte**
- Durante el evento: ¡Está pasando ahora!
- Después del evento: ¡Gracias por vivir A+PRUEBA!

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

- Pista debajo del carrusel (texto propuesto en `CAMBIOS-PORTAL-FONDO.md`; falta aprobarlo): **Toca una foto para descubrir cada estación**
- Botón: **Quiero vivir la ruta**

### 5. Ubicación
- Overline: **Cómo llegar**
- Título: **¿Dónde nos vemos?**
- Pestañas: Presencial y Virtual
- Presencial:
  - Auditorio Norte y Explanada, con cada dato en su propia línea:
    - UCSUR Sede Norte
    - Cruce de Av. Alfredo Mendiola y Av. 2 de Octubre, Los Olivos
    - Referencia: Óvalo Infantas
  - Martes 17 de noviembre — 9:00 a.m. – 1:00 p.m.
  - Lleva tu QR de inscripción — Lo recibes en tu correo al registrarte.
  - Botón: **Abrir en Google Maps**
  - Mapa de Google embebido (el `embedUrl` de `js/config.js` es provisional)
  - Foto de la sede en una polaroid: pie **Así luce la Sede Norte**; texto alternativo
    "Edificio de la Universidad Científica del Sur, Sede Norte". Archivos: `assets/img/sede-norte.webp`
    y `assets/img/sede-norte.jpg` (respaldo). Al tocarla se abre en grande.
- Virtual:
  - Transmisión exclusiva con acceso interactivo — Plataforma: [por confirmar]
  - Martes 17 de noviembre — 9:00 a.m. – 1:00 p.m.
  - Tu enlace privado llega a tu correo — Solo para inscritos en la modalidad virtual.
  - Qué necesitas — Celular o computadora con internet.

### 6. Aliados
- Overline: **Aliados**
- Título: **Con el apoyo de**

### 7. Footer
- Lema: Descubre tu potencial antes de elegir tu camino.
- Overline: **Dudas e informes**
- Título: **¿Tienes preguntas? Escríbenos**
- Botón: **Escríbenos por WhatsApp**
- Mensaje prellenado: Hola, tengo una consulta sobre A+PRUEBA
- Overline: **Síguenos**
- Texto: Novedades antes del evento
- Legal: © 2026 A+PRUEBA, La Ruta del Estudiante
- Enlaces legales: "Política de privacidad" y "Términos y condiciones", separados solo por espacio, sin ningún carácter entre ellos

### SEO
- Título de pestaña: A+PRUEBA | La Ruta del Estudiante, 17 de noviembre
- Descripción: Descubre, experimenta y define tu futuro profesional. Evento gratuito para escolares: presencial en UCSUR Sede Norte o virtual. Martes 17 de noviembre, 9:00 a.m.

## 8. Pendientes por confirmar

- [x] Dirección de UCSUR Sede Norte (cruce de avenidas, sin número) y enlace de Google Maps
- [ ] Embed oficial del mapa: Google Maps → Compartir → Insertar un mapa, copiar solo el `src` del iframe (el actual es provisional)
- [ ] Luma: URL del evento, ID del evento, IDs de los 2 tipos de entrada y snippet del botón embebible
- [ ] Luma: cómo reciben el enlace de la transmisión solo los virtuales (define si son 1 o 2 eventos)
- [ ] Plataforma de la transmisión virtual y si soporta 800 participantes
- [ ] Presencial: ¿orden de inscripción o selección? (hoy dice "por orden de inscripción")
- [ ] Número de WhatsApp de soporte
- [ ] URLs de Instagram, TikTok y Facebook
- [ ] Texto de consentimiento de datos y autorización del apoderado (lo valida UCSUR)
- [ ] URLs de política de privacidad y términos
- [ ] Lista de carreras para el desplegable del registro
- [x] Imagen para compartir provisional (`assets/og/og-image.png`, 1200×630), hecha con el logo y los textos de la página. Reemplazarla si llega una oficial
- [ ] Favicon oficial (el actual es provisional: círculo navy con "A+")
- [ ] Texto real de cada aliado (descripción y qué ofrece) y sus redes: hoy es texto de relleno en `CONFIG.aliados`
- [ ] Dominio: ¿subdominio de UCSUR (hay que pedírselo a TI) o URL gratuita del hosting? Con él, `og:image` y `twitter:image` pasan a URL absolutas y se agrega `og:url` (WhatsApp y Facebook las piden)

## 9. Decisiones tomadas

- **Sin base de datos propia:** Luma maneja el registro, el QR y la confirmación.
- **Tecnología:** HTML, CSS y JavaScript puro, publicado en un hosting estático gratuito.
- **El hosting debe comprimir** (brotli o gzip). Netlify, Vercel, Cloudflare Pages y GitHub Pages lo hacen solos. Sin compresión, Lighthouse móvil baja de 100 a 86 en rendimiento.
- **Cupos virtuales:** 800, no ilimitados.
- **Inscripción:** no navega a otro lugar. Los botones flotantes Presencial/Virtual abren la explicación en el mismo sitio, y el registro de Luma se abre como overlay sobre la página.
- **Ruta animada:** estrellas en movimiento constante, trazo que avanza, cometa que pasa por los nodos 1–4 y nodos que crecen al recibirlo.
- **Video del auditorio de fondo en Entradas:** con un velo azul marino. Se carga al acercarse a la sección, se pausa fuera de pantalla y tiene botón de pausa; con movimiento reducido o ahorro de datos queda solo la imagen fija.
- **Hero con el video del campus de fondo (18 de octubre):** a pantalla completa y con el texto centrado; sin el pasaporte, las estrellas ni el planeta.
- **Sin botón de pausa en los videos de fondo (18 de octubre).** Con movimiento reducido o ahorro de datos se ve solo la imagen fija.
- **Sin agenda (18 de octubre):** se quitó la agenda a pantalla completa que abría "Quiero vivir la ruta". El botón vuelve a bajar a Entradas y los boletos saludan, como los otros CTA. No volver a ponerla.
- **Correcciones al texto original:** "¿Sentir la presión…?" pasó a "¿Sientes la presión…?". Los títulos "Inmersión física" y "Alcance escalable" pasaron a "Vívelo en el campus" y "Vívelo desde donde estés", más cercanos a un escolar.
- **Grupo de WhatsApp:** fuera de alcance por ahora.
