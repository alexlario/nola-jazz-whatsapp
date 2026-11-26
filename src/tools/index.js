import { compareFebruaryWindows } from './dates.js';
import { analyzeZaragozaRoutes } from './flights.js';
import { recommendHotels } from './hotels.js';
import { planJazzItinerary } from './jazz.js';
import { searchLiveNolaJazz } from './liveSearch.js';

export const TOOL_SPECS = [
  {
    name: 'compare_february_windows',
    description:
      'Compara ventanas de fechas en febrero de 2027 para Nueva Orleans: semana grande 4–11 feb (Mardi Gras el 9 feb, desfiles Bacchus/Orpheus/Zulu/Rex), entorno 1–6 feb, híbrido 30 ene–5 feb, y post-Mardi Gras (10–17 feb, ~30–40% más barato y tranquilo).',
    parameters: {
      type: 'object',
      properties: {
        focus: {
          type: 'string',
          description: 'Enfoque de comparación: compare_all, early_feb, post_mardi_gras, hybrid o mardi_gras_week.',
        },
        preferredDays: {
          type: 'number',
          description: 'Duración deseada del viaje en días (entre 4 y 14, por defecto 6).',
        },
      },
    },
    handler: async (args) => compareFebruaryWindows(args),
  },
  {
    name: 'analyze_zaragoza_routes',
    description:
      'Búsqueda avanzada en tiempo real de vuelos desde Zaragoza (AVE a Madrid/Barcelona + vuelo MAD/BCN->MSY con 1 escala) frente a ZAZ. Analiza horarios diurnos, duración de escalas, si pasa inmigración en EE. UU. o directo en MSY (vía Londres), calcula comfortScore por comodidad/precio y puede comparar dos pares de fechas a la vez.',
    parameters: {
      type: 'object',
      properties: {
        outboundDate: {
          type: 'string',
          description: 'Fecha principal de salida YYYY-MM-DD (ej. 2027-02-04 o 2027-02-11).',
        },
        returnDate: {
          type: 'string',
          description: 'Fecha principal de regreso YYYY-MM-DD (ej. 2027-02-11 o 2027-02-18).',
        },
        alternateOutboundDate: {
          type: 'string',
          description: 'Opcional: segunda fecha de salida YYYY-MM-DD para comparar precios en vivo en paralelo.',
        },
        alternateReturnDate: {
          type: 'string',
          description: 'Opcional: segunda fecha de regreso YYYY-MM-DD para comparar precios en vivo en paralelo.',
        },
        priority: {
          type: 'string',
          description: 'Prioridad del viajero: balanced, comfort o budget.',
        },
      },
    },
    handler: async (args) => analyzeZaragozaRoutes(args),
  },
  {
    name: 'recommend_hotels',
    description:
      'Búsqueda avanzada de hoteles en Nueva Orleans en tiempo real (Google Hotels) filtrada por zona (CBD, Marigny/Frenchmen, French Quarter tranquilo), valoración mínima y precio máximo en euros, comparando impacto de Mardi Gras y añadiendo ejemplos cómodos + enlaces de reserva.',
    parameters: {
      type: 'object',
      properties: {
        checkInDate: {
          type: 'string',
          description: 'Fecha de entrada YYYY-MM-DD.',
        },
        checkOutDate: {
          type: 'string',
          description: 'Fecha de salida YYYY-MM-DD.',
        },
        budgetLevel: {
          type: 'string',
          description: 'Preferencia: balanced (compara CBD y French Quarter en vivo), jazz_walkable (Marigny) o historic_quarter (French Quarter).',
        },
        maxPriceEur: {
          type: 'number',
          description: 'Opcional: presupuesto máximo por noche en euros para filtrar hoteles en vivo.',
        },
        minRating: {
          type: 'number',
          description: 'Opcional: valoración mínima sobre 5 (ej. 4.0 o 4.5, por defecto 4.0).',
        },
      },
    },
    handler: async (args) => recommendHotels(args),
  },
  {
    name: 'plan_jazz_itinerary',
    description:
      'Genera un plan cómodo y sentado de jazz tradicional en Nueva Orleans (Snug Harbor, Preservation Hall con butaca reservada, Spotted Cat de tarde, The Maison, crucero Steamboat Natchez) con reservas clave, clima de febrero y consejos prácticos.',
    parameters: {
      type: 'object',
      properties: {
        nights: {
          type: 'number',
          description: 'Número de noches en Nueva Orleans (entre 2 y 10).',
        },
        style: {
          type: 'string',
          description: 'Estilo prioritario: traditional, dixieland, acoustic o mixed.',
        },
      },
    },
    handler: async (args) => planJazzItinerary(args),
  },
  {
    name: 'search_live_nola_jazz',
    description:
      'Búsqueda web en vivo en Google (SerpApi) para consultar cualquier dato actualizado online: conciertos/bandas en WWOZ, entradas de Preservation Hall/Snug Harbor/Steamboat Natchez, gradas de Mardi Gras, reseñas de hoteles, restaurantes criollos tranquilos o trenes AVE Zaragoza–Madrid/Barcelona.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Consulta concreta para buscar en vivo en Google.',
        },
        focus: {
          type: 'string',
          description: 'wwoz_schedule, parades_tickets, jazz_venues, trains_ave o general_nola.',
        },
      },
      required: ['query'],
    },
    handler: async (args) => searchLiveNolaJazz(args),
  },
  {
    name: 'save_traveler_preferences',
    description:
      'Guarda en el cuaderno del viaje cualquier preferencia, decisión o dato que comparta Antonio (fechas elegidas, presupuesto, si viaja solo o acompañado, salida preferida, hotel/vuelo elegido o notas personales) para recordarlo durante toda la planificación.',
    parameters: {
      type: 'object',
      properties: {
        selectedWindow: {
          type: 'string',
          description: 'Ventana elegida: mardi-gras-week, early-feb, post-mardi-gras o hybrid-early.',
        },
        outboundDate: {
          type: 'string',
          description: 'Fecha de ida YYYY-MM-DD si la ha decidido.',
        },
        returnDate: {
          type: 'string',
          description: 'Fecha de regreso YYYY-MM-DD si la ha decidido.',
        },
        preferredOrigin: {
          type: 'string',
          description: 'Origen preferido: MAD, BCN o ZAZ.',
        },
        travelers: {
          type: 'string',
          description: 'Ej. "1 adulto", "2 adultos".',
        },
        hotelZone: {
          type: 'string',
          description: 'Zona preferida: cbd, marigny o french-quarter.',
        },
        maxHotelPerNightEur: {
          type: 'number',
          description: 'Tope aproximado de hotel por noche en euros.',
        },
        chosenFlight: {
          type: 'string',
          description: 'Resumen del vuelo preferido o cerrado.',
        },
        chosenHotel: {
          type: 'string',
          description: 'Nombre del hotel preferido o reservado.',
        },
        note: {
          type: 'string',
          description: 'Cualquier preferencia o comentario personal de Antonio que convenga recordar (ritmo tranquilo, pasillo, comida, etc.).',
        },
      },
    },
    handler: async (args, context) => {
      if (!context?.sessionStore || !context?.sessionId) {
        return { saved: false, reason: 'Sin almacenamiento de sesión activo' };
      }
      const updated = await context.sessionStore.updatePreferences(context.sessionId, args);
      return { saved: true, travelNotebook: updated };
    },
  },
  {
    name: 'get_trip_summary',
    description:
      'Devuelve la hoja de ruta actual del viaje de Antonio (todo lo cerrado hasta ahora, lo que falta por decidir y el checklist de trámites y preparativos pendientes) para darle claridad y seguridad.',
    parameters: {
      type: 'object',
      properties: {},
    },
    handler: async (_args, context) => {
      if (!context?.sessionStore || !context?.sessionId) {
        return { error: 'Sin almacenamiento de sesión activo' };
      }
      const session = await context.sessionStore.getSession(context.sessionId);
      const prefs = session.preferences || {};
      const pending = [];
      if (!prefs.outboundDate || !prefs.returnDate) pending.push('Elegir fechas exactas de ida y vuelta');
      if (!prefs.preferredOrigin) pending.push('Decidir salida por Madrid o Barcelona en AVE');
      if (!prefs.chosenFlight) pending.push('Seleccionar y reservar vuelo');
      if (!prefs.chosenHotel) pending.push('Seleccionar y reservar hotel (tarifa cancelación gratuita)');
      pending.push(
        'Pasaporte en vigor + ESTA oficial (https://esta.cbp.dhs.gov)',
        'Seguro médico de viaje para EE. UU.',
        'Reservar entradas con asiento en Preservation Hall y Snug Harbor',
        'Avisar al banco en España, llevar billetes pequeños en USD y adaptador enchufe EE. UU.',
      );
      return {
        travelNotebook: prefs,
        pendingChecklist: pending,
      };
    },
  },
];

const TOOL_MAP = new Map(TOOL_SPECS.map((t) => [t.name, t]));

export async function executeTool(name, args = {}, context = {}) {
  const tool = TOOL_MAP.get(name);
  if (!tool) {
    return { error: `Herramienta desconocida: ${name}` };
  }
  try {
    return await tool.handler(args || {}, context);
  } catch (err) {
    return { error: `Error ejecutando ${name}: ${err.message}` };
  }
}
