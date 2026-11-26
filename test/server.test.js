import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { config } from '../src/config.js';
import { extractMetaIncomingMessages } from '../src/channels/metaWhatsApp.js';
import { createApp } from '../src/server.js';
import { SessionStore } from '../src/storage/sessionStore.js';
import { TravelAgent } from '../src/agent/travelAgent.js';

async function withServer(fn) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nola-test-'));
  const store = new SessionStore(path.join(tmpDir, 'sessions.json'));
  const agent = new TravelAgent({ sessionStore: store });
  const app = createApp({ travelAgent: agent });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    await fn({ baseUrl });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

test('GET / serves simulator HTML and /api/health returns status without leaking secrets', async () => {
  await withServer(async ({ baseUrl }) => {
    const htmlRes = await fetch(`${baseUrl}/`);
    assert.equal(htmlRes.status, 200);
    const html = await htmlRes.text();
    assert.match(html, /NOLA Jazz Concierge/);

    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, 'nola-jazz-whatsapp');
    assert.equal('geminiApiKey' in body, false);

    const privacyRes = await fetch(`${baseUrl}/privacy`);
    assert.equal(privacyRes.status, 200);
  });
});

test('extractMetaIncomingMessages supports both from and from_user_id (BSUID)', () => {
  const msgs = extractMetaIncomingMessages({
    object: 'whatsapp_business_account',
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                { id: 'm1', from_user_id: 'BSUID_123', type: 'text', text: { body: 'Hola jazz' } },
              ],
            },
          },
        ],
      },
    ],
  });
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].from, 'BSUID_123');
  assert.equal(msgs[0].text, 'Hola jazz');
});

test('POST /api/chat supports multi-turn Zaragoza -> NOLA flow in fallback mode and /api/reset clears it', async () => {
  await withServer(async ({ baseUrl }) => {
    const chat = async (message) => {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-dad', message }),
      });
      assert.equal(res.status, 200);
      return res.json();
    };

    const r1 = await chat('Hola, ayúdame a planificar el viaje');
    assert.match(r1.reply, /Comparar fechas/);

    const r2 = await chat('1');
    assert.match(r2.reply, /Mardi Gras/);
    assert.match(r2.reply, /1–6 de febrero/);

    const r3 = await chat('2');
    assert.match(r3.reply, /Zaragoza-Delicias/);
    assert.match(r3.reply, /Google Flights/);

    const r4 = await chat('hoteles');
    assert.match(r4.reply, /CBD \/ Warehouse District/);
    assert.match(r4.reply, /Booking/);

    const r5 = await chat('jazz');
    assert.match(r5.reply, /Preservation Hall/);
    assert.match(r5.reply, /Snug Harbor/);

    const resetRes = await fetch(`${baseUrl}/api/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'test-dad' }),
    });
    assert.equal(resetRes.status, 200);
  });
});

test('GET /webhook/meta enforces hub.verify_token', async () => {
  await withServer(async ({ baseUrl }) => {
    const badRes = await fetch(`${baseUrl}/webhook/meta?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=123`);
    assert.equal(badRes.status, 403);

    const okRes = await fetch(
      `${baseUrl}/webhook/meta?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(config.meta.verifyToken)}&hub.challenge=abc999`,
    );
    assert.equal(okRes.status, 200);
    assert.equal(await okRes.text(), 'abc999');
  });
});

test('POST /webhook/meta verifies HMAC-SHA256 x-hub-signature-256 when appSecret is set', async () => {
  const prevSecret = config.meta.appSecret;
  config.meta.appSecret = 'test-secret-123';

  try {
    await withServer(async ({ baseUrl }) => {
      const payload = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
      const badRes = await fetch(`${baseUrl}/webhook/meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': 'sha256=deadbeef',
        },
        body: payload,
      });
      assert.equal(badRes.status, 403);

      const goodSig = `sha256=${crypto.createHmac('sha256', 'test-secret-123').update(payload).digest('hex')}`;
      const goodRes = await fetch(`${baseUrl}/webhook/meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': goodSig,
        },
        body: payload,
      });
      assert.equal(goodRes.status, 200);
      assert.equal(await goodRes.text(), 'EVENT_RECEIVED');
    });
  } finally {
    config.meta.appSecret = prevSecret;
  }
});

test('POST /webhook/twilio returns valid TwiML XML when authToken is unset in dev mode', async () => {
  const prevAuth = config.twilio.authToken;
  const prevStrict = config.security.strictWebhookSignature;
  config.twilio.authToken = '';
  config.security.strictWebhookSignature = false;

  try {
    await withServer(async ({ baseUrl }) => {
      const form = new URLSearchParams({
        From: 'whatsapp:+34600111222',
        Body: 'compara fechas de febrero',
        NumMedia: '0',
        MessageSid: 'SM_TEST_1',
      });
      const res = await fetch(`${baseUrl}/webhook/twilio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      assert.equal(res.status, 200);
      const xml = await res.text();
      assert.match(xml, /<Response>/);
      assert.match(xml, /<Message>/);
      assert.match(xml, /Mardi Gras/);

      // Duplicate MessageSid returns empty <Response/> without double-processing
      const dupRes = await fetch(`${baseUrl}/webhook/twilio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      assert.equal(dupRes.status, 200);
      const dupXml = await dupRes.text();
      assert.doesNotMatch(dupXml, /<Message>/);
    });
  } finally {
    config.twilio.authToken = prevAuth;
    config.security.strictWebhookSignature = prevStrict;
  }
});
