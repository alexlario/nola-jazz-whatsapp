import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { z } from 'zod';
import { config, getPublicStatus } from './config.js';
import { TravelAgent } from './agent/travelAgent.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import {
  extractMetaIncomingMessages,
  markMetaMessageAsRead,
  sendMetaWhatsAppText,
  verifyMetaSignature,
  verifyMetaWebhookChallenge,
} from './channels/metaWhatsApp.js';
import {
  buildEmptyTwilioXmlResponse,
  buildTwilioXmlResponse,
  canSendTwilioAsync,
  sendTwilioWhatsAppText,
  verifyTwilioSignature,
} from './channels/twilioWhatsApp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const ChatInputSchema = z.object({
  sessionId: z.string().trim().min(1).max(80).default('sim-papa'),
  message: z.string().trim().min(1).max(1000),
});

const ResetInputSchema = z.object({
  sessionId: z.string().trim().min(1).max(80).default('sim-papa'),
});

function normalizePhone(phone) {
  return String(phone || '').trim().replace(/^whatsapp:\+?/i, '').replace(/^\+/, '');
}

function isPhoneAllowed(phone) {
  const list = config.security.allowedPhoneNumbers;
  if (!list || list.length === 0) return true;
  return list.includes(normalizePhone(phone));
}

export function createApp({ travelAgent = new TravelAgent() } = {}) {
  const app = express();
  const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 25 });
  const processedMessageIds = new Set();

  app.set('trust proxy', 1);

  // Capture rawBody specifically so Meta HMAC-SHA256 verification stays exact
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false, limit: '256kb' }));

  app.use(express.static(PUBLIC_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'nola-jazz-whatsapp',
      ...getPublicStatus(),
    });
  });

  app.post('/api/chat', async (req, res) => {
    const parsed = ChatInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'Mensaje inválido o vacío' });
    }

    const rateKey = `web:${req.ip || 'local'}:${parsed.data.sessionId}`;
    if (!checkRateLimit(rateKey).allowed) {
      return res.status(429).json({ ok: false, error: 'Demasiados mensajes seguidos, espera un momento.' });
    }

    try {
      const result = await travelAgent.reply(`web:${parsed.data.sessionId}`, parsed.data.message);
      return res.json({ ok: true, reply: result.text, mode: result.mode });
    } catch (err) {
      console.error('[/api/chat] Error:', err);
      return res.status(500).json({ ok: false, error: 'Error procesando el mensaje.' });
    }
  });

  app.post('/api/reset', async (req, res) => {
    const parsed = ResetInputSchema.safeParse(req.body || {});
    const sessionId = parsed.success ? parsed.data.sessionId : 'sim-papa';
    await travelAgent.reset(`web:${sessionId}`);
    res.json({ ok: true });
  });

  // --- Meta WhatsApp Cloud API ---
  app.get('/webhook/meta', verifyMetaWebhookChallenge);

  app.post('/webhook/meta', (req, res) => {
    if (!verifyMetaSignature(req)) {
      return res.status(403).send('Invalid signature');
    }

    const incoming = extractMetaIncomingMessages(req.body);
    res.status(200).send('EVENT_RECEIVED');

    for (const msg of incoming) {
      if (msg.id) {
        if (processedMessageIds.has(msg.id)) continue;
        processedMessageIds.add(msg.id);
        if (processedMessageIds.size > 1000) {
          const oldest = processedMessageIds.values().next().value;
          processedMessageIds.delete(oldest);
        }
      }

      if (!isPhoneAllowed(msg.from)) {
        console.warn(`[Meta] Mensaje bloqueado de número no autorizado: ${msg.from}`);
        continue;
      }

      if (!checkRateLimit(`wa:${msg.from}`).allowed) {
        continue;
      }

      void (async () => {
        try {
          await markMetaMessageAsRead(msg.id);
          if (!msg.text) {
            await sendMetaWhatsAppText(
              msg.from,
              'Por ahora solo puedo leer mensajes de texto. Escríbeme tu pregunta sobre fechas, vuelos desde Zaragoza, hoteles o jazz y te ayudo encantado.',
            );
            return;
          }

          const { text } = await travelAgent.reply(`wa:${msg.from}`, msg.text);
          await sendMetaWhatsAppText(msg.from, text);
        } catch (err) {
          console.error('[Meta] Error respondiendo mensaje:', err.message);
        }
      })();
    }
  });

  // --- Twilio WhatsApp Webhook ---
  app.post('/webhook/twilio', async (req, res) => {
    if (!verifyTwilioSignature(req)) {
      return res.status(403).send('Unauthorized Twilio request');
    }

    const rawFrom = String(req.body?.From || '').trim();
    const sender = normalizePhone(rawFrom);
    const bodyText = String(req.body?.Body || '').trim();
    const numMedia = Number.parseInt(req.body?.NumMedia || '0', 10);
    const messageSid = req.body?.MessageSid ? String(req.body.MessageSid) : null;

    if (!sender || !isPhoneAllowed(sender)) {
      return res.status(403).send('Sender not allowed');
    }

    if (messageSid) {
      if (processedMessageIds.has(messageSid)) {
        res.type('text/xml');
        return res.send(buildEmptyTwilioXmlResponse());
      }
      processedMessageIds.add(messageSid);
      if (processedMessageIds.size > 1000) {
        const oldest = processedMessageIds.values().next().value;
        processedMessageIds.delete(oldest);
      }
    }

    if (!checkRateLimit(`twilio:${sender}`).allowed) {
      res.type('text/xml');
      return res.send(buildTwilioXmlResponse('Un segundo por favor, espera unos instantes antes de enviar otro mensaje.'));
    }

    const buildReplyText = async () => {
      if (!bodyText && numMedia > 0) {
        return 'De momento solo puedo leer mensajes de texto (no notas de voz ni imágenes). Escríbeme con palabras qué quieres consultar sobre el viaje a Nueva Orleans.';
      }
      const result = await travelAgent.reply(`wa:${sender}`, bodyText || 'Hola');
      return result.text;
    };

    // En producción con Twilio configurado, respondemos 200 al instante para evitar
    // el timeout de 15s de Twilio y enviamos la respuesta de la IA por API REST.
    if (canSendTwilioAsync()) {
      res.type('text/xml');
      res.send(buildEmptyTwilioXmlResponse());

      void (async () => {
        try {
          const replyText = await buildReplyText();
          await sendTwilioWhatsAppText(rawFrom, replyText);
        } catch (err) {
          console.error('[Twilio] Error enviando respuesta asíncrona:', err.message);
        }
      })();
      return;
    }

    try {
      const replyText = await buildReplyText();
      res.type('text/xml');
      return res.send(buildTwilioXmlResponse(replyText));
    } catch (err) {
      console.error('[Twilio] Error procesando mensaje:', err);
      res.type('text/xml');
      return res.send(
        buildTwilioXmlResponse('Ha ocurrido un pequeño error temporal. Por favor, vuelve a intentarlo en unos segundos.'),
      );
    }
  });

  return app;
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  const app = createApp();
  app.listen(config.port, () => {
    const status = getPublicStatus();
    console.log(`\n🎷 NOLA Jazz WhatsApp Concierge listo en http://localhost:${config.port}`);
    console.log(`   • Motor IA: ${status.aiProvider}`);
    console.log(`   • Precios en vivo (SerpApi): ${status.livePricesEnabled ? 'Activo' : 'Desactivado (usa rangos + enlaces)'}`);
    console.log(`   • Meta Cloud API: ${status.metaConfigured ? 'Configurado' : 'Pendiente en .env'}`);
    console.log(`   • Twilio Sandbox: ${status.twilioConfigured ? 'Configurado' : 'Pendiente en .env'}\n`);
  });
}
