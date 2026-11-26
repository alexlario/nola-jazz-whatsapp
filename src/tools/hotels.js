import { config } from '../config.js';
import { HOTEL_ZONES, SENIOR_FRIENDLY_HOTELS } from '../data/travelKnowledge.js';

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
  return checkInDate <= '2027-02-09' && checkOutDate > '2027-02-04';
}

function mapMinRatingParam(minRating) {
  const num = Number(minRating);
  if (!Number.isFinite(num) || num <= 0) return 'AT_LEAST_4_0';
  if (num >= 4.5) return 'AT_LEAST_4_5';
  if (num >= 4.0) return 'AT_LEAST_4_0';
  return 'AT_LEAST_3_5';
}

async function fetchLiveHotelsFromSerpApi({
  checkInDate,
  checkOutDate,
  query = 'New Orleans French Quarter CBD quiet hotels',
  maxPriceEur = null,
  minRating = 4.0,
}) {
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
    sort_by: '8', // highest rating / best quality first
    rating: mapMinRatingParam(minRating),
    api_key: config.serpApiKey,
  });

  if (Number.isFinite(Number(maxPriceEur)) && Number(maxPriceEur) > 40) {
    params.set('max_price', String(Math.round(Number(maxPriceEur))));
  }

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
      ratePerNightEur: p.rate_per_night?.extracted_lowest ?? p.rate_per_night?.lowest ?? null,
      totalRateEur: p.total_rate?.extracted_lowest ?? p.total_rate?.lowest ?? null,
      amenities: Array.isArray(p.amenities) ? p.amenities.slice(0, 5) : [],
      link: p.link || null,
    }));
    return {
      source: 'Google Hotels en vivo (SerpApi)',
      queryUsed: query,
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
  maxPriceEur = null,
  minRating = 4.0,
  checkLive = true,
} = {}) {
  const safeIn = isValidIsoDate(checkInDate) ? checkInDate : '2027-02-11';
  const safeOut = isValidIsoDate(checkOutDate) ? checkOutDate : '2027-02-17';
  const isCarnivalPeak = overlapsCarnivalPeak(safeIn, safeOut);

  let liveData = null;
  if (checkLive && config.serpApiKey) {
    if (budgetLevel === 'historic_quarter') {
      liveData = await fetchLiveHotelsFromSerpApi({
        checkInDate: safeIn,
        checkOutDate: safeOut,
        query: 'New Orleans French Quarter quiet hotels',
        maxPriceEur,
        minRating,
      });
    } else if (budgetLevel === 'jazz_walkable') {
      liveData = await fetchLiveHotelsFromSerpApi({
        checkInDate: safeIn,
        checkOutDate: safeOut,
        query: 'New Orleans Faubourg Marigny Frenchmen Street hotels',
        maxPriceEur,
        minRating,
      });
    } else {
      const [cbdLive, fqLive] = await Promise.all([
        fetchLiveHotelsFromSerpApi({
          checkInDate: safeIn,
          checkOutDate: safeOut,
          query: 'New Orleans CBD Warehouse District hotels',
          maxPriceEur,
          minRating,
        }),
        fetchLiveHotelsFromSerpApi({
          checkInDate: safeIn,
          checkOutDate: safeOut,
          query: 'New Orleans French Quarter hotels',
          maxPriceEur,
          minRating,
        }),
      ]);
      liveData = {
        cbdValue: cbdLive,
        frenchQuarter: fqLive,
      };
    }
  }

  return {
    checkInDate: safeIn,
    checkOutDate: safeOut,
    filtersApplied: {
      budgetLevel,
      minRating,
      ...(maxPriceEur ? { maxPriceEur } : {}),
    },
    carnivalSurgeWarning: isCarnivalPeak
      ? 'Atención: estas fechas tocan los días grandes de Mardi Gras (del 4 al 9 de feb), donde los hoteles céntricos suben a ~340–400 €/noche o más. Si mueve al 10–17 feb ahorrará aprox. un 30–40%.'
      : 'Excelente elección de fechas: fuera del pico de Mardi Gras los hoteles recuperan tarifas normales de invierno (aprox. 30–40% más económicas).',
    recommendedZoneOrder:
      budgetLevel === 'jazz_walkable'
        ? ['marigny', 'cbd', 'french-quarter']
        : budgetLevel === 'historic_quarter'
          ? ['french-quarter', 'cbd', 'marigny']
          : ['cbd', 'marigny', 'french-quarter'],
    zones: HOTEL_ZONES,
    seniorFriendlyExamples: SENIOR_FRIENDLY_HOTELS,
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
