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

  mapa: {
    embedUrl: '',  // el src del iframe de Google Maps
    linkUrl: '',   // el enlace normal, para abrir la app
    direccion: '[POR CONFIRMAR]',
  },

  virtual: { plataforma: '[POR CONFIRMAR]' },

  legal: { privacidadUrl: '', terminosUrl: '' },
};
