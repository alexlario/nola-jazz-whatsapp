import { FEBRUARY_2027_CARNIVAL } from '../data/travelKnowledge.js';

export function compareFebruaryWindows({ focus = 'compare_all', preferredDays = 6 } = {}) {
  const days = Math.max(4, Math.min(14, Number(preferredDays) || 6));

  return {
    year: 2027,
    mardiGrasFatTuesday: FEBRUARY_2027_CARNIVAL.mardiGrasDate,
    ashWednesday: FEBRUARY_2027_CARNIVAL.ashWednesdayDate,
    requestedFocus: focus,
    requestedTripDays: days,
    summaryRecommendation:
      'Si la prioridad es disfrutar el mejor jazz con comodidad y buen precio, la mejor ventana es salir a partir del 10–11 de febrero (tras Mardi Gras), donde los hoteles bajan aprox. un 30–40%. Si queréis mantener fechas en torno al 1–6 de febrero, conviene llegar algo antes (p. ej. 30 ene – 4/5 feb) o alojarse en el CBD para amortiguar la subida de precios desde el jueves 4 feb.',
    windows: FEBRUARY_2027_CARNIVAL.windows,
  };
}
