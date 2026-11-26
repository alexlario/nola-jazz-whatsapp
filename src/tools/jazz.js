import { JAZZ_VENUES, PRACTICAL_TIPS } from '../data/travelKnowledge.js';

export function planJazzItinerary({ nights = 5, style = 'traditional' } = {}) {
  const safeNights = Math.max(2, Math.min(10, Number(nights) || 5));

  const sampleEvenings = [
    {
      evening: 'Noche 1 (Aterrizaje suave en el French Quarter)',
      plan: 'Paseo tranquilo y llano por Royal St. y Jackson Square + pase temprano en Preservation Hall (reservar entrada con asiento Big Shot/fila delantera) o taberna tranquila en Fritzel’s European Jazz Pub (733 Bourbon St.).',
    },
    {
      evening: 'Noche 2 (Inmersión cómoda en Frenchmen Street)',
      plan: 'Tarde tranquila en The Spotted Cat (15:00–18:30, fácil sentarse sin multitudes), cena en Snug Harbor (626 Frenchmen St.) y pase sentado con butaca numerada a las 19:30 o 21:30 (reservar antes).',
    },
    {
      evening: 'Noche 3 (Barco de vapor + cena acústica)',
      plan: 'Crucero diurno sentado de 2 h en el Steamboat Natchez con jazz en directo por el Misisipi, descanso por la tarde y cena con música en The Maison (508 Frenchmen St.) o Three Muses (536 Frenchmen St.).',
    },
    {
      evening: 'Noche 4 (Tranvía clásico y club favorito)',
      plan: 'Mañana en el tranvía histórico de St. Charles Ave (Garden District), tarde relajada en Bamboula’s (514/516 Frenchmen St.) o Mahogany Jazz Hall (125 Chartres St.).',
    },
  ];

  return {
    nightsPlanned: safeNights,
    styleFocus: style,
    mustBookBeforeTravel: [
      'Preservation Hall (726 St. Peter St.) — reservar online entradas con asiento reservado (Big Shot o fila delantera) para evitar colas de pie.',
      'Snug Harbor Jazz Bistro (626 Frenchmen St.) — reservar butacas numeradas del pase de 19:30 o 21:30.',
      'Crucero Steamboat Natchez — reservar pase diurno con jazz en directo y almuerzo opcional.',
    ],
    venues: JAZZ_VENUES,
    suggestedEvenings: sampleEvenings.slice(0, Math.min(sampleEvenings.length, safeNights)),
    practicalTips: PRACTICAL_TIPS,
  };
}
