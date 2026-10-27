/* Chatbot de la página: intenciones y respuestas.

   La lógica viene del bot de WhatsApp (a-mas-chatbot: src/bot/intents.ts, content.ts y
   responder.ts), portada a JS: normaliza el texto, busca la intención con palabras clave y
   devuelve una respuesta predefinida. Sin IA y sin servidor: nada de lo que se escribe sale
   del navegador.

   Diferencias con el de WhatsApp (decididas el 20 oct):
   - Los datos son los de la landing (docs/PROYECTO.md): horario de 9:00 a.m. a 1:00 p.m. y
     las estaciones de la ruta, que se leen de los <article> de #ruta (no se duplican).
   - Sin "Soy menor de edad" ni la lista de espera: datos sin confirmar.
   - El menú son botones, no números; sin límite de respuestas por minuto ni "solo leo texto".

   Una respuesta es { bloques, opciones }: bloques son nodos para el globo del bot, y opciones,
   las intenciones que se ofrecen como botones debajo. */

import { CONFIG } from './config.js';

/* ---------------------------------------------------------
   Intenciones
   --------------------------------------------------------- */

const MENU = [
  { intencion: 'que_es', etiqueta: '¿Qué es A+PRUEBA?' },
  { intencion: 'fecha_lugar', etiqueta: 'Fecha, hora y lugar' },
  { intencion: 'estaciones', etiqueta: 'Las 4 estaciones' },
  { intencion: 'inscripcion', etiqueta: '¿Cómo me inscribo?' },
  { intencion: 'costo', etiqueta: '¿Tiene costo?' },
  { intencion: 'cupos', etiqueta: 'Cupos' },
  { intencion: 'virtual', etiqueta: 'Edición virtual' },
  { intencion: 'aliados', etiqueta: 'Aliados' },
  { intencion: 'contacto', etiqueta: 'Hablar con el equipo' },
];

// El orden importa: gana la primera regla que coincide, así los temas van antes que los saludos.
const REGLAS = [
  { intencion: 'estacion-1', palabras: ['conocete'] },
  { intencion: 'estacion-2', palabras: ['experimenta'] },
  { intencion: 'estacion-3', palabras: ['escucha', 'conecta'] },
  { intencion: 'estacion-4', palabras: ['valida', 'consolida'] },
  { intencion: 'estaciones', prefijos: ['estacion', 'ruta'] },
  { intencion: 'virtual', palabras: ['online', 'remoto', 'remota'], prefijos: ['virtual'] },
  { intencion: 'cupos', prefijos: ['cupo', 'vacante', 'aforo'] },
  { intencion: 'costo', palabras: ['gratis', 'pago', 'pagar', 'cuesta', 'cobran'], prefijos: ['costo', 'precio', 'gratuit'] },
  { intencion: 'inscripcion', palabras: ['link', 'enlace', 'formulario'], prefijos: ['inscrib', 'inscrip', 'registr'] },
  { intencion: 'fecha_lugar', palabras: ['cuando', 'donde', 'hora', 'horario', 'fecha', 'dia', 'lugar', 'sede', 'ubicacion', 'direccion', 'mapa', 'llegar'] },
  { intencion: 'aliados', prefijos: ['aliad', 'organiza', 'auspici'] },
  { intencion: 'contacto', palabras: ['persona', 'humano', 'asesor', 'asesora', 'contacto', 'equipo', 'llamar', 'telefono', 'correo', 'whatsapp', 'grupo'], prefijos: ['comunic'] },
  { intencion: 'que_es', frases: ['que es', 'de que trata', 'en que consiste', 'de que se trata', 'mas informacion', 'info'] },
  { intencion: 'gracias', prefijos: ['gracias'], palabras: ['ok', 'listo', 'genial', 'perfecto'] },
  { intencion: 'menu', palabras: ['hola', 'holi', 'buenas', 'buenos', 'menu', 'inicio', 'opciones', 'ayuda', 'hey'] },
];

export function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function detectarIntencion(texto) {
  const limpio = normalizar(texto);
  if (limpio === '') return null;
  const palabras = limpio.split(' ');
  const rodeado = ` ${limpio} `;
  for (const regla of REGLAS) {
    if (regla.palabras?.some((p) => palabras.includes(p))) return regla.intencion;
    if (regla.prefijos?.some((p) => palabras.some((t) => t.startsWith(p)))) return regla.intencion;
    if (regla.frases?.some((f) => rodeado.includes(` ${f} `))) return regla.intencion;
  }
  return null;
}

/** La etiqueta del botón de cada intención que se ofrece como opción. */
export function etiqueta(intencion) {
  if (intencion === 'menu') return 'Ver todas las opciones';
  const estacion = estaciones().find((e) => e.intencion === intencion);
  if (estacion) return estacion.titulo;
  return MENU.find((o) => o.intencion === intencion)?.etiqueta ?? intencion;
}

/* ---------------------------------------------------------
   Respuestas
   --------------------------------------------------------- */

const OPCIONES_MENU = MENU.map((o) => o.intencion);

/** La respuesta a un texto escrito. */
export function responder(texto) {
  const intencion = detectarIntencion(texto);
  if (intencion === null) {
    return { bloques: [p('No entendí tu mensaje. Elige una de estas opciones:')], opciones: OPCIONES_MENU };
  }
  return respuesta(intencion);
}

/** El saludo con el que se abre el chat. */
export function saludo() {
  return {
    bloques: [p('¡Hola! Soy el asistente de ', b('A+PRUEBA'), '. ¿Sobre qué tienes dudas?')],
    opciones: OPCIONES_MENU,
  };
}

/** La respuesta a una intención (también la de los botones de opciones). */
export function respuesta(intencion) {
  const estacion = estaciones().find((e) => e.intencion === intencion);
  if (estacion) {
    return {
      bloques: [
        p(b(`Estación ${estacion.numero}. ${estacion.titulo}`)),
        p(i(estacion.pregunta)),
        p(estacion.descripcion),
      ],
      opciones: [...estaciones().filter((e) => e !== estacion).map((e) => e.intencion), 'inscripcion', 'menu'],
    };
  }

  switch (intencion) {
    case 'menu':
      return { bloques: [p('Elige una opción:')], opciones: OPCIONES_MENU };

    case 'que_es':
      return {
        bloques: [
          p(b('A+PRUEBA, La Ruta del Estudiante'), ': ', i('Descubre tu potencial antes de elegir tu camino.')),
          p('¿Sientes la presión de no saber qué estudiar o dudas si tu elección es la correcta? Tranquilo, es normal. Elegir tu carrera no debería ser una decisión a ciegas: vive una experiencia donde pondrás a prueba tus habilidades, resolverás retos reales y conectarás con profesionales antes de tomar la gran decisión.'),
          p('Es gratis y es para escolares de secundaria.'),
        ],
        opciones: ['estaciones', 'fecha_lugar', 'inscripcion', 'menu'],
      };

    case 'fecha_lugar':
      return {
        bloques: [
          p(b('Presencial')),
          lista([
            [b('Fecha: '), 'sábado 14 de noviembre'],
            [b('Hora: '), '9:00 a.m. – 1:00 p.m.'],
            [b('Lugar: '), 'Auditorio Norte y Explanada, UCSUR Sede Norte'],
            [b('Dirección: '), [CONFIG.mapa.direccion, CONFIG.mapa.referencia].filter(Boolean).join('. ')],
          ]),
          ...enlaceSi(CONFIG.mapa.linkUrl, 'Abrir en Google Maps'),
          p(b('Virtual: '), 'fecha próximamente.'),
        ],
        opciones: ['inscripcion', 'virtual', 'menu'],
      };

    case 'estaciones':
      return {
        bloques: [
          p('Una mañana, cuatro paradas. Al final sabrás qué tan seguro estás de tu elección.'),
          lista(estaciones().map((e) => [b(`${e.numero}. ${e.titulo}: `), e.pregunta])),
          p('Toca una estación para saber más.'),
        ],
        opciones: [...estaciones().map((e) => e.intencion), 'menu'],
      };

    case 'inscripcion':
      return {
        bloques: [
          p(b('Cómo inscribirte')),
          lista([
            ['Regístrate gratis con tus datos.'],
            ['Recibe tu Pasaporte (QR) en tu correo.'],
            ['Preséntalo el sábado 14 de noviembre en UCSUR Sede Norte. Si eliges la modalidad virtual, recibes tu enlace privado en tu correo.'],
          ], 'ol'),
          ...(CONFIG.inscripcion
            ? enlaceSi(CONFIG.inscripcion, 'Abrir el formulario de inscripción')
            : [p('Inscripciones muy pronto.')]),
        ],
        opciones: ['costo', 'cupos', 'menu'],
      };

    case 'costo':
      return {
        bloques: [p('No, la inscripción es ', b('gratis'), ', en las dos modalidades.')],
        opciones: ['inscripcion', 'menu'],
      };

    case 'cupos':
      return {
        bloques: [
          lista([
            [b(`Presencial: ${CONFIG.cupos.presencial} cupos`), ', limitados por orden de inscripción.'],
            [b(`Virtual: ${CONFIG.cupos.virtual} cupos`), '.'],
          ]),
        ],
        opciones: ['inscripcion', 'menu'],
      };

    case 'virtual':
      return {
        bloques: [
          p('Conéctate desde tu celular o computadora a una experiencia pensada para lo virtual: no es una simple transmisión, tiene dinámicas propias.'),
          lista([
            ['Diagnóstico digital desde tu celular'],
            ['Experiencias dinámicas guiadas'],
            ['Retos colaborativos en equipos online'],
            ['Conversatorios y salas interactivas'],
          ]),
          p(b('Fecha: '), 'próximamente. Tu enlace privado llega a tu correo.'),
        ],
        opciones: ['inscripcion', 'cupos', 'menu'],
      };

    case 'aliados': {
      const aliados = Object.values(CONFIG.aliados);
      return {
        bloques: [
          p('Con el apoyo de:'),
          lista(aliados.map(({ nombre, red }) => [red ? enlace(red, nombre) : nombre])),
        ],
        opciones: ['menu'],
      };
    }

    case 'contacto':
      return {
        bloques: CONFIG.whatsapp.grupo
          ? [p('¡Únete a nuestro grupo de WhatsApp y no te pierdas de nada!'), ...enlaceSi(CONFIG.whatsapp.grupo, 'Unirme al grupo de WhatsApp')]
          : [p('Pronto publicaremos un canal de contacto con el equipo.')],
        opciones: ['menu'],
      };

    case 'gracias':
      return { bloques: [p('¡Con gusto! Si tienes otra duda, elige una opción.')], opciones: ['menu'] };

    default:
      return { bloques: [p('Elige una opción:')], opciones: OPCIONES_MENU };
  }
}

/* Las estaciones salen de los <article> de la ruta: así los textos viven en un solo lugar. */
let cacheEstaciones = null;
function estaciones() {
  if (cacheEstaciones) return cacheEstaciones;
  const texto = (articulo, selector) => articulo.querySelector(selector)?.textContent.trim() ?? '';
  cacheEstaciones = [...document.querySelectorAll('#ruta .estacion')].map((articulo, indice) => ({
    intencion: `estacion-${indice + 1}`,
    numero: indice + 1,
    titulo: texto(articulo, '.estacion__titulo'),
    pregunta: texto(articulo, '.estacion__pregunta'),
    descripcion: texto(articulo, '.estacion__desc'),
  }));
  return cacheEstaciones;
}

/* ---------------------------------------------------------
   Nodos (con textContent: nunca HTML armado con cadenas)
   --------------------------------------------------------- */

function nodo(etiquetaHtml, hijos) {
  const el = document.createElement(etiquetaHtml);
  el.append(...hijos);
  return el;
}

const p = (...hijos) => nodo('p', hijos);
const b = (texto) => nodo('strong', [texto]);
const i = (texto) => nodo('em', [texto]);

function lista(items, tipo = 'ul') {
  return nodo(tipo, items.map((hijos) => nodo('li', hijos)));
}

function enlace(url, texto) {
  const a = nodo('a', [texto]);
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  return a;
}

// Un enlace destacado en su propio párrafo; sin URL no se muestra (nunca un enlace roto).
function enlaceSi(url, texto) {
  if (!url) return [];
  const a = enlace(url, texto);
  a.className = 'chatbot__accion';
  return [p(a)];
}
