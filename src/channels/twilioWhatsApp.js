import twilio from 'twilio';
import { config } from '../config.js';
import { splitWhatsAppMessage } from '../utils/whatsappFormat.js';

export function verifyTwilioSignature(req) {
  if (!config.twilio.authToken) {
    return !config.security.strictWebhookSignature;
  }

  const signature = req.headers['x-twilio-signature'];
  if (typeof signature !== 'string') {
    return false;
  }

  const base =
    config.twilio.publicBaseUrl ||
    `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers.host}`;
  const fullUrl = `${base}${req.originalUrl}`;

  return twilio.validateRequest(config.twilio.authToken, signature, fullUrl, req.body || {});
}

export function buildTwilioXmlResponse(text) {
  const twiml = new twilio.twiml.MessagingResponse();
  const chunks = splitWhatsAppMessage(text, 1400);

  for (const chunk of chunks) {
    twiml.message(chunk);
  }
  return twiml.toString();
}

export function buildEmptyTwilioXmlResponse() {
  const twiml = new twilio.twiml.MessagingResponse();
  return twiml.toString();
}

export function canSendTwilioAsync() {
  return Boolean(config.twilio.accountSid && config.twilio.authToken && config.twilio.whatsappNumber);
}

export async function sendTwilioWhatsAppText(to, text) {
  if (!canSendTwilioAsync()) {
    throw new Error('Credenciales de Twilio incompletas para envío asíncrono');
  }

  const client = twilio(config.twilio.accountSid, config.twilio.authToken);
  const formattedTo = String(to).startsWith('whatsapp:') ? String(to) : `whatsapp:+${String(to).replace(/^\+/, '')}`;
  const formattedFrom = config.twilio.whatsappNumber.startsWith('whatsapp:')
    ? config.twilio.whatsappNumber
    : `whatsapp:+${config.twilio.whatsappNumber.replace(/^\+/, '')}`;

  const chunks = splitWhatsAppMessage(text, 1400);
  const results = [];
  for (const chunk of chunks) {
    const msg = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: chunk,
    });
    results.push(msg.sid);
  }
  return results;
}
