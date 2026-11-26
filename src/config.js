import dotenv from 'dotenv';

dotenv.config();

function parseCsvList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim().replace(/^\+/, '').replace(/^whatsapp:\+?/i, ''))
    .filter(Boolean);
}

export const config = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  travelerName: (process.env.TRAVELER_NAME || 'tu padre').trim(),

  ai: {
    geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
    geminiModel: (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim(),
    openaiApiKey: (process.env.OPENAI_API_KEY || '').trim(),
    openaiModel: (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim(),
  },

  serpApiKey: (process.env.SERPAPI_API_KEY || '').trim(),

  meta: {
    token: (process.env.META_WHATSAPP_TOKEN || '').trim(),
    phoneNumberId: (process.env.META_PHONE_NUMBER_ID || '').trim(),
    wabaId: (process.env.META_WABA_ID || '').trim(),
    verifyToken: (process.env.META_VERIFY_TOKEN || 'nola-jazz-verify-2027').trim(),
    appSecret: (process.env.META_APP_SECRET || '').trim(),
    graphVersion: (process.env.META_GRAPH_VERSION || 'v21.0').trim(),
  },

  twilio: {
    accountSid: (process.env.TWILIO_ACCOUNT_SID || '').trim(),
    authToken: (process.env.TWILIO_AUTH_TOKEN || '').trim(),
    whatsappNumber: (process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886').trim(),
    publicBaseUrl: (process.env.PUBLIC_BASE_URL || '').trim().replace(/\/+$/, ''),
  },

  security: {
    allowedPhoneNumbers: parseCsvList(process.env.ALLOWED_PHONE_NUMBERS),
    strictWebhookSignature:
      process.env.STRICT_WEBHOOK_SIGNATURE === 'true' || process.env.NODE_ENV === 'production',
  },
};

export function getPublicStatus() {
  return {
    aiProvider: config.ai.geminiApiKey
      ? `Gemini (${config.ai.geminiModel})`
      : config.ai.openaiApiKey
        ? `OpenAI (${config.ai.openaiModel})`
        : 'Modo guiado local (sin clave IA)',
    livePricesEnabled: Boolean(config.serpApiKey),
    metaConfigured: Boolean(config.meta.token && config.meta.phoneNumberId),
    twilioConfigured: Boolean(config.twilio.accountSid && config.twilio.authToken),
    strictWebhookSignature: config.security.strictWebhookSignature,
    whitelistCount: config.security.allowedPhoneNumbers.length,
  };
}
