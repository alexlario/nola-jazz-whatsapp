import { config } from '../config.js';
import { diagnostics, sanitizeMessage } from '../diagnostics.js';
import { ZARAGOZA_ROUTES } from '../data/travelKnowledge.js';

const EUROPEAN_HUBS = new Set(['LHR', 'LGW', 'CDG', 'ORY', 'FRA', 'MUC', 'AMS', 'DUB', 'MAD', 'BCN', 'LIS', 'ZRH']);

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

function parseHour(timeStr) {
  if (typeof timeStr !== 'string') return null;
  const match = timeStr.match(/\b(\d{1,2}):(\d{2})\b/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function scoreFlightForSeniorTraveler(offer) {
  let score = 100;
  if (offer.stops > 1) score -= 35;
  if (offer.hasOvernightLayover) score -= 25;
  if (offer.totalDurationMin && offer.totalDurationMin > 1020) score -= 12; // >17h
  if (offer.layoverMinutesMax && offer.layoverMinutesMax > 300) score -= 10; // >5h
  if (offer.layoverMinutesMin && offer.layoverMinutesMin < 95 && !offer.usImmigrationAtMSY) {
    score -= 18; // Conexión justa en EE. UU. pasando inmigración
  }
  if (offer.usImmigrationAtMSY) score += 8; // Escala en Europa -> inmigración cómoda al llegar a MSY

  const depHour = parseHour(offer.departureTime);
  if (depHour !== null && depHour >= 9 && depHour <= 15) {
    score += 6; // Horario diurno cómodo para enlazar AVE desde Zaragoza por la mañana
  } else if (depHour !== null && depHour < 8) {
    score -= 8; // Muy temprano para salir desde Zaragoza el mismo día
  }

  if (typeof offer.priceEur === 'number') {
    score -= Math.round(Math.max(0, offer.priceEur - 600) / 40);
  }
  return Math.max(0, Math.min(100, score));
}

export function summarizeSerpApiFlightOffer(item) {
  const legs = item.flights || [];
  const firstLeg = legs[0] || {};
  const lastLeg = legs[legs.length - 1] || {};
  const stopsCount = Math.max(0, legs.length - 1);
  const layoverObjs = item.layovers || [];

  const layovers = layoverObjs.map((l) => {
    const hrs = l.duration ? `${Math.round((l.duration / 60) * 10) / 10}h` : '?';
    return `${l.id || l.name || 'Escala'} (${hrs}${l.overnight ? ', noche' : ''})`;
  });

  const layoverHubs = layoverObjs.map((l) => String(l.id || '').toUpperCase()).filter(Boolean);
  const usImmigrationAtMSY =
    stopsCount > 0 && layoverHubs.length > 0 && layoverHubs.every((hub) => EUROPEAN_HUBS.has(hub));

  const durations = layoverObjs.map((l) => Number(l.duration || 0)).filter((d) => d > 0);
  const airlines = [...new Set(legs.map((l) => l.airline).filter(Boolean))];
  const departureTime = firstLeg.departure_airport?.time || null;
  const arrivalTime = lastLeg.arrival_airport?.time || null;

  const summary = {
    priceEur: item.price ?? null,
    totalDurationMin: item.total_duration ?? null,
    stops: stopsCount,
    airlines,
    departureTime,
    arrivalTime,
    layovers,
    hasOvernightLayover: layoverObjs.some((l) => Boolean(l.overnight)) || legs.some((l) => Boolean(l.overnight)),
    layoverMinutesMin: durations.length ? Math.min(...durations) : null,
    layoverMinutesMax: durations.length ? Math.max(...durations) : null,
    usImmigrationAtMSY,
  };

  summary.comfortScore = scoreFlightForSeniorTraveler(summary);
  return summary;
}

async function fetchLiveFlightsFromSerpApi({ origin, destination = 'MSY', outboundDate, returnDate }) {
  if (!config.serpApiKey) return null;

  const params = new URLSearchParams({
    engine: 'google_flights',
    type: '1',
    departure_id: origin,
    arrival_id: destination,
    outbound_date: outboundDate,
    return_date: returnDate,
    stops: '2', // 1 stop or fewer
    currency: 'EUR',
    hl: 'es',
    gl: 'es',
    api_key: config.serpApiKey,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.error) {
      const msg = json?.error || `HTTP ${res.status}`;
      diagnostics.lastSerpApiFlights = { ok: false, origin, error: sanitizeMessage(msg) };
      return { error: `SerpApi: ${msg}` };
    }
    const candidates = [...(json.best_flights || []), ...(json.other_flights || [])]
      .slice(0, 8)
      .map(summarizeSerpApiFlightOffer)
      .sort((a, b) => b.comfortScore - a.comfortScore || (a.priceEur ?? 9999) - (b.priceEur ?? 9999))
      .slice(0, 5);

    diagnostics.lastSerpApiFlights = {
      ok: true,
      origin,
      outboundDate,
      offersCount: candidates.length,
    };

    return {
      source: 'Google Flights en vivo (SerpApi, ordenados por comodidad y precio)',
      offers: candidates,
    };
  } catch (err) {
    const msg = err.name === 'AbortError' ? 'Tiempo de espera agotado (10s) consultando vuelos en vivo' : err.message;
    diagnostics.lastSerpApiFlights = { ok: false, origin, error: sanitizeMessage(msg) };
    return { error: msg };
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeZaragozaRoutes({
  outboundDate = '2027-02-11',
  returnDate = '2027-02-17',
  alternateOutboundDate = null,
  alternateReturnDate = null,
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
  let alternateLiveData = null;

  if (checkLive && config.serpApiKey) {
    const tasks = [
      fetchLiveFlightsFromSerpApi({ origin: 'MAD', outboundDate: safeOut, returnDate: safeRet }),
      fetchLiveFlightsFromSerpApi({ origin: 'BCN', outboundDate: safeOut, returnDate: safeRet }),
    ];

    const hasAlt = isValidIsoDate(alternateOutboundDate) && isValidIsoDate(alternateReturnDate);
    if (hasAlt) {
      tasks.push(
        fetchLiveFlightsFromSerpApi({
          origin: 'MAD',
          outboundDate: alternateOutboundDate,
          returnDate: alternateReturnDate,
        }),
      );
    }

    const results = await Promise.all(tasks);
    liveData = { MAD: results[0], BCN: results[1] };
    if (hasAlt) {
      alternateLiveData = {
        outboundDate: alternateOutboundDate,
        returnDate: alternateReturnDate,
        MAD: results[2],
      };
    }
  }

  return {
    outboundDate: safeOut,
    returnDate: safeRet,
    priority,
    verdictForDad:
      'La opción más equilibrada en comodidad, seguridad y precio desde Zaragoza es AVE/Iryo/Ouigo a Madrid-Atocha (~1h15–1h30) o Barcelona-Sants (~1h35–1h50) y vuelo en billete único con 1 sola escala a Nueva Orleans (MSY). Si la escala es en Londres (LHR/BA-Iberia), haces inmigración de EE. UU. directo en MSY sin prisas en la escala. Salir desde Zaragoza (ZAZ) obliga a billetes separados y cambio de aeropuerto.',
    routes: ZARAGOZA_ROUTES,
    bookingLinks: links,
    liveSearch: liveData || {
      source: 'Estimación verificada + enlaces directos (configura SERPAPI_API_KEY si quieres tarifas exactas en tiempo real dentro del chat)',
    },
    ...(alternateLiveData ? { alternateDatesLiveSearch: alternateLiveData } : {}),
  };
}
