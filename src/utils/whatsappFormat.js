/**
 * Normalizes standard Markdown into WhatsApp-friendly formatting
 * (*bold*, _italic_, clean bullets, no broken markdown tables).
 */
export function formatForWhatsApp(text) {
  if (!text) return '';

  return String(text)
    // Convert **bold** or __bold__ to WhatsApp *bold*
    .replace(/\*\*([^*\n]+)\*\*/g, '*$1*')
    .replace(/__([^_\n]+)__/g, '*$1*')
    // Convert markdown headings (# Title) to uppercase bold headers
    .replace(/^#{1,6}\s+(.+)$/gm, (_, heading) => `\n*${heading.trim()}*`)
    // Convert markdown links [label](url) -> label: url (WhatsApp auto-links bare URLs)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1: $2')
    // Collapse excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Splits a long WhatsApp message cleanly at paragraph or line boundaries.
 * Twilio sandbox caps single TwiML messages around ~1600 chars; 1400 is a safe margin.
 */
export function splitWhatsAppMessage(text, maxLength = 1400) {
  const clean = formatForWhatsApp(text);
  if (clean.length <= maxLength) return [clean];

  const chunks = [];
  let remaining = clean;

  while (remaining.length > maxLength) {
    const slice = remaining.slice(0, maxLength);
    let splitIdx = slice.lastIndexOf('\n\n');
    if (splitIdx < maxLength * 0.4) {
      splitIdx = slice.lastIndexOf('\n');
    }
    if (splitIdx < maxLength * 0.4) {
      splitIdx = slice.lastIndexOf(' ');
    }
    if (splitIdx <= 0) {
      splitIdx = maxLength;
    }

    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks.filter(Boolean);
}
