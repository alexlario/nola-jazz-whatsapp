import { config } from '../config.js';
import { ZARAGOZA_ROUTES } from '../data/travelKnowledge.js';

function isValidIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function buildFlightLinks({ origin = 'MAD', destination = 'MSY', outboundDate = '2027-02-11', returnDate = '2027-02-17' }) {
  const safeOut = isValidIsoDate(outboundDate) ? outboundDate : '2027-02-11';
  const safeRet = isValidIsoDate(returnDate) ? returnDate : '2027-02-17';
  const safeOrigin = /^[A-Z]{3}$/.test(String(origin).toUpperCase()) ? String(origin).toUpperCase() : 'MAD';
  const safeDest = /^[A-Z]{3}$/.test(String(destination).toUpperCase()) ? String(destination).toUpperCase() : 'MSY';

  const gfQuery = `Flights to ${safeDest} from ${safeOrigin} on ${safeOut} through ${safeRet} one stop`;
  const compactOut = safeOut.slice(2).replace(/-/g, '');
  const compactRet = safeRet.slice(2).replace(/-/g, '');

  return {
    googleFlights: `https://www.google.com/travel/flights?q=${encodeURIComponent(gfQuery)}`,
    skyscanner: `https://www.skyscanner.es/transporte/vuelos/${safeOrigin.toLowerCase()}/${safeDest.toLowerCase()}/${compactOut}/${compactRet}/`,
    trainFromZaragoza:
      safeOrigin === 'BCN'
        ? 'https://www.thetrainline.com/es/horarios-trenes/zaragoza-a-barcelona'
        : 'https://www.thetrainline.com/es/horarios-trenes/zaragoza-a-madrid',
  };
}

async function fetchLiveFlightsFromSerpApi({ origin, destination = 'MSY', outboundDate, returnDate }) {
  if (!config.serpApiKey) return null;

  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: origin,
    arrival_id: destination,
    outbound_date: outboundDate,
    return_date: returnDate,
    stops: '2', // 0=any, 1=nonstop, 2=1 stop or fewer
    currency: 'EUR',
    hl: 'es',
    gl: 'es',
    api_key: config.serpApiKey,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      return { error: `SerpApi devolvió HTTP ${res.status}` };
    }
    const json = await res.json();
    const candidates = [...(json.best_flights || []), ...(json.other_flights || [])].slice(0, 6);

    const formatted = candidates.map((item) => {
      const legs = item.flights || [];
      const stopsCount = Math.max(0, legs.length - 1);
      const layovers = (item.layovers || []).map((l) => `${l.name || l.id} (${Math.round((l.duration || 0) / 60 * 10) / 10}h)`);
      const airlines = [...new Set(legs.map((l) => l.airline).filter(Boolean))];
      return {
        priceEur: item.price ?? null,
        totalDurationMin: item.total_duration ?? null,
        stops: stopsCount,
        airlines,
        layovers,
      };
    });

    return {
      source: 'Google Flights en vivo (SerpApi)',
      offers: formatted,
    };
  } catch (err) {
    return { error: err.name === 'AbortError' ? 'Tiempo de espera agotado consultando vuelos en vivo' : err.message };
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeZaragozaRoutes({
  outboundDate = '2027-02-11',
  returnDate = '2027-02-17',
  priority = 'balanced',
  checkLive = true,
} = {}) {
  const safeOut = isValidIsoDate(outboundDate) ? outboundDate : '2027-02-11';
  const safeRet = isValidIsoDate(returnDate) ? returnDate : '2027-02-17';

  const links = {
    MAD: buildFlightLinks({ origin: 'MAD', destination: 'MSY', outboundDate: safeOut, returnDate: safeRet }),
    BCN: buildFlightLinks({ origin: 'BCN', destination: 'MSY', outboundDate: safeOut, returnDate: safeRet }),
    ZAZ: buildFlightLinks({ origin: 'ZAZ', destination: 'MSY', outboundDate: safeOut, returnDate: safeRet }),
  };

  let liveData = null;
  if (checkLive && config.serpApiKey) {
    const [madLive, bcnLive] = await Promise.all([
      fetchLiveFlightsFromSerpApi({ origin: 'MAD', outboundDate: safeOut, returnDate: safeRet }),
      fetchLiveFlightsFromSerpApi({ origin: 'BCN', outboundDate: safeOut, returnDate: safeRet }),
    ]);
    liveData = { MAD: madLive, BCN: bcnLive };
  }

  return {
    outboundDate: safeOut,
    returnDate: safeRet,
    priority,
    verdictForDad:
      'La opción más equilibrada en comodidad, seguridad y precio desde Zaragoza es coger un AVE/Iryo/Ouigo a Madrid-Atocha (~1h15–1h30) o Barcelona-Sants (~1h35–1h50) y volar en billete único con 1 sola escala a Nueva Orleans (MSY). Salir desde el aeropuerto de Zaragoza (ZAZ) obliga a billetes separados (por ejemplo vía Londres Stansted), cambiar de aeropuerto en Londres y asumir el riesgo si hay retrasos.',
    routes: ZARAGOZA_ROUTES,
    bookingLinks: links,
    liveSearch: liveData || {
      source: 'Estimación verificada + enlaces directos (configura SERPAPI_API_KEY si quieres tarifas exactas en tiempo real dentro del chat)',
    },
  };
}
