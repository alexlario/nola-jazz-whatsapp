import { config } from '../config.js';
import { diagnostics, sanitizeMessage } from '../diagnostics.js';

export async function searchLiveNolaJazz({
  query = 'New Orleans traditional jazz live music WWOZ Preservation Hall Snug Harbor February',
  focus = 'jazz_venues',
} = {}) {
  const cleanQuery = String(query || '').trim().slice(0, 180);
  if (!cleanQuery) {
    return { error: 'Consulta vacía' };
  }

  const enrichedQuery =
    focus === 'wwoz_schedule'
      ? `site:wwoz.org ${cleanQuery}`
      : focus === 'parades_tickets'
        ? `New Orleans Mardi Gras 2027 ${cleanQuery}`
        : `New Orleans ${cleanQuery}`;

  if (!config.serpApiKey) {
    return {
      source: 'Sin SERPAPI_API_KEY activa; usa los enlaces oficiales',
      results: [],
      suggestedLinks: {
        wwozLivewire: 'https://www.wwoz.org/calendar/livewire-music',
        preservationHall: 'https://www.preservationhall.com/',
        snugHarbor: 'https://snugjazz.com/shows/',
        steamboatNatchez: 'https://www.steamboatnatchez.com/',
      },
    };
  }

  const params = new URLSearchParams({
    engine: 'google',
    q: enrichedQuery,
    hl: 'en',
    gl: 'us',
    num: '6',
    api_key: config.serpApiKey,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.error) {
      const msg = json?.error || `HTTP ${res.status}`;
      diagnostics.lastSerpApiJazz = { ok: false, error: sanitizeMessage(msg) };
      return { error: `SerpApi Search: ${msg}` };
    }
    const results = (json.organic_results || []).slice(0, 5).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
    }));

    diagnostics.lastSerpApiJazz = { ok: true, resultsCount: results.length };

    return {
      source: 'Búsqueda web en vivo (SerpApi Google)',
      queryUsed: enrichedQuery,
      results,
    };
  } catch (err) {
    const msg = err.name === 'AbortError' ? 'Tiempo de espera agotado buscando lugares/eventos en vivo' : err.message;
    diagnostics.lastSerpApiJazz = { ok: false, error: sanitizeMessage(msg) };
    return { error: msg };
  } finally {
    clearTimeout(timeout);
  }
}
