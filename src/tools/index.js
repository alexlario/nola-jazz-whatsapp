import { compareFebruaryWindows } from './dates.js';
import { analyzeZaragozaRoutes } from './flights.js';
import { recommendHotels } from './hotels.js';
import { planJazzItinerary } from './jazz.js';

export const TOOL_SPECS = [
  {
    name: 'compare_february_windows',
    description:
      'Compara ventanas de fechas en febrero de 2027 para Nueva Orleans: entorno 1–6 feb (pre-Mardi Gras con desfiles y subida hotelera) frente a post-Mardi Gras (desde 10–11 feb, mucho más barato y tranquilo para el jazz) y opción híbrida.',
    parameters: {
      type: 'object',
      properties: {
        focus: {
          type: 'string',
          description: 'Enfoque de comparación: compare_all, early_feb, post_mardi_gras o hybrid.',
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
      'Compara opciones de viaje desde Zaragoza a Nueva Orleans (MSY): AVE/Iryo/Ouigo a Madrid + vuelo MAD-MSY (1 escala), AVE a Barcelona + vuelo BCN-MSY (1 escala) frente a salir del aeropuerto de Zaragoza (ZAZ). Devuelve enlaces directos a Google Flights, Skyscanner y trenes, y precios en vivo si SerpApi está configurado.',
    parameters: {
      type: 'object',
      properties: {
        outboundDate: {
          type: 'string',
          description: 'Fecha de salida en formato YYYY-MM-DD (ej. 2027-02-01 o 2027-02-11).',
        },
        returnDate: {
          type: 'string',
          description: 'Fecha de regreso en formato YYYY-MM-DD (ej. 2027-02-07 o 2027-02-17).',
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
      'Recomienda zonas de hotel en Nueva Orleans (CBD/Warehouse District, Faubourg Marigny/Frenchmen St., French Quarter) comparando tranquilidad, cercanía al jazz, efecto Mardi Gras y enlaces con fechas pre-cargadas a Booking y Google Hotels (más precios en vivo si SerpApi está configurado).',
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
          description: 'Preferencia: balanced (CBD mejor relación calidad-precio), jazz_walkable (Marigny/Frenchmen) o historic_quarter.',
        },
      },
    },
    handler: async (args) => recommendHotels(args),
  },
  {
    name: 'plan_jazz_itinerary',
    description:
      'Genera un plan de noches y locales de jazz tradicional en Nueva Orleans (Preservation Hall, Snug Harbor, Spotted Cat, Fritzel’s, Three Muses, d.b.a., The Maison, Bamboula’s, Mahogany) con horarios, precios de entrada, reservas recomendadas y consejos prácticos de aeropuerto y propinas.',
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
