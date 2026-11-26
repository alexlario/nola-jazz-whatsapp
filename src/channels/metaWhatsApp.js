import crypto from 'node:crypto';
import { config } from '../config.js';
import { diagnostics, sanitizeMessage } from '../diagnostics.js';
import { splitWhatsAppMessage } from '../utils/whatsappFormat.js';

export function verifyMetaWebhookChallenge(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token && token === config.meta.verifyToken) {
    return res.status(200).send(String(challenge || ''));
  }
  return res.sendStatus(403);
}

export function verifyMetaSignature(req) {
  if (!config.meta.appSecret) {
    return !config.security.strictWebhookSignature;
  }

  const signatureHeader = req.headers['x-hub-signature-256'];
  if (typeof signatureHeader !== 'string' || !req.rawBody) {
    return false;
  }

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', config.meta.appSecret)
    .update(req.rawBody)
    .digest('hex')}`;

  const providedBuf = Buffer.from(signatureHeader, 'utf8');
  const expectedBuf = Buffer.from(expectedSignature, 'utf8');

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

export function extractMetaIncomingMessages(payload) {
  const messages = [];
  if (!payload || payload.object !== 'whatsapp_business_account') {
    return messages;
  }

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contacts = value.contacts || [];
      const contactName = contacts[0]?.profile?.name || null;

      for (const msg of value.messages || []) {
        const sender = msg.from || msg.from_user_id;
        let text = null;
        if (msg.type === 'text') {
          text = msg.text?.body || null;
        } else if (msg.type === 'interactive') {
          text =
            msg.interactive?.button_reply?.title ||
            msg.interactive?.list_reply?.title ||
            null;
        } else if (msg.type === 'button') {
          text = msg.button?.text || null;
        }

        if (sender && text) {
          messages.push({
            id: msg.id,
            from: String(sender).replace(/^\+/, ''),
            contactName,
            text: text.trim(),
            type: msg.type,
          });
        } else if (sender && msg.type) {
          messages.push({
            id: msg.id,
            from: String(sender).replace(/^\+/, ''),
            contactName,
            text: null,
            type: msg.type,
          });
        }
      }
    }
  }
  return messages;
}

async function callMetaGraph(pathSuffix, body) {
  if (!config.meta.token || !config.meta.phoneNumberId) {
    throw new Error('META_WHATSAPP_TOKEN o META_PHONE_NUMBER_ID no configurados');
  }

  const url = `https://graph.facebook.com/${config.meta.graphVersion}/${config.meta.phoneNumberId}/${pathSuffix}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.meta.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Meta Graph API error ${res.status}: ${errText.slice(0, 300)}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function markMetaMessageAsRead(messageId) {
  if (!messageId || !config.meta.token || !config.meta.phoneNumberId) return;
  try {
    await callMetaGraph('messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });
    diagnostics.lastMetaReadStatus = 'ok';
  } catch (err) {
    diagnostics.lastMetaReadStatus = sanitizeMessage(err);
    console.warn('[Meta] No se pudo marcar como leído:', err.message);
  }
}

export async function sendMetaWhatsAppText(to, text) {
  const chunks = splitWhatsAppMessage(text, 3800);
  const results = [];
  for (const chunk of chunks) {
    const result = await callMetaGraph('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: chunk,
      },
    });
    results.push(result);
  }
  diagnostics.lastMetaSendStatus = 'ok';
  diagnostics.lastMetaSendError = null;
  return results;
}

export async function ensureMetaWabaSubscribed() {
  if (!config.meta.token || !config.meta.wabaId) return;
  const url = `https://graph.facebook.com/${config.meta.graphVersion}/${config.meta.wabaId}/subscribed_apps`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.meta.token}` },
    });
    const text = await res.text();
    if (!res.ok) {
      console.warn(`[Meta] No se pudo suscribir WABA (${res.status}): ${text.slice(0, 200)}`);
      return;
    }
    console.log('[Meta] WABA suscrita correctamente a la app:', text);
  } catch (err) {
    console.warn('[Meta] Error suscribiendo WABA:', err.message);
  }
}
