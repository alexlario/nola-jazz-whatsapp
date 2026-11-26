import { config } from '../config.js';
import { HOTEL_ZONES } from '../data/travelKnowledge.js';

function isValidIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function buildHotelLinks({ checkInDate = '2027-02-11', checkOutDate = '2027-02-17', zone = 'CBD' }) {
  const safeIn = isValidIsoDate(checkInDate) ? checkInDate : '2027-02-11';
  const safeOut = isValidIsoDate(checkOutDate) ? checkOutDate : '2027-02-17';
  const queryMap = {
    cbd: 'New Orleans CBD Warehouse District hotels',
    marigny: 'New Orleans Faubourg Marigny Frenchmen Street hotels',
    'french-quarter': 'New Orleans French Quarter quiet hotels',
  };
  const label = queryMap[zone] || 'New Orleans hotels';

  const bookingUrl = new URL('https://www.booking.com/searchresults.es.html');
  bookingUrl.searchParams.set('ss', 'Nueva Orleans, Luisiana, Estados Unidos');
  bookingUrl.searchParams.set('checkin', safeIn);
  bookingUrl.searchParams.set('checkout', safeOut);
  bookingUrl.searchParams.set('group_adults', '1');
  bookingUrl.searchParams.set('no_rooms', '1');
  bookingUrl.searchParams.set('order', 'review_score_and_price');

  const googleHotelsUrl = `https://www.google.com/travel/hotels?q=${encodeURIComponent(`${label} ${safeIn} to ${safeOut}`)}`;

  return {
    booking: bookingUrl.toString(),
    googleHotels: googleHotelsUrl,
  };
}

function overlapsCarnivalPeak(checkInDate, checkOutDate) {
  // Peak surge runs heavily from Thu 2027-02-04 through Fat Tuesday 2027-02-09
  return checkInDate <= '2027-02-09' && checkOutDate > '2027-02-04';
}

async function fetchLiveHotelsFromSerpApi({ checkInDate, checkOutDate, query = 'New Orleans CBD hotels' }) {
  if (!config.serpApiKey) return null;

  const params = new URLSearchParams({
    engine: 'google_hotels',
    q: query,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    adults: '1',
    currency: 'EUR',
    hl: 'es',
    gl: 'es',
    sort_by: '13', // highest rated / best value when available
    api_key: config.serpApiKey,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) return { error: `SerpApi devolvió HTTP ${res.status}` };
    const json = await res.json();
    const props = (json.properties || []).slice(0, 6).map((p) => ({
      name: p.name,
      rating: p.overall_rating ?? null,
      reviews: p.reviews ?? null,
      ratePerNight: p.rate_per_night?.lowest ?? null,
      totalRate: p.total_rate?.lowest ?? null,
      neighborhood: p.neighborhood || null,
    }));
    return {
      source: 'Google Hotels en vivo (SerpApi)',
      properties: props,
    };
  } catch (err) {
    return { error: err.name === 'AbortError' ? 'Tiempo de espera agotado consultando hoteles' : err.message };
  } finally {
    clearTimeout(timeout);
  }
}

export async function recommendHotels({
  checkInDate = '2027-02-11',
  checkOutDate = '2027-02-17',
  budgetLevel = 'balanced',
  checkLive = true,
} = {}) {
  const safeIn = isValidIsoDate(checkInDate) ? checkInDate : '2027-02-11';
  const safeOut = isValidIsoDate(checkOutDate) ? checkOutDate : '2027-02-17';
  const isCarnivalPeak = overlapsCarnivalPeak(safeIn, safeOut);

  let liveData = null;
  if (checkLive && config.serpApiKey) {
    const query =
      budgetLevel === 'jazz_walkable'
        ? 'New Orleans Marigny French Quarter hotels'
        : 'New Orleans CBD Warehouse District hotels';
    liveData = await fetchLiveHotelsFromSerpApi({ checkInDate: safeIn, checkOutDate: safeOut, query });
  }

  return {
    checkInDate: safeIn,
    checkOutDate: safeOut,
    carnivalSurgeWarning: isCarnivalPeak
      ? 'Atención: estas fechas tocan el fin de semana previo a Mardi Gras (del 4 al 9 de feb), donde los hoteles suelen subir un 150–300% y exigir mínimos de estancia. Si adelantas la salida o mueves al 10–17 feb ahorrarás bastante.'
      : 'Excelente elección de fechas: fuera del pico de Mardi Gras los hoteles recuperan tarifas normales de invierno (aprox. 30–40% más económicas).',
    recommendedZoneOrder:
      budgetLevel === 'jazz_walkable'
        ? ['marigny', 'cbd', 'french-quarter']
        : ['cbd', 'marigny', 'french-quarter'],
    zones: HOTEL_ZONES,
    bookingLinks: {
      general: buildHotelLinks({ checkInDate: safeIn, checkOutDate: safeOut, zone: 'cbd' }),
      marigny: buildHotelLinks({ checkInDate: safeIn, checkOutDate: safeOut, zone: 'marigny' }),
      frenchQuarter: buildHotelLinks({ checkInDate: safeIn, checkOutDate: safeOut, zone: 'french-quarter' }),
    },
    liveSearch: liveData || {
      source: 'Rangos de referencia reales + enlaces directos con fechas cargadas',
    },
  };
}
