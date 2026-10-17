/* ===========================================================
   A+PRUEBA · datos editables
   Todo lo que cambia sin tocar el resto del código vive aquí.
   Si un campo está vacío, el elemento que depende de él se
   muestra deshabilitado. Nunca queda un enlace roto.
   =========================================================== */

export const CONFIG = {
  evento: {
    inicio: '2026-11-17T09:00:00-05:00', // hora de Lima
    fin:    '2026-11-17T13:00:00-05:00',
  },

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

  // Panel de cada aliado (docs/CAMBIOS-INTERACCION.md §2).
  // PENDIENTE: descripcion y queOfrece son texto de relleno, igual en los seis.
  // Reemplazar con el texto real de cada aliado; nunca inventar datos.
  // Una red vacía se muestra deshabilitada con el texto "Próximamente".
  aliados: {
    'face-to-face': {
      nombre: 'Face to Face',
      descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      queOfrece: ['Lorem ipsum dolor sit amet', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor'],
      redes: { instagram: '', tiktok: '', facebook: '', web: '' },
    },
    'lead-ucsur': {
      nombre: 'LEAD UCSUR',
      descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      queOfrece: ['Lorem ipsum dolor sit amet', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor'],
      redes: { instagram: '', tiktok: '', facebook: '', web: '' },
    },
    'bell': {
      nombre: 'BELL',
      descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      queOfrece: ['Lorem ipsum dolor sit amet', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor'],
      redes: { instagram: '', tiktok: '', facebook: '', web: '' },
    },
    'red-astrum': {
      nombre: 'Red Astrum',
      descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      queOfrece: ['Lorem ipsum dolor sit amet', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor'],
      redes: { instagram: '', tiktok: '', facebook: '', web: '' },
    },
    'club-tecnologia-electronica': {
      nombre: 'Club de Tecnología y Electrónica',
      descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      queOfrece: ['Lorem ipsum dolor sit amet', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor'],
      redes: { instagram: '', tiktok: '', facebook: '', web: '' },
    },
    'legado-stemos': {
      nombre: 'Legado STEMos',
      descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      queOfrece: ['Lorem ipsum dolor sit amet', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor'],
      redes: { instagram: '', tiktok: '', facebook: '', web: '' },
    },
  },
};
