import test from 'node:test';
import assert from 'node:assert/strict';

import { compareFebruaryWindows } from '../src/tools/dates.js';
import { analyzeZaragozaRoutes, buildFlightLinks } from '../src/tools/flights.js';
import { recommendHotels, buildHotelLinks } from '../src/tools/hotels.js';
import { planJazzItinerary } from '../src/tools/jazz.js';
import { formatForWhatsApp, splitWhatsAppMessage } from '../src/utils/whatsappFormat.js';

test('compareFebruaryWindows identifies Mardi Gras 2027 on Feb 9 and compares 3 windows', () => {
  const res = compareFebruaryWindows({ preferredDays: 6 });
  assert.equal(res.mardiGrasFatTuesday, '2027-02-09');
  assert.equal(res.ashWednesday, '2027-02-10');
  assert.equal(res.windows.length, 3);
  const early = res.windows.find((w) => w.id === 'early-feb');
  assert.ok(early.parades.some((p) => p.includes('Muses')));
  assert.ok(early.parades.some((p) => p.includes('Endymion')));
});

test('analyzeZaragozaRoutes recommends AVE+MAD/BCN over ZAZ and builds valid deep links', async () => {
  const res = await analyzeZaragozaRoutes({
    outboundDate: '2027-02-11',
    returnDate: '2027-02-17',
    checkLive: false,
  });

  const aveMad = res.routes.find((r) => r.id === 'ave-mad');
  const aveBcn = res.routes.find((r) => r.id === 'ave-bcn');
  const zaz = res.routes.find((r) => r.id === 'zaz-self-transfer');

  assert.equal(aveMad.recommended, true);
  assert.equal(aveBcn.recommended, true);
  assert.equal(zaz.recommended, false);
  assert.match(res.bookingLinks.MAD.googleFlights, /google\.com\/travel\/flights/);
  assert.match(res.bookingLinks.MAD.googleFlights, /2027-02-11/);
  assert.match(res.bookingLinks.BCN.trainFromZaragoza, /zaragoza-a-barcelona/);
});

test('buildFlightLinks sanitizes invalid dates safely', () => {
  const links = buildFlightLinks({ origin: 'INVALID', outboundDate: 'bad', returnDate: 'bad' });
  assert.match(links.googleFlights, /from%20MAD%20on%202027-02-11/);
});

test('recommendHotels flags carnival surge in early Feb and off-peak savings after Mardi Gras', async () => {
  const carnival = await recommendHotels({
    checkInDate: '2027-02-01',
    checkOutDate: '2027-02-07',
    checkLive: false,
  });
  assert.match(carnival.carnivalSurgeWarning, /Atención/);

  const post = await recommendHotels({
    checkInDate: '2027-02-11',
    checkOutDate: '2027-02-17',
    checkLive: false,
  });
  assert.match(post.carnivalSurgeWarning, /30–40%/);

  const hotelLinks = buildHotelLinks({ checkInDate: '2027-02-11', checkOutDate: '2027-02-17' });
  assert.match(hotelLinks.booking, /checkin=2027-02-11/);
  assert.match(hotelLinks.booking, /checkout=2027-02-17/);
});

test('planJazzItinerary includes core traditional venues, closed Palm Court warning, and MSY taxi tip', () => {
  const plan = planJazzItinerary({ nights: 5 });
  const names = plan.venues.map((v) => v.name);
  assert.ok(names.includes('Preservation Hall'));
  assert.ok(names.includes('Snug Harbor Jazz Bistro'));
  assert.ok(names.includes('The Spotted Cat Music Club'));
  assert.ok(names.includes('Fritzel’s European Jazz Pub'));
  assert.match(plan.practicalTips.closedWarning, /Palm Court/);
  assert.match(plan.practicalTips.airportTransfer, /\$36/);
});

test('formatForWhatsApp and splitWhatsAppMessage convert markdown and split cleanly', () => {
  const formatted = formatForWhatsApp('## Título\n\nTexto **en negrita** con [Google](https://google.com)');
  assert.equal(formatted, '*Título*\n\nTexto *en negrita* con Google: https://google.com');

  const longText = Array.from({ length: 40 }, (_, i) => `Línea de prueba número ${i + 1} con texto de relleno.`).join('\n');
  const chunks = splitWhatsAppMessage(longText, 300);
  assert.ok(chunks.length > 3);
  for (const chunk of chunks) {
    assert.ok(chunk.length <= 300);
  }
});
