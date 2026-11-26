export const diagnostics = {
  lastGeminiMode: null,
  lastGeminiModelTried: null,
  lastGeminiMs: null,
  lastGeminiError: null,
  lastMetaIncomingAt: null,
  lastMetaIncomingType: null,
  lastMetaReadStatus: null,
  lastMetaSendStatus: null,
  lastMetaSendError: null,
};

export function sanitizeMessage(err) {
  return String(err?.message || err || '')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer ***')
    .slice(0, 350);
}
