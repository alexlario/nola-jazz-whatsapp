export const FEBRUARY_2027_CARNIVAL = {
  mardiGrasDate: '2027-02-09',
  ashWednesdayDate: '2027-02-10',
  easterDate: '2027-03-28',
  windows: [
    {
      id: 'early-feb',
      label: 'Entorno 1–6 de febrero de 2027 (Pre-Mardi Gras)',
      suggestedDates: { outbound: '2027-02-01', returnDate: '2027-02-07', nights: 5 },
      hotelPriceLevel: 'Alto / Muy alto desde el jueves 4',
      crowdLevel: 'Crece rápido del 3 al 6 de febrero',
      jazzAccess: 'Bueno por las tardes/noches, aunque zonas del centro y rutas de desfiles están muy concurridas del 4 al 6.',
      parades: [
        'Lun 1 y Mar 2 feb: días tranquilos en el centro (desfiles menores en barrios periféricos).',
        'Mié 3 feb: Krewe of Druids y Krewe of Alla (Uptown, tarde ~17:00-18:15).',
        'Jue 4 feb: Knights of Chaos, Knights of Babylon y Krewe of Muses (Uptown, gran desfile muy popular).',
        'Vie 5 feb: Bosom Buddies (French Quarter 11:30), Hermes, Krewe d’Etat y Morpheus (Uptown tarde).',
        'Sáb 6 feb: Iris (11:00), Tucks (12:00) y Endymion (16:00, megadesfile en Mid-City).',
      ],
      pros: [
        'Coincide exactamente con el tramo que teníais en mente.',
        'Permite vivir desfiles icónicos (Muses el jue 4, Hermes/d’Etat el vie 5) antes del caos total del martes 9.',
      ],
      cons: [
        'Los hoteles suben con fuerza a partir del jueves 4 y suelen exigir estancias mínimas de 3–5 noches en fin de semana de Carnaval.',
        'Más tráfico, cortes de calles por desfiles y taxis/Uber más caros desde el jueves.',
      ],
    },
    {
      id: 'post-mardi-gras',
      label: 'Justo después de Mardi Gras (10–17 de febrero de 2027)',
      suggestedDates: { outbound: '2027-02-10', returnDate: '2027-02-17', nights: 6 },
      hotelPriceLevel: 'Económico / Normal de invierno (~30–40% menos que en pico de Carnaval)',
      crowdLevel: 'Moderado y muy agradable',
      jazzAccess: 'Óptimo: todos los clubes de Frenchmen Street y Preservation Hall a pleno rendimiento, sin colas extremas ni sobreprecios.',
      parades: ['Sin grandes desfiles de Carnaval; ciudad tranquila y enfocada en música, gastronomía y paseos.'],
      pros: [
        'Caída inmediata de tarifas hoteleras a partir del Miércoles de Ceniza (10 feb).',
        'Muchísima más comodidad para moverse a pie o en tranvía y entrar sin agobios a clubes de jazz.',
        'Mejor relación comodidad/precio en vuelos de regreso frente al fin de semana largo de Carnaval.',
      ],
      cons: [
        'No se ven carrozas de Mardi Gras (aunque la música en directo es igual o más disfrutable).',
      ],
    },
    {
      id: 'hybrid-early',
      label: 'Híbrido inteligente (30 ene – 5 feb 2027)',
      suggestedDates: { outbound: '2027-01-30', returnDate: '2027-02-05', nights: 5 },
      hotelPriceLevel: 'Moderado del 30 ene al 3 feb; sube el jue 4 feb',
      crowdLevel: 'Tranquilo los primeros días + 2 noches de desfiles',
      jazzAccess: 'Muy bueno entre semana (domingo a miércoles) en Frenchmen Street y French Quarter.',
      parades: [
        'Dom 31 ene – Mar 2 feb: ambiente relajado para disfrutar jazz con calma.',
        'Mié 3 feb (Druids) y Jue 4 feb (Muses): dos grandes desfiles antes del colapso del fin de semana 5–6 feb.',
      ],
      pros: [
        'Combina días baratos y tranquilos para el jazz con la experiencia de ver un gran desfile como Muses.',
        'Vuelta el viernes 5 evita las noches hoteleras más caras del sábado 6 al martes 9.',
      ],
      cons: [
        'Requiere adelantar la salida un par de días respecto al 1 de febrero.',
      ],
    },
    {
      id: 'mardi-gras-week',
      label: 'Semana grande de Carnaval (4–11 de febrero de 2027, 7 noches)',
      suggestedDates: { outbound: '2027-02-04', returnDate: '2027-02-11', nights: 7 },
      hotelPriceLevel: 'Temporada alta de Carnaval (~340–400 €/noche en hoteles céntricos tranquilos)',
      crowdLevel: 'Máximo ambiente de Mardi Gras; ideal usar gradas con asiento',
      jazzAccess: 'Muy bueno en salas sentadas con reserva (Snug Harbor, Preservation Hall con asiento Big Shot, Steamboat Natchez) o Frenchmen St. de tarde.',
      parades: [
        'Jue 4 feb: Chaos, Babylon y Muses.',
        'Vie 5 feb: Bosom Buddies, Hermes, d’Etat y Morpheus.',
        'Sáb 6 feb: Iris, Tucks y Endymion.',
        'Dom 7 feb: Okeanos, Mid-City, Thoth y Bacchus (~17:15, gran desfile nocturno).',
        'Lun 8 feb (Lundi Gras): Proteus (~17:15) y Orpheus (~18:00).',
        'Mar 9 feb (Mardi Gras Day): Zulu (08:00) y Rex (~10:00).',
      ],
      pros: [
        'Permite vivir los días grandes de Mardi Gras sin perderse el jazz sentado.',
        'Consejo práctico: comprar pase de grada con asiento y baños privados (Grandstand Tickets en St. Charles Ave, p. ej. Lafayette Square o Gallier Hall) en lugar de esperar horas de pie en Canal Street.',
      ],
      cons: [
        'Tarifas hoteleras más altas del año; si prefiere ahorrar ~30–40% y más calma, es mejor viajar del 10–17 feb.',
      ],
    },
  ],
};

export const ZARAGOZA_ROUTES = [
  {
    id: 'ave-mad',
    name: 'AVE / Iryo / Ouigo Zaragoza -> Madrid + Vuelo MAD -> MSY (1 escala)',
    recommended: true,
    trainSegment: {
      route: 'Zaragoza-Delicias -> Madrid Atocha',
      duration: '1h 15m – 1h 30m directo',
      estimatedEurOneWay: '15–50 € (reservando con antelación)',
      airportTransfer: 'Cercanías C1/C10 (o taxi/bus exprés ~25–35 min) hasta Madrid-Barajas (MAD). Conviene dejar 3h–3h30 entre llegada del AVE y vuelo transatlántico.',
    },
    flightSegment: {
      airlines: [
        'Iberia / American Airlines / British Airways (vía Miami MIA, Dallas DFW, Charlotte CLT o Londres LHR)',
        'Delta Air Lines (vía Atlanta ATL)',
        'United Airlines (vía Newark EWR o Houston IAH)',
      ],
      duration: '13h – 16h totales (1 escala de 2h–4h)',
      typicalRoundTripEur: '650–900 € en económica reservando con meses de antelación',
      protection: 'Billete único MAD–MSY: si se retrasa el primer vuelo, la aerolínea te reubica gratis.',
    },
    layoverAdvice:
      'La escala en Londres-Heathrow (LHR con British Airways/Iberia) tiene una gran ventaja práctica: haces inmigración de EE. UU. directamente al aterrizar en Nueva Orleans (MSY, aeropuerto pequeño y muy manejable) en lugar de hacerla en mitad de una escala intermedia en EE. UU. Conviene elegir asiento de pasillo en el tramo largo, revisar si la tarifa incluye maleta facturada y dejar 3h–3h30 entre llegada del AVE y embarque (o dormir la noche previa junto a Barajas si prefieres ir cero prisas).',
  },
  {
    id: 'ave-bcn',
    name: 'AVE / Iryo / Ouigo Zaragoza -> Barcelona + Vuelo BCN -> MSY (1 escala)',
    recommended: true,
    trainSegment: {
      route: 'Zaragoza-Delicias -> Barcelona Sants',
      duration: '1h 35m – 1h 50m directo',
      estimatedEurOneWay: '17–45 € (reservando con antelación)',
      airportTransfer: 'Rodalies R2 Nord desde Sants (~18 min) o taxi/Aerobús hasta BCN El Prat.',
    },
    flightSegment: {
      airlines: [
        'United Airlines / Lufthansa (vía Newark EWR, Frankfurt FRA o Múnich MUC)',
        'Delta / Air France / KLM (vía Nueva York JFK, Atlanta ATL o París CDG)',
        'Air Canada (vía Montreal YUL o Toronto YYZ)',
      ],
      duration: '14h – 17h totales (1 escala)',
      typicalRoundTripEur: '700–850 € en económica con antelación',
      protection: 'Billete único BCN–MSY con protección de conexión.',
    },
    layoverAdvice:
      'Muy buena alternativa si salen mejores tarifas desde BCN, especialmente vía FRA/CDG/LHR o EWR.',
  },
  {
    id: 'zaz-self-transfer',
    name: 'Salir desde Aeropuerto de Zaragoza (ZAZ) con auto-conexión',
    recommended: false,
    trainSegment: null,
    flightSegment: {
      airlines: [
        'Ryanair directo ZAZ -> Londres Stansted (STN) o Bruselas Charleroi (CRL) / Milán (BGY)',
        'Wizz Air Malta ZAZ -> Roma Fiumicino (FCO) / Milán (MXP)',
      ],
      duration: '18h – 28h+ con traslados entre aeropuertos y posible noche intermedia',
      typicalRoundTripEur: 'A menudo igual o más caro sumando equipaje, traslado STN->LHR y riesgo de billetes separados',
      protection: 'SIN protección: son billetes independientes. Si Ryanair se retrasa o cambia horario, pierdes el vuelo transatlántico.',
    },
    layoverAdvice:
      'No suele compensar: desde Londres Stansted (STN) habría que cruzar Londres por carretera/tren (~1h30–2h+) hasta Heathrow (LHR) o Gatwick para volar a EE. UU. Solo tendría sentido si quisieras hacer noche turística en Londres o Roma a la ida y a la vuelta.',
  },
];

export const HOTEL_ZONES = [
  {
    id: 'cbd',
    name: 'CBD / Warehouse District (Mejor relación calidad-precio y descanso)',
    typicalNightUsdOffPeak: '$130 – $220 / noche',
    typicalNightUsdCarnival: '$320 – $650+ / noche (del 4 al 9 feb)',
    walkToJazz: '10–18 min a pie hasta French Quarter; ~25–30 min a pie o 8 min en Uber/tranvía hasta Frenchmen St.',
    noiseLevel: 'Bajo-Moderado (edificios modernos mejor insonorizados)',
    bestFor: 'Dormir bien, hoteles con estándar cómodo, precio más contenido que el French Quarter sin perder cercanía.',
    tips: 'Buscar cerca de Canal St / Poydras / Julia St para ir caminando fácil al French Quarter o tomar el tranvía St. Charles.',
  },
  {
    id: 'marigny',
    name: 'Faubourg Marigny / Entorno Frenchmen Street (Meca del jazz a pie)',
    typicalNightUsdOffPeak: '$150 – $250 / noche',
    typicalNightUsdCarnival: '$350 – $700+ / noche',
    walkToJazz: '2–6 min a pie de Spotted Cat, Snug Harbor, d.b.a., Three Muses, Bamboula’s y The Maison.',
    noiseLevel: 'Tranquilo en calles residenciales paralelas a Frenchmen St.',
    bestFor: 'Salir del club de jazz y estar en el alojamiento en 5 minutos a pie, ambiente bohemio local.',
    tips: 'Hay más casas boutique y B&Bs pequeños que grandes hoteles; reservar pronto y revisar valoraciones de insonorización.',
  },
  {
    id: 'french-quarter',
    name: 'French Quarter (Centro histórico, el más caro)',
    typicalNightUsdOffPeak: '$190 – $320 / noche',
    typicalNightUsdCarnival: '$500 – $1,100+ / noche',
    walkToJazz: 'Pasos de Preservation Hall, Fritzel’s y Mahogany Jazz Hall; 10–15 min a pie a Frenchmen St.',
    noiseLevel: 'Muy variable: tranquilo cerca de Royal/Esplanade, muy ruidoso junto a Bourbon St.',
    bestFor: 'Comodidad absoluta para pasear de día por arquitectura criolla y escuchar jazz clásico por la noche.',
    tips: 'Si elige French Quarter, evitar calles pegadas a Bourbon St. (mejor zona baja/tranquila hacia Esplanade/Decatur o Royal/Canal junto al tranvía).',
  },
];

export const SENIOR_FRIENDLY_HOTELS = [
  {
    name: 'Le Richelieu Hotel',
    area: 'French Quarter (zona baja y tranquila)',
    highlights: 'Hotel histórico de 3 estrellas en una calle muy apacible; paseo llano de 5–10 minutos tanto a Jackson Square como a los clubes de jazz de Frenchmen Street.',
    url: 'https://www.lerichelieuhotelnola.com/',
  },
  {
    name: 'Wyndham New Orleans - French Quarter',
    area: 'Royal St / Canal St (French Quarter)',
    highlights: '4 estrellas junto a los tranvías históricos de Canal Street y St. Charles Avenue; cómodo para ver pasar desfiles cerca y subir enseguida a descansar.',
    url: 'https://www.wyndhamhotels.com/wyndham/new-orleans-louisiana/wyndham-new-orleans-french-quarter/overview',
  },
  {
    name: 'Holiday Inn French Quarter-Chateau LeMoyne',
    area: 'Dauphine St (French Quarter)',
    highlights: 'Edificio histórico con patio interior muy agradable y buen acceso peatonal llano a todo el centro.',
    url: 'https://www.ihg.com/holidayinn/hotels/us/en/new-orleans/msycl/hoteldetail',
  },
];

export const JAZZ_VENUES = [
  {
    name: 'Preservation Hall',
    area: 'French Quarter',
    address: '726 St. Peter St.',
    style: 'Jazz tradicional de Nueva Orleans puro y sin amplificación',
    schedule: 'Varios pases cada noche (sesiones cortas de ~45 min)',
    entry: 'Muy importante: reservar online con antelación las entradas con asiento reservado (Big Shot o fila delantera), porque la entrada general es de pie y requiere hacer cola en la calle.',
    idealForDad: true,
    url: 'https://www.preservationhall.com/',
  },
  {
    name: 'Snug Harbor Jazz Bistro',
    area: 'Frenchmen Street (Marigny)',
    address: '626 Frenchmen St.',
    style: 'Jazz acústico, straight-ahead y leyendas locales en sala con butacas numeradas',
    schedule: '7 días a la semana; pases habituales a las 19:30 y 21:30',
    entry: 'La opción más cómoda para ir sentado sin agobios: comprar entrada anticipada en su web y cenar en su restaurante criollo delantero.',
    idealForDad: true,
    url: 'https://snugjazz.com/',
  },
  {
    name: 'The Spotted Cat Music Club',
    area: 'Frenchmen Street (Marigny)',
    address: '623 Frenchmen St.',
    style: 'Jazz tradicional, swing clásico, brass y blues muy vivo',
    schedule: 'Todos los días desde ~14:00 hasta madrugada',
    entry: 'Truco de comodidad: ir entre las 15:00 y las 18:30 h, cuando hay mucho menos gentío y es fácil sentarse en la barra o mesas laterales antes de que se llene por la noche. Llevar efectivo.',
    idealForDad: true,
    url: 'https://www.spottedcatmusicclub.com/',
  },
  {
    name: 'Fritzel’s European Jazz Pub',
    area: 'French Quarter',
    address: '733 Bourbon St.',
    style: 'Dixieland y jazz tradicional auténtico en taberna del s. XVIII',
    schedule: 'Todas las noches',
    entry: 'Entrada libre sin reserva (se pide consumición y es costumbre dejar propina en la cesta de la banda). Oasis auténtico pese a estar en Bourbon St.',
    idealForDad: true,
    url: 'https://fritzelsjazz.com/',
  },
  {
    name: 'Three Muses',
    area: 'Frenchmen Street (Marigny)',
    address: '536 Frenchmen St.',
    style: 'Jazz acústico íntimo y blues mientras cenas',
    schedule: 'Noches (~19:00–23:00 entre semana, más tarde fines de semana)',
    entry: 'Sin cover tradicional; añaden ~$3/persona de suplemento de música en vivo en la cuenta + propina a los músicos. Prioridad sin reserva (walk-in).',
    idealForDad: true,
    url: 'https://www.3musesnola.com/',
  },
  {
    name: 'd.b.a.',
    area: 'Frenchmen Street (Marigny)',
    address: '618 Frenchmen St.',
    style: 'Brass bands, jazz piano, blues y funk de gran nivel',
    schedule: 'Todas las noches (~18:00–01:00)',
    entry: 'Primer pase de la tarde suele ser gratis o muy barato; pases principales con cover moderado en puerta (+21).',
    idealForDad: true,
    url: 'https://www.dbaneworleans.com/',
  },
  {
    name: 'The Maison',
    area: 'Frenchmen Street (Marigny)',
    address: '508 Frenchmen St.',
    style: 'Swing y jazz tradicional a primera hora; brass/funk más tarde',
    schedule: 'Todos los días desde media tarde (~16:00 entre semana)',
    entry: 'Generalmente sin entrada en sets habituales (mínimo 1 bebida o plato). Muy buen sitio para empezar la tarde.',
    idealForDad: true,
    url: 'https://www.maisonfrenchmen.com/',
  },
  {
    name: 'Bamboula’s',
    area: 'Frenchmen Street (Marigny)',
    address: '514/516 Frenchmen St.',
    style: 'Jazz tradicional, brass y raíces durante todo el día',
    schedule: 'Todos los días desde ~11:00 hasta medianoche/madrugada',
    entry: 'Siempre entrada gratuita (sin cover), funcionando con consumición y propinas.',
    idealForDad: true,
    url: 'https://www.bamboulasmusic.com/',
  },
  {
    name: 'Mahogany Jazz Hall',
    area: 'French Quarter',
    address: '125 Chartres St.',
    style: 'Jazz tradicional y swing en formato club íntimo',
    schedule: 'Consultar programación nocturna en WWOZ Livewire o web del local',
    entry: 'Dependiendo del pase/noche; útil como alternativa céntrica en el French Quarter.',
    idealForDad: true,
    url: 'https://www.wwoz.org/calendar/livewire-music',
  },
  {
    name: 'Crucero en barco de vapor Steamboat Natchez',
    area: 'Toulouse Street Wharf (Río Misisipi / French Quarter)',
    address: '400 Toulouse St.',
    style: 'Crucero diurno de ~2 horas por el río Misisipi con banda de jazz tradicional en directo y almuerzo opcional',
    schedule: 'Salidas diarias diurnas y nocturnas (nota: en mantenimiento invernal ocasionalmente opera su barco hermano Riverboat City of New Orleans)',
    entry: 'Actividad muy relajada y sentada sin apenas caminar; ideal para disfrutar del jazz de día con vistas al río.',
    idealForDad: true,
    url: 'https://www.steamboatnatchez.com/',
  },
];

export const PRACTICAL_TIPS = {
  airportTransfer:
    'Del aeropuerto MSY al centro/French Quarter: taxi oficial con tarifa plana regulada de $36 (1–2 personas, puerta 7 nivel 1), la opción más directa y sin transbordos. Alternativa económica: autobús RTA 202 Airport Express por $1,25 (puerta 2 nivel 1).',
  liveScheduleLink: 'https://www.wwoz.org/calendar/livewire-music',
  closedWarning:
    'Nota importante: el histórico Palm Court Jazz Cafe cerró en su formato tradicional, así que mejor no incluirlo en la ruta.',
  entryDocs:
    'Pasaporte electrónico en vigor, autorización ESTA oficial en https://esta.cbp.dhs.gov (evitar webs intermediarias que cobran de más) y seguro médico de viaje con buena cobertura en EE. UU.',
  cashForJazz:
    'Llevar algo de efectivo en dólares en billetes pequeños ($1, $5, $10) para entradas rápidas en Frenchmen Street y propinas a las bandas.',
  weatherAndPacking:
    'Tiempo en febrero: días suaves (18–21 °C) y noches frescas (9–12 °C) con humedad y chaparrones pasajeros. Vestirse por capas ("estilo cebolla"), cortavientos impermeable ligero, calzado cerrado muy cómodo con buena suela (aceras de adoquines irregulares en el Barrio Francés), paraguas plegable y gafas de sol.',
  paradeComfort:
    'Si coincide con desfiles de Mardi Gras, evitar aglomeraciones de pie en Canal St.: es mucho más cómodo comprar un pase de grada con asiento y baños privados (Grandstand Tickets en St. Charles Ave, p. ej. Lafayette Square o Gallier Hall) o pasear de día por Royal St. y Jackson Square.',
  moneyAndConnectivity:
    'Avisar a tu banco en España antes de viajar para que no bloqueen la tarjeta en EE. UU., llevar una segunda tarjeta por si acaso, adaptador de enchufe tipo A/B (EE. UU., 110V) y valorar una eSIM o tarifa roaming para llevar Google Maps y este WhatsApp operativos al aterrizar.',
  bookingSafety:
    'Al reservar el hotel, conviene elegir tarifa con cancelación gratuita hasta cerrar los vuelos; y en el vuelo largo, comprobar si la tarifa incluye maleta facturada y reservar asiento de pasillo.',
};
