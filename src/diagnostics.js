export const diagnostics = {
  lastGeminiMode: null,
  lastGeminiModelTried: null,
  lastGeminiMs: null,
  lastGeminiError: null,
  lastToolsCalled: [],
  lastSerpApiFlights: null,
  lastSerpApiHotels: null,
  lastSerpApiJazz: null,
  lastMetaIncomingAt: null,
  lastMetaIncomingType: null,
  lastMetaReadStatus: null,
  lastMetaSendStatus: null,
  lastMetaSendError: null,
};

export function sanitizeMessage(err) {
  return String(err?.message || err || '')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer ***')
    .replace(/api_key=[^&\s]+/gi, 'api_key=***')
    .slice(0, 350);
}
