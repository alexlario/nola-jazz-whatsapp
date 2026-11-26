import { compareFebruaryWindows } from '../tools/dates.js';
import { analyzeZaragozaRoutes } from '../tools/flights.js';
import { recommendHotels } from '../tools/hotels.js';
import { planJazzItinerary } from '../tools/jazz.js';

function formatDateComparisonReply() {
  const data = compareFebruaryWindows();
  const early = data.windows.find((w) => w.id === 'early-feb');

  return [
    '*📅 Fechas en febrero 2027: comparar ahorro vs ambiente*',
    '',
    `En 2027 el *Mardi Gras* cae el *martes 9 de febrero*. Eso divide febrero en 3 opciones muy claras:`,
    '',
    `1️⃣ *${early.label}*`,
    `• Desfiles famosos del mié 3 (Druids) al sáb 6 (Iris, Tucks, Endymion).`,
    `• Hoteles: *suben fuerte desde el jue 4* y suelen pedir mínimo de noches.`,
    `• Jazz: muy buen ambiente, aunque más gente en el centro del 4 al 6.`,
    '',
    `2️⃣ *Justo después de Mardi Gras (10–17 de febrero) — ⭐ Más cómoda y económica*`,
    `• Desde el mié 10 feb los hoteles suelen bajar aprox. un *30–40%*.`,
    `• Ciudad mucho más tranquila para pasear, entrar a clubes de Frenchmen St. y dormir bien.`,
    '',
    `3️⃣ *Híbrido (30 ene – 5 feb)*`,
    `• Primeros días tranquilos para el jazz + ves el gran desfile de *Muses* (jue 4) y regresas antes del fin de semana más caro.`,
    '',
    '¿Qué te llama más? Responde *1*, *2* o *3* (o dime tus días aproximados) y miramos los vuelos desde Zaragoza.',
  ].join('\n');
}

async function formatFlightsReply(dates) {
  const outbound = dates?.outbound || '2027-02-11';
  const returnDate = dates?.returnDate || '2027-02-17';
  const data = await analyzeZaragozaRoutes({ outboundDate: outbound, returnDate, checkLive: true });

  const lines = [
    `*🚄✈️ Cómo viajar desde Zaragoza a Nueva Orleans (${outbound} al ${returnDate})*`,
    '',
    '*1. ⭐ AVE a Madrid + Vuelo MAD → MSY (1 escala) — La más cómoda*',
    '• Tren: Zaragoza-Delicias → Madrid Atocha en *1h 15m–1h 30m* (~15–50 € reservando con tiempo).',
    '• Vuelo: British Airways / Iberia vía Londres (ventaja: haces inmigración de EE. UU. directo en MSY, aeropuerto pequeño) o Iberia/AA vía Miami/Charlotte.',
    '• Consejo comodidad (74 años): elige *asiento de pasillo* y solicita asistencia gratuita de aeropuerto en escalas grandes. Tiempo total: ~14–16h | Orientativo i/v: *650–900 €*.',
    '',
    '*2. AVE a Barcelona + Vuelo BCN → MSY (1 escala) — Muy buena alternativa*',
    '• Tren: Zaragoza-Delicias → Barcelona Sants en *1h 35m–1h 50m* (~17–45 €).',
    '• Vuelo: United/Lufthansa (Newark, Frankfurt, Múnich) o Air France/Delta/KLM (París, JFK, Atlanta).',
    '• Orientativo i/v: *700–850 €*.',
    '',
    '*3. ⚠️ ¿Por qué NO suele compensar volar desde Zaragoza (ZAZ)?*',
    '• ZAZ solo tiene directos low-cost (p. ej. Londres Stansted o Milán/Roma), sin billete único transatlántico.',
    '• Si vuelas ZAZ → Londres Stansted tendrías que cruzar Londres hasta Heathrow/Gatwick (~1h30–2h) con billetes separados y sin protección si se retrasa el primer avión.',
    '',
  ];

  if (data.liveSearch?.MAD?.offers?.length) {
    lines.push('*🔎 Tarifas reales encontradas ahora (MAD → MSY):*');
    for (const o of data.liveSearch.MAD.offers.slice(0, 3)) {
      lines.push(`• ${o.priceEur ? `${o.priceEur} €` : 'Consultar'} | ${o.stops} escala(s) | ${o.airlines.join('/')} | ${o.totalDurationMin ? `${Math.round(o.totalDurationMin / 60)}h` : ''}`);
    }
    lines.push('');
  }

  lines.push(
    '*🔗 Ver precios actuales en 1 clic:*',
    `• Desde Madrid (Google Flights): ${data.bookingLinks.MAD.googleFlights}`,
    `• Desde Barcelona (Google Flights): ${data.bookingLinks.BCN.googleFlights}`,
    `• Trenes AVE/Iryo/Ouigo desde Zaragoza: ${data.bookingLinks.MAD.trainFromZaragoza}`,
    '',
    '¿Prefieres ver ahora *hoteles* (responde *hoteles*) o el *plan de jazz* (responde *jazz*)?',
  );

  return lines.join('\n');
}

async function formatHotelsReply(dates) {
  const checkIn = dates?.outbound || '2027-02-11';
  const checkOut = dates?.returnDate || '2027-02-17';
  const data = await recommendHotels({ checkInDate: checkIn, checkOutDate: checkOut, checkLive: true });

  const lines = [
    `*🏨 Zonas recomendadas de hotel (${checkIn} al ${checkOut})*`,
    '',
    `ℹ️ ${data.carnivalSurgeWarning}`,
    '',
    '*1. ⭐ CBD / Warehouse District — Mejor calidad-precio y descanso*',
    '• Hoteles modernos mejor insonorizados, a 10–18 min andando del French Quarter.',
    '• Orientativo: *$130–$220/noche* fuera de Carnaval (o $320–$650+ si toca del 4 al 9 feb).',
    '',
    '*2. Faubourg Marigny / Frenchmen St. — A 3 minutos del mejor jazz*',
    '• Sales de Spotted Cat o Snug Harbor y llegas andando a dormir.',
    '• Orientativo: *$150–$250/noche* fuera de Carnaval (muchas casas boutique/B&B).',
    '',
    '*3. French Quarter (zona tranquila) — Ejemplos probados*',
    '• *Le Richelieu Hotel* (zona baja tranquila, paseo llano 5–10 min a Frenchmen St. y Jackson Sq.), *Wyndham French Quarter* (Royal/Canal junto al tranvía) o *Holiday Inn Chateau LeMoyne* (patio tranquilo).',
    '• Orientativo: *$190–$320/noche* fuera de Carnaval (~340–400 €/noche del 4 al 11 feb).',
    '',
    '*🔗 Enlaces con tus fechas ya puestas:*',
    `• Booking (orden calidad/precio): ${data.bookingLinks.general.booking}`,
    `• Google Hotels (CBD): ${data.bookingLinks.general.googleHotels}`,
    `• Google Hotels (Marigny/Jazz): ${data.bookingLinks.marigny.googleHotels}`,
    '',
    '¿Quieres que te arme ahora la *ruta de clubes de jazz tradicional* y consejos de aeropuerto? Responde *jazz*.',
  ];

  return lines.join('\n');
}

function formatJazzReply() {
  const data = planJazzItinerary({ nights: 5 });

  return [
    '*🎷 Ruta del Mejor Jazz Tradicional en Nueva Orleans*',
    '',
    '*Imprescindibles con asiento reservado (para no esperar de pie):*',
    '• *Preservation Hall* (726 St. Peter St.): reserva online entrada con *asiento reservado (Big Shot o fila delantera)*, ya que la general es de pie con cola.',
    '• *Snug Harbor Jazz Bistro* (626 Frenchmen St.): butacas numeradas (pases 19:30 y 21:30) + restaurante criollo delante.',
    '• *Crucero Steamboat Natchez* (Toulouse St. Wharf): paseo diurno de 2 h en barco de vapor con jazz en directo sentado y almuerzo opcional.',
    '',
    '*Locales clave para pasear sin agobios (Frenchmen St. y Quarter):*',
    '• *The Spotted Cat* (623 Frenchmen St.): ve entre *15:00 y 18:30* para escuchar gran jazz tradicional y swing sentado sin multitudes.',
    '• *The Maison* (508) y *Three Muses* (536 Frenchmen St.): locales con mesas para cenar tranquilo escuchando música en directo.',
    '• *Fritzel’s European Jazz Pub* (733 Bourbon St.) y *Bamboula’s* (514/516 Frenchmen St.): jazz clásico todo el día.',
    '',
    '*🚕 Consejos prácticos (74 años, febrero):*',
    `• ${data.practicalTips.airportTransfer}`,
    `• ${data.practicalTips.weatherAndPacking}`,
    `• ${data.practicalTips.cashForJazz}`,
    `• Agenda diaria de bandas: ${data.practicalTips.liveScheduleLink}`,
    `• ${data.practicalTips.entryDocs}`,
    '',
    'Si quieres ajustar fechas exactas, comparar los días del *1–6 feb* frente al *10–17 feb*, o sacar enlaces nuevos de vuelos, dime qué fechas prefieres.',
  ].join('\n');
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function extractDatesFromHistory(text, session) {
  const pref = session?.preferences?.selectedWindow;
  const lower = text.toLowerCase();

  const customRange = lower.match(/\bdel?\s+(\d{1,2})\s+al?\s+(\d{1,2})\b/);
  if (customRange) {
    const d1 = Number.parseInt(customRange[1], 10);
    const d2 = Number.parseInt(customRange[2], 10);
    if (d1 >= 1 && d1 <= 28 && d2 > d1 && d2 <= 28) {
      return {
        outbound: `2027-02-${pad2(d1)}`,
        returnDate: `2027-02-${pad2(d2)}`,
        windowId: d1 <= 6 ? 'early-feb' : 'post-mardi-gras',
      };
    }
  }

  if (lower.includes('1 al 6') || lower.includes('1-6') || lower.includes('1–6') || lower.includes('mardi gras')) {
    return { outbound: '2027-02-01', returnDate: '2027-02-07', windowId: 'early-feb' };
  }
  if (lower.includes('después') || lower.includes('despues') || lower.includes('10') || lower.includes('11')) {
    return { outbound: '2027-02-11', returnDate: '2027-02-17', windowId: 'post-mardi-gras' };
  }
  if (lower.includes('híbrido') || lower.includes('hibrido') || lower.includes('30')) {
    return { outbound: '2027-01-30', returnDate: '2027-02-05', windowId: 'hybrid-early' };
  }

  if (pref === 'early-feb') return { outbound: '2027-02-01', returnDate: '2027-02-07', windowId: 'early-feb' };
  if (pref === 'hybrid-early') return { outbound: '2027-01-30', returnDate: '2027-02-05', windowId: 'hybrid-early' };
  return { outbound: '2027-02-11', returnDate: '2027-02-17', windowId: 'post-mardi-gras' };
}

export async function runFallbackReply(userText, session) {
  const lower = userText.trim().toLowerCase();
  const lastAssistant = [...(session?.history || [])].reverse().find((m) => m.role === 'assistant')?.text || '';
  const dates = extractDatesFromHistory(userText, session);

  // Numeric quick-replies based on previous prompt
  if (/^[123]$/.test(lower)) {
    if (lastAssistant.includes('Fechas en febrero 2027')) {
      if (lower === '1') {
        const reply = await formatFlightsReply({ outbound: '2027-02-01', returnDate: '2027-02-07' });
        return { reply, preferencesPatch: { selectedWindow: 'early-feb' } };
      }
      if (lower === '2') {
        const reply = await formatFlightsReply({ outbound: '2027-02-11', returnDate: '2027-02-17' });
        return { reply, preferencesPatch: { selectedWindow: 'post-mardi-gras' } };
      }
      if (lower === '3') {
        const reply = await formatFlightsReply({ outbound: '2027-01-30', returnDate: '2027-02-05' });
        return { reply, preferencesPatch: { selectedWindow: 'hybrid-early' } };
      }
    }
    if (lower === '1') return { reply: formatDateComparisonReply(), preferencesPatch: null };
    if (lower === '2') return { reply: await formatFlightsReply(dates), preferencesPatch: null };
    if (lower === '3') return { reply: await formatHotelsReply(dates), preferencesPatch: null };
  }

  if (/(hola|buenas|empezar|ayuda|menu|menú|planificar|inicio)/.test(lower) && lower.length < 60) {
    return {
      reply: [
        '¡Hola! Soy tu asistente para preparar el viaje de *Zaragoza a Nueva Orleans en febrero de 2027* y disfrutar del mejor jazz de la forma más cómoda y económica. 🎷',
        '',
        'Podemos ir paso a paso. ¿Por qué prefieres empezar?',
        '1️⃣ *Comparar fechas* (1–6 feb vs después de Mardi Gras, que en 2027 cae el 9 feb)',
        '2️⃣ *Vuelos y AVE desde Zaragoza* (Madrid/Barcelona vs ZAZ, escalas y precios)',
        '3️⃣ *Hoteles recomendados* (CBD, Marigny o French Quarter)',
        '• O escribe *jazz* para ver los mejores clubes tradicionales y consejos prácticos.',
      ].join('\n'),
      preferencesPatch: null,
    };
  }

  if (/(fecha|mardi|carnaval|desfile|cuando|cuándo|1 al 6|1-6|1–6|comparar)/.test(lower)) {
    return {
      reply: formatDateComparisonReply(),
      preferencesPatch: { selectedWindow: dates.windowId },
    };
  }

  if (/(vuelo|ave|tren|zaragoza|zaz|madrid|barcelona|escala|avion|avión|enlace|link)/.test(lower)) {
    return {
      reply: await formatFlightsReply(dates),
      preferencesPatch: { selectedWindow: dates.windowId },
    };
  }

  if (/(hotel|aloja|dormir|zona|barrio|marigny|cbd|quarter|precio.*noche|habitaci)/.test(lower)) {
    return {
      reply: await formatHotelsReply(dates),
      preferencesPatch: { selectedWindow: dates.windowId },
    };
  }

  if (/(jazz|musica|música|club|bar|frenchmen|preservation|snug|spotted|itinerario|taxi|aeropuerto)/.test(lower)) {
    return {
      reply: formatJazzReply(),
      preferencesPatch: null,
    };
  }

  // Generic helpful response combining key summary
  return {
    reply: [
      'Puedo ayudarte con cualquiera de las 4 piezas del viaje desde *Zaragoza a Nueva Orleans (febrero 2027)*:',
      '',
      '• Escribe *fechas* para comparar del 1–6 feb frente a después del 10 feb (Mardi Gras es el 9 feb 2027).',
      '• Escribe *vuelos* para comparar AVE a Madrid/Barcelona + 1 escala frente a salir de ZAZ (con enlaces directos).',
      '• Escribe *hoteles* para ver mejores zonas (CBD, Marigny o French Quarter).',
      '• Escribe *jazz* para la ruta de clubes tradicionales (Preservation Hall, Snug Harbor, Spotted Cat, Fritzel’s).',
    ].join('\n'),
    preferencesPatch: null,
  };
}
