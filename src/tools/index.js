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
      'Búsqueda avanzada en tiempo real de vuelos desde Zaragoza (AVE a Madrid/Barcelona + vuelo MAD/BCN->MSY con 1 escala) frente a ZAZ. Analiza horarios diurnos, duración de escalas, si pasa inmigración en EE. UU. o directo en MSY (vía Londres), calcula comfortScore para 74 años y puede comparar dos pares de fechas a la vez.',
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
      'Búsqueda avanzada de hoteles en Nueva Orleans en tiempo real (Google Hotels) filtrada por zona (CBD, Marigny/Frenchmen, French Quarter tranquilo), valoración mínima y precio máximo en euros, comparando impacto de Mardi Gras y añadiendo ejemplos cómodos para 74 años + enlaces de reserva.',
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
      'Genera un plan cómodo y sentado de jazz tradicional en Nueva Orleans (Snug Harbor, Preservation Hall Big Shot, Spotted Cat de tarde, The Maison, crucero Steamboat Natchez) con reservas clave, clima de febrero y consejos para 74 años.',
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
      'Busca en vivo en Google/WWOZ información actualizada sobre programación de bandas de jazz en Nueva Orleans, entradas de Preservation Hall/Snug Harbor/Steamboat Natchez, gradas de Mardi Gras (Grandstand Tickets) o restaurantes criollos tranquilos.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Consulta concreta en español o inglés (ej. "Snug Harbor calendar February", "Steamboat Natchez lunch jazz cruise tickets", "Mardi Gras grandstand tickets St Charles").',
        },
        focus: {
          type: 'string',
          description: 'wwoz_schedule, parades_tickets o jazz_venues.',
        },
      },
      required: ['query'],
    },
    handler: async (args) => searchLiveNolaJazz(args),
  },
];

const TOOL_MAP = new Map(TOOL_SPECS.map((t) => [t.name, t]));

export async function executeTool(name, args = {}) {
  const tool = TOOL_MAP.get(name);
  if (!tool) {
    return { error: `Herramienta desconocida: ${name}` };
  }
  try {
    return await tool.handler(args || {});
  } catch (err) {
    return { error: `Error ejecutando ${name}: ${err.message}` };
  }
}
