import { JAZZ_VENUES, PRACTICAL_TIPS } from '../data/travelKnowledge.js';

export function planJazzItinerary({ nights = 5, style = 'traditional' } = {}) {
  const safeNights = Math.max(2, Math.min(10, Number(nights) || 5));

  const sampleEvenings = [
    {
      evening: 'Noche 1 (Aterrizaje suave en el French Quarter)',
      plan: 'Paseo tranquilo por Royal St. y Jackson Square + pase temprano en Preservation Hall (reservar entrada online antes del viaje) o copa tranquila escuchando Dixieland en Fritzel’s European Jazz Pub (733 Bourbon St.).',
    },
    {
      evening: 'Noche 2 (Inmersión total en Frenchmen Street)',
      plan: 'Cenar cómodo en el restaurante de Snug Harbor (626 Frenchmen St.) y entrar al pase de las 19:30 o 21:30 en su sala de conciertos (reservar antes). Después, asomarse a The Spotted Cat (623 Frenchmen St.) para escuchar swing/jazz tradicional de cerca.',
    },
    {
      evening: 'Noche 3 (Tarde de música continua + cena acústica)',
      plan: 'Empezar a media tarde escuchando jazz tradicional gratis en Bamboula’s (514/516 Frenchmen St.) o The Maison (508 Frenchmen St.). Cenar en Three Muses (536 Frenchmen St., ~$3 de música en directo en cuenta) y rematar en d.b.a. (618 Frenchmen St.).',
    },
    {
      evening: 'Noche 4 (Día clásico de río, barrio y club favorito)',
      plan: 'Mañana por Garden District (tranvía St. Charles) o Garden/French Market, descanso a mediodía y repetir el local que más le haya gustado de Frenchmen St. o probar Mahogany Jazz Hall (125 Chartres St.).',
    },
  ];

  return {
    nightsPlanned: safeNights,
    styleFocus: style,
    mustBookBeforeTravel: [
      'Preservation Hall (726 St. Peter St.) — reservar entradas online con semanas de antelación.',
      'Snug Harbor Jazz Bistro (626 Frenchmen St.) — reservar butacas del pase de 19:30 o 21:30 si quieres garantía de asiento cómodo.',
    ],
    venues: JAZZ_VENUES,
    suggestedEvenings: sampleEvenings.slice(0, Math.min(sampleEvenings.length, safeNights)),
    practicalTips: PRACTICAL_TIPS,
  };
}
