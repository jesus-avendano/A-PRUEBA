/* ===========================================================
   A+PRUEBA · datos editables
   Todo lo que cambia sin tocar el resto del código vive aquí.
   Si un campo está vacío, el elemento que depende de él se
   muestra deshabilitado. Nunca queda un enlace roto.
   =========================================================== */

export const CONFIG = {
  // Una cuenta regresiva por fecha (hora de Lima). Presencial: sábado 14 de noviembre.
  // Virtual: PRÓXIMAMENTE (20 oct; antes era el martes 17). Mientras
  // su inicio esté vacío, su cuenta muestra solo "Próximamente". Cuando llegue la fecha,
  // va aquí y en los textos del HTML que dicen "próximamente".
  // PENDIENTE: el horario del sábado; se mantiene el de antes (9:00 a 13:00).
  evento: {
    presencial: { inicio: '2026-11-14T09:00:00-05:00', fin: '2026-11-14T13:00:00-05:00' },
    virtual:    { inicio: '', fin: '' },
  },

  // Formulario de inscripción (Google Forms, desde el 19 oct): lo abren
  // los botones de los dos boletos mientras Luma no esté configurado.
  inscripcion: 'https://docs.google.com/forms/d/e/1FAIpQLSc7edGDRnYyBGKbZSBVK2gHvofAPw-ElJmHqAgJODE-nSVzow/viewform',

  // Sirve para un evento de Luma con 2 tipos de entrada (mismo eventId)
  // o para 2 eventos separados.
  // url          → URL pública del evento (ej. https://lu.ma/aprueba)
  // eventId      → evt-... (Gestionar evento → More → Embed Registration Button)
  // ticketTypeId → ttyp-... (Registration → el ticket → ⋯ → Copy Ticket Type ID)
  luma: {
    presencial: { url: '', eventId: '', ticketTypeId: '' },
    virtual:    { url: '', eventId: '', ticketTypeId: '' },
  },

  cupos: { presencial: 200, virtual: 800 },

  whatsapp: {
    // El botón del pie lleva al grupo; si no hubiera grupo, abriría el chat con este número.
    grupo: 'https://chat.whatsapp.com/C2blyHlVFO673nyyDHYKXR', // 19 oct, sin el ?mode= de rastreo
    numero: '', // formato 51XXXXXXXXX, sin + ni espacios
    mensaje: 'Hola, tengo una consulta sobre A+PRUEBA',
  },

  redes: { instagram: '', tiktok: '', facebook: '' },

  // Fuente: página oficial del Campus Norte (da un cruce de avenidas, sin número).
  mapa: {
    direccion: 'Cruce de Av. Alfredo Mendiola y Av. 2 de Octubre, Los Olivos',
    referencia: 'Referencia: Óvalo Infantas',
    linkUrl: 'https://www.google.com/maps/place/Universidad+Cient%C3%ADfica+del+Sur/@-11.9445269,-77.0732338,17.52z/data=!4m6!3m5!1s0x9105d1c1512bb1a5:0xdc9cbf193fa9af0e!8m2!3d-11.9440854!4d-77.0717673!16s%2Fg%2F11j0ysw37_?hl=es',
    // PROVISIONAL. El oficial: Google Maps → Compartir → Insertar un mapa, y copiar solo el src del iframe.
    embedUrl: 'https://www.google.com/maps?q=-11.9440854,-77.0717673&z=17&hl=es&output=embed',
  },

  virtual: { plataforma: '[POR CONFIRMAR]' },

  legal: { privacidadUrl: '', terminosUrl: '' },

  // Aliados: cada logo lleva directo a su red (19 oct: sin el
  // panel de información de la v2). Los Instagram son del 18 oct,
  // sin los parámetros de rastreo. Sin red, el logo se muestra deshabilitado.
  aliados: {
    'face-to-face':                { nombre: 'Face to Face',                     red: 'https://www.instagram.com/somosfacetoface' },
    'lead-ucsur':                  { nombre: 'LEAD UCSUR',                       red: 'https://www.instagram.com/lead_cientifica' },
    'bell':                        { nombre: 'BELL',                             red: 'https://www.instagram.com/comunidad.bell' },
    'red-astrum':                  { nombre: 'Red Astrum',                       red: 'https://www.instagram.com/red_astrum' },
    'club-tecnologia-electronica': { nombre: 'Club de Tecnología y Electrónica', red: 'https://www.instagram.com/clubtecnologia_ucsur' },
    'legado-stemos':               { nombre: 'Legado STEMos',                    red: 'https://www.instagram.com/legado_stemos' },
  },
};
